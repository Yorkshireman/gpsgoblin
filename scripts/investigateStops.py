"""Offline stop-policy experiments, not a production classifier.

python3 scripts/investigateStops.py [--gpx /path/to/permissioned.gpx]
Emits aggregate evidence only: no source coordinates, dates, names or path.
Uses Python's standard library; does not modify or upload recordings.
"""

import argparse
import bisect
from collections import Counter, deque
import datetime
import json
import math
import platform
import statistics
import time
import xml.etree.ElementTree as ET

RADIUS = 6_371_008.8


def read_recording(path):
    root = ET.parse(path).getroot()
    ns = {'g': 'http://www.topografix.com/GPX/1/1'}
    segments = root.findall('g:trk/g:trkseg', ns)
    if len(segments) != 1:
        raise ValueError('This private-recording diagnostic expects one segment')
    raw = segments[0].findall('g:trkpt', ns)
    origin_lat = math.radians(float(raw[0].get('lat')))
    origin_lon = math.radians(float(raw[0].get('lon')))
    points = []
    fields = Counter()
    for element in raw:
        fields.update(child.tag.split('}')[-1] for child in element)
        latitude = math.radians(float(element.get('lat')))
        longitude = math.radians(float(element.get('lon')))
        timestamp = datetime.datetime.fromisoformat(element.findtext('g:time', namespaces=ns).replace('Z', '+00:00')).timestamp()
        elevation = element.findtext('g:ele', namespaces=ns)
        points.append((timestamp, RADIUS * (longitude - origin_lon) * math.cos(origin_lat),
                       RADIUS * (latitude - origin_lat), float(elevation) if elevation else None))
    origin_time = points[0][0]
    points = [(t - origin_time, x, y, z) for t, x, y, z in points]
    if any(b[0] <= a[0] for a, b in zip(points, points[1:])):
        raise ValueError('Diagnostic expects strictly increasing timestamps')
    # Independent spherical distance for exact pace arithmetic; the compactness
    # experiment uses a local planar approximation, unsuitable for global routes.
    distances = [0.0]
    for a, b in zip(raw, raw[1:]):
        lat1, lat2 = math.radians(float(a.get('lat'))), math.radians(float(b.get('lat')))
        dlon = math.radians(float(b.get('lon')) - float(a.get('lon')))
        h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        distances.append(distances[-1] + 2 * RADIUS * math.atan2(math.sqrt(h), math.sqrt(1 - h)))
    return points, distances, dict(fields)


def compact_windows(points, duration, diameter, max_gap=10):
    """Trailing windows: bounding-box diagonal <= diameter, sufficient duration.

    Four monotonic deques make spatial checks linear in point count. A window
    includes the observation immediately before/on its time boundary. Reject
    windows containing an interval > max_gap (a research parameter, not an
    import limit or a proven universally appropriate gap policy).
    Merge overlapping accepted windows to expose the slow-creep failure mode.
    """
    queues = [deque() for _ in range(4)]
    left = 0
    gap_end = -1
    merged = []
    for right, point in enumerate(points):
        if right and point[0] - points[right - 1][0] > max_gap:
            gap_end = right
        while left < right and points[left + 1][0] <= point[0] - duration:
            left += 1
        for queue, dimension, sign in zip(queues, [1, 1, 2, 2], [1, -1, 1, -1]):
            while queue and points[queue[-1]][dimension] * sign >= point[dimension] * sign:
                queue.pop()
            queue.append(right)
            while queue[0] < left:
                queue.popleft()
        extent = math.hypot(points[queues[1][0]][1] - points[queues[0][0]][1],
                            points[queues[3][0]][2] - points[queues[2][0]][2])
        if point[0] - points[left][0] < duration or gap_end > left or extent > diameter:
            continue
        if merged and left <= merged[-1][1]:
            merged[-1][1] = right
        else:
            merged.append([left, right])
    return merged


def summary(points, intervals):
    durations = [points[end][0] - points[start][0] for start, end in intervals]
    return {'intervals': len(intervals), 'candidateSeconds': round(sum(durations), 3),
            'longestSeconds': round(max(durations, default=0), 3)}


def confined_cores(points, intervals, duration=60, diameter=10):
    """Choose the longest spatially bounded subwindow of each merged candidate.

    This intentionally leaves the remainder for review; it does not repeatedly
    chop creeping motion into smaller putative stops. Tie-break: earliest core.
    """
    cores = []
    for start, end in intervals:
        queues = [deque() for _ in range(4)]
        left = start
        best = (start, start)
        for right in range(start, end + 1):
            for queue, dimension, sign in zip(queues, [1, 1, 2, 2], [1, -1, 1, -1]):
                while queue and points[queue[-1]][dimension] * sign >= points[right][dimension] * sign:
                    queue.pop()
                queue.append(right)
            while math.hypot(points[queues[1][0]][1] - points[queues[0][0]][1],
                             points[queues[3][0]][2] - points[queues[2][0]][2]) > diameter:
                left += 1
                for queue in queues:
                    while queue[0] < left:
                        queue.popleft()
            if points[right][0] - points[left][0] > points[best[1]][0] - points[best[0]][0]:
                best = (left, right)
        if points[best[1]][0] - points[best[0]][0] >= duration:
            cores.append(list(best))
    return cores


