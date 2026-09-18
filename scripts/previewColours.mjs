// Local design exploration over the static export; never writes to out/.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const port = Number(process.env.COLOURS_PORT ?? 4192);
const root = resolve('out');
const themes = {
  current: { name: 'Current', description: 'The existing light theme.' },
  woodland: {
    name: 'Woodland',
    description: 'Moss, cream and berry. A friendly woodland goblin.',
    page: '#f8f7f1',
    panel: '#fffefa',
    ink: '#303c27',
    muted: '#62684f',
    border: '#d9dac0',
    accent: '#49642c',
    soft: '#e8efce',
    hover: '#d5e2af',
    selected: '#f5e2ed',
    selection: '#873e65'
  },
  // Saved for later: docs/themes/mischief.md. Hidden from the active gallery.
  mischief: {
    name: 'Mischief',
    description: 'Muted plum on pale blue, with quiet blue information panels.',
    page: '#edf2f7',
    panel: '#ffffff',
    ink: '#3e3143',
    muted: '#6e5f6e',
    border: '#dbd0d7',
    accent: '#684171',
    soft: '#ede3ef',
    hover: '#e1cee3',
    selected: '#edf3f9',
    selection: '#385e82'
  },
  imp: {
    name: 'Imp',
    description: 'Inky violet and electric blue. Mischief with more bite.',
    page: '#e1eaf5',
    panel: '#ffffff',
    ink: '#21132f',
    muted: '#51435f',
    border: '#aaa0b8',
    accent: '#542080',
    soft: '#e6d5f5',
    hover: '#cfb1e8',
    selected: '#dceafe',
    selection: '#174c98',
    routeColour: '#542080'
  },
  bramble: {
    name: 'Bramble light',
    description: 'Deep forest green and bold berry. Woodland with more bite.',
    page: '#ebeeda',
    panel: '#fffef4',
    ink: '#18291c',
    muted: '#48533b',
    border: '#a9b38c',
    accent: '#254e24',
    soft: '#d4e6af',
    hover: '#b8d383',
    selected: '#f0dce8',
    selection: '#742445',
    routeColour: '#254e24'
  },
  'bramble-dark': {
    name: 'Bramble dark',
    description:
      'Forest at dusk: warm green surfaces, fresh moss and clear blue information panels.',
    mode: 'dark',
    page: '#151d17',
    panel: '#202b22',
    ink: '#eef3e4',
    muted: '#cbd5bf',
    border: '#667c5e',
    mutedBorder: '#4c6048',
    accent: '#b9d98b',
    soft: '#2f432b',
    hover: '#405834',
    contrast: '#172314',
    selected: '#20344a',
    selection: '#bedbfa',
    selectionContrast: '#15283d',
    routeColour: '#254e24'
  },
  trail: {
    name: 'Bright trail',
    description: 'Petrol teal, mint and lime. Fresh with a spark of energy.',
    page: '#f4f9f5',
    panel: '#fcfefb',
    ink: '#213e3d',
    muted: '#516a60',
    border: '#c9dfcf',
    accent: '#146361',
    soft: '#def0e5',
    hover: '#bde2d0',
    selected: '#eaf3bc',
    selection: '#506218'
  }
};

const palette = (name, accent, soft, hover, contrast = '#ffffff') => {
  return {
    [`${name}-fg`]: accent,
    [`${name}-solid`]: accent,
    [`${name}-contrast`]: contrast,
    [`${name}-subtle`]: soft,
    [`${name}-muted`]: hover,
    [`${name}-emphasized`]: hover,
    [`${name}-border`]: accent,
    [`${name}-focus-ring`]: accent,
    [`${name}-600`]: accent,
    [`${name}-700`]: accent
  };
};

const colourStyle = (theme, homepage) => {
  const mode = theme.mode ?? 'light';
  const values = theme.page
    ? {
        bg: theme.panel,
        'bg-panel': theme.panel,
        'bg-subtle': theme.page,
        'bg-muted': theme.page,
        'bg-emphasized': theme.border,
        'bg-inverted': theme.ink,
        fg: theme.ink,
        'fg-muted': theme.muted,
        'fg-subtle': theme.muted,
        'fg-inverted': theme.contrast ?? '#ffffff',
        border: theme.border,
        'border-muted': theme.mutedBorder ?? theme.border,
        'border-subtle': theme.mutedBorder ?? theme.border,
        'border-emphasized': theme.muted,
        ...palette(
          'green',
          theme.accent,
          theme.soft,
          theme.hover,
          theme.contrast
        ),
        ...palette(
          'teal',
          theme.accent,
          theme.soft,
          theme.hover,
          theme.contrast
        ),
        ...palette(
          'blue',
          theme.selection,
          theme.selected,
          theme.border,
          theme.selectionContrast
        )
      }
    : {};
  return `<style>:root,:root.${mode} {color-scheme:${mode};${Object.entries(
    values
  )
    .map(([key, value]) => {
      return `--chakra-colors-${key}:${value} !important;`;
    })
    .join(
      ''
    )}${theme.routeColour ? `--gpsgoblin-route-colour:${theme.routeColour};` : ''}} body {background:var(--chakra-colors-bg-muted) !important;} ${homepage ? 'main > div > div {background:var(--chakra-colors-bg-panel);}' : ''}</style>`;
};

