import unittest,sys,copy
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import pixel_density as pd
class VisualLockTests(unittest.TestCase):
 def fixture(self):
  from PIL import Image
  import json
  root=Path(__file__).resolve().parents[2];s=json.loads((root/'concept_art/character-cores.json').read_text(encoding='utf-8'));c=s['assets'][2]['cells'][0];im=Image.open(root/s['assets'][2]['path']).convert('RGBA');return np.array(im.crop(c['sourceBoundsExclusive'])),copy.deepcopy(c['nativePixelContract'])
 def test_each_pixel_defect_is_rejected(self):
  original,c=self.fixture();self.assertEqual(pd.native_pixel_errors(original,c),[])
  l,t,r,b=c['eyes'][0]
  for color in [[100,80,60],[128,128,128]]:
   a=original.copy();a[t-1,l,:3]=color;self.assertIn('eye halo is not flat skin',pd.native_pixel_errors(a,c))
  a=original.copy();a[t,l,3]=128;self.assertIn('partial alpha',pd.native_pixel_errors(a,c))
  a=original.copy();a[t,l,:3]=c['skinRGB'];self.assertIn('eye is not a solid opaque rectangle',pd.native_pixel_errors(a,c))
  a=original.copy();l,t,r,b=c['neckOpenings'][0];a[t:b,l:r,:3]=c['outlineRGB'];self.assertIn('central jaw/neck attachment is not warm skin shadow',pd.native_pixel_errors(a,c))
  a=original.copy();tone=c['hairTonesRGB'][2];a[np.all(a[:,:,:3]==tone,axis=2),:3]=c['hairTonesRGB'][1];self.assertIn('three hair tones missing',pd.native_pixel_errors(a,c))
 def test_one_logical_eye_and_required_hair_contract(self):
  a,c=self.fixture();c['logicalEyeWidth']=6;self.assertIn('eye exceeds one logical cell',pd.native_pixel_errors(a,c));c.pop('hairTonesRGB');self.assertIn('human requires measured three-tone hair',pd.native_pixel_errors(a,c))
 def test_new_image_without_contract_cannot_use_legacy_exception(self):
  import visual_registry as vr,json,tempfile
  from unittest.mock import patch
  from PIL import Image
  base=Path(__file__).resolve().parents[2]/'.artifacts/qa/character-expansion-part3/test-fixtures';base.mkdir(parents=True,exist_ok=True)
  with tempfile.TemporaryDirectory(dir=base)as tmp:
   root=Path(tmp);(root/'qa').mkdir();(root/'qa/legacy-visual-locks.json').write_text(json.dumps({'files':{}}));assets=root/'stories/new-story/assets';assets.mkdir(parents=True);Image.new('RGBA',(8,8),(24,18,16,255)).save(assets/'new-sprite.png')
   (root/'stories/catalog.json').write_text(json.dumps({'stories':[]}))
   with patch.object(vr,'ROOT',root):
    report=vr.check();self.assertFalse(report['passed']);self.assertIn('missing measured native sprite',report['errors'][0])
    import hashlib
    target=assets/'new-sprite.png';pin=hashlib.sha256(target.read_bytes()).hexdigest();(root/'qa/legacy-visual-locks.json').write_text(json.dumps({'files':{'stories/new-story/assets/new-sprite.png':pin}}));Image.new('RGBA',(8,8),(50,40,30,255)).save(target);report=vr.check();self.assertFalse(report['passed']);self.assertIn('legacy image changed',report['errors'][0])

if __name__=='__main__':unittest.main()
