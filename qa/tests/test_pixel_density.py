import unittest,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import pixel_density as pd

class DensityTests(unittest.TestCase):
 def test_checker_rejects_an_internal_pixel_edit(self):
  a=np.repeat(np.repeat(np.array([[[0,0,0,255],[255,0,0,255]],[[0,255,0,255],[0,0,255,255]]],dtype=np.uint8),4,0),4,1)
  self.assertEqual(pd.off_grid_changes(a,[2,2]),0)
  a[1,1]=[20,20,20,255]
  self.assertGreater(pd.off_grid_changes(a,[2,2]),0)
 def test_rational_noninteger_pitch(self):
  logical=np.array([[[i*5,0,0,255]for i in range(43)]for y in range(68)],dtype=np.uint8)
  a=logical[pd.nn_labels(425,68)[:,None],pd.nn_labels(291,43)[None,:]]
  self.assertEqual(pd.off_grid_changes(a,[43,68]),0)
  self.assertEqual(len(np.unique(pd.nn_labels(425,68))),68)
 def test_panorama_cells_and_odd_edge_preserve_size(self):
  raw=np.arange(7*5*3,dtype=np.uint8).reshape(5,7,3);out=np.array(pd.normalize_panorama(Image.fromarray(raw),2))
  self.assertEqual(out.shape,raw.shape)
  for y in range(0,5,2):
   for x in range(0,7,2):self.assertTrue((out[y:y+2,x:x+2]==raw[min(y+1,4),min(x+1,6)]).all())
 def test_historical_pose_height_does_not_reset(self):
  p={'characters':{'logicalSamplesPerReferencePerson':68,'storyReferenceWorldHeight':180}}
  self.assertEqual(pd.logical_size({'normalizedWorldSize':[120,180]},p),[45,68])
  self.assertEqual(pd.logical_size({'normalizedWorldSize':[168,142]},p),[63,54])
  a=Image.new('RGBA',(30,30),(20,40,60,120));a.putpixel((0,0),(3,4,5,80))
  self.assertEqual(np.array(pd.hard(a))[0,0,3],0)
 def test_destructive_character_projection_is_disabled(self):
  p={'characters':{'logicalSamplesPerReferencePerson':68,'storyReferenceWorldHeight':180}}
  raw=np.random.default_rng(11).integers(0,256,(425,291,4),dtype=np.uint8)
  cell={'sourceBoundsExclusive':[0,0,291,425],'normalizedWorldSize':[124,180]}
  with self.assertRaisesRegex(ValueError,'Destructive character resampling is disabled'):
   pd.normalize_atlas(Image.fromarray(raw),[cell],p)
  self.assertTrue(np.array_equal(raw,np.array(Image.fromarray(raw))))
 def test_native_contract_rejects_eye_halo_and_colored_exterior(self):
  dark=[24,18,16];skin=[254,198,150]
  a=np.zeros((20,20,4),dtype=np.uint8);a[2:18,2:18]=dark+[255];a[4:16,4:16]=skin+[255];a[7:12,8:10]=dark+[255]
  c={'outlineRGB':dark,'skinRGB':skin,'paletteRGB':[dark,skin],'eyes':[[8,7,10,12]]}
  self.assertEqual(pd.native_pixel_errors(a,c),[])
  a[6,8,:3]=[100,80,60]
  self.assertIn('eye halo is not flat skin',pd.native_pixel_errors(a,c))
  a[6,8,:3]=skin;a[2,8,:3]=skin
  self.assertIn('colored exterior pixel',pd.native_pixel_errors(a,c))
  a[2,8,:3]=dark;a[0,0]=dark+[255]
  self.assertIn('detached or empty silhouette',pd.native_pixel_errors(a,c))
 def test_outline_measure_detects_thinning(self):
  def outline(n):
   im=Image.new('RGBA',(50,60));d=ImageDraw.Draw(im);d.rectangle((4,4,45,55),fill='black');d.rectangle((4+n,4+n,45-n,55-n),fill='#ffcd91');return pd.statistics(im)['outlineToInteriorMedianPx']
  self.assertGreater(outline(4),outline(1))
 def test_profile_width_warm_neck_and_third_hair_tone_are_required(self):
  dark=[24,18,16];skin=[254,198,150];warm=[230,143,82];light=[253,187,78]
  a=np.zeros((28,20,4),dtype=np.uint8);a[2:26,2:18]=dark+[255];a[4:16,4:16]=skin+[255];a[7:12,8:10]=dark+[255];a[16:20,9:11]=warm+[255];a[5,5]=light+[255]
  c={'outlineRGB':dark,'skinRGB':skin,'paletteRGB':[dark,skin,warm,light],'eyes':[[8,7,10,12]],'expectedEyeWidths':[2],'neckOpenings':[[9,16,11,20]],'neckRGB':warm,'hairHighlightRGB':light,'minimumHighlightPixels':1}
  self.assertEqual(pd.native_pixel_errors(a,c),[])
  c['eyes'][0][2]=11
  self.assertIn('eye width differs from approved profile cell',pd.native_pixel_errors(a,c));c['eyes'][0][2]=10
  a[16:20,9:11,:3]=dark
  self.assertIn('central jaw/neck attachment is not warm skin shadow',pd.native_pixel_errors(a,c));a[16:20,9:11,:3]=warm
  a[5,5,:3]=skin
  self.assertIn('third hair highlight tone is missing',pd.native_pixel_errors(a,c))
 def test_normalization_requires_explicit_apply(self):
  with self.assertRaisesRegex(ValueError,'explicit --apply'):pd.apply('unused',False)
 def test_master_source_and_copy_hashes_are_immutable(self):
  self.assertEqual(len(pd.masters()),3)
 def test_immutable_visual_master_cannot_be_normalized(self):
  from unittest.mock import patch
  master=pd.read(pd.MANIFEST)['immutableVisualReferences'][0]
  spec={'assets':[{'path':master['copy']}]}
  with patch.object(pd,'spec_profile',return_value=(spec,pd.profile())):
   with self.assertRaisesRegex(ValueError,'Never normalize a Golden Master'):pd.apply('unused',True)
 def test_panorama_design_scale_cannot_silently_drift(self):
  p={'panoramas':{'operativeNNBlockSourcePx':2,'referenceDesignHeight':724}}
  self.assertEqual(pd.panorama_block({'designReferenceSourceHeight':720},p),2)
  self.assertEqual(pd.panorama_block({'designReferenceSourceHeight':1086},p),3)
  with self.assertRaisesRegex(ValueError,'fractional-pitch'):pd.panorama_block({'designReferenceSourceHeight':900},p)

if __name__=='__main__':unittest.main()
