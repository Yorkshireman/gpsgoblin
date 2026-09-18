// Local-only exploration of the actual static export; nothing is added to out/.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const port = Number(process.env.TYPOGRAPHY_PORT ?? 4190);
const exportRoot = resolve('out');
const explorationRoot = resolve('docs/typography');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.md': 'text/plain; charset=utf-8'
};

const fontStyle = (font, enlarged, homepage) => {
  const families = {
    inter: ['Inter Preview', 'InterVariable.woff2', '100 900'],
    source: ['Source Sans 3 Preview', 'SourceSans3VF-Upright.woff2', '200 900'],
    bricolage: ['Bricolage Preview', 'BricolageGrotesque.woff2', '200 800'],
    fraunces: ['Fraunces Preview', 'Fraunces.woff2', '100 900'],
    grenze: ['Grenze Preview', 'Grenze.woff2', '100 900'],
    goblin: ['Goblin One Preview', 'GoblinOne.ttf', '400']
  };
  const candidate = Object.hasOwn(families, font) ? families[font] : undefined;
  const paired = ['bricolage', 'fraunces', 'grenze', 'goblin'].includes(font);
  const body = paired ? families.source : candidate;
  const heading = font === 'goblin' ? body : candidate;
  const face = (family) => {
    return `@font-face {font-family:'${family[0]}';src:url('/__typography/fonts/${family[1]}') format('${family[1].endsWith('.ttf') ? 'truetype' : 'woff2'}');font-weight:${family[2]};font-style:normal;font-display:swap;}`;
  };
  const fallback =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'";
  return `<style>
    ${
      candidate
        ? `${face(candidate)}${paired ? face(body) : ''}
    :root {--chakra-fonts-body:'${body[0]}',${fallback} !important;--chakra-fonts-heading:'${heading[0]}',${fallback} !important;}
    ${font === 'fraunces' ? "h1,h2,h3,h4,h5,h6 {font-variation-settings:'SOFT' 50,'WONK' 1;}" : ''}
    ${font === 'goblin' && homepage ? `h1 {font-family:'${candidate[0]}',${fallback} !important;font-weight:400 !important;}` : ''}`
        : ''
    }
    ${enlarged ? ':root {font-size:32px !important;}' : ''}
  </style>`;
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const isExploration = url.pathname.startsWith('/__typography/');
    const root = isExploration ? explorationRoot : exportRoot;
    const pathname = decodeURIComponent(
      isExploration
        ? url.pathname.slice('/__typography/'.length)
        : url.pathname.slice(1)
    );
    let filename = resolve(root, pathname || 'index.html');
    if (!filename.startsWith(root + sep) || pathname === '_headers') {
      response.writeHead(404).end();
      return;
    }
    if (!extname(filename)) filename += '.html';
    let body = await readFile(filename);
    if (extname(filename) === '.html' && !isExploration) {
      body = Buffer.from(
        body
          .toString()
          .replace(
            '</head>',
            `${fontStyle(url.searchParams.get('font'), url.searchParams.get('text') === '200', ['/', '/index.html'].includes(url.pathname))}</head>`
          )
      );
    }
    // This deliberately modified preview is not a production security-header test.
    response
      .writeHead(200, {
        'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex'
      })
      .end(body);
  } catch {
    response.writeHead(404).end('Not found. Build the static export first.');
  }
  return;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Typography comparison: http://127.0.0.1:${port}/__typography/`);
  return;
});
