import copy,hashlib,json,sys,tempfile,unittest
from pathlib import Path
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from pixel_density import ROOT,MANIFEST,read,scene_policy_errors,scene_reference_errors
from visual_registry import panorama_problems
class SceneReferenceTests(unittest.TestCase):
 def setUp(self):
  self.policy=read(MANIFEST)['sceneReferencePolicy'];self.master=next(e for e in self.policy['approvedSceneMasters']if '/08-'in e['path']);ref=self.master['path'];self.image=Image.new('RGBA',(1664,936),(80,100,120,255));self.item={'path':'stories/test/assets/environments/room.png','reference_scene_master':ref,'reference_scene_master_sha256':self.master['sha256'],'dimensions':[1664,936],'blockSourcePx':2,'overscanFactor':1.3,'space':'interior','fullRoomInterior':True,'exteriorCutaway':False,'generation':{'tool':'image_gen','primaryStyleReference':ref,'referenced_image_paths':[ref]}}
 def errors(self):return scene_reference_errors(self.item,self.image,self.policy)
 def test_new_exemption_cannot_be_added_to_frozen_baseline(self):
  p=copy.deepcopy(self.policy);p['legacyPanoramas']['stories/new/assets/new.png']='new';self.assertTrue(scene_policy_errors(p))
 def test_full_room_direct_master_passes(self):self.assertEqual(self.errors(),[])
 def test_missing_unknown_or_story_reference_fails(self):
  for ref in [None,'stories/test/assets/previous-scene.png','concept_art/scenes/nonexistent.png']:
   self.item['reference_scene_master']=ref;self.assertTrue(self.errors())
 def test_chained_only_image_inputs_fail(self):
  self.item['generation']['referenced_image_paths']=['stories/test/assets/previous-scene.png'];self.assertTrue(any('image inputs'in e for e in self.errors()))
 def test_prompt_mention_is_not_an_image_input(self):
  self.item['generation']['referenced_image_paths']=[];self.item['generation']['prompt']=self.master['path'];self.assertTrue(self.errors())
 def test_wrong_hash_dimensions_density_overscan_fail(self):
  for key,value in [('reference_scene_master_sha256','bad'),('dimensions',[1280,720]),('blockSourcePx',4),('overscanFactor',1.0)]:
   old=self.item[key];self.item[key]=value;self.assertTrue(self.errors(),key);self.item[key]=old
  self.image=Image.new('RGB',(1280,720));self.assertTrue(self.errors())
 def test_actual_off_grid_pixel_fails(self):
  self.image.putpixel((1,1),(255,0,0,255));self.assertTrue(any('2x2 source density'in e for e in self.errors()))
 def test_cutaway_and_exterior_master_for_interior_fail(self):
  self.item['exteriorCutaway']=True;self.assertTrue(self.errors());self.item['exteriorCutaway']=False;self.item['fullRoomInterior']=False;self.assertTrue(self.errors())
 def test_legacy_hash_is_not_a_new_art_exemption(self):
  with tempfile.TemporaryDirectory()as folder:
   p=Path(folder)/'old.png';self.image.save(p);policy=copy.deepcopy(self.policy);policy['legacyPanoramas']={'old':hashlib.sha256(p.read_bytes()).hexdigest()};self.assertEqual(panorama_problems('old',p,None,policy),(True,[]));self.image.putpixel((0,0),(1,2,3,255));self.image.save(p);historical,errors=panorama_problems('old',p,None,policy);self.assertFalse(historical);self.assertTrue(errors)
if __name__=='__main__':unittest.main()
