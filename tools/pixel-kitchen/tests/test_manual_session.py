"""Synthetic immutable Cook/manual/final/adoption transactions, no production art."""
from copy import deepcopy
import io
import json
import os
from pathlib import Path
import unittest
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from fixtures import fixture,repin
from contracts import validate_bundle
from manual_session import SessionStore,Conflict,encode_png


class ManualSessionTests(unittest.TestCase):
    def setUp(self):
        self.root=Path(os.environ['PIXEL_KITCHEN_TEST_OUTPUT'])/self._testMethodName
        self.bundle,self.cook,_=fixture(self.root)
        self.store=SessionStore(self.root,self.root/'.artifacts/session',self.bundle,{'front':self.cook['id']})

    def payload(self):
        v=self.store.snapshot()['assets']['front'];base=v['cook']
        im=Image.open(self.root/self.cook['image']['path']).convert('RGBA');im.putpixel((10,10),(220,30,40,255))
        return dict(key='front',expected_current=v['active']['record'],edited_from=base['record'],
          parent_sha256=base['imageSha256'],geometry=deepcopy(base['geometry']),png=encode_png(im))

    def reject(self,p,text):
        before=self.store.path.read_bytes()
        with self.assertRaisesRegex(Conflict,text):self.store.approve(**p)
        self.assertEqual(before,self.store.path.read_bytes())

    def test_manual_directly_from_cook_and_exact_diff(self):
        r=self.store.approve(**self.payload());self.assertTrue(r['adopted'])
        self.assertEqual(r['diff']['editedFrom'],'cook');self.assertEqual(r['diff']['comparisonBase'],'cook')
        self.assertEqual(r['diff']['count'],1);self.assertEqual(r['diff']['parentSha256'],self.cook['image']['sha256'])
        self.assertEqual(self.store.snapshot()['assets']['front']['active']['record'],r['final'])
        state=json.loads(self.store.path.read_text());self.assertTrue(validate_bundle(state['bundle'],self.root)['ready'])
        self.assertFalse(any(v.get('stage')=='chef' for v in state['bundle']['records']))

    def test_stale_parent_hash_rejected(self):
        p=self.payload();p['parent_sha256']='0'*64;self.reject(p,'parentSha256')

    def test_stale_expected_revision_rejected(self):
        p=self.payload();self.store.approve(**p);self.reject(p,'expectedCurrent')

    def test_wrong_canvas_rejected_without_changing_pointer(self):
        p=self.payload();p['png']=encode_png(Image.open(io.BytesIO(p['png'])).crop((0,0,63,64)))
        self.reject(p,'canvas')

    def test_root_shift_rejected(self):
        p=self.payload();p['geometry']['root'][0]+=.5;self.reject(p,'root')

    def test_contact_erased_with_identical_metadata_rejected(self):
        p=self.payload();im=Image.open(io.BytesIO(p['png']));im.putpixel((19,39),(0,0,0,0));p['png']=encode_png(im)
        self.reject(p,'contact|support')

    def test_protected_region_recolored_rejected(self):
        p=self.payload();im=Image.open(io.BytesIO(p['png']));im.putpixel((20,20),(1,2,3,255));p['png']=encode_png(im)
        self.reject(p,'protected region')

    def test_rollback_and_restore_preserve_all_revisions(self):
        original=self.store.snapshot()['assets']['front']['active']['record'];r=self.store.approve(**self.payload())
        self.store.rollback('front',r['final']);self.assertEqual(self.store.snapshot()['assets']['front']['active']['record'],original)
        self.store.rollback('front',original);self.assertEqual(self.store.snapshot()['assets']['front']['active']['record'],r['final'])
        self.assertTrue(validate_bundle(json.loads(self.store.path.read_text())['bundle'],self.root)['ready'])
        self.assertEqual(len(list(self.store.directory.glob('revisions/*/final.png'))),1)

    def test_concurrent_saves_only_one_adopts(self):
        p=self.payload()
        def save():
            try:self.store.approve(**p);return 'adopted'
            except Conflict:return 'rejected'
        with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(lambda _:save(),range(2)))
        self.assertEqual(sorted(results),['adopted','rejected'])

    def test_pending_seed_cannot_initialize_adoption(self):
        b=deepcopy(self.bundle);b['records'][0]['review']['state']='draft'
        repin(b)
        verdict=validate_bundle(b,self.root);self.assertTrue(verdict['valid']);self.assertFalse(verdict['ready'])
        with self.assertRaises(Conflict):SessionStore(self.root,self.root/'.artifacts/pending',b,{'front':self.cook['id']})

    def test_object_32_manual_without_chef(self):
        b,c,_=fixture(self.root/'object-fixture','object')
        store=SessionStore(self.root/'object-fixture',self.root/'object-fixture/.artifacts/session',b,{'object':c['id']})
        v=store.snapshot()['assets']['object'];im=Image.open(self.root/'object-fixture'/c['image']['path']).convert('RGBA')
        im.putpixel((10,10),(30,70,100,255))
        r=store.approve('object',v['active']['record'],v['cook']['record'],v['cook']['imageSha256'],v['cook']['geometry'],encode_png(im))
        self.assertTrue(r['adopted']);self.assertEqual(store.snapshot()['assets']['object']['active']['dimensions'],[32,32])
