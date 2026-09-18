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
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.md': 'text/plain; charset=utf-8'
};

const fontStyle = (font, enlarged) => {
  const families = {
    inter: ['Inter Preview', 'InterVariable.woff2', '100 900'],
    source: ['Source Sans 3 Preview', 'SourceSans3VF-Upright.woff2', '200 900']
  };
  const candidate = families[font];
  return `<style>
    ${
      candidate
        ? `@font-face {font-family:'${candidate[0]}';src:url('/__typography/fonts/${candidate[1]}') format('woff2');font-weight:${candidate[2]};font-style:normal;font-display:swap;}
    :root {--chakra-fonts-body:'${candidate[0]}',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol' !important;--chakra-fonts-heading:var(--chakra-fonts-body) !important;}`
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
            `${fontStyle(url.searchParams.get('font'), url.searchParams.get('text') === '200')}</head>`
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
