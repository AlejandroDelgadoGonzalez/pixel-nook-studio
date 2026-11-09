from pathlib import Path
import unittest,tempfile,json,hashlib,sys
from unittest.mock import patch
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import pixel_density as pd

class ConceptDirectoryTests(unittest.TestCase):
 def fixture(self):
  root=pd.ROOT/'.artifacts';root.mkdir(exist_ok=True);temp=tempfile.TemporaryDirectory(dir=root);self.addCleanup(temp.cleanup);base=Path(temp.name);path=base/'reference.png';Image.new('RGB',(4,4),'#314251').save(path);relative=path.relative_to(pd.ROOT).as_posix();entry={'path':relative,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'dimensions':[4,4],'verification':'normalized-grid'};(base/'catalog.json').write_text(json.dumps({'assets':[entry]}));return base,entry,{'passed':True,'assets':[{'path':relative,'passed':True}]}
 def test_complete_pinned_directory_passes(self):
  base,entry,report=self.fixture()
  with patch.object(pd,'run_check',return_value=report):self.assertTrue(pd.check_directory(base)['passed'])
 def test_untracked_image_fails(self):
  base,entry,report=self.fixture();Image.new('RGB',(4,4)).save(base/'untracked.png')
  with patch.object(pd,'run_check',return_value=report):self.assertFalse(pd.check_directory(base)['passed'])
 def test_changed_pixels_fail_even_when_grid_passes(self):
  base,entry,report=self.fixture();Image.new('RGB',(4,4),'red').save(base/'reference.png')
  with patch.object(pd,'run_check',return_value=report):self.assertFalse(pd.check_directory(base)['passed'])
 def test_failed_density_is_not_overridden_by_catalog(self):
  base,entry,report=self.fixture();report['passed']=False;report['assets'][0]['passed']=False
  with patch.object(pd,'run_check',return_value=report):self.assertFalse(pd.check_directory(base)['passed'])

if __name__=='__main__':unittest.main()
