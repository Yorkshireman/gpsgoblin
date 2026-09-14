import Link from 'next/link';

const Home = () => {
  return (
    <main>
      <h1>GPSGoblin</h1>
      <p>See your route, elevation, speed and pace from a GPX file.</p>
      <Link href='/tools/gpx-file-viewer'>Open GPX File Viewer</Link>
    </main>
  );
};

export default Home;
