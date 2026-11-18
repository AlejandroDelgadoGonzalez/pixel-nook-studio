"""Pack one NOOK review revision into a self-contained HTML file."""
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
LAYOUTS = ((360,800),(390,844),(430,932),(1280,720),(1366,640),(1080,1920))
MODES = ('Auto','9:16','16:9')


def embed(asset, root, native=False):
    path = (root / asset['path']).resolve()
    if not path.is_relative_to(root):
        raise ValueError('Asset must be inside the workspace')
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != asset['sha256']:
        raise ValueError(f'SHA256 mismatch: {asset["path"]}')
    with Image.open(io.BytesIO(raw)) as image:
        if image.format not in ('PNG','JPEG','WEBP'):
            raise ValueError('Unsupported raster format')
        if native and list(image.size) not in ([64,64],[32,32],[640,360],[1080,360]):
            raise ValueError('Cook must have native dimensions')
        rgba = image.convert('RGBA') if native else None
        return {**asset, 'name':path.name, 'dimensions':list(image.size), 'bytes':len(raw),
                'colors':len({p[:3] for p in rgba.getdata() if p[3]}) if native else None,
                'data':'data:'+Image.MIME[image.format]+';base64,'+base64.b64encode(raw).decode()}


def build(spec, output, root=ROOT):
    root = root.resolve()
    spec = json.loads(json.dumps(spec, allow_nan=False))
    if spec['schema'] != 'nook-review-board/1':
        raise ValueError('Unsupported Review Board input')
    gate = spec['gate']
    if gate not in (1,2,4,5):
        raise ValueError('Audio is paused')
    if gate < 4 and (spec['cook'] or spec['finishing']):
        raise ValueError('G1/G2 cannot show Cook or finishing')
    if spec['finishing'] and not spec['cook']:
        raise ValueError('Finishing needs Cook evidence')
    if spec['cook'] and any(not row.get('revision') or not row.get('geometry') for row in spec['cook']):
        raise ValueError('Cook needs revision and effective geometry')
    measures = spec['measure']
    keys = [(tuple(row['viewport']), row['mode']) for row in measures['frames']]
    if len(keys) != 18 or set(keys) != {(size,mode) for size in LAYOUTS for mode in MODES}:
        raise ValueError('Supply exactly 18 measured framing records')
    for row in measures['frames']:
        for name in ('frustum','safeFrame'):
            x,y,w,h = row[name]
            if w<=0 or h<=0:
                raise ValueError('Invalid framing rectangle')
    assets = spec['assets']
    native_ids = {row['native'] for row in spec['cook']}
    referenced = set(spec['precooked']) | set(spec['reused']) | {measures['background']}
    referenced |= {row[key] for row in spec['cook'] for key in ('original','native')}
    referenced |= {row[key] for row in spec['finishing'] for key in ('before','after')}
    if native_ids & set(spec['precooked']):
        raise ValueError('A Cook raster cannot be presented as precooked')
    spec['assets'] = {key:embed(assets[key], root, key in native_ids) for key in sorted(referenced)}
    for key in spec['precooked']:
        if max(spec['assets'][key]['dimensions']) <= 64:
            raise ValueError('Expected the large precooked source')
    package = json.dumps(spec, ensure_ascii=False).replace('<',r'\u003c')
    template = Path(__file__).with_name('template.html').read_text(encoding='utf-8')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(template.replace('@@BOARD_DATA@@',package).encode())
    receipt = dict(reviewId=spec['reviewId'], htmlSha256=hashlib.sha256(output.read_bytes()).hexdigest(),
                   inputs={k:v['sha256'] for k,v in spec['assets'].items()})
    output.with_suffix('.receipt.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
    return receipt


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    print(json.dumps(build(json.loads(args.input.read_text(encoding='utf-8')),args.output),indent=2))
