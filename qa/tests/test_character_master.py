import unittest,sys,json,hashlib,tempfile
from pathlib import Path
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import character_master as cm
from unittest.mock import patch
class PaletteRevisionTests(unittest.TestCase):
 def test_revision_palette_cannot_exempt_changed_or_preserved_pose_pixels(self):
  root=Path(__file__).resolve().parents[2];scratch=root/'.artifacts/qa/character-cleanup-part1/test-fixtures';scratch.mkdir(parents=True,exist_ok=True)
  with tempfile.TemporaryDirectory(dir=scratch)as tmp:
   r=Path(tmp);shared=r/'stories/test/shared';shared.mkdir(parents=True);source=r/'source.png';master=r/'master.png';Image.new('RGBA',(2,2),(24,18,16,255)).save(source)
   im=Image.new('RGBA',(4,2),(24,18,16,255));im.paste((0,80,255,255),(2,0,4,2));im.save(master)
   def crop_sha(bounds):return hashlib.sha256(im.crop(bounds).tobytes()).hexdigest()
   doc={'asset':'/master.png','poses':[{'pose':name,'asset':'/master.png','sourceBoundsExclusive':bounds,'provenance':{},'lockedCropSha256':crop_sha(bounds)}for name,bounds in [('revised',[0,0,2,2]),('preserved',[2,0,4,2])]]}
   (shared/'atlas.json').write_text(json.dumps(doc));registry={'characters':{'alice':{'metadata':'stories/test/shared/atlas.json','canonicalSource':'source.png','canonicalSha256':cm.sha(source),'paletteRevision':{'preservedPoseHashes':{'preserved':crop_sha([2,0,4,2])}}}}};(shared/'character-masters.json').write_text(json.dumps(registry))
   with patch.object(cm,'ROOT',r):
    self.assertTrue(cm.check('test')['passed'])
    derived=r/'derived.png';im.crop((0,0,2,2)).save(derived);registry['characters']['alice']['derivedCopies']=[{'path':'derived.png','pose':'revised','sha256':cm.sha(derived)}];(shared/'character-masters.json').write_text(json.dumps(registry))
    self.assertTrue(cm.check('test')['passed'])
    broken=Image.open(derived).convert('RGBA');broken.putpixel((0,0),(255,0,0,255));broken.save(derived)
    self.assertTrue(any('derived copy differs'in e for e in cm.check('test')['errors']))
    im.crop((0,0,2,2)).save(derived)
    im.putpixel((3,1),(0,90,255,255));im.save(master);self.assertFalse(cm.check('test')['passed'])
    im.putpixel((3,1),(0,80,255,255));im.putpixel((0,0),(0,80,255,255));im.save(master);self.assertTrue(any('noncanonical RGB'in e for e in cm.check('test')['errors']))
if __name__=='__main__':unittest.main()
