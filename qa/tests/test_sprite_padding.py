import unittest,sys,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from character_cores import padded_sprite_sheet
from pixel_density import native_pixel_errors,storage_pixel_errors
from character_master import source_registration_errors
D=[24,18,16];S=[254,198,150]
class SpritePaddingTests(unittest.TestCase):
 def test_square_scale_rejects_vertical_stretch(self):
  a=np.array(self.fixture());c={'outlineRGB':D,'skinRGB':S,'paletteRGB':[D,S],'exportScaleXY':[1,1.2]}
  self.assertIn('Non-square pixels: scale_x must equal scale_y',native_pixel_errors(a,c))
 def test_double_eye_width_fails_scene_canonical_measurement(self):
  a=np.array(self.fixture());c={'outlineRGB':D,'skinRGB':S,'paletteRGB':[D,S],'canonicalEyeWorldWidth':1,'sourcePixelsPerWorldPixel':1,'eyes':[[8,10,10,13]]}
  self.assertTrue(any('canonical eye width'in e for e in native_pixel_errors(a,c)))

 def test_selection_window_recovers_connected_head_and_feet_outside_window(self):
  source=self.fixture();out,records=padded_sprite_sheet(source,[{'sourceBoundsExclusive':[3,9,27,31]}],logical_cell_px=3)
  actual=out.crop(records[0]['sourceBoundsExclusive']);self.assertEqual(source.tobytes(),actual.crop(actual.getbbox()).tobytes())
 def test_repacked_source_anchor_must_retain_registered_origin(self):
  pose={'pose':'registered-arm','sourceBoundsExclusive':[8,6,28,22],'sourceRegistrationAnchor':[13,22],'origin':[.25,1]}
  self.assertEqual(source_registration_errors(pose),[]);pose['sourceBoundsExclusive']=[108,56,128,72];self.assertTrue(source_registration_errors(pose));pose['sourceRegistrationAnchor']=[113,72];self.assertEqual(source_registration_errors(pose),[])
 def fixture(self):
  im=Image.new('RGBA',(30,40));d=ImageDraw.Draw(im);d.polygon([(7,0),(22,0),(29,7),(29,18),(24,23),(24,39),(6,39),(6,23),(0,18),(0,7)],fill=tuple(D+[255]));d.rectangle((6,8,23,18),fill=tuple(S+[255]));return im
 def test_export_keeps_entire_bun_hat_and_feet_with_four_cells(self):
  source=self.fixture();out,records=padded_sprite_sheet(source,[{'sourceBoundsExclusive':[0,0,30,40]}],logical_cell_px=3)
  actual=out.crop(records[0]['sourceBoundsExclusive']);self.assertEqual(source.tobytes(),actual.crop(actual.getbbox()).tobytes());a=np.array(actual);c={'outlineRGB':D,'skinRGB':S,'paletteRGB':[D,S],'logicalCellPx':3,'minimumTransparentCells':4};self.assertEqual(native_pixel_errors(a,c),[])
  y,x=np.where(a[:,:,3]>0);self.assertGreaterEqual(min(x.min(),y.min(),a.shape[1]-1-x.max(),a.shape[0]-1-y.max()),12)
 def test_border_contact_and_open_top_fail(self):
  a=np.array(self.fixture());c={'outlineRGB':D,'skinRGB':S,'paletteRGB':[D,S]};self.assertTrue(any('touches cell edge'in s for s in native_pixel_errors(a,c)));a[0,9,:3]=S;self.assertTrue(any('open top/bottom outline'in s for s in native_pixel_errors(a,c)))
 def test_content_trim_needs_real_padded_storage_contract(self):
  source=self.fixture();out,_=padded_sprite_sheet(source,[{'sourceBoundsExclusive':[0,0,30,40]}],logical_cell_px=3);cell={'sourceBoundsExclusive':[12,12,42,52],'nativePixelContract':{'outlineRGB':D,'skinRGB':S,'paletteRGB':[D,S],'logicalCellPx':3,'minimumTransparentCells':4,'frameIsContentTrim':True}}
  self.assertTrue(storage_pixel_errors(out,cell));cell['cellBoundsExclusive']=[0,0,54,64];self.assertEqual(storage_pixel_errors(out,cell),[]);cell['sourceBoundsExclusive'][2]=60;self.assertTrue(storage_pixel_errors(out,cell))
 def test_padding_cannot_conceal_a_clipped_head_reference(self):
  source=self.fixture();out,_=padded_sprite_sheet(source,[{'sourceBoundsExclusive':[0,0,30,40]}],logical_cell_px=3);a=np.array(out);head=a[:35,:,3]>0;y,x=np.where(head);h=head[y.min():y.max()+1,x.min():x.max()+1];signature=hashlib.sha256(str(h.shape).encode()+h.tobytes()).hexdigest();c={'outlineRGB':D,'skinRGB':S,'paletteRGB':[D,S],'hairRegionBounds':[0,0,54,35],'fullHeadReferenceAlphaSha256':signature};self.assertEqual(native_pixel_errors(a,c),[]);a[12:16]=0;self.assertTrue(any('full source head silhouette changed'in s for s in native_pixel_errors(a,c)))
if __name__=='__main__':unittest.main()
