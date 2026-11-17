import copy
import hashlib
import json
import os
from pathlib import Path
import unittest
from PIL import Image
from contracts import validate_bundle,check_adoption,reference,SCHEMA
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from fixtures import fixture,retouch,repin,common,write_image

OUTPUT=Path(os.environ['PIXEL_KITCHEN_TEST_OUTPUT'])


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.root=OUTPUT/self._testMethodName
        self.bundle,self.cook,self.consumer=fixture(self.root)

    def result(self):return validate_bundle(self.bundle,self.root)

    def assertValid(self):
        r=self.result();self.assertTrue(r['ready'],r)

    def assertFails(self,text):
        r=self.result();self.assertFalse(r['valid'],r);self.assertIn(text,' '.join(r['errors']))

    def verdict(self,final,expected=None):
        return check_adoption(self.bundle,self.root,reference(self.consumer),reference(final),expected or reference(self.cook))

    def test_schema_is_valid(self):Draft202012Validator.check_schema(SCHEMA)

    def test_individual_schema_entrypoints_offline(self):
        registry=Registry().with_resource(SCHEMA['$id'],Resource.from_contents(SCHEMA))
        retouch(self.bundle,self.root,self.cook)
        for kind in ('source','body','pose','cook','retouch','consumer'):
            path=Path(__file__).resolve().parents[1]/'schemas/v1'/f'{kind}.schema.json'
            schema=json.loads(path.read_text())
            Draft202012Validator.check_schema(schema)
            record=next(r for r in self.bundle['records'] if r['recordType']==kind)
            validator=Draft202012Validator(schema,registry=registry)
            validator.validate(record)
            bad=copy.deepcopy(record);bad['unexpectedField']=True
            self.assertTrue(list(validator.iter_errors(bad)))
        path=Path(__file__).resolve().parents[1]/'schemas/v1/adoption.schema.json'
        Draft202012Validator.check_schema(json.loads(path.read_text()))

    def test_invalid_protected_rectangle_fails_without_crashing(self):
        self.cook['geometry']['protectedRegions'][0]['rect']=[22,20,20,22]
        repin(self.bundle)
        retouch(self.bundle,self.root,self.cook)
        self.assertFails('invalid exclusive protected rectangle')

    def test_color_patch_and_manual_final_without_chef(self):
        final=retouch(self.bundle,self.root,self.cook)
        self.assertValid();self.assertTrue(self.verdict(final)['compatible'])
        self.assertEqual(final['comparisonBase'],reference(self.cook));self.assertEqual(final['editedFrom'],reference(self.cook))
        self.assertFalse(any(r.get('stage')=='chef' for r in self.bundle['records']))
        (self.root/'valid.json').write_text(json.dumps(self.bundle,indent=2))

    def test_chef_manual_preserves_two_bases(self):
        chef=retouch(self.bundle,self.root,self.cook,'chef','chef',False)
        manual=retouch(self.bundle,self.root,chef,'manual','manual',False,pixel=(11,10,(30,220,60,255)))
        final=retouch(self.bundle,self.root,manual,'final','final',True,pixel=(12,10,(30,60,220,255)))
        self.assertValid();self.assertEqual(final['editedFrom'],reference(manual));self.assertEqual(final['comparisonBase'],reference(chef));self.assertEqual(final['cookBase'],reference(self.cook))
        self.assertEqual(len(final['changes']),2);self.assertTrue(self.verdict(final)['compatible'])
        (self.root/'valid-chef-chain.json').write_text(json.dumps(self.bundle,indent=2))

    def test_approve_directly_from_chef(self):
        chef=retouch(self.bundle,self.root,self.cook,'chef','chef',True)
        self.assertValid();self.assertTrue(self.verdict(chef)['compatible'])

    def test_wrong_native_canvas(self):
        final=retouch(self.bundle,self.root,self.cook);final['image']=write_image(self.root,'bad-size',Image.new('RGBA',(63,64)))
        self.assertFails('physical PNG canvas')

    def test_shifted_root(self):
        final=retouch(self.bundle,self.root,self.cook);final['geometry']['root'][0]+=1
        self.assertFails('geometry changed: root')
        (self.root/'invalid-root.json').write_text(json.dumps(self.bundle,indent=2))

    def test_contact_deleted_with_identical_metadata(self):
        retouch(self.bundle,self.root,self.cook,pixel=(19,39,(0,0,0,0)))
        self.assertFails('contact');self.assertFails('RGBA changed')

    def test_contact_recolored_but_still_opaque(self):
        retouch(self.bundle,self.root,self.cook,pixel=(19,39,(255,0,0,255)))
        self.assertFails('RGBA changed')

    def test_protected_region_changed(self):
        retouch(self.bundle,self.root,self.cook,pixel=(21,21,(255,0,0,255)))
        self.assertFails('protected region RGBA changed')

    def test_transform_changed(self):
        final=retouch(self.bundle,self.root,self.cook);final['geometry']['transform']['offset'][0]=1
        self.assertFails('geometry changed: transform')

    def test_geometry_on_pixel_boundary_and_fractional_root(self):
        self.assertEqual(self.consumer['geometry']['contacts'][0]['point'],[20,40]);self.assertEqual(self.consumer['geometry']['root'][0],32.5)
        self.assertValid()

    def test_source_byte_hash_wrong(self):
        self.bundle['records'][0]['image']['sha256']='0'*64;repin(self.bundle)
        self.assertFails('PNG byte hash mismatch')
        (self.root/'invalid-source-hash.json').write_text(json.dumps(self.bundle,indent=2))

    def test_missing_reference(self):
        self.cook['source']['id']='does-not-exist';repin(self.bundle)
        self.assertFails('reference not found')

    def test_wrong_source_even_with_valid_hash(self):
        self.cook['source']=reference(self.bundle['records'][1]);repin(self.bundle)
        self.assertFails('Cook source differs from pose source')

    def test_stale_edit_document_hash(self):
        final=retouch(self.bundle,self.root,self.cook);final['editedFrom']['sha256']='0'*64
        self.assertFails('reference document hash mismatch')

    def test_stale_consumer_base(self):
        old=retouch(self.bundle,self.root,self.cook,'old-final');self.consumer['current']=reference(old)
        new=retouch(self.bundle,self.root,old,'new-final',pixel=(11,10,(0,230,80,255)))
        self.assertValid();v=self.verdict(new);self.assertFalse(v['compatible']);self.assertIn('stale',' '.join(v['errors']))
        self.assertTrue(self.verdict(new,reference(old))['compatible'])

    def test_pending_hash_cannot_adopt(self):
        self.bundle['records'][0]['image']['sha256']=None;repin(self.bundle)
        final=retouch(self.bundle,self.root,self.cook);r=self.result();self.assertTrue(r['valid'],r);self.assertFalse(r['ready']);self.assertFalse(self.verdict(final)['compatible'])
        a=dict(**common('adoption','adoption'),consumer=reference(self.consumer),expectedCurrent=reference(self.cook),candidate=reference(final),status='simulated-adopted',compatibility='compatible')
        self.bundle['records'].append(a);self.assertFails('false adoption claim')

    def test_pending_measurement_and_draft_do_not_promote(self):
        self.bundle['records'][3]['measures']['standingBodyHeight']=None;repin(self.bundle)
        final=retouch(self.bundle,self.root,self.cook);r=self.result();self.assertTrue(r['valid'],r);self.assertFalse(r['ready']);self.assertFalse(self.verdict(final)['compatible'])
        (self.root/'pending.json').write_text(json.dumps(self.bundle,indent=2))

    def test_draft_source_stays_pending(self):
        self.bundle['records'][0]['review']=dict(state='draft',receiptId=None);repin(self.bundle)
        r=self.result();self.assertTrue(r['valid']);self.assertFalse(r['ready']);self.assertEqual(self.bundle['records'][0]['review']['state'],'draft')

    def test_draft_retouch_cannot_adopt(self):
        final=retouch(self.bundle,self.root,self.cook,approved=False);self.assertValid();self.assertFalse(self.verdict(final)['compatible'])

    def test_simulated_adoption_distinct_from_real_adoption(self):
        final=retouch(self.bundle,self.root,self.cook)
        a=dict(**common('adoption','adoption'),consumer=reference(self.consumer),expectedCurrent=reference(self.cook),candidate=reference(final),status='simulated-adopted',compatibility='compatible')
        self.bundle['records'].append(a);self.assertValid();self.assertEqual(self.consumer['current'],reference(self.cook))
        a['status']='adopted';self.assertFails('false adoption claim')

    def test_diff_omission_fails(self):
        final=retouch(self.bundle,self.root,self.cook);final['changes']=[];self.assertFails('exact decoded RGBA')

    def test_duplicate_revision_rejected(self):
        self.bundle['records'].append(copy.deepcopy(self.cook));self.assertFails('duplicate ID/revision')

    def test_legacy_record_rejected_not_reinterpreted(self):
        self.bundle['records'].append(dict(size=64,metadata=dict(method='human-approved')));self.assertFails('schema')

    def test_all_four_profiles(self):
        for kind in ['character','object','scene','panorama']:
            with self.subTest(kind=kind):
                bundle,_,_=fixture(self.root/kind,kind);r=validate_bundle(bundle,self.root/kind);self.assertTrue(r['ready'],r)

    def test_nonfinite_rejected(self):
        self.cook['parameters']['value']=float('nan');self.assertFails('non-finite')

    def test_reference_wrong_type_does_not_crash(self):
        self.cook['pose']=reference(self.bundle['records'][0]);repin(self.bundle);self.assertFails('wrong reference type')

    def test_body_reference_not_bbox_scale(self):
        self.bundle['records'][3]['views']['side']['bodyHeightInSource']=40;repin(self.bundle);self.assertFails('body height scale mismatch')

    def test_path_escape_rejected(self):
        self.bundle['records'][0]['image']['path']='../outside.png';repin(self.bundle);self.assertFails('confined to root')

    def test_pending_adoption_is_not_ready(self):
        final=retouch(self.bundle,self.root,self.cook)
        a=dict(**common('adoption','adoption'),consumer=reference(self.consumer),expectedCurrent=reference(self.cook),candidate=reference(final),status='pending',compatibility='pending')
        self.bundle['records'].append(a);r=self.result();self.assertTrue(r['valid'],r);self.assertFalse(r['ready']);self.assertFalse(self.verdict(final)['compatible'])

    def test_source_root_outside_source(self):
        pose=next(r for r in self.bundle['records'] if r['recordType']=='pose');pose['sourceRoot']=[1000,60];repin(self.bundle);self.assertFails('root outside source image boundary')

    def test_unknown_transform_cannot_claim_ready(self):
        pose=next(r for r in self.bundle['records'] if r['recordType']=='pose');pose['geometry']['transform']['scale']=None
        self.cook['geometry']['transform']['scale']=None;self.consumer['geometry']['transform']['scale']=None;repin(self.bundle)
        r=self.result();self.assertTrue(r['valid'],r);self.assertFalse(r['ready'])

    def test_actual_file_changed_after_descriptor(self):
        final=retouch(self.bundle,self.root,self.cook)
        p=self.root/final['image']['path'];im=Image.open(p).convert('RGBA');im.putpixel((19,39),(0,0,0,0));im.save(p)
        self.assertFails('PNG byte hash mismatch');self.assertFalse(self.verdict(final)['compatible'])
