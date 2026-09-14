"""Local test server for out/, including its global Cloudflare Pages headers.

This supports only the global rule we generate, not arbitrary Cloudflare rules.
Actual-host redirects, preview indexing and Cloudflare behaviour need live QA.
"""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4173)
args = parser.parse_args()
output = Path('out').resolve()
lines = (output / '_headers').read_text().splitlines()
assert lines[0] == '/*', 'Expected one global header rule'
assert all(line.startswith('  ') for line in lines[1:] if line), 'Unsupported header rule'
headers = [line.strip().split(': ', 1) for line in lines[1:] if line]


class ExportHandler(SimpleHTTPRequestHandler):
    def log_request(self, code='-', size='-'):
        # Keep browser test output readable; server errors still use log_error.
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(output), **kwargs)

    def end_headers(self):
        for name, value in headers:
            self.send_header(name, value)
        super().end_headers()

    def send_head(self):
        # Never expose the deployment configuration as a downloadable asset.
        if unquote(urlsplit(self.path).path).rstrip('/') == '/_headers':
            self.send_error(404)
            return
        return super().send_head()

    def translate_path(self, path):
        translated = super().translate_path(path)
        # Next exports /privacy to privacy.html; links and direct visits both work.
        if not Path(translated).suffix and Path(translated + '.html').is_file():
            return translated + '.html'
        return translated


ThreadingHTTPServer(('127.0.0.1', args.port), ExportHandler).serve_forever()
