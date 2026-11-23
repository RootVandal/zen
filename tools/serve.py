"""Local preview server without caching (so edits show up on reload).
    python -I tools/serve.py 5191
"""
import http.server
import sys
from functools import partial
from pathlib import Path


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5191
    root = Path(__file__).resolve().parent.parent
    handler = partial(NoCache, directory=str(root))
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
