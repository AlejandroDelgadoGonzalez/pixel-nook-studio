"""Versioned, local-only Chef handoffs. Atomic state includes adoption, learning and queue.
PNG hash codec pk-rgba-png/1 is shared with the static browser (uncompressed RGBA PNG).
Chef is the human-directed agent role: recipes record its visual inspection, not an AI service.
"""
import argparse, hashlib, io, json, re, struct, sys, zlib
from copy import deepcopy
from pathlib import Path
from contracts import reference, validate_bundle, digest
from manual_session import SessionStore, Conflict, encode_png
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
DEFAULT='.artifacts/pixel-kitchen-transition/chef-queue/session-v1'

def canonical_png(im):
    im=im.convert('RGBA'); w,h=im.size
    raw=b''.join(b'\0'+im.tobytes()[y*w*4:(y+1)*w*4] for y in range(h))
    def chunk(t,b):return struct.pack('>I',len(b))+t+b+struct.pack('>I',zlib.crc32(t+b)&0xffffffff)
    blocks=b''
    for p in range(0,len(raw),65535):
        b=raw[p:p+65535]; blocks+=bytes([int(p+len(b)==len(raw))])+struct.pack('<HH',len(b),65535-len(b))+b
    compressed=b'\x78\x01'+blocks+struct.pack('>I',zlib.adler32(raw)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',compressed)+chunk(b'IEND',b'')

def patch(im,changes):
    im=im.copy(); seen=set()
    if not isinstance(changes,list) or len(changes)>im.width*im.height:raise Conflict('Invalid changes')
    for c in changes:
        if not isinstance(c,dict) or set(c)-{'x','y','hex','colorHex'}:raise Conflict('Invalid pixel edit')
        x,y=c['x'],c['y']; color=c.get('hex',c.get('colorHex'))
        if type(x)!=int or type(y)!=int or not (0<=x<im.width and 0<=y<im.height) or (x,y) in seen:raise Conflict('Invalid/duplicate coordinates')
        if not isinstance(color,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?',color):raise Conflict('Invalid hex')
        rgba=tuple(bytes.fromhex(color[1:]+('FF' if len(color)==7 else '')))
        if rgba[3] not in (0,255):raise Conflict('Binary alpha required')
        if rgba[3]==0:rgba=(0,0,0,0)
        im.putpixel((x,y),rgba); seen.add((x,y))
    return im

class ChefStore(SessionStore):
    # Pending transaction metadata lives on this instance only during synchronous CLI import.
    transaction=None
    approval_actor="Alejandro via explicit copied handoff"
    def prepare(self,tasks):
        with self.lock():
            s=self._read()
            if 'queue' in s:return
            s.update(queue=deepcopy(tasks),learning=[],handoffs={})
            for t in s['queue']:
                c=self._consumer(s,t['key']); t['expectedCurrent']=c['current'];t['status']='waiting'
                t['cook']=s['consumers'][t['key']]['cook']
                cook=self._find(s,t['cook']);src=self._find(s,cook['source'])
                t['original']=src['image'];t['assetId']=cook['assetId']
                t['recipe'].update(sourceSha256=src['image']['sha256'],cookSha256=cook['image']['sha256'])
            self._next(s);self._validate(s);self._commit(s)
    def _candidate(self,s,t):
        cook=self._find(s,t['cook']);recipe=t['recipe'];source=self.root/t['original']['path']
        if hashlib.sha256(source.read_bytes()).hexdigest()!=recipe['sourceSha256']:raise Conflict('Original hash changed')
        if cook['image']['sha256']!=recipe['cookSha256'] or not recipe.get('inspection'):raise Conflict('Missing pinned visual inspection')
        im=Image.open(self.root/cook['image']['path']).convert('RGBA');out=patch(im,recipe.get('changes',[]))
        # Learning is consulted, but coordinates never transfer across unrelated assets/anatomy.
        lessons=[l['handoffId'] for l in s['learning']]
        for lesson in s['learning']:
            if lesson.get('cookBase')!=t['cook']:continue
            for change in lesson['changes']:
                x,y=change['x'],change['y']
                if list(out.getpixel((x,y)))==change['before']:out.putpixel((x,y),tuple(change['after']))
        token=digest(dict(cook=t['cook'],recipe=recipe,lessons=lessons))[:24]
        p=self.directory/'candidates'/token/'chef.png';p.parent.mkdir(parents=True,exist_ok=True)
        raw=canonical_png(out)
        if p.exists() and p.read_bytes()!=raw:raise Conflict('Immutable candidate collision')
        p.write_bytes(raw)
        changes=[dict(x=x,y=y,before=list(im.getpixel((x,y))),after=list(out.getpixel((x,y)))) for y in range(im.height) for x in range(im.width) if im.getpixel((x,y))!=out.getpixel((x,y))]
        r=dict(schemaVersion='pixel-kitchen/1',recordType='retouch',id='chef.'+t['key'],revision=token,assetId=cook['assetId'],assetType=cook['assetType'],scope=cook['scope'],pending=[],stage='chef',parent=t['cook'],editedFrom=t['cook'],comparisonBase=t['cook'],cookBase=t['cook'],image=dict(path=p.relative_to(self.root).as_posix(),sha256=hashlib.sha256(raw).hexdigest(),dimensions=list(im.size)),geometry=deepcopy(cook['geometry']),changes=changes,status='draft',approval=None)

        if not any(reference(v)==reference(r) for v in s['bundle']['records']):s['bundle']['records'].append(r)
        t['chef']=reference(r);t['lessonsConsulted']=lessons
        t['learningDecision']='Preserve protected geometry; do not transfer another asset\'s coordinate edits. Review source-specific lessons before a new recipe.'
        self._validate(s)
    def _next(self,s):
        t=next((t for t in s['queue'] if t['status']=='waiting'),None)
        if t:
            t['expectedCurrent']=self._consumer(s,t['key'])['current']
            self._candidate(s,t);t['status']='active'
    def _task_base(self,t,mode):
        if t and ((t['status']=='active' and mode in ('chef','cook')) or
                  (t['status']=='complete' and mode=='final')) and mode in t:
            return t[mode]
        raise Conflict('409: task or editing base is no longer available')

    def _expected(self,c,expected):
        super()._expected(c,expected)
        if self.transaction:
            s=self._read();t=next((t for t in s['queue'] if t['taskId']==self.transaction['taskId']),None)
            current_base=self._find(s,self._task_base(t,self.transaction['editedFrom']))
            if current_base['revision']!=self.transaction['baseRevision'] or current_base['image']['sha256']!=self.transaction['baseSha256']:raise Conflict('409: candidate changed during import')
    def _commit(self,s):
        if self.transaction and s.get('history') and s['history'][-1]['operation']=='approve-and-adopt':
            h=self.transaction;t=next(t for t in s['queue'] if t['taskId']==h['taskId'])
            final=self._find(s,s['history'][-1]['current'])
            was_active=t['status']=='active'
            parent=self._find(s,final['parent'])
            before=Image.open(self.root/parent['image']['path']).convert('RGBA')
            after=Image.open(self.root/final['image']['path']).convert('RGBA')
            edits=[dict(x=x,y=y,before=list(before.getpixel((x,y))),after=list(after.getpixel((x,y)))
                        ) for x,y in sorted({(c['x'],c['y']) for c in h['changes']},key=lambda p:(p[1],p[0]))
                   if before.getpixel((x,y))!=after.getpixel((x,y))]
            lesson=dict(handoffId=digest(h),assetId=t['assetId'],baseRevision=h['baseRevision'],baseSha256=h['baseSha256'],editedFrom=h['editedFrom'],comparisonBase=h['comparisonBase'],cookBase=final['cookBase'],final=reference(final),changes=edits,observation='Exact approved human changes; intent is not inferred. Preserve roots, supports and protected pixels.',status='observed-not-universal-rule')
            s['learning'].append(lesson);t['status']='complete';t['final']=reference(final)
            s['handoffs'][digest(h)]=dict(final=reference(final),taskId=t['taskId'])
            if was_active:self._next(s)
            self._validate(s)
        super()._commit(s)
    def receive(self,h):
        allowed={'schemaVersion','hashEncoding','taskId','assetId','baseRevision','baseSha256','editedFrom','comparisonBase','expectedCurrent','canvas','changes','finalSha256','geometry'}
        if not isinstance(h,dict) or set(h)-allowed:raise Conflict('Unknown handoff fields')
        s=self._read();receipt=digest(h)
        if receipt in s.get('handoffs',{}):return dict(status=200,replayed=True,**s['handoffs'][receipt])
        t=next((t for t in s['queue'] if t['taskId']==h.get('taskId')),None)
        if h.get('schemaVersion')!='pixel-kitchen-handoff/1' or h.get('hashEncoding')!='pk-rgba-png/1':raise Conflict('Unsupported handoff version/codec')
        mode=h.get('editedFrom')
        if mode not in ('chef','cook','final') or h.get('comparisonBase')!=mode:raise Conflict('Wrong editing/comparison base')
        parent=self._find(s,self._task_base(t,mode));pin=reference(parent)
        expected=pin if mode=='final' else t['expectedCurrent']
        if h.get('assetId')!=t['assetId'] or h.get('baseRevision')!=pin['revision'] or h.get('baseSha256')!=parent['image']['sha256']:raise Conflict('409: obsolete base hash/revision')
        if h.get('expectedCurrent')!=expected:raise Conflict('409: wrong expected consumer')
        if 'geometry' in h and h['geometry']!=parent['geometry']:raise Conflict('409: geometry/root altered')
        if h.get('canvas',parent['image']['dimensions'])!=parent['image']['dimensions']:raise Conflict('409: canvas altered')
        im=Image.open(self.root/parent['image']['path']).convert('RGBA');out=patch(im,h['changes']);raw=canonical_png(out)
        if hashlib.sha256(raw).hexdigest()!=h.get('finalSha256'):raise Conflict('409: finalSha256 mismatch')
        self.transaction=h
        try:r=self.approve(t['key'],expected,pin,h['baseSha256'],parent['geometry'],raw)
        finally:self.transaction=None
        self.materialize_learning()
        return dict(status=200,**r)
    def materialize_learning(self):
        # Recoverable projection; atomic state is authoritative even if projection is interrupted.
        s=self._read();d=self.directory/'learning';d.mkdir(exist_ok=True)
        for l in s.get('learning',[]):(d/(l['handoffId']+'.json')).write_text(json.dumps(l,indent=2)+'\n',encoding='utf-8')
    def export(self,destination):
        with self.lock():
            s=self._read();self._validate(s);out=Path(destination);out.mkdir(parents=True,exist_ok=True);tasks=[]
            for t in s['queue']:
                item={k:t[k] for k in ('taskId','assetId','status','expectedCurrent','label')};item['bases']={}
                if 'final' in t:
                    item['adoptedFinal']=self._consumer(s,t['key'])['current']==t['final']
                    item['expectedCurrent']=t['final']
                raw=(self.root/t['original']['path']).read_bytes()
                if hashlib.sha256(raw).hexdigest()!=t['original']['sha256']:raise Conflict('Original mismatch')
                name=t['taskId']+'-original.png';(out/name).write_bytes(raw)
                item['original']=dict(url=name,sha256=t['original']['sha256'],dimensions=t['original']['dimensions'])
                for mode in ('cook','chef','final'):
                    if mode not in t:continue
                    r=self._find(s,t[mode]);raw=(self.root/r['image']['path']).read_bytes();name=t['taskId']+'-'+mode+('-'+r['revision'] if mode=='final' else '')+'.png';(out/name).write_bytes(raw)
                    im=Image.open(io.BytesIO(raw)).convert('RGBA')
                    item['bases'][mode]=dict(url=name,revision=r['revision'],sha256=r['image']['sha256'],dimensions=list(im.size),rgba=list(im.tobytes()),geometry=r['geometry'])
                tasks.append(item)
            manifest=dict(schemaVersion='pixel-kitchen-queue/1',scope='isolated-pilot',generation=s['generation'],tasks=tasks)
            temp=out/'queue.tmp';temp.write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8');temp.replace(out/'queue.json')
            return manifest

def initialize(directory):
    from local_editor_server import initialize as seed
    seed(directory)
    store=ChefStore(ROOT,directory)
    store.prepare([dict(taskId='alice-front-v1',key='front',label='Alice - front',recipe=dict(inspection='Compared large front and native Cook: solid two-pixel eyes, closed black perimeter. Preserve approved design; no speculative pixel changes.',changes=[])),dict(taskId='drink-me-v1',key='object',label='Drink Me - bottle',recipe=dict(inspection='Compared large transparent bottle and native Cook: preserve cork, cream label and white glass reflection at 18px. No justified coordinate edit.',changes=[]))])
    return store

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--session',default=DEFAULT)
    sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('init');a=sub.add_parser('receive');a.add_argument('handoff',help='JSON file or - for stdin')
    a=sub.add_parser('export');a.add_argument('--out',default='app/pixel-kitchen-preview/queue')
    a=sub.add_parser('candidate');a.add_argument('recipe',help='Reviewed source-specific recipe JSON for active task')
    args=p.parse_args()
    try:
        store=initialize(ROOT/args.session)
        if args.command=='receive':
            raw=sys.stdin.read() if args.handoff=='-' else Path(args.handoff).read_text(encoding='utf-8-sig');raw=raw.strip()
            if raw.startswith('```'):raw='\n'.join(raw.splitlines()[1:-1])
            result=store.receive(json.loads(raw));store.export(ROOT/'app/pixel-kitchen-preview/queue');result['staticPackagePrepared']=True
        elif args.command=='export':result=store.export(ROOT/args.out);result={'tasks':len(result['tasks'])}
        elif args.command=='candidate':
            with store.lock():
                s=store._read();t=next(t for t in s['queue'] if t['status']=='active');recipe=json.loads(Path(args.recipe).read_text());recipe.update(sourceSha256=t['original']['sha256'],cookSha256=store._find(s,t['cook'])['image']['sha256']);t['recipe']=recipe;store._candidate(s,t);store._commit(s);result={'candidate':t['chef']}
        else:result={'initialized':str(store.directory)}
        print(json.dumps(result,indent=2))
    except (Conflict,ValueError,KeyError,TypeError,OSError) as e:print(json.dumps({'status':409,'error':str(e)}));sys.exit(1)
