type FileFixture = Readonly<{
  name: string;
  contents: string;
  type?: string;
}>;

// Synthetic examples only. Equatorial points one degree apart give 111.2 km.
const fixtures = {
  sourceMetadata: {
    name: 'metadata.gpx',
    contents: `
      <gpx version="1.1" creator="GPSGoblin test exporter" xmlns="http://www.topografix.com/GPX/1/1">
        <metadata>
          <name>Weekend walk</name>
          <desc>&lt;strong&gt;Original file notes&lt;/strong&gt;</desc>
        </metadata>
        <rte>
          <name>Ridge route</name>
          <desc>Follow the ridge</desc>
          <rtept lat="0" lon="0" />
          <rtept lat="0" lon="1" />
        </rte>
        <trk>
          <name>Morning track</name>
          <desc>&lt;em&gt;Recorded walk notes&lt;/em&gt;</desc>
          <trkseg><trkpt lat="0" lon="0" /></trkseg>
        </trk>
        <trk>
          <name>Track without notes</name>
          <trkseg><trkpt lat="0" lon="1" /></trkseg>
        </trk>
      </gpx>
    `
  },
  filenameOnly: {
    name: 'route.gpx',
    contents: '<gpx version="1.1"></gpx>'
  },
  singleTrack: {
    name: 'route.gpx',
    contents: `
      <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Morning route</name>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2" />
          </trkseg>
        </trk>
      </gpx>
    `
  },
  malformedXml: {
    name: 'broken.gpx',
    contents: '<gpx version="1.1"><trk></gpx>'
  },
  equatorTrack: {
    name: 'equator-route.gpx',
    contents: `
      <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Equator route</name>
          <trkseg>
            <trkpt lat="0" lon="0" />
            <trkpt lat="0" lon="1" />
          </trkseg>
        </trk>
      </gpx>
    `
  },
  emptyDocument: {
    name: 'empty.gpx',
    contents: `
      <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1" />
    `
  },
  emptyTrack: {
    name: 'empty-track.gpx',
    contents: `
      <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <trkseg />
        </trk>
      </gpx>
    `
  },
  unsupportedFile: {
    name: 'route.txt',
    contents: 'Not a GPX document',
    type: 'text/plain'
  },
  multipleTracks: {
    name: 'tracks.gpx',
    contents: `
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Morning track</name>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2" />
          </trkseg>
        </trk>
        <trk>
          <name>Evening track</name>
          <trkseg>
            <trkpt lat="53.2" lon="-1.3" />
          </trkseg>
        </trk>
      </gpx>
    `
  },
  trackAndRoute: {
    name: 'track-and-route.gpx',
    contents: `
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <rte>
          <name>Hill route</name>
          <rtept lat="0" lon="0" />
          <rtept lat="0" lon="1" />
        </rte>
        <trk>
          <name>Morning track</name>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2" />
          </trkseg>
        </trk>
      </gpx>
    `
  },
  routeOnly: {
    name: 'route-only.gpx',
    contents: `
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <rte>
          <name>Equator route</name>
          <rtept lat="0" lon="0" />
          <rtept lat="0" lon="1" />
        </rte>
      </gpx>
    `
  },
  trackRouteAndWaypoints: {
    name: 'mixed.gpx',
    contents: `
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <wpt lat="53.1" lon="-1.2">
          <ele>0</ele>
          <name>Summit</name>
          <desc>A place to rest</desc>
        </wpt>
        <wpt lat="54" lon="-2" />
        <rte>
          <name>Planned walk</name>
          <rtept lat="0" lon="0" />
          <rtept lat="0" lon="1" />
        </rte>
        <trk>
          <name>Recorded walk</name>
          <trkseg>
            <trkpt lat="0" lon="0" />
          </trkseg>
        </trk>
      </gpx>
    `
  },
  waypointOnly: {
    name: 'waypoint.gpx',
    contents: `
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <wpt lat="0" lon="0" />
      </gpx>
    `
  },
  selectableSegments: {
    name: 'segments.gpx',
    contents: `
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Segmented walk</name>
          <trkseg>
            <trkpt lat="0" lon="0" />
            <trkpt lat="0" lon="1" />
          </trkseg>
          <trkseg>
            <trkpt lat="0" lon="10" />
            <trkpt lat="0" lon="12" />
          </trkseg>
          <trkseg>
            <trkpt lat="0" lon="20" />
          </trkseg>
        </trk>
        <trk>
          <name>Another walk</name>
          <trkseg>
            <trkpt lat="0" lon="30" />
          </trkseg>
        </trk>
      </gpx>
    `
  },
  segmentedTrack: {
    name: 'route.gpx',
    contents: `
      <gpx version="1.1" creator="GPSGoblin test" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Morning route</name>
          <trkseg>
            <trkpt lat="53.1" lon="-1.2" />
          </trkseg>
          <trkseg>
            <trkpt lat="53.2" lon="-1.3" />
          </trkseg>
        </trk>
      </gpx>
    `
  }
} satisfies Record<string, FileFixture>;

export const createTestFile = (fixtureName: keyof typeof fixtures) => {
  const fixture: FileFixture = fixtures[fixtureName];

  return new File([fixture.contents], fixture.name, {
    type: fixture.type ?? 'application/gpx+xml'
  });
};
