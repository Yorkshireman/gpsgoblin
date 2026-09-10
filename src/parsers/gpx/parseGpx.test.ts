import { parseGpx } from '.';

describe('parseGpx', () => {
  describe.each([
    { kind: 'track point', before: '<trk><trkseg>', point: 'trkpt', after: '</trkseg></trk>' },
    { kind: 'route point', before: '<rte>', point: 'rtept', after: '</rte>' },
    { kind: 'waypoint', before: '', point: 'wpt', after: '' }
  ])('$kind coordinates', ({ kind, before, point, after }) => {
    it('preserves genuine zero coordinates', () => {
      const result = parseGpx(`
        <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1">
          ${before}<${point} lat="0" lon="0" />${after}
        </gpx>
      `);

      if (!result.ok) {
        throw new Error('Expected the GPX document to parse successfully');
      }

      const samples = [
        ...result.document.tracks.flatMap(track => {
          return track.segments.flatMap(segment => {
            return segment.samples;
          });
        }),
        ...result.document.routes.flatMap(route => {
          return route.points;
        }),
        ...result.document.waypoints
      ];

      expect(samples).toHaveLength(1);
      expect(samples[0]).toMatchObject({ latitudeDegrees: 0, longitudeDegrees: 0 });
    });

    it.each([
      { latitude: '', longitude: '1' },
      { latitude: '1', longitude: '' },
      { latitude: '   ', longitude: '1' },
      { latitude: '1', longitude: '   ' }
    ])('rejects blank coordinates: $latitude / $longitude', ({ latitude, longitude }) => {
      const result = parseGpx(`
        <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1">
          ${before}<${point} lat="${latitude}" lon="${longitude}" />${after}
        </gpx>
      `);

      expect(result).toEqual({
        ok: false,
        error: `A ${kind} is missing its coordinates.`
      });
    });
  });

  it('returns the complete activity document for a valid GPX file', () => {
    const fileText = `
      <?xml version="1.0" encoding="UTF-8"?>
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <name>Morning route</name>

          <trkseg>
            <trkpt lat="53.1000" lon="-1.2000" />
            <trkpt lat="53.2000" lon="-1.3000" />
          </trkseg>

          <trkseg>
            <trkpt lat="53.3000" lon="-1.4000" />
          </trkseg>
        </trk>
      </gpx>
    `;

    expect(parseGpx(fileText)).toEqual({
      ok: true,
      document: {
        creator: 'GPSGoblin test',
        format: 'gpx',
        originalContents: fileText,
        routes: [],
        tracks: [
          {
            id: 'track-0',
            name: 'Morning route',
            segments: [
              {
                id: 'track-0-segment-0',
                samples: [
                  {
                    id: 'track-0-segment-0-sample-0',
                    latitudeDegrees: 53.1,
                    longitudeDegrees: -1.2
                  },
                  {
                    id: 'track-0-segment-0-sample-1',
                    latitudeDegrees: 53.2,
                    longitudeDegrees: -1.3
                  }
                ]
              },
              {
                id: 'track-0-segment-1',
                samples: [
                  {
                    id: 'track-0-segment-1-sample-0',
                    latitudeDegrees: 53.3,
                    longitudeDegrees: -1.4
                  }
                ]
              }
            ]
          }
        ],
        version: '1.1',
        waypoints: []
      }
    });
  });

  it('rejects malformed XML', () => {
    const result = parseGpx('<gpx><trk></gpx>');

    expect(result).toEqual({
      ok: false,
      error: 'The file contains malformed XML.'
    });
  });

  it('rejects XML that is not a GPX document', () => {
    const result = parseGpx('<document></document>');

    expect(result).toEqual({
      ok: false,
      error: 'The file is not a GPX document.'
    });
  });

  it('distinguishes zero elevation from missing elevation', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <trkseg>
            <trkpt lat="53.1000" lon="-1.2000">
              <ele>0</ele>
            </trkpt>
            <trkpt lat="53.2000" lon="-1.3000" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected the GPX document to parse successfully');
    }

    const samples = result.document.tracks[0]?.segments[0]?.samples;

    expect(samples?.[0]?.elevationMetres).toBe(0);
    expect(samples?.[1]).not.toHaveProperty('elevationMetres');
  });

  it('rejects track points with missing coordinates', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <trkseg>
            <trkpt lat="53.1000" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result).toEqual({
      ok: false,
      error: 'A track point is missing its coordinates.'
    });
  });

  it('rejects non-numeric track point coordinates', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <trkseg>
            <trkpt lat="north" lon="-1.2000" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result).toEqual({
      ok: false,
      error: 'A track point contains invalid coordinates.'
    });
  });

  it('rejects coordinates outside valid geographic ranges', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <trkseg>
            <trkpt lat="91" lon="-1.2000" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result).toEqual({
      ok: false,
      error: 'A track point contains invalid coordinates.'
    });
  });

  it('rejects unsupported GPX versions', () => {
    const result = parseGpx(`
      <gpx
        version="1.0"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/0"
      />
    `);

    expect(result).toEqual({
      ok: false,
      error: 'Only GPX 1.1 files are currently supported.'
    });
  });

  it('rejects GPX files containing a DOCTYPE declaration', () => {
    const result = parseGpx(`
      <!DOCTYPE gpx>
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      />
    `);

    expect(result).toEqual({
      ok: false,
      error: 'GPX files containing a DOCTYPE declaration are not supported.'
    });
  });

  it('preserves the track name', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <name>Morning route</name>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected the GPX document to parse successfully');
    }

    expect(result.document.tracks[0]?.name).toBe('Morning route');
  });

  it('rejects a non-numeric track-point elevation', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <trk>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2">
              <ele>unknown</ele>
            </trkpt>
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result).toEqual({
      ok: false,
      error: 'A track point contains an invalid elevation.'
    });
  });

  it('preserves document and track metadata', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="Trail recorder"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <metadata>
          <name>Peak District collection</name>
          <desc>Routes recorded during September</desc>
        </metadata>

        <trk>
          <name>Morning route</name>
          <desc>A wet and windy recording</desc>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected the GPX document to parse successfully');
    }

    expect(result.document.creator).toBe('Trail recorder');
    expect(result.document.metadata).toEqual({
      description: 'Routes recorded during September',
      name: 'Peak District collection'
    });
    expect(result.document.tracks[0]?.description).toBe('A wet and windy recording');
  });

  it('parses a waypoint-only document and preserves waypoint order', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <wpt lat="53.1" lon="-1.2">
          <ele>0</ele>
          <name>Trailhead</name>
          <desc>Start beside the gate</desc>
        </wpt>
        <wpt lat="53.2" lon="-1.3">
          <name>Summit</name>
        </wpt>
      </gpx>
    `);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected the GPX document to parse successfully');
    }

    expect(result.document.routes).toEqual([]);
    expect(result.document.tracks).toEqual([]);
    expect(result.document.waypoints).toEqual([
      {
        description: 'Start beside the gate',
        elevationMetres: 0,
        id: 'waypoint-0',
        latitudeDegrees: 53.1,
        longitudeDegrees: -1.2,
        name: 'Trailhead'
      },
      {
        id: 'waypoint-1',
        latitudeDegrees: 53.2,
        longitudeDegrees: -1.3,
        name: 'Summit'
      }
    ]);
  });

  it('rejects a waypoint with missing coordinates', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <wpt lat="53.1">
          <name>Trailhead</name>
        </wpt>
      </gpx>
    `);

    expect(result).toEqual({
      ok: false,
      error: 'A waypoint is missing its coordinates.'
    });
  });

  it('rejects a waypoint with invalid coordinates', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <wpt lat="north" lon="-1.2">
          <name>Trailhead</name>
        </wpt>
      </gpx>
    `);

    expect(result).toEqual({
      error: 'A waypoint contains invalid coordinates.',
      ok: false
    });
  });

  it('rejects a waypoint with invalid elevation', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <wpt lat="53.1" lon="-1.2">
          <ele>unknown</ele>
          <name>Trailhead</name>
        </wpt>
      </gpx>
    `);

    expect(result).toEqual({
      error: 'A waypoint contains an invalid elevation.',
      ok: false
    });
  });

  it('parses a planned route and preserves route-point order', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <rte>
          <name>Summit plan</name>
          <desc>A planned walking route</desc>
          <rtept lat="53.1" lon="-1.2">
            <ele>0</ele>
            <name>Trailhead</name>
          </rtept>
          <rtept lat="53.2" lon="-1.3">
            <desc>Turn beside the cairn</desc>
          </rtept>
        </rte>
      </gpx>
    `);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected the GPX document to parse successfully');
    }

    expect(result.document.routes).toEqual([
      {
        description: 'A planned walking route',
        id: 'route-0',
        name: 'Summit plan',
        points: [
          {
            elevationMetres: 0,
            id: 'route-0-point-0',
            latitudeDegrees: 53.1,
            longitudeDegrees: -1.2,
            name: 'Trailhead'
          },
          {
            description: 'Turn beside the cairn',
            id: 'route-0-point-1',
            latitudeDegrees: 53.2,
            longitudeDegrees: -1.3
          }
        ]
      }
    ]);
    expect(result.document.tracks).toEqual([]);
    expect(result.document.waypoints).toEqual([]);
  });

  it('rejects a route point with missing coordinates', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <rte>
          <name>Summit plan</name>
          <rtept lat="53.1" />
        </rte>
      </gpx>
    `);

    expect(result).toEqual({
      error: 'A route point is missing its coordinates.',
      ok: false
    });
  });

  it('rejects a route point with invalid coordinates', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <rte>
          <name>Summit plan</name>
          <rtept lat="north" lon="-1.2" />
        </rte>
      </gpx>
    `);

    expect(result).toEqual({
      error: 'A route point contains invalid coordinates.',
      ok: false
    });
  });

  it('rejects a route point with invalid elevation', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <rte>
          <name>Summit plan</name>
          <rtept lat="53.1" lon="-1.2">
            <ele>unknown</ele>
          </rtept>
        </rte>
      </gpx>
    `);

    expect(result).toEqual({
      error: 'A route point contains an invalid elevation.',
      ok: false
    });
  });

  it('preserves multiple entities and their source order', () => {
    const result = parseGpx(`
      <gpx
        version="1.1"
        creator="GPSGoblin test"
        xmlns="http://www.topografix.com/GPX/1/1"
      >
        <wpt lat="53.1" lon="-1.1">
          <name>First waypoint</name>
        </wpt>
        <wpt lat="53.2" lon="-1.2">
          <name>Second waypoint</name>
        </wpt>
        <rte>
          <name>First route</name>
          <rtept lat="53.3" lon="-1.3" />
        </rte>
        <rte>
          <name>Second route</name>
          <rtept lat="53.4" lon="-1.4" />
        </rte>
        <trk>
          <name>First track</name>
          <trkseg>
            <trkpt lat="53.5" lon="-1.5" />
          </trkseg>
          <trkseg>
            <trkpt lat="53.6" lon="-1.6" />
          </trkseg>
        </trk>
        <trk>
          <name>Second track</name>
          <trkseg>
            <trkpt lat="53.7" lon="-1.7" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected the GPX document to parse successfully');
    }

    expect(result.document.waypoints.map(waypoint => waypoint.name)).toEqual([
      'First waypoint',
      'Second waypoint'
    ]);
    expect(result.document.routes.map(route => route.name)).toEqual([
      'First route',
      'Second route'
    ]);
    expect(result.document.tracks.map(track => track.name)).toEqual([
      'First track',
      'Second track'
    ]);
    expect(result.document.tracks[0]?.segments.map(segment => segment.id)).toEqual([
      'track-0-segment-0',
      'track-0-segment-1'
    ]);
  });
});
