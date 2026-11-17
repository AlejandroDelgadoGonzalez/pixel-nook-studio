"""Record Alejandro's explicit four-input approval; never recook or alter PNGs."""
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

from contracts import reference, digest, validate_bundle

ROOT=Path(__file__).resolve().parents[2]
PILOT=ROOT/'.artifacts/pixel-kitchen-transition/cook-phaser-pilot'
RECEIPT=PILOT/'approvals/input-visual-approval-v2.json'
PINS={
 'pilot.alice.source.front':'92b7878cbf4805677017dcfd1f5e6e869075d0474b17b2a6af4185806999250d',
 'pilot.alice.source.back':'df343d7ee6f7efb7dadee1ea5842205459889faf3e1f0c3e89bcbb1f4922fb3a',
 'pilot.drink-me.source.front':'4298bb42402dc2f62331b223dedba5f24d1bee11ecd365ccab8075aa805638d9',
 'pilot.forest.source.front':'00019941dc5821a5b3b3c4d0c875e44c7497acaeafab9a827a115b7a93fcbc5a'}


def write_json(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes((json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode())


def repin_revision(bundle,revision,edit=lambda r:None):
    """Derive an immutable metadata revision from an already validated graph."""
    records=deepcopy(bundle['records']);index={}
    for old,new in zip(bundle['records'],records):
        index[(old['id'],old['revision'])]=new
        new['revision']=revision;edit(new)
    done=set();visiting=set()
    def visit(r):
        if r['id'] in done:return
        if r['id'] in visiting:raise ValueError('Cyclic metadata derivation')
        visiting.add(r['id'])
        def walk(value):
            if isinstance(value,dict):
                if set(value)=={'id','revision','sha256'}:
                    target=index[(value['id'],value['revision'])];visit(target)
                    value.update(reference(target))
                else:
                    for v in value.values():walk(v)
            elif isinstance(value,list):
                for v in value:walk(v)
        walk(r);visiting.remove(r['id']);done.add(r['id'])
    for r in records:visit(r)
    return dict(schemaVersion=bundle['schemaVersion'],records=records)


def register():
    path=PILOT/'contracts.json';original=path.read_bytes();bundle=json.loads(original)
    initial=validate_bundle(bundle,ROOT)
    if not initial['valid']:raise ValueError(initial)
    sources={r['id']:r for r in bundle['records'] if r['recordType']=='source'}
    for name,pin in PINS.items():
        desc=sources[name]['image']
        if desc['sha256']!=pin or hashlib.sha256((ROOT/desc['path']).read_bytes()).hexdigest()!=pin:
            raise ValueError('Approval input hash conflict: '+name)
    if RECEIPT.exists() and initial['ready']:return initial
    history=PILOT/'history';history.mkdir(exist_ok=True)
    (history/('contracts-'+digest(bundle)+'.json')).write_bytes(original)
    for name in ['report.json','validation.json','body-measurements.json']:
        p=PILOT/name;raw=p.read_bytes()
        (history/(p.stem+'-'+hashlib.sha256(raw).hexdigest()+'.json')).write_bytes(raw)
    receipt=dict(schemaVersion='pixel-kitchen-visual-receipt/1',receiptId='pilot-input-visual-approval-v2',
       approvedBy='Alejandro',status='approved-visually',recordedAt=datetime.now(timezone.utc).isoformat(),
       evidence='Confirmación directa: Alejandro ya revisó y aprobó visualmente Alice front, Alice back, botella Drink Me y escenario 01-forest-cottage-river; Alice side ya aprobado.',
       scope='Exact existing pilot inputs; not alpha certification, scene certification or production adoption',
       inputs=[dict(id=name,source=deepcopy(sources[name]['image']),
                    cooked=deepcopy(next(r['image'] for r in bundle['records'] if r['recordType']=='cook' and r['source']['id']==name))) for name in PINS])
    write_json(RECEIPT,receipt)
    def approve(r):
        if r['recordType']=='source' and r['id'] in PINS:
            r['review']=dict(state='approved',receiptId=RECEIPT.relative_to(ROOT).as_posix())
    updated=repin_revision(bundle,'pilot-approved-v2',approve)
    verdict=validate_bundle(updated,ROOT)
    if not verdict['ready']:raise ValueError(verdict)
    write_json(path,updated);write_json(PILOT/'validation.json',verdict)
    report=json.loads((PILOT/'report.json').read_text(encoding='utf-8'))
    report['validation']=verdict;report['approvalReceipt']=RECEIPT.relative_to(ROOT).as_posix()
    report['limitations']=[s for s in report.get('pending',[]) if 'review' not in s.lower()]
    report['pending']=[]
    measurements=json.loads((PILOT/'body-measurements.json').read_text(encoding='utf-8'))
    for view,v in measurements['views'].items():
        v['review']=next(r['review'] for r in updated['records'] if r['recordType']=='source' and r['id']=='pilot.alice.source.'+view)
    write_json(PILOT/'body-measurements.json',measurements)
    report['bodyReference']=measurements;write_json(PILOT/'report.json',report)
    html=PILOT/'index.html';text=html.read_text(encoding='utf-8')
    text=text.replace('Technical pilot only. Visual approval of Alice side is recorded separately from alpha/geometry. Front/back and other missing source review receipts remain pending; nothing is adopted.',
      'All five inputs are visually approved by exact hash. Native contracts are ready; source alpha quality and scene certification remain separate. This page shows the isolated pilot, not a story migration.')
    html.write_bytes(text.encode())
    return verdict


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--record-alejandro-approval',action='store_true',required=True)
    p.parse_args();print(json.dumps(register(),indent=2))
