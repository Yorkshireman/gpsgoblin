import { parseGpx } from './parseGpx';

describe('parseGpx', () => {
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
        format: 'gpx',
        originalContents: fileText,
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
        version: '1.1'
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
});
