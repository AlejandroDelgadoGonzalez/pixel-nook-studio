"""Small file-backed, isolated-consumer manual/final transaction. No story writes."""
from contextlib import contextmanager
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path
import threading
from uuid import uuid4

from PIL import Image
from contracts import validate_bundle, check_adoption, reference


class Conflict(ValueError):
    pass


def png_hash(raw):return hashlib.sha256(raw).hexdigest()


def encode_png(im):
    b=io.BytesIO();im.save(b,format='PNG',optimize=True);return b.getvalue()


class SessionStore:
    def __init__(self,root,directory,bundle=None,bindings=None):
        self.root=Path(root).resolve();self.directory=Path(directory).resolve()
        if not self.directory.is_relative_to(self.root/'.artifacts'):
            raise ValueError('Local session writes must remain below .artifacts')
        self.directory.mkdir(parents=True,exist_ok=True)
        self.path=self.directory/'state.json';self.mutex=threading.RLock()
        with self.lock():
            if not self.path.exists():
                if bundle is None or not bindings:raise ValueError('Missing isolated-session seed')
                verdict=validate_bundle(bundle,self.root)
                if not verdict['ready']:raise Conflict(str(verdict))
                b=deepcopy(bundle);consumers={}
                for key,cook_id in bindings.items():
                    cook=next(r for r in b['records'] if r['id']==cook_id and r['recordType']=='cook')
                    c=dict(schemaVersion='pixel-kitchen/1',recordType='consumer',id='isolated.'+key,
                      revision='consumer-v0',assetId=cook['assetId'],assetType=cook['assetType'],scope=cook['scope'],pending=[],
                      storyId='isolated-pilot-not-a-story',sceneId='static-phaser-consumer',
                      current=reference(cook),geometry=deepcopy(cook['geometry']))
                    b['records'].append(c);consumers[key]=dict(current=reference(c),cook=reference(cook))
                state=dict(schemaVersion='pixel-kitchen-local-session/1',generation=0,bundle=b,consumers=consumers,history=[])
                self._validate(state);self._commit(state)

    @contextmanager
    def lock(self):
        # OS lock serializes even separate local processes; no database or lock service.
        with self.mutex:
            with (self.directory/'transaction.lock').open('a+b') as f:
                f.seek(0,os.SEEK_END)
                if f.tell()==0:f.write(b'0');f.flush()
                f.seek(0)
                if os.name=='nt':
                    import msvcrt;msvcrt.locking(f.fileno(),msvcrt.LK_LOCK,1)
                else:
                    import fcntl;fcntl.flock(f.fileno(),fcntl.LOCK_EX)
                try:yield
                finally:
                    f.seek(0)
                    if os.name=='nt':msvcrt.locking(f.fileno(),msvcrt.LK_UNLCK,1)
                    else:fcntl.flock(f.fileno(),fcntl.LOCK_UN)

    def _read(self):return json.loads(self.path.read_text(encoding='utf-8'))

    def _commit(self,state):
        # One authoritative snapshot publishes records + pointers together.
        temp=self.directory/('state-'+uuid4().hex+'.tmp')
        with temp.open('wb') as f:
            f.write((json.dumps(state,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
        os.replace(temp,self.path)

    def _validate(self,state):
        verdict=validate_bundle(state['bundle'],self.root)
        if not verdict['ready']:raise Conflict(json.dumps(verdict))
        return verdict

    def _find(self,state,pin):
        if not isinstance(pin,dict):raise Conflict('Missing exact record pin')
        r=next((r for r in state['bundle']['records'] if r['id']==pin.get('id') and r['revision']==pin.get('revision')),None)
        if r is None or reference(r)!=pin:raise Conflict('Unknown or stale record/hash')
        return r

    def _consumer(self,state,key):
        if key not in state['consumers']:raise Conflict('Unknown isolated consumer')
        c=self._find(state,state['consumers'][key]['current'])
        if not c['id'].startswith('isolated.'):raise Conflict('Production consumer writes are forbidden')
        return c

    def _expected(self,consumer,expected):
        if expected!=consumer['current']:raise Conflict('Stale expectedCurrent: active revision changed')

    def _pack(self,record):
        from urllib.parse import quote
        return dict(record=reference(record),recordType=record['recordType'],imageSha256=record['image']['sha256'],
          imageUrl='/api/image/'+quote(record['id'],safe='')+'/'+quote(record['revision'],safe='')+'?sha256='+record['image']['sha256'],
          geometry=record['geometry'],dimensions=record['image']['dimensions'])

    def snapshot(self):
        with self.lock():
            s=self._read();self._validate(s);assets={}
            for key,v in s['consumers'].items():
                c=self._consumer(s,key)
                assets[key]=dict(consumer=reference(c),cook=self._pack(self._find(s,v['cook'])),active=self._pack(self._find(s,c['current'])))
            return dict(generation=s['generation'],assets=assets,history=s['history'],ready=True,scope='isolated-local-only')

    def image(self,identity,revision,expected_hash):
        with self.lock():
            s=self._read()
            r=next((r for r in s['bundle']['records'] if r['id']==identity and r['revision']==revision and r['recordType'] in ('cook','retouch')),None)
            if not r or r['image']['sha256']!=expected_hash:raise Conflict('Unpinned image request')
            raw=(self.root/r['image']['path']).read_bytes()
            if png_hash(raw)!=expected_hash:raise Conflict('Image changed after pinning')
            return raw

    def approve(self,key,expected_current,edited_from,parent_sha256,geometry,png):
        with self.lock():
            state=self._read();consumer=self._consumer(state,key);self._expected(consumer,expected_current)
            parent=self._find(state,edited_from)
            if parent['recordType'] not in ('cook','retouch') or parent['assetId']!=consumer['assetId']:
                raise Conflict('Invalid editing base identity/type')
            if parent['image']['sha256']!=parent_sha256:raise Conflict('Stale parentSha256')
            self._validate(state)
            with Image.open(io.BytesIO(png)) as decoded:
                if decoded.format!='PNG':raise Conflict('Final must be PNG')
                if decoded.width*decoded.height>4096:raise Conflict('Unexpected pixel count')
                im=decoded.convert('RGBA')
            cook_pin=reference(parent) if parent['recordType']=='cook' else parent['cookBase']
            compare_pin=reference(parent) if parent['recordType']=='cook' or parent.get('stage')=='chef' else parent['comparisonBase']
            compare=self._find(state,compare_pin)
            base=Image.open(self.root/compare['image']['path']).convert('RGBA')
            changes=[]
            if im.size==base.size:
                changes=[dict(x=x,y=y,before=list(base.getpixel((x,y))),after=list(im.getpixel((x,y))))
                         for y in range(im.height) for x in range(im.width) if im.getpixel((x,y))!=base.getpixel((x,y))]
            token=uuid4().hex;revision_dir=self.directory/'revisions'/token;revision_dir.mkdir(parents=True)
            image_path=revision_dir/'final.png';image_path.write_bytes(png)
            relative=image_path.relative_to(self.root).as_posix()
            receipt_path=revision_dir/'approval.json'
            receipt=dict(scope='isolated-consumer-only-not-production-art-approval',status='approval-request',by=getattr(self,'approval_actor','local-pilot-operator'),
                         trigger='Single Approve and save action',time=datetime.now(timezone.utc).isoformat(),
                         parent=edited_from,parentSha256=parent_sha256,imageSha256=png_hash(png))
            receipt_path.write_bytes((json.dumps(receipt,indent=2)+'\n').encode())
            final=dict(schemaVersion='pixel-kitchen/1',recordType='retouch',id='isolated.'+key+'.final',revision=token,
              assetId=parent['assetId'],assetType=parent['assetType'],scope=parent['scope'],pending=[],stage='final',
              parent=edited_from,editedFrom=edited_from,comparisonBase=compare_pin,cookBase=cook_pin,
              image=dict(path=relative,sha256=png_hash(png),dimensions=list(im.size)),geometry=deepcopy(geometry),changes=changes,
              status='approved' if parent['scope']=='project' else 'test-approved',
              approval=dict(decision='approved' if parent['scope']=='project' else 'simulated',by=getattr(self,'approval_actor','local-pilot-operator'),
                            receiptId=receipt_path.relative_to(self.root).as_posix()))
            candidate=deepcopy(state);candidate['bundle']['records'].append(final)
            verdict=check_adoption(candidate['bundle'],self.root,reference(consumer),reference(final),expected_current)
            diff=dict(schemaVersion='pixel-kitchen-local-diff/1',scope='isolated-pilot',
              editedFrom=parent.get('stage',parent['recordType']),comparisonBase=compare.get('stage',compare['recordType']),parentSha256=parent_sha256,
              editedFromRef=edited_from,comparisonBaseRef=compare_pin,cookBase=cook_pin,finalRef=reference(final),
              count=len(changes),changes=changes,compatibility=verdict)
            (revision_dir/'diff.json').write_bytes((json.dumps(diff,indent=2)+'\n').encode())
            if not verdict['compatible']:
                receipt['status']='rejected';receipt['validation']=verdict
                receipt_path.write_bytes((json.dumps(receipt,indent=2)+'\n').encode())
                raise Conflict(json.dumps(verdict))
            adoption=dict(schemaVersion='pixel-kitchen/1',recordType='adoption',id='isolated.'+key+'.adoption',revision=token,
              assetId=parent['assetId'],assetType=parent['assetType'],scope=parent['scope'],pending=[],
              consumer=reference(consumer),expectedCurrent=expected_current,candidate=reference(final),
              status='adopted' if parent['scope']=='project' else 'simulated-adopted',compatibility='compatible')
            candidate['bundle']['records'].append(adoption)
            self._advance(candidate,key,consumer,reference(final),'approve-and-adopt')
            self._validate(candidate)
            receipt['status']='approved-for-isolated-consumer';receipt['validation']=verdict
            receipt_path.write_bytes((json.dumps(receipt,indent=2)+'\n').encode())
            self._commit(candidate)
            return dict(adopted=True,final=reference(final),diff=diff,generation=candidate['generation'])

    def _advance(self,state,key,consumer,target,operation):
        replacement=deepcopy(consumer);replacement['revision']='consumer-'+uuid4().hex;replacement['current']=target
        state['bundle']['records'].append(replacement)
        state['consumers'][key]['current']=reference(replacement)
        state['history'].append(dict(key=key,operation=operation,previous=consumer['current'],current=target))
        state['generation']+=1

    def rollback(self,key,expected_current):
        with self.lock():
            s=self._read();c=self._consumer(s,key);self._expected(c,expected_current)
            op=next((op for op in reversed(s['history']) if op['key']==key),None)
            if not op:raise Conflict('No previous revision')
            target=self._find(s,op['previous']);active=self._find(s,c['current'])
            if target['geometry']!=active['geometry']:raise Conflict('Rollback geometry conflict')
            if target['recordType']=='retouch':
                verdict=check_adoption(s['bundle'],self.root,reference(c),reference(target),expected_current)
                if not verdict['compatible']:raise Conflict(str(verdict))
            elif reference(target)!=s['consumers'][key]['cook']:raise Conflict('Rollback must stay in the same Cook lineage')
            self._validate(s);self._advance(s,key,c,reference(target),'rollback-previous-revision')
            self._validate(s);self._commit(s)
            return dict(rolledBack=True,current=reference(target),generation=s['generation'])
