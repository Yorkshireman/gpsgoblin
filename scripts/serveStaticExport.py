"""Local test server for out/, including its generated Cloudflare headers.

This supports only our global and workers.dev header rules, not arbitrary rules.
Actual-host redirects, preview indexing and Cloudflare behaviour need live QA.
"""
import argparse
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4173)
args = parser.parse_args()
output = Path('out').resolve()
blocks = (output / '_headers').read_text().strip().split('\n\n')
headers_by_rule = {}
for block in blocks:
    rule, *lines = block.splitlines()
    assert rule in ('/*', 'https://:version.:subdomain.workers.dev/*'), 'Unsupported header rule'
    assert all(line.startswith('  ') for line in lines), 'Unsupported header syntax'
    headers_by_rule[rule] = [line.strip().split(': ', 1) for line in lines]



class ExportHandler(SimpleHTTPRequestHandler):
    def log_request(self, code='-', size='-'):
        # Keep browser test output readable; server errors still use log_error.
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(output), **kwargs)

    def end_headers(self):
        for rule, headers in headers_by_rule.items():
            host = self.headers.get('Host', '').split(':', 1)[0].lower()
            if rule == '/*' or re.fullmatch(r'[^.]+\.[^.]+\.workers\.dev', host):
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
