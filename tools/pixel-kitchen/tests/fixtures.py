"""Synthetic geometry only. Writes exclusively to a supplied .artifacts directory."""
from copy import deepcopy
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw
from contracts import SIZES, PROFILES, reference


def common(kind, name, asset_type='character'):
    return dict(schemaVersion='pixel-kitchen/1', recordType=kind, id='synthetic.' + name,
                revision='test-v1', assetId='synthetic.' + asset_type, assetType=asset_type,
                scope='synthetic-test', pending=[])


def write_image(root, name, im):
    root = Path(root)
    if '.artifacts' not in root.resolve().parts:
        raise ValueError('Fixtures may only write under .artifacts')
    root.mkdir(parents=True, exist_ok=True)
    p = root / (name + '.png')
    im.save(p)
    return dict(path=p.name, sha256=hashlib.sha256(p.read_bytes()).hexdigest(), dimensions=list(im.size))


def fixture(root, asset_type='character'):
    w, h = SIZES[asset_type]
    im = Image.new('RGBA', (w, h), (90, 120, 160, 255) if asset_type in ('scene', 'panorama') else (0,0,0,0))
    ImageDraw.Draw(im).rectangle((4,4,w-5,h-5), fill=(180,140,90,255))
    records = []
    sources = []
    for view in ['front', 'side', 'back'] if asset_type == 'character' else ['front']:
        src = dict(**common('source', view, asset_type), view=view, poseId=view,
                   image=write_image(root, view, im), references=[reference(v) for v in sources],
                   review=dict(state='test-reviewed', receiptId='SYNTHETIC-ONLY'))
        sources.append(src)
        records.append(src)
    body = None
    root_point = [w/2+.5, h-5.5]
    geometry = dict(canvas=[w,h], root=root_point, transform=dict(scale=1, offset=[0,0]),
                    supports=[], contacts=[], protectedRegions=[])
    if asset_type == 'character':
        geometry.update(contacts=[dict(id='test-grip', point=[20,40], pixels=[[19,39]])],
                        supports=[dict(id='test-foot', point=[30.5,58.5], pixels=[[30,58]])],
                        protectedRegions=[dict(id='test-label', rect=[20,20,22,22])])
        body = dict(**common('body', 'body'), masters={v['view']:reference(v) for v in sources},
                    measures=dict(standingBodyHeight=54, headWidth=19, armWidth=3, footWidth=4), root=root_point,
                    views={v['view']:dict(sourceRoot=root_point,bodyHeightInSource=54,
                                          transform=dict(scale=1,offset=[0,0])) for v in sources})
        records.append(body)
    pose = dict(**common('pose','pose',asset_type), source=reference(sources[0]), view='front', poseId='front',
                bodyReference=reference(body) if body else None, sourceRoot=root_point,
                bodyHeightInSource=54 if body else None, geometry=deepcopy(geometry))
    cook = dict(**common('cook','cook',asset_type), source=reference(sources[0]), pose=reference(pose),
                profile=PROFILES[asset_type], engineVersion='synthetic-fixture/not-a-cook-engine',
                parameters=dict(synthetic=True), image=write_image(root,'cook',im), geometry=deepcopy(geometry))
    consumer = dict(**common('consumer','consumer',asset_type), storyId='synthetic-story', sceneId='synthetic-scene',
                    current=reference(cook), geometry=deepcopy(geometry))
    records += [pose,cook,consumer]
    return dict(schemaVersion='pixel-kitchen-bundle/1',records=records),cook,consumer


def retouch(bundle, root, parent, name='manual-final', stage='manual', approved=True, pixel=(10,10,(230,30,40,255))):
    by_key = {(r['id'],r['revision']):r for r in bundle['records']}
    cook_ref = reference(parent) if parent['recordType']=='cook' else parent['cookBase']
    compare_ref = reference(parent) if parent['recordType']=='cook' or parent.get('stage')=='chef' else parent['comparisonBase']
    compare = by_key[(compare_ref['id'],compare_ref['revision'])]
    im = Image.open(Path(root)/parent['image']['path']).convert('RGBA')
    if pixel:
        im.putpixel(pixel[:2],pixel[2])
    base = Image.open(Path(root)/compare['image']['path']).convert('RGBA')
    changes = [dict(x=x,y=y,before=list(base.getpixel((x,y))),after=list(im.getpixel((x,y))))
               for y in range(im.height) for x in range(im.width) if base.getpixel((x,y))!=im.getpixel((x,y))]
    r = dict(**common('retouch',name,parent['assetType']), stage=stage, parent=reference(parent),
             editedFrom=reference(parent), comparisonBase=compare_ref,cookBase=cook_ref,
             image=write_image(root,name,im),geometry=deepcopy(parent['geometry']),changes=changes,
             status='test-approved' if approved else 'draft',
             approval=dict(decision='simulated',by='test-fixture',receiptId='SYNTHETIC-ONLY') if approved else None)
    bundle['records'].append(r)
    return r


def repin(bundle):
    """Repin intentional fixture mutations; not an application repair helper."""
    index={(r['id'],r['revision']):r for r in bundle['records']};done=set()
    def visit(r):
        key=(r['id'],r['revision'])
        if key in done:return
        def walk(v):
            if isinstance(v,dict):
                if set(v)=={'id','revision','sha256'} and (v['id'],v['revision']) in index:
                    target=index[(v['id'],v['revision'])];visit(target);v['sha256']=reference(target)['sha256']
                else:
                    for x in v.values():walk(x)
            elif isinstance(v,list):
                for x in v:walk(x)
        walk(r);done.add(key)
    for r in bundle['records']:visit(r)
