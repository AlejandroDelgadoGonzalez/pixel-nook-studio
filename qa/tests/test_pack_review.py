"""Review packaging preserves files and rejects unsafe or incomplete packets."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import uuid
import base64
import html
import re

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('pack_review',ROOT/'scripts/pack-review.py')
packer=importlib.util.module_from_spec(spec);spec.loader.exec_module(packer)

class ReviewPackaging(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(dir=ROOT/'.artifacts',prefix='pack-test-')
        self.source=Path(self.temp.name)
        self.scene=f'C{int(uuid.uuid4().hex[:12],16)}-S1'
        self.target=ROOT/'.artifacts'/f'REVIEW-BOARD-{self.scene}.html'
        self.root_copy=ROOT/self.target.name
        self.certificate={'scene':self.scene,'verdict':'PASS','creativeApproval':'PENDING Alejandro','gate3Started':False,'newAudioFiles':0,'durationSeconds':60,'beats':[{'durationSeconds':60,'text':'A complete thought.'}],'viewports':[{'width':w,'height':h,'passed':True} for w,h in packer.SIZES],'productionBaseline':[{'path':'AGENTS.md','sha256':packer.sha(ROOT/'AGENTS.md')}],'technicalChecks':{'native':True},'scope':'static review','atlases':[],'packageFiles':['density.json']}
        (self.source/'PROPUESTA.md').write_text('# Proposal\n\nNiño — exact text.\n\n| Beat | Text |\n|---|---|\n| 01 | Hello. |',encoding='utf-8')
        (self.source/'MEASURED-ART-BOARD.html').write_text('<img src="local.svg">',encoding='utf-8')
        (self.source/'local.svg').write_text('<svg/>',encoding='utf-8')
        (self.source/'density.json').write_text('{"passed":true,"assets":[]}',encoding='utf-8')
        (self.source/'GEOMETRIA-PROPUESTA.json').write_text('{"anchors":{"root":[535,615]},"camera":{"focus":[500,444]}}',encoding='utf-8')
        uri='data:image/svg+xml;base64,'+base64.b64encode(b'<svg/>').decode()
        (self.source/'REVIEW-VISUALS.json').write_text(json.dumps({'atlasCrops':[{'label':'Native crop','dataUri':uri,'width':2,'height':3}],'compositions':[{'label':f'{w}x{h}','width':w,'height':h,'dataUri':uri} for w,h in packer.SIZES],'masksRoutes':[{'label':'Routes; no occluders','dataUri':uri}]}),encoding='utf-8')
    def tearDown(self):
        self.target.unlink(missing_ok=True);self.root_copy.unlink(missing_ok=True);self.temp.cleanup()
    def run_packet(self):
        (self.source/'CERTIFICACION.json').write_text(json.dumps(self.certificate),encoding='utf-8')
        return packer.package(self.scene,self.source)
    def test_offline_dependency_full_text_and_root_copy_are_consolidated(self):
        self.assertTrue(self.run_packet()['passed'])
        self.assertEqual(self.target.read_bytes(),self.root_copy.read_bytes())
        text=self.target.read_text(encoding='utf-8')
        self.assertIn('Niño — exact text.',text)
        self.assertIn('<td>Hello.</td>',text)
        self.assertIn('id="certificate"',text)
        self.assertIn('width="8" height="12"',text)
        iframe=html.unescape(re.search(r'srcdoc="([^"]*)"',text)[1])
        self.assertIn('data:image/svg+xml;base64,',iframe)
        self.assertNotIn('src="local.svg"',text)
    def test_missing_dependency_is_rejected(self):
        (self.source/'local.svg').unlink()
        with self.assertRaisesRegex(ValueError,'dependency'):self.run_packet()
    def test_external_dependency_is_rejected(self):
        (self.source/'MEASURED-ART-BOARD.html').write_text('<img src="https://example.com/a.png">',encoding='utf-8')
        with self.assertRaisesRegex(ValueError,'External dependency'):self.run_packet()
    def test_production_hash_change_is_rejected(self):
        self.certificate['productionBaseline'][0]['sha256']='0'*64
        with self.assertRaisesRegex(ValueError,'Production changed'):self.run_packet()
    def test_static_or_excessive_silence_is_rejected(self):
        self.certificate['beats']=[{'durationSeconds':60,'text':'','visiblePhysicalAction':'walk'}]
        with self.assertRaisesRegex(ValueError,'silent sequence'):self.run_packet()
    def test_candidate_atlas_is_mandatory(self):
        self.certificate['atlases']=[{'newOrModified':True,'packagePath':'new.png','contractPath':'new.json','sha256':'0'*64}]
        with self.assertRaisesRegex(ValueError,'Missing'):self.run_packet()
    def test_failed_density_evidence_is_rejected(self):
        (self.source/'density.json').write_text('{"passed":false}',encoding='utf-8')
        with self.assertRaisesRegex(ValueError,'density report failed'):self.run_packet()
    def test_missing_geometry_is_rejected(self):
        (self.source/'GEOMETRIA-PROPUESTA.json').unlink()
        with self.assertRaisesRegex(ValueError,'Missing'):self.run_packet()

if __name__=='__main__':unittest.main()
