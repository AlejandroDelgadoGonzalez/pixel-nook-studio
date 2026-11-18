"""Generate two isolated board fixtures from pinned Cook → Phaser inputs."""
from copy import deepcopy
import json
from pathlib import Path

from build import ROOT, LAYOUTS, MODES, build

PILOT = ROOT / '.artifacts/pixel-kitchen-transition/cook-phaser-pilot'
OUTPUT = ROOT / '.artifacts/pixel-kitchen-transition/review-board-phase-e'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def fixture():
    records = read(PILOT/'contracts.json')['records']
    placement = read(PILOT/'placement.json')
    assets = {}
    cooks = []
    for r in records:
        if r['recordType'] not in ('source','cook'):
            continue
        source = r.get('source',{}).get('id',r['id'])
        title = ('Alice · '+source.split('.')[-1].title() if '.alice.' in source else
                 'Drink Me · Front' if '.drink-me.' in source else 'Forest cottage and river')
        assets[r['id']] = {**r['image'], 'label':title, 'revision':r['revision']}
        if r['recordType']=='source':
            assets[r['id']].update(
                view=r['view'], references=[ref['id'] for ref in r['references']],
                status='Visual approval recorded for the isolated source pilot · '+r['review']['state'],
                reviewReceipt=r['review']['receiptId'], beats=['B1'])
        else:
            cooks.append(dict(label=title,original=source,native=r['id'],geometry=r['geometry'],revision=r['revision']))
    def point(id,xy,consumer,evidence,labelOffset):
        return dict(id=id,xy=xy,consumer=consumer,evidence=evidence,labelOffset=labelOffset)
    frames=[]
    for w,h in LAYOUTS:
        for mode in MODES:
            ratio = {'9:16':9/16,'16:9':16/9}.get(mode,w/h)
            fw,fh=min(640,360*ratio),min(360,640/ratio)
            x,y=max(0,min(640-fw,414-fw/2)),max(0,360-fh)
            rect=[round(f,3) for f in (x,y,fw,fh)]
            frames.append(dict(viewport=[w,h],mode=mode,frustum=rect,
                safeFrame=[round(f,3) for f in (x+8,y+8,fw-16,fh-16)],
                evidence='Static fixture. 8 world-pixel inset for illustration; dialogue reserve unmeasured.'))
    ax,ay=placement['aliceRoot']
    ox,oy=placement['objectRoot']
    alice_geometry=assets['pilot.alice.source.front']
    alice_geometry['bodyScale']='Shared front / side / back body calibration from the pilot'
    paper=dict(schema='nook-review-board/1',title='Forest path · isolated format pilot',
        storyId='isolated-review-fixture',sceneId='forest-path-fixture',reviewId='review-board-pre-cook-v1',
        gate=2, assets=assets, reused=['pilot.forest.source.front'],
        precooked=[k for k in assets if k.startswith(('pilot.alice','pilot.drink-me')) and not k.endswith('.cook')],
        cook=[],finishing=[],
        decisions=[dict(gate='G1 Narrative',state='FIXTURE',detail='Synthetic English text for format review. Scene approval pending.'),
                   dict(gate='G2 Art / geometry',state='FIXTURE',detail='Input visual approvals retained. Board and scene geometry remain unapproved.'),
                   dict(gate='G4 Programming',state='NOT RUN',detail='Cook inputs withheld in this pre-Cook simulation.'),
                   dict(gate='G5 QA',state='PENDING',detail='Scene runtime and export certification pending.')],
        narrative=dict(chapterMap=['B1 · Static path and silhouette check.'],
          causal=[['B1','Alice and the bottle stand on the measured path.','Their support line is visible against the complete background.']],
          text=['Alice stood on the path. The little bottle rested beside her.'],
          beats=[['B1','Static hold · no canonical duration','Alice and the bottle remain in place. The route layer is a drawing fixture.']]),
        measure=dict(background='pilot.forest.source.front',world=placement['world'],
          note='Complete original background mapped to 640 × 360 world units. Roots and ground come from the isolated pilot. Timed route, contact example, occluder and framing are static fixtures.',
          frames=frames,
          points=[point('1',[360,300],'B1 ground','Pilot placement.json',[0,-6]),point('2',[470,300],'B1 ground','Pilot placement.json',[0,-6])],
          roots=[point('Alice root',[ax,ay],'B1 Alice','Pilot placement.json',[-10,-23]),point('Bottle root',[ox,oy],'B1 bottle','Pilot placement.json',[8,-23])],
          supports=[point('Foot L',[ax-4,ay],'B1 Alice','Pilot native geometry projected by constant world offset',[-14,-11]),
                    point('Foot R',[ax+4,ay],'B1 Alice','Pilot native geometry projected by constant world offset',[6,-10]),
                    point('Base',[ox+.5,oy],'B1 bottle','Pilot native geometry projected by constant world offset',[9,-9])],
          contacts=[point('Ground contact',[ox,oy],'B1 bottle','Static marker at the measured base root',[15,17])],
          surfaces=[dict(id='Path support',vertices=placement['supportSegment'])],
          occluders=[dict(id='Example mask',vertices=[[53,213],[88,209],[99,260],[54,267]],evidence='Synthetic overlay only')],
          routes=[dict(id='Example route',samples=[dict(ms=0,xy=[335,320]),dict(ms=500,xy=[374,319]),
                                                dict(ms=1000,xy=[413,319]),dict(ms=1500,xy=[452,320])])]),
        evidence=[dict(scope='Static review board',state='FORMAT PILOT',detail='Synthetic staging evidence. No story or gate approval.'),
                  dict(scope='Runtime',state='OUT OF SCOPE',detail='Earlier isolated Cook → Phaser evidence is separate.'),
                  dict(scope='Encoded export',state='NOT RUN',detail='No MP4 or physical device evidence for this review.')])
    cooked=deepcopy(paper)
    cooked.update(reviewId='review-board-post-cook-v1',gate=4,cook=cooks)
    cooked['decisions'][2].update(state='COOK AVAILABLE',detail='Reuses immutable native outputs of the earlier isolated pilot. No scene implementation.')
    cooked['evidence'].append(dict(scope='Cook',state='EXISTING PILOT OUTPUTS',detail=str((PILOT/'contracts.json').relative_to(ROOT))))
    return paper,cooked


if __name__=='__main__':
    for name, board in zip(('pre-cook','post-cook'),fixture()):
        output=OUTPUT/name/'REVIEW-BOARD.html'
        build(board,output)
        print(output)
