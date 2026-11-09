"""Lossless native RGBA frame decoding for compact axis-run atlas storage."""
import numpy as np
from PIL import Image

def frame_image(image,cell):
 crop=image.crop(tuple(cell['sourceBoundsExclusive'])).convert('RGBA')
 info=cell.get('nativeFrame')
 if not info:return crop
 a=np.repeat(np.repeat(np.array(crop),info['yRuns'],axis=0),info['xRuns'],axis=1)
 if list(a.shape[1::-1])!=info['size']:raise ValueError('Invalid lossless frame size')
 return Image.fromarray(a)

def native_storage(image,cell):
 info=cell.get('nativeFrame')
 if not info:return image,cell
 l,t,r,b=info['cellBoundsExclusive'];fl,ft,fr,fb=info['sourceBoundsExclusive']
 padded=Image.new('RGBA',(r-l,b-t));padded.paste(frame_image(image,cell),(fl-l,ft-t))
 return padded,{**cell,'cellBoundsExclusive':[0,0,r-l,b-t],'sourceBoundsExclusive':[fl-l,ft-t,fr-l,fb-t],'nativeFrame':None}
