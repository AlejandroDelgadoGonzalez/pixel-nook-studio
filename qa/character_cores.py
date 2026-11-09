"""Native-pixel audit and lossless padded export for the five character cores.

This does not normalize or resample artwork and does not certify story runtime.
"""
from pathlib import Path
import argparse, hashlib, json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from pixel_density import native_pixel_errors

ROOT=Path(__file__).resolve().parents[1]

def padded_sprite_sheet(image,cells,logical_cell_px=12,margin_cells=4,columns=4):
 """Recover complete source components, then copy with padding; never resample.

 A supplied window is a selection seed, not a destructive clipping rectangle.
 Connected buns, hats and feet extending beyond it are included in full.
 """
 if margin_cells<4:raise ValueError('At least four logical cells required')
 image=image.convert('RGBA');labels,_=ndi.label(np.asarray(image)[:,:,3]>0,np.ones((3,3)));objects=ndi.find_objects(labels)
 pieces=[];pad=int(np.ceil(logical_cell_px*margin_cells))
 for cell in cells:
  l,t,r,b=cell['sourceBoundsExclusive']
  if not(0<=l<r<=image.width and 0<=t<b<=image.height):raise ValueError('Selection window outside source image')
  ids=np.unique(labels[t:b,l:r]);selected=[objects[int(i)-1]for i in ids if i>0]
  if not selected:raise ValueError('Empty sprite')
  full=(min(q[1].start for q in selected),min(q[0].start for q in selected),max(q[1].stop for q in selected),max(q[0].stop for q in selected))
  box=(full[0]-l,full[1]-t,full[2]-l,full[3]-t)
  pieces.append((image.crop(full),box))
 width=max(p.width for p,_ in pieces)+2*pad;height=max(p.height for p,_ in pieces)+2*pad
 canvas=Image.new('RGBA',(width*columns,height*((len(pieces)+columns-1)//columns)));records=[]
 for i,(piece,box)in enumerate(pieces):
  x=(i%columns)*width+(width-piece.width)//2;y=(i//columns)*height+(height-piece.height)//2;canvas.paste(piece,(x,y))
  records.append({'sourceBoundsExclusive':[(i%columns)*width,(i//columns)*height,(i%columns+1)*width,(i//columns+1)*height],'translationFromOldCell':[x-(i%columns)*width-box[0],y-(i//columns)*height-box[1]],'logicalCellPx':logical_cell_px,'minimumTransparentCells':margin_cells,'exportScaleXY':[1,1]})
 return canvas,records

def check(spec='concept_art/character-cores.json'):
 data=json.loads((ROOT/spec).read_text(encoding='utf-8-sig'));errors=[];sheets=[]
 expected={'casual-modern-core.png','storybook-classic-core.png','fantasy-medieval-core.png','world-tales-core.png','diverse-everyday-core.png'}
 if len(data['assets'])!=5 or {Path(a['path']).name for a in data['assets']}!=expected:errors.append('Character core sheet inventory mismatch')
 for item in data['assets']:
  path=ROOT/item['path'];im=Image.open(path).convert('RGBA');a=np.array(im);rows=[]
  if list(im.size)!=item['dimensions']:errors.append(item['path']+': dimensions')
  digest=hashlib.sha256(path.read_bytes()).hexdigest()
  if digest!=item['sha256']:errors.append(item['path']+': source hash')
  if len(item['cells'])!=12:errors.append(item['path']+': expected 12 sprites')
  painted=np.zeros(a.shape[:2],bool)
  for i,cell in enumerate(item['cells']):
   l,t,r,b=cell['sourceBoundsExclusive'];piece=a[t:b,l:r];v=piece[:,:,3]>0;c=cell['nativePixelContract'];problems=native_pixel_errors(piece,c);g=cell['headGeometry']
   if painted[t:b,l:r].any():problems.append('overlapping cells')
   painted[t:b,l:r]=True
   if v[0].any()or v[-1].any()or v[:,0].any()or v[:,-1].any():problems.append('nonempty outer gutter')
   if c.get('minimumTransparentCells',0)<4 or c.get('logicalCellPx')!=12:problems.append('missing four-cell transparent margin contract')
   expected=[2,1,0,1][i%4]
   if len(c['eyes'])!=expected:problems.append('incorrect front/profile/back eye count')
   if any(w!=12 for w in c['expectedEyeWidths']):problems.append('eye differs from approved 12px eye unit')
   if expected and (not c['neckOpenings']or max(q[2]-q[0]for q in c['neckOpenings'])<12):problems.append('missing warm central neck attachment')
   yy,xx=np.where(v);bounds=[int(xx.min()+l),int(yy.min()+t),int(xx.max()+l+1),int(yy.max()+t+1)];ratio=(g['jawBottomY']-bounds[1])/(bounds[3]-bounds[1])
   if bounds!=g['bodyBounds']:problems.append('body bounds differ from measured source')
   if not .45<=ratio<=.50 and not g.get('sourceAnatomyPreserved'):problems.append('head/body ratio outside 45–50%')
   head=piece[:g['jawBottomY']-t];hair=[int(np.count_nonzero((head[:,:,3]>0)&np.all(head[:,:,:3]==tone,axis=2)))for tone in c['hairTonesRGB']]
   headcolors={tuple(x)for x in np.unique(head[head[:,:,3]>0,:3],axis=0)}
   if headcolors-{tuple(x)for x in cell['headAllowedRGB']}:problems.append('foreign garment/brown noise in head')
   neckmask=np.zeros(head.shape[:2],bool)
   for nl,nt,nr,nb in c['neckOpenings']:neckmask[max(0,nt):min(len(head),nb),nl:nr]=True
   if np.any(np.all(head[:,:,:3]==c['neckRGB'],axis=2)&(head[:,:,3]>0)&~neckmask):problems.append('warm skin noise outside neck attachment')
   skinmask=np.all(head[:,:,:3]==c['skinRGB'],axis=2)&(head[:,:,3]>0);labels,k=ndi.label(skinmask,np.ones((3,3)));sizes=np.bincount(labels.ravel());sizes[0]=0
   if k:
    inside=ndi.binary_fill_holes(labels==sizes.argmax());dark=np.all(head[:,:,:3]==c['outlineRGB'],axis=2)
    if np.any(inside&~skinmask&~dark):problems.append('nonflat color enclosed in facial skin')
   if min(hair)<c['minimumHairTonePixels']:problems.append('three clean hair tones missing from head')
   crop=hashlib.sha256(piece.tobytes()).hexdigest()
   if crop!=cell['lockedCropSha256']:problems.append('locked pose pixels changed')
   for material,colors in cell['materialsRGB'].items():
    if not 2<=len(colors)<=3:problems.append('material must declare 2–3 flat tones: '+material)
   if problems:errors.append({'pose':cell['id'],'errors':problems})
   rows.append({'id':cell['id'],'passed':not problems,'headBodyPercent':round(ratio*100,2),'visibleEyes':expected,'eyeWidths':c['expectedEyeWidths'],'hairTonePixelsInHead':hair,'partialAlphaPixels':int(np.count_nonzero((piece[:,:,3]>0)&(piece[:,:,3]<255))),'cropSha256':crop,'errors':problems})
  if ((a[:,:,3]>0)&~painted).any():errors.append(item['path']+': pixels outside cells')
  if len({x['cropSha256']for x in rows})!=12:errors.append(item['path']+': duplicated pose')
  sheets.append({'path':item['path'],'sha256':digest,'poses':rows})
 return {'passed':not errors,'errors':errors,'sheets':sheets,'sprites':sum(len(s['poses'])for s in sheets),'scope':'Native PNG palette, opaque rectangular eyes, warm neck openings, three hair tones, exterior/alpha/gutters, pinned cells and authored 45–50% head landmarks. Head bounds include drawn headwear; back-view jaw levels are inherited anatomical landmarks. Human style approval remains pending; no runtime or MP4 certification.'}

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--spec',default='concept_art/character-cores.json');parser.add_argument('--output',required=True);args=parser.parse_args();out=ROOT/args.output
 if not out.resolve().is_relative_to(ROOT/'.artifacts'):raise ValueError('Reports must stay in .artifacts/')
 report=check(args.spec);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps({'passed':report['passed'],'sprites':report['sprites'],'errors':report['errors']}));sys.exit(0 if report['passed']else 1)
