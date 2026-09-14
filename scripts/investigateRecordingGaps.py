"""Diagnostic for #14; research settings, not production gap detection.

Run without arguments for synthetic cases, or pass local GPX paths.
Prints aggregate timing only: no paths, coordinates, dates or health fields.
Uses Python's standard library; parse only trusted local experiment files.
"""
import argparse
import json
import statistics
import xml.etree.ElementTree as ET
from datetime import datetime


def baseline(values):
    return statistics.median(values) if values else None


def classify(intervals, floor=120, factor=10, local=True):
    """Input is one uninterrupted run of positive, usable timestamp intervals.

    Inspect up to 20 intervals on either side, excluding the candidate.
    Require five neighbours on each nonempty side; permit a genuine run edge.
    Taking the larger side median protects a change to sparse recording.
    """
    found = []
    for i, duration in enumerate(intervals):
        if duration <= floor:
            continue
        if local:
            sides = [intervals[max(0, i - 20):i], intervals[i + 1:i + 21]]
            sides = [side for side in sides if side]
            if not sides or any(len(side) < 5 for side in sides):
                continue
            reference = max(baseline(side) for side in sides)
        else:
            reference = baseline(intervals)
        if duration > factor * reference:
            found.append(i)
    return found


def read_runs(path):
    ns = {'g': 'http://www.topografix.com/GPX/1/1'}
    root = ET.parse(path).getroot()
    runs = []
    invalid = 0
    for segment in root.findall('.//g:trkseg', ns):
        previous = latest = None
        run = []
        for point in segment.findall('g:trkpt', ns):
            raw = point.findtext('g:time', namespaces=ns)
            try:
                stamp = datetime.fromisoformat(raw.replace('Z', '+00:00'))
                if stamp.tzinfo is None:
                    raise ValueError('timezone absent')
                current = stamp.timestamp()
                if latest is not None and current <= latest:
                    raise ValueError('nonmonotonic')
            except (AttributeError, ValueError, OverflowError):
                invalid += 1
                if run:
                    runs.append(run)
                run = []
                previous = None
                continue
            if previous is not None:
                # Millisecond rounding avoids float epoch subtraction artefacts.
                run.append(round(current - previous, 3))
            previous = latest = current
        if run:
            runs.append(run)
    return runs, invalid


def synthetic():
    cases = {
        'regular_1s': [1] * 100,
        'regular_300s': [300] * 100,
        'isolated_600s': [1] * 40 + [600] + [1] * 40,
        'sparse_with_3600s_gap': [300] * 40 + [3600] + [300] * 40,
        'switch_1s_to_300s': [1] * 100 + [300] * 40,
        'switch_300s_to_1s': [300] * 40 + [1] * 100,
        'alternating_1s_300s': [1, 300] * 50,
        'three_sparse_intervals': [1] * 40 + [300] * 3 + [1] * 40,
        'insufficient_context': [1, 600, 1],
        'first_interval_gap': [600] + [1] * 40,
        'last_interval_gap': [1] * 40 + [600],
        'near_edge_gap': [1] * 3 + [600] + [1] * 40,
        'exact_floor_120s': [1] * 40 + [120] + [1] * 40,
        'exact_factor_10': [20] * 40 + [200] + [20] * 40,
        'slow_walk_1s': [1] * 100,
        'stationary_1s': [1] * 100,
    }
    result = {}
    for name, intervals in cases.items():
        result[name] = {mode: len(classify(intervals, local=(mode == 'local')))
                        for mode in ['global', 'local']}
    # Known structural invariants and boundary behaviour, not product validation.
    assert result['isolated_600s']['local'] == 1
    assert result['regular_300s']['local'] == 0
    assert result['switch_1s_to_300s']['local'] == 0
    assert result['switch_300s_to_1s']['local'] == 0
    assert result['insufficient_context']['local'] == 0
    assert result['exact_floor_120s']['local'] == 0
    assert result['exact_factor_10']['local'] == 0
    # Segment/invalid-time breaks must be processed independently.
    assert sum(len(classify(run)) for run in [[1] * 40, [300] * 40]) == 0
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='*')
    args = parser.parse_args()
    print(json.dumps({'synthetic': synthetic()}, indent=2))
    for number, path in enumerate(args.files, 1):
        runs, invalid = read_runs(path)
        durations = [duration for run in runs for duration in run]
        stats = {'recording': number, 'runs': len(runs), 'invalid_times': invalid,
                 'intervals': len(durations), 'median_seconds': baseline(durations)}
        trials = []
        for floor in [60, 120, 180, 300]:
            for factor in [5, 10, 20]:
                for local in [False, True]:
                    flagged = [run[i] for run in runs
                               for i in classify(run, floor, factor, local)]
                    trials.append({'floor': floor, 'factor': factor,
                                   'method': 'local' if local else 'global',
                                   'count': len(flagged),
                                   'seconds': round(sum(flagged), 3),
                                   'minimum': min(flagged, default=None),
                                   'maximum': max(flagged, default=None)})
        stats['trials'] = trials
        print(json.dumps(stats, indent=2))


if __name__ == '__main__':
    main()