const gallery = () => {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GPSGoblin colour exploration</title>
  <style>
  @font-face{font-family:Source;src:url('/__colours/body.woff2');font-weight:200 900}
  @font-face{font-family:Fraunces;src:url('/__colours/heading.woff2');font-weight:100 900}
  *{box-sizing:border-box}body{margin:0;background:#f5f5f4;color:#282b29;font-family:Source,Arial,sans-serif;font-size:18px}
  main{max-width:1200px;margin:auto;padding:32px 20px}h1,h2{font-family:Fraunces,Georgia,serif;font-optical-sizing:auto;font-variation-settings:'SOFT' 50,'WONK' 1}h1{margin:0 0 12px}p{max-width:70ch}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.card{border:1px solid #ccc;border-radius:12px;overflow:hidden;background:white}.info{padding:20px}.info h2{margin:0}.swatches{display:flex;gap:8px;margin:16px 0}.swatch{width:36px;height:36px;border:1px solid #aaa;border-radius:50%}a{color:inherit;text-underline-offset:3px}a:focus-visible{outline:3px solid #315a6b;outline-offset:4px}.links{display:flex;flex-wrap:wrap;gap:16px}iframe{width:100%;height:510px;border:0;border-top:1px solid #ccc;display:block}@media(max-width:700px){.grid{grid-template-columns:1fr}main{padding:24px 16px}}
  </style><main><h1>Bramble, day and night</h1><p>Bramble is our chosen theme. Compare the finalised light and dark versions. Fonts, type sizes and layout stay the same. Open a viewer to try your own file.</p><p>Each preview opens in a new tab. Files stay in that tab. Map routes use forest green with white outlines. Map tiles keep their usual colours; warnings and errors use the existing colours for each mode.</p><div class="grid">
  ${Object.entries(themes)
    .filter(([id]) => {
      return ['bramble', 'bramble-dark'].includes(id);
    })
    .map(([id, theme]) => {
      return `<section class="card"><div class="info"><h2>${theme.name}</h2><p>${theme.description}</p>${
        theme.page
          ? `<div class="swatches" aria-label="Theme colours">${[
              'page',
              'panel',
              'ink',
              'accent',
              'selection'
            ]
              .map((key) => {
                return `<span class="swatch" style="background:${theme[key]}" title="${key}: ${theme[key]}"></span>`;
              })
              .join('')}</div>`
          : ''
      }<div class="links"><a href="/?colours=${id}" target="_blank" rel="noopener" aria-label="Open ${theme.name} homepage in a new tab">Open homepage</a><a href="/tools/gpx-file-viewer?colours=${id}" target="_blank" rel="noopener" aria-label="Try ${theme.name} viewer in a new tab">Try viewer</a></div></div><iframe title="${theme.name} homepage preview" src="/?colours=${id}" loading="lazy"></iframe></section>`;
    })
    .join('')}</div></main></html>`;
};

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/__colours/' || url.pathname === '/__colours') {
      response
        .writeHead(200, {
          'Content-Type': types['.html'],
          'X-Robots-Tag': 'noindex'
        })
        .end(gallery());
      return;
    }
    const fonts = {
      '/__colours/body.woff2': 'SourceSans3VF-Upright.woff2',
      '/__colours/heading.woff2': 'Fraunces.woff2'
    };
    if (Object.hasOwn(fonts, url.pathname)) {
      response
        .writeHead(200, { 'Content-Type': types['.woff2'] })
        .end(await readFile(resolve('src/app/fonts', fonts[url.pathname])));
      return;
    }
    let filename = resolve(
      root,
      decodeURIComponent(url.pathname.slice(1)) || 'index.html'
    );
    if (!filename.startsWith(root + sep) || url.pathname === '/_headers') {
      response.writeHead(404).end();
      return;
    }
    if (!extname(filename)) filename += '.html';
    let body = await readFile(filename);
    if (extname(filename) === '.html') {
      const requested = url.searchParams.get('colours') ?? 'current';
      const id = Object.hasOwn(themes, requested) ? requested : 'current';
      const theme = themes[id];
      // Per-window mode avoids storage events changing the other preview iframe.
      // This override is served only on the local exploration origin.
      const mode = theme.mode ?? 'light';
      const script = `<script>const originalGetItem=Storage.prototype.getItem;Storage.prototype.getItem=function(key){if(this===localStorage&&key==='theme')return ${JSON.stringify(mode)};return originalGetItem.call(this,key);};document.addEventListener('click',function(event){const link=event.target.closest('a');if(!link)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&!url.pathname.startsWith('/__colours')){url.searchParams.set('colours',${JSON.stringify(id)});event.preventDefault();event.stopImmediatePropagation();if(link.target==='_blank'||event.metaKey||event.ctrlKey){window.open(url.href,'_blank','noopener');}else{location.assign(url.href);}}},true);</script>`;
      body = Buffer.from(
        body
          .toString()
          .replace(
            '</head>',
            `${colourStyle(theme, ['/', '/index.html'].includes(url.pathname))}${script}</head>`
          )
      );
    }
    response
      .writeHead(200, {
        'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex'
      })
      .end(body);
  } catch {
    response
      .writeHead(404)
      .end('Not found. Run pnpm build before starting this preview.');
  }
  return;
}).listen(port, '127.0.0.1', () => {
  console.log(`Colour comparison: http://127.0.0.1:${port}/__colours/`);
  return;
});