def screen_candidates(points, intervals, diameter=10, elevation_span=5):
    """Research safeguards: whole-episode extent and 10-second median elevation.

    Thresholds are sensitivity parameters, not validated product defaults.
    A surviving candidate is NOT confirmed stationary. Sample medians are used
    here; production irregular-sampling treatment remains to be specified.
    """
    retained = []
    rejected = []
    for start, end in intervals:
        window = points[start:end + 1]
        extent = math.hypot(max(p[1] for p in window) - min(p[1] for p in window),
                            max(p[2] for p in window) - min(p[2] for p in window))
        buckets = {}
        for t, x, y, z in window:
            if z is not None:
                buckets.setdefault(int((t - window[0][0]) // 10), []).append(z)
        medians = [statistics.median(values) for values in buckets.values()]
        span = max(medians) - min(medians) if medians else None
        reasons = []
        if extent > diameter:
            reasons.append('wholeIntervalSpatialExtent')
        if any(p[3] is None for p in window):
            reasons.append('incompleteElevationEvidence')
        if span is not None and span > elevation_span:
            reasons.append('elevationChangeOrDrift')
        thirds = [[], [], []]
        for point in window:
            third = min(2, int(3 * (point[0] - window[0][0]) / (window[-1][0] - window[0][0])))
            thirds[third].append(point)
        if all(thirds):
            centres = [(statistics.median(p[1] for p in third), statistics.median(p[2] for p in third)) for third in thirds]
            shifts = [(b[0] - a[0], b[1] - a[1]) for a, b in zip(centres, centres[1:])]
            lengths = [math.hypot(*shift) for shift in shifts]
            if min(lengths) > 2 and sum(a * b for a, b in zip(shifts[0], shifts[1])) / (lengths[0] * lengths[1]) > .8:
                reasons.append('directionalProgressOrDrift')
        if reasons:
            rejected.append({'seconds': window[-1][0] - window[0][0], 'reasons': reasons})
        else:
            retained.append([start, end])
    return {'survivingCandidates': summary(points, retained), 'retainForReview': rejected}


def describe_window(points, distances, start, end):
    window = points[start:end + 1]
    elevations = [p[3] for p in window if p[3] is not None]
    seconds = window[-1][0] - window[0][0]
    travelled = distances[end] - distances[start]
    identical = sum(a[1:3] == b[1:3] for a, b in zip(window, window[1:]))
    return {'seconds': seconds, 'points': len(window), 'pathMetres': round(travelled, 6),
            'paceMinPerKm': round(seconds / travelled * 1000 / 60, 6) if travelled else None,
            'maxFromStartMetres': round(max(math.hypot(p[1] - window[0][1], p[2] - window[0][2]) for p in window), 3),
            'boxDiagonalMetres': round(math.hypot(max(p[1] for p in window) - min(p[1] for p in window), max(p[2] for p in window) - min(p[2] for p in window)), 3),
            'identicalCoordinateIntervals': identical,
            'elevationRangeMetres': round(max(elevations) - min(elevations), 3) if elevations else None,
            'elevationNetMetres': round(window[-1][3] - window[0][3], 3) if len(elevations) == len(window) else None}


def synthetic_cases():
    stationary = [(t, math.sin(t / 8), math.cos(t / 11), 100.0) for t in range(601)]
    cases = {
        'stationaryWithJitter': stationary,
        'walking1MetrePerSecond': [(t, t, 0, 100.0) for t in range(601)],
        'slowProgress0.05MetresPerSecond': [(t, t * .05, 0, 100.0) for t in range(601)],
        'verticalClimbWithElevation': [(t, x, y, 100 + t * .1) for t, x, y, z in stationary],
        'verticalClimbMissingElevation': [(t, x, y, None) for t, x, y, z in stationary],
        'verticalClimbFlatTerrainElevation': stationary,
        'stationaryWithElevationDrift': [(t, x, y, 100 + t * .1) for t, x, y, z in stationary],
        'verticalClimbUpAndDown': [(t, x, y, 100 + min(t, 600 - t) * .1) for t, x, y, z in stationary],
        'stationaryMissingElevation': [(t, x, y, None) for t, x, y, z in stationary],
        'movingInSmallCircle': [(t, 3 * math.sin(t / 3), 3 * math.cos(t / 3), 100.0) for t in range(601)],
        'stationaryWithUnknownGap': [(0, 0, 0, 100.0), (600, 0, 0, 100.0)],
        'stationarySampledEvery5Seconds': stationary[::5],
        'stationarySampledEvery15Seconds': stationary[::15],
        'stationaryIrregularDense': [p for i, p in enumerate(stationary) if i % 7 in (0, 1, 4) or i == 600],
    }
    # Known-answer counterexamples, not an assertion that any candidate is a stop.
    assert cases['verticalClimbMissingElevation'] == cases['stationaryMissingElevation']
    assert cases['verticalClimbFlatTerrainElevation'] == cases['stationaryWithJitter']
    assert cases['stationaryWithElevationDrift'] == cases['verticalClimbWithElevation']
    assert compact_windows(cases['walking1MetrePerSecond'], 60, 10) == []
    assert summary(stationary, compact_windows(stationary, 60, 10))['candidateSeconds'] == 600
    assert compact_windows(cases['stationaryWithUnknownGap'], 60, 10) == []
    screened_climb = screen_candidates(cases['verticalClimbWithElevation'], [[0, 600]])
    assert screened_climb['survivingCandidates']['candidateSeconds'] == 0
    assert screen_candidates(stationary, [[0, 600]])['survivingCandidates']['candidateSeconds'] == 600
    creep = cases['slowProgress0.05MetresPerSecond']
    creep_cores = confined_cores(creep, compact_windows(creep, 60, 10))
    assert screen_candidates(creep, creep_cores)['survivingCandidates']['candidateSeconds'] == 0
    return {name: {**summary(points, compact_windows(points, 60, 10)),
                   'screening': screen_candidates(points, compact_windows(points, 60, 10)),
                   'coreScreening': screen_candidates(points, confined_cores(points, compact_windows(points, 60, 10))),
                   'elevationNetMetres': None if points[0][3] is None else round(points[-1][3] - points[0][3], 3)}
            for name, points in cases.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--gpx')
    options = parser.parse_args()
    output = {'python': platform.python_version(), 'note': 'Research compact-window candidates, not validated stops; no production changes.',
              'syntheticRule': {'windowSeconds': 60, 'boxDiagonalMetres': 10, 'maxObservationGapSeconds': 10},
              'screeningRule': {'wholeIntervalBoxDiagonalMetres': 10, 'elevationMedianBinSeconds': 10, 'maximumMedianElevationSpanMetres': 5,
                                'progressThirdsMinimumShiftMetres': 2, 'progressThirdsMinimumCosine': .8},
              'synthetic': synthetic_cases()}
    if options.gpx:
        points, distances, fields = read_recording(options.gpx)
        timestamps = [p[0] for p in points]
        peak = None
        for end, point in enumerate(points):
            start = bisect.bisect_right(timestamps, point[0] - 600) - 1
            if start < 0:
                continue
            distance = distances[end] - distances[start]
            pace = (point[0] - points[start][0]) / distance if distance else float('inf')
            if peak is None or pace > peak[0]:
                peak = (pace, start, end)
        gaps = Counter(b[0] - a[0] for a, b in zip(points, points[1:]))
        matrix = []
        for duration in (30, 60, 120):
            for diameter in (5, 10, 20):
                began = time.perf_counter()
                intervals = compact_windows(points, duration, diameter)
                row = {'windowSeconds': duration, 'boxDiagonalMetres': diameter, **summary(points, intervals),
                       'detectorMilliseconds': round((time.perf_counter() - began) * 1000, 2)}
                row['containsPeakWindow'] = any(start <= peak[1] and end >= peak[2] for start, end in intervals)
                matrix.append(row)
        output['privateRecording'] = {'points': len(points), 'durationSeconds': points[-1][0],
                                      'sampleIntervalCounts': gaps, 'pointFieldCounts': fields,
                                      'peak600SecondWindow': describe_window(points, distances, peak[1], peak[2]),
                                      'sensitivity': matrix,
                                      'screeningSensitivity': {str(z): screen_candidates(points, compact_windows(points, 60, 10), elevation_span=z) for z in (3, 5, 10)},
                                      'coreScreening': screen_candidates(points, confined_cores(points, compact_windows(points, 60, 10))),
                                      'confirmedWindowScreening': screen_candidates(points, [[peak[1], peak[2]]]),
                                      'coreContainsPeakWindow': any(start <= peak[1] and end >= peak[2] for start, end in confined_cores(points, compact_windows(points, 60, 10)))}
    print(json.dumps(output, indent=2))


if __name__ == '__main__':
    main()
