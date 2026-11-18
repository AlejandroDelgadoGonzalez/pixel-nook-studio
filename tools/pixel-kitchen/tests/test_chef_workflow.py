"""Real Chef validators with synthetic fixtures only."""
from copy import deepcopy
import hashlib,json,os
from pathlib import Path
import unittest
from PIL import Image
from fixtures import fixture
from chef_workflow import ChefStore,canonical_png,patch
from manual_session import Conflict

class ChefTests(unittest.TestCase):
 def setUp(self):
  self.root=Path(os.environ['PIXEL_KITCHEN_TEST_OUTPUT'])/self._testMethodName
  b,c,_=fixture(self.root);self.cook=c
  self.store=ChefStore(self.root,self.root/'.artifacts/chef',b,{'front':c['id']})
  self.store.prepare([dict(taskId='one',key='front',label='Synthetic one',recipe=dict(inspection='Synthetic fixture inspected',changes=[])),dict(taskId='two',key='front',label='Synthetic two',recipe=dict(inspection='Synthetic second fixture',changes=[]))])
 def handoff(self,mode='chef',changes=None):
  s=self.store._read();t=s['queue'][0];r=self.store._find(s,t[mode]);im=Image.open(self.root/r['image']['path']).convert('RGBA')
  changes=[dict(x=10,y=10,hex='#123456FF')] if changes is None else changes
  return dict(schemaVersion='pixel-kitchen-handoff/1',hashEncoding='pk-rgba-png/1',taskId=t['taskId'],assetId=t['assetId'],baseRevision=r['revision'],baseSha256=r['image']['sha256'],editedFrom=mode,comparisonBase=mode,expectedCurrent=t['final'] if mode=='final' else t['expectedCurrent'],canvas=r['image']['dimensions'],changes=changes,finalSha256=hashlib.sha256(canonical_png(patch(im,changes))).hexdigest())
 def reject(self,h):
  before=self.store.path.read_bytes()
  with self.assertRaises(Conflict):self.store.receive(h)
  self.assertEqual(before,self.store.path.read_bytes())
 def test_chef_final_learning_and_queue_atomic(self):
  h=self.handoff();r=self.store.receive(h);s=self.store._read()
  self.assertTrue(r['adopted']);self.assertEqual(r['diff']['editedFrom'],'chef');self.assertEqual(r['diff']['comparisonBase'],'chef')
  self.assertEqual([t['status'] for t in s['queue']],['complete','active']);self.assertEqual(len(s['learning']),1)
  self.assertEqual(len(list((self.store.directory/'learning').glob('*.json'))),1)
  self.assertEqual(len(s['queue'][1]['lessonsConsulted']),1)
  next_candidate=self.store._find(s,s['queue'][1]['chef'])
  self.assertEqual(Image.open(self.root/next_candidate['image']['path']).convert('RGBA').getpixel((10,10)),(18,52,86,255))
 def test_direct_cook_and_no_manual_changes(self):
  r=self.store.receive(self.handoff('cook',[]));self.assertEqual(r['diff']['count'],0);self.assertEqual(r['diff']['comparisonBase'],'cook')
 def test_replay_idempotent(self):
  h=self.handoff();self.store.receive(h);before=self.store.path.read_bytes();self.assertTrue(self.store.receive(h)['replayed']);self.assertEqual(before,self.store.path.read_bytes())
 def test_obsolete_hash(self):
  h=self.handoff();h['baseSha256']='0'*64;self.reject(h)
 def test_obsolete_revision(self):
  h=self.handoff();h['baseRevision']='old';self.reject(h)
 def test_root_change(self):
  h=self.handoff();h['geometry']=deepcopy(self.cook['geometry']);h['geometry']['root'][0]+=1;self.reject(h)
 def test_contact_pixel_change(self):self.reject(self.handoff(changes=[dict(x=19,y=39,hex='#00000000')]))
 def test_protected_color_change(self):self.reject(self.handoff(changes=[dict(x=20,y=20,hex='#112233FF')]))
 def test_wrong_canvas(self):
  h=self.handoff();h['canvas']=[63,64];self.reject(h)
 def test_wrong_expected_final_hash(self):
  h=self.handoff();h['finalSha256']='0'*64;self.reject(h)
 def test_next_candidate_failure_cannot_adopt(self):
  s=self.store._read();s['queue'][1]['recipe']['changes']=[dict(x=19,y=39,hex='#00000000')];self.store._commit(s);self.reject(self.handoff())
 def test_rollback_preserves_final(self):
  r=self.store.receive(self.handoff());self.store.rollback('front',r['final']);self.assertEqual(self.store.snapshot()['assets']['front']['active']['record'],self.store._read()['queue'][0]['cook'])
 def test_stale_consumer(self):
  h=self.handoff();h['expectedCurrent']['revision']='changed';self.reject(h)
 def test_candidate_draft_does_not_approve(self):
  s=self.store._read();c=self.store._find(s,s['queue'][0]['chef']);self.assertEqual(c['status'],'draft');self.assertIsNone(c['approval'])
 def test_export_no_private_paths(self):
  out=self.store.export(self.root/'.artifacts/static');text=json.dumps(out);self.assertNotIn(str(self.root),text);self.assertNotIn('imageUrl',text)

 def test_revise_adopted_final(self):
  first=self.store.receive(self.handoff())
  handoff=self.handoff('final',[dict(x=11,y=10,hex='#654321FF')])
  second=self.store.receive(handoff)
  self.assertEqual(second['diff']['editedFromRef'],first['final'])
  self.assertEqual(second['diff']['count'],2)
  state=self.store._read()
  self.assertEqual(len(state['learning'][-1]['changes']),1)
  self.assertEqual([t['status'] for t in state['queue']],['complete','active'])
  q=self.store.export(self.root/'.artifacts/second-export')
  self.assertTrue(q['tasks'][0]['adoptedFinal'])
  self.assertEqual(q['tasks'][0]['expectedCurrent'],second['final'])
  self.assertEqual(q['tasks'][0]['bases']['final']['sha256'],handoff['finalSha256'])
  handoff['finalSha256']='0'*64
  self.reject(handoff)
