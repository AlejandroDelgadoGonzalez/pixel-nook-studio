"""Loopback-only manual/final pilot. No LAN, story routes or production writes."""
import argparse
import base64
from copy import deepcopy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlsplit,parse_qs,unquote

from approve_pilot_inputs import repin_revision
from contracts import validate_bundle
from manual_session import SessionStore,Conflict

ROOT=Path(__file__).resolve().parents[2]
TOOLS=Path(__file__).resolve().parent
PILOT=ROOT/'.artifacts/pixel-kitchen-transition/cook-phaser-pilot'


def initialize(directory):
    source=json.loads((PILOT/'contracts.json').read_text(encoding='utf-8'))
    verdict=validate_bundle(source,ROOT)
    if not verdict['ready']:raise Conflict(str(verdict))
    def protect(r):
        if r['recordType'] in ('pose','cook') and r['source']['id']=='pilot.alice.source.front':
            r['geometry']['contacts']=[dict(id='hand-preservation-landmark',point=[23.5,42.5],pixels=[[23,42]])]
            r['geometry']['protectedRegions']=[dict(id='hand-preservation',rect=[22,41,25,44])]
        if r['recordType'] in ('pose','cook') and r['source']['id']=='pilot.drink-me.source.front':
            r['geometry']['protectedRegions']=[dict(id='cream-label',rect=[12,22,19,24])]
    seed=repin_revision(source,'local-contact-calibration-v1',protect)
    return SessionStore(ROOT,directory,seed,dict(front='pilot.alice.source.front.cook',object='pilot.drink-me.source.front.cook'))


def handler(store):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args):pass

        def send(self,value,status=200,mime='application/json'):
            raw=value if isinstance(value,bytes) else json.dumps(value).encode()
            self.send_response(status);self.send_header('Content-Type',mime)
            self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff')
            self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)

        def do_GET(self):
            try:
                u=urlsplit(self.path);path=unquote(u.path)
                if path=='/api/state':return self.send(store.snapshot())
                if path.startswith('/api/image/'):
                    identity,revision=path.removeprefix('/api/image/').split('/')
                    return self.send(store.image(identity,revision,parse_qs(u.query)['sha256'][0]),mime='image/png')
                files={'/':(TOOLS/'manual_editor.html','text/html; charset=utf-8'),
                  '/editor.js':(TOOLS/'manual_editor.js','text/javascript; charset=utf-8'),
                  '/preview/':(PILOT/'index.html','text/html; charset=utf-8'),
                  '/vendor/phaser/phaser.min.js':(ROOT/'vendor/phaser/phaser.min.js','text/javascript; charset=utf-8'),
                  '/tools/pixel-kitchen/pilot-viewer.js':(TOOLS/'pilot-viewer.js','text/javascript; charset=utf-8')}
                prefix='/.artifacts/pixel-kitchen-transition/cook-phaser-pilot/'
                if path.startswith(prefix):
                    name=path[len(prefix):]
                    if name in ['placement.json','body-measurements.json','report.json','forest-640.png',
                                'alice-front-64.png','alice-side-64.png','alice-back-64.png','drink-me-32.png']:
                        files[path]=(PILOT/name,'image/png' if name.endswith('.png') else 'application/json')
                if path not in files:return self.send(dict(error='Not found'),404)
                file,mime=files[path];return self.send(file.read_bytes(),mime=mime)
            except (ValueError,KeyError,Conflict,OSError) as e:self.send(dict(error=str(e)),409)

        def do_POST(self):
            try:
                port=self.server.server_address[1]
                if self.headers.get('Host') not in (f'127.0.0.1:{port}',f'localhost:{port}'):return self.send(dict(error='Loopback host required'),403)
                origin=self.headers.get('Origin')
                if origin and origin not in (f'http://127.0.0.1:{port}',f'http://localhost:{port}'):return self.send(dict(error='Cross-origin write rejected'),403)
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=1024*1024:return self.send(dict(error='Invalid request size'),413)
                data=json.loads(self.rfile.read(size))
                if self.path=='/api/approve':
                    raw=base64.b64decode(data['png'].split(',')[-1],validate=True)
                    result=store.approve(data['key'],data['expectedCurrent'],data['editedFrom'],data['parentSha256'],data['geometry'],raw)
                elif self.path=='/api/rollback':result=store.rollback(data['key'],data['expectedCurrent'])
                else:return self.send(dict(error='Not found'),404)
                self.send(result)
            except (ValueError,KeyError,Conflict,OSError) as e:self.send(dict(error=str(e)),409)
    return Handler


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--port',type=int,default=8891)
    p.add_argument('--session',default='.artifacts/pixel-kitchen-transition/manual-final-pilot/session-v1')
    args=p.parse_args();store=initialize((ROOT/args.session).resolve())
    class LocalServer(ThreadingHTTPServer):request_queue_size=128
    server=LocalServer(('127.0.0.1',args.port),handler(store))
    print(f'Local isolated manual/final pilot: http://127.0.0.1:{args.port}',flush=True)
    server.serve_forever()
