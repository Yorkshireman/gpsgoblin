type ExampleActivityTestEnvironment = Readonly<{
  fetchExample: jest.Mock;
  markDirectEntry: () => void;
  restore: () => void;
}>;

export const createExampleGpxResponse = (trackName: string) => {
  const example = `<gpx version="1.1" creator="GPSGoblin example" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${trackName}</name><trkseg><trkpt lat="53.1" lon="-1.2"><ele>100</ele><time>2026-09-11T12:00:00Z</time></trkpt><trkpt lat="53.101" lon="-1.201"><ele>120</ele><time>2026-09-11T12:01:00Z</time></trkpt></trkseg></trk></gpx>`;
  return {
    blob: async () => {
      return new Blob([example], { type: 'application/gpx+xml' });
    },
    ok: true
  };
};

export const setupExampleActivityTestEnvironment =
  (): ExampleActivityTestEnvironment => {
    const fetchBeforeTest = global.fetch;
    const fetchExample = jest.fn();
    const locationBeforeTest = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    global.fetch = fetchExample;

    return {
      fetchExample,
      markDirectEntry: () => {
        window.history.replaceState(
          {},
          '',
          '/tools/gpx-file-viewer#example-activity'
        );
        return;
      },
      restore: () => {
        window.history.replaceState({}, '', locationBeforeTest);
        global.fetch = fetchBeforeTest;
        return;
      }
    };
  };
