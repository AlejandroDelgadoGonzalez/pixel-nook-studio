from compact_atlas import frame_image,native_storage
"""Golden-master calibration, deterministic NN normalization and independent grid audit.

python qa/pixel_density.py calibrate --output .artifacts/pixel-density/calibration.json
python qa/pixel_density.py normalize --spec stories/<story>/shared/pixel-density.json --apply
python qa/pixel_density.py check --spec stories/<story>/shared/pixel-density.json --output .artifacts/qa/density.json

Requires Pillow, numpy and scipy. PNG dimensions alone are never a density measure.
Source masters are immutable; normalization requires explicit --apply and backs up
every changed file below .artifacts/. No generated image API is used by this tool.
"""
from pathlib import Path
import argparse, hashlib, json, math, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'concept_art/manifest.json'
PROFILE=ROOT/'concept_art/density-profile.json'
NN=Image.Resampling.NEAREST
FROZEN_PANORAMA_BASELINE_SHA256='c1896685ee15b4214c62e854c57b25c432f97fcdead696972ae093aab731e7ca'

def read(p): return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def local(p):
 p=Path(p);p=p if p.is_absolute() else ROOT/p
 if not p.resolve().is_relative_to(ROOT): raise ValueError('Path outside this project: '+str(p))
 return p
def artifact(p):
 p=local(p)
 if not p.resolve().is_relative_to(ROOT/'.artifacts'): raise ValueError('Reports/backups must be under .artifacts/')
 return p
def save_json(p,data):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
def masters():
 manifest=read(MANIFEST);m=manifest['masters']
 for e in m+manifest.get('immutableVisualReferences',[]):
  if digest(ROOT/e['source'])!=e['sha256'] or digest(ROOT/e['copy'])!=e['sha256']: raise ValueError('Golden Master changed: '+e['id'])
 return {e['id']:e for e in m}
def hard(im):
 a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>80,255,0);a[a[:,:,3]==0]=0
 return Image.fromarray(a)
def tight(im):
 m=np.asarray(im.convert('RGBA'))[:,:,3]>80;y,x=np.where(m)
 if not len(x): raise ValueError('Empty master cell')
 return im.crop((int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)))
def grid_image(im,wh): return hard(im.resize(tuple(wh),NN))
def statistics(im):
 a=np.array(im.convert('RGBA'));m=a[:,:,3]>80;rgb=a[:,:,:3].astype(np.int16)
 runs=[]
 for mat in [m,m.T]:
  edges=mat[:,1:]!=mat[:,:-1]
  for row in edges.T:
   ids=np.flatnonzero(np.diff(np.r_[False,row,False]));runs.extend((ids[1::2]-ids[::2]).tolist())
 runs=np.array(runs);dark=m&(rgb.max(axis=2)<80);bright=m&~dark;rim=m&~ndi.binary_erosion(m)
 depth=ndi.distance_transform_edt(~bright)[rim&dark] if bright.any() else np.array([])
 return {'dimensions':list(im.size),'visiblePixels':int(m.sum()),'partialAlphaPixels':int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum()),
         'silhouettePlateauMedianPx':float(np.median(runs))if len(runs)else None,
         'outlineToInteriorMedianPx':float(np.median(depth))if len(depth)else None,
         'outlineToInteriorP90Px':float(np.percentile(depth,90))if len(depth)else None,
         'opaqueRGBColors':int(len(np.unique((rgb[m,0].astype(np.uint32)<<16)|(rgb[m,1].astype(np.uint32)<<8)|rgb[m,2].astype(np.uint32))))if m.any()else 0}
def plateau_histogram(im):
 # Quantize only for measurement: 32-level RGB bands suppress tiny AI color noise.
 # Count short constant-color plateaus along both axes, not large empty areas.
 a=np.asarray(im.convert('RGB'))//32;hist=np.zeros(13,dtype=np.int64)
 for mat in [a,np.swapaxes(a,0,1)]:
  for row in mat:
   changes=np.flatnonzero(np.any(row[1:]!=row[:-1],axis=1))+1
   lens=np.diff(np.r_[0,changes,len(row)]);hist+=np.bincount(lens[lens<=12],minlength=13)
 return {str(i):int(hist[i])for i in range(2,13)}
def calibrate():
 ms=masters();gm=Image.open(ROOT/ms['odyssey-core']['copy']).convert('RGBA');rows=[]
 for row,name in enumerate(['Odysseus','Calypso','Hermes']):
  for col in range(4):
   xs=[0,321,641,962,1254];ys=[0,337,643,970];bottom=961 if row==2 and col==1 else ys[row+1]
   im=tight(gm.crop((xs[col],ys[row],xs[col+1],bottom)))
   # Exact standing renderer policy in calypso-island.js: height136, half-grid68.
   # The crouched interaction reference is excluded from standing calibration.
   h=110 if row==0 and col==3 else 136;w=math.floor(im.width/im.height*h+.5)
   logical=grid_image(im,[max(1,math.floor(w/2+.5)),h//2]);can=logical.resize((logical.width*2,h),NN)
   rows.append({'name':name,'column':col,'referenceStandingWorldHeight':136,'sourceBoundsSize':list(im.size),'source':statistics(im),'canonical':statistics(can)})
 second=Image.open(ROOT/ms['second-cup-people']['copy']).convert('RGBA');secondary=[]
 for r in range(2):
  for c in range(4):
   im=tight(second.crop((round(c*second.width/4),round(r*second.height/2),round((c+1)*second.width/4),round((r+1)*second.height/2))))
   logical=grid_image(im,[max(1,round(im.width/im.height*68)),68]);secondary.append(statistics(logical.resize((logical.width*2,136),NN)))
 pan=Image.open(ROOT/ms['odyssey-panorama-c4-2']['copy']);hist=plateau_histogram(pan);block=max(range(2,9),key=lambda b:hist[str(b)])
 outlines=[r['canonical']['outlineToInteriorMedianPx']for r in rows if r['canonical']['outlineToInteriorMedianPx']]
 return {'schemaVersion':1,'masters':list(ms.values()),'characters':{'primary':'odyssey-core','secondary':'second-cup-people','masterRuntimeStandingHeight':136,'masterRuntimeGridWorldPx':2,'logicalSamplesPerReferencePerson':68,'storyReferenceWorldHeight':180,'explanation':'Match anatomical sampling: Odyssey136/2=68 samples per standing person. Alice180/2=90 was32.35% finer. Every pose uses its measured physical height relative to180, not its own bbox as a new standing height. Runtime keeps complete2world-pixel blocks.'},
         'panoramas':{'primary':'odyssey-panorama-c4-2','referenceDesignHeight':724,'shortPlateauHistogramQuant32':hist,'operativeNNBlockSourcePx':block,'method':'Mode of short(2..8px) quant32 RGB plateaus, axes pooled. This is a defined estimator, not proof of an original perfect lattice. Use this exact NN cell size for new assets.'},
         'outlineReference':{'medianAt136':float(np.median(outlines)),'observedMin':float(min(outlines)),'observedMax':float(max(outlines)),'method':'Median distance from dark visible silhouette boundary to nearest opaque non-dark interior; maxRGB<80. Diagnostic, anatomy/material dependent, not an instruction to dilate outlines.'},
         'characterSamples':rows,'secondaryCanonical136':secondary,'limits':'The selected AI PNG masters contain partial alpha and irregular native steps; no single exact native NN block describes every pixel. Exact enforcement is the derived sampling lattice/hard alpha. Outline and silhouette statistics describe rather than guarantee identical drawing style. Human zoom review remains mandatory.'}
def profile():
 p=read(PROFILE);ms=masters()
 if {e['id']:e['sha256']for e in p['masters']}!={k:v['sha256']for k,v in ms.items()}:raise ValueError('Density profile does not match masters')
 if p['characters']['logicalSamplesPerReferencePerson']!=68:raise ValueError('Unexpected anatomical calibration')
 return p
def logical_size(cell,p):
 ratio=p['characters']['logicalSamplesPerReferencePerson']/p['characters']['storyReferenceWorldHeight']
 return [max(1,math.floor(v*ratio+.5))for v in cell['normalizedWorldSize']]
def spec_profile(spec):
 p=profile();s=read(local(spec));reference=s.get('referenceStandingHeightWorld')
 if not isinstance(reference,(float,int))or reference<=0:raise ValueError('Measured referenceStandingHeightWorld required in spec')
 p['characters']['storyReferenceWorldHeight']=reference
 return s,p
def nn_labels(size,count):
 # PIL nearest-neighbor pixel-center mapping, used only to enumerate cell boundaries.
 return np.minimum(count-1,((2*np.arange(size)+1)*count)//(2*size))
def off_grid_changes(a,logical):
 # Independent audit of adjacent output pixels: any RGBA change INSIDE a
 # logical cell is forbidden. This does not call the normalizer/resizer.
 h,w=a.shape[:2];lx=nn_labels(w,logical[0]);ly=nn_labels(h,logical[1])
 xchange=np.any(a[:,1:]!=a[:,:-1],axis=2)&(lx[1:]==lx[:-1])[None,:]
 ychange=np.any(a[1:]!=a[:-1],axis=2)&(ly[1:]==ly[:-1])[:,None]
 return int(xchange.sum()+ychange.sum())
def normalize_atlas(im,cells,p):
 raise ValueError('Destructive character resampling is disabled: edit native pixel blocks; 68 rows is a historical diagnostic, not an authoring filter')

def native_pixel_errors(a,contract):
 errors=[];visible=a[:,:,3]>0;rgb=a[:,:,:3];dark=np.array(contract['outlineRGB']);skin=np.array(contract['skinRGB'])
 if 'exportScaleXY' in contract:
  sx,sy=contract['exportScaleXY']
  if sx<=0 or sy<=0 or abs(sx-sy)>1e-9:errors.append('Non-square pixels: scale_x must equal scale_y')
 if contract.get('canonicalEyeWorldWidth'):
  scale=contract['sourcePixelsPerWorldPixel'];target=contract['canonicalEyeWorldWidth']
  if any(abs((r-l)/scale-target)>.26 for l,t,r,b in contract.get('eyes',[])):errors.append('Inconsistent canonical eye width across character poses')
 if ndi.label(visible,structure=np.ones((3,3),bool))[1]!=contract.get('expectedComponents',1):errors.append('detached or empty silhouette')
 if ((a[:,:,3]>0)&(a[:,:,3]<255)).any():errors.append('partial alpha')
 if not contract.get('frameIsContentTrim')and(visible[0].any()or visible[-1].any()or visible[:,0].any()or visible[:,-1].any()):errors.append('Zero Bounding-Box Clipping: visible pixel touches cell edge')
 if contract.get('minimumTransparentCells')and not contract.get('frameIsContentTrim'):
  yy,xx=np.where(visible)
  if len(xx):
   margins=[int(xx.min()),int(yy.min()),int(a.shape[1]-1-xx.max()),int(a.shape[0]-1-yy.max())];required=math.ceil(contract['minimumTransparentCells']*contract['logicalCellPx'])
   if min(margins)<required:errors.append('Zero Bounding-Box Clipping: insufficient transparent margin')
 pixels=rgb[visible].astype(np.uint32)
 colors=set(np.unique((pixels[:,0]<<16)|(pixels[:,1]<<8)|pixels[:,2]).tolist())
 allowed={(int(r)<<16)|(int(g)<<8)|int(b)for r,g,b in contract['paletteRGB']}
 if colors-allowed:errors.append('noncanonical material color')
 rim=visible&~ndi.binary_erosion(visible,structure=np.ones((3,3),bool))
 if np.any(rgb[rim]!=dark):errors.append('colored exterior pixel')
 yy,xx=np.where(visible)
 if len(xx):
  for row in [int(yy.min()),int(yy.max())]:
   if np.any(rgb[row][visible[row]]!=dark):errors.append('Zero Bounding-Box Clipping: open top/bottom outline')
 if contract.get('fullHeadReferenceAlphaSha256'):
  l,t,r,b=contract['hairRegionBounds'];head=visible[t:b,l:r];hy,hx=np.where(head)
  if len(hx):
   head=head[hy.min():hy.max()+1,hx.min():hx.max()+1];signature=hashlib.sha256(str(head.shape).encode()+head.tobytes()).hexdigest()
   if signature!=contract['fullHeadReferenceAlphaSha256']:errors.append('Zero Bounding-Box Clipping: full source head silhouette changed')
  else:errors.append('Zero Bounding-Box Clipping: empty head')
 for i,(l,t,r,b) in enumerate(contract.get('eyes',[])):
  targets=contract.get('expectedEyeWidths')
  if targets is not None and (i>=len(targets)or r-l!=targets[i]):errors.append('eye width differs from approved profile cell')
  if not np.all(a[t:b,l:r,3]==255)or not np.all(rgb[t:b,l:r]==dark):errors.append('eye is not a solid opaque rectangle')
  margin=contract.get('eyeMargin',1);ring=np.ones((b-t+2*margin,r-l+2*margin),bool);ring[margin:-margin,margin:-margin]=False
  if not np.all(rgb[t-margin:b+margin,l-margin:r+margin][ring]==skin)or not np.all(a[t-margin:b+margin,l-margin:r+margin,3][ring]==255):errors.append('eye halo is not flat skin')
 for l,t,r,b in contract.get('jaws',[]):
  if not np.all(rgb[t:b,l:r][visible[t:b,l:r]]==dark):errors.append('jaw separator is not solid dark')
 for l,t,r,b in contract.get('neckOpenings',[]):
  if not np.all(a[t:b,l:r,3]==255)or not np.all(rgb[t:b,l:r]==contract['neckRGB']):errors.append('central jaw/neck attachment is not warm skin shadow')
 if contract.get('minimumHighlightPixels'):
  count=np.count_nonzero(visible&np.all(rgb==contract['hairHighlightRGB'],axis=2))
  if count<contract['minimumHighlightPixels']:errors.append('third hair highlight tone is missing')
 if contract.get('hairTonesRGB'):
  tones=contract['hairTonesRGB'];minimum=contract.get('minimumHairTonePixels',25)
  hair_region=np.ones(visible.shape,bool)
  if contract.get('hairRegionBounds'):
   l,t,r,b=contract['hairRegionBounds'];hair_region[:]=False;hair_region[t:b,l:r]=True
  if len({tuple(c)for c in tones})!=3:errors.append('hair requires three distinct tones')
  for tone in tones:
   mask=visible&hair_region&np.all(rgb==tone,axis=2)
   if mask.sum()<minimum:errors.append('three hair tones missing')
   if contract.get('minimumHairClusterPixels'):
    labels,count=ndi.label(mask,np.ones((3,3)));sizes=np.bincount(labels.ravel())[1:]
    if not count or sizes.max()<contract['minimumHairClusterPixels']:errors.append('hair tone lacks a clean strand cluster')
 if contract.get('strictHuman'):
  view=contract.get('view');counts={'front':2,'walk-right':1,'reach-right':1,'back':0}
  if view in counts and not contract.get('expressionException')and len(contract.get('eyes',[]))!=counts[view]:errors.append('eye count differs from measured view')
  if not contract.get('eyes')and not contract.get('expressionException')and contract.get('view')!='back':errors.append('visible human requires measured eyes')
  if contract.get('eyes')and not contract.get('neckOpenings')and not contract.get('neckOcclusionException'):errors.append('visible human requires warm neck attachment')
  if not contract.get('hairTonesRGB'):errors.append('human requires measured three-tone hair')
  if not contract.get('hairRegionBounds'):errors.append('human requires measured hair region')
  if contract.get('logicalEyeWidth')and any(r-l!=contract['logicalEyeWidth']for l,t,r,b in contract.get('eyes',[])):errors.append('eye exceeds one logical cell')
  facial_skin=visible&np.all(rgb==skin,axis=2)
  if contract.get('hairRegionBounds'):
   l,t,r,b=contract['hairRegionBounds'];region=np.zeros(visible.shape,bool);region[t:b,l:r]=True;facial_skin&=region
  labels,count=ndi.label(facial_skin,np.ones((3,3)))
  if count:
   sizes=np.bincount(labels.ravel());sizes[0]=0;face=labels==sizes.argmax();inside=ndi.binary_fill_holes(face)
   if np.any(inside&~face&~np.all(rgb==dark,axis=2)):errors.append('nonflat color enclosed in facial skin')
 return errors

def storage_pixel_errors(image,cell):
 if cell.get('nativeFrame'):
  native_image,native_cell=native_storage(image,cell)
  l,t,r,b=cell['cellBoundsExclusive'];fl,ft,fr,fb=cell['sourceBoundsExclusive']
  if not (0<=l<=fl<fr<=r<=image.width and 0<=t<=ft<fb<=b<=image.height):return ['Invalid compact storage bounds']
  return storage_pixel_errors(native_image,native_cell)
 contract=cell.get('nativePixelContract',{})
 if not contract.get('frameIsContentTrim'):return []
 bounds=cell.get('cellBoundsExclusive')
 if not bounds:return ['Zero Bounding-Box Clipping: missing padded storage cell']
 l,t,r,b=bounds;fl,ft,fr,fb=cell['sourceBoundsExclusive']
 if not(l<=fl<fr<=r and t<=ft<fb<=b):return ['Content trim is outside storage cell']
 base={k:contract[k]for k in ['paletteRGB','outlineRGB','skinRGB','expectedComponents','logicalCellPx','minimumTransparentCells']if k in contract}
 return native_pixel_errors(np.array(image.crop(bounds).convert('RGBA')),base)
def normalize_panorama(im,block):
 a=np.array(im.convert('RGB'));h,w=a.shape[:2]
 # Integer cells, last row/column may be partial: no whole-image dimension change.
 ys=np.minimum((np.arange(h)//block)*block+block//2,h-1);xs=np.minimum((np.arange(w)//block)*block+block//2,w-1)
 return Image.fromarray(a[ys[:,None],xs[None,:]])
def panorama_block(item,p):
 h=item.get('designReferenceSourceHeight')
 if not isinstance(h,(int,float))or h<=0:raise ValueError('Panorama requires measured designReferenceSourceHeight, excluding overscan')
 expected=p['panoramas']['operativeNNBlockSourcePx']*h/p['panoramas']['referenceDesignHeight'];block=max(1,math.floor(expected+.5))
 if abs(block/expected-1)>.01:raise ValueError('Design scale needs an explicit fractional-pitch calibration; cannot silently round panorama density')
 return block

def scene_policy_errors(policy):
 signature=hashlib.sha256(json.dumps(policy['legacyPanoramas'],sort_keys=True,separators=(',',':')).encode()).hexdigest()
 return []if signature==FROZEN_PANORAMA_BASELINE_SHA256 else ['Pre-policy panorama baseline changed; new art cannot gain a legacy exemption']

def scene_reference_errors(item,image,policy=None):
 """New panorama contract; metadata never substitutes for visual review."""
 policy=policy or read(MANIFEST)['sceneReferencePolicy'];errors=[]
 masters={e['path']:e for e in policy['approvedSceneMasters']};ref=item.get('reference_scene_master');master=masters.get(ref)
 if not master:return ['Mandatory Concept-Art Scene Reference: missing or unknown reference_scene_master']
 if item.get('reference_scene_master_sha256')!=master['sha256'] or digest(local(ref))!=master['sha256']:errors.append('Scene master hash mismatch')
 if list(image.size)!=[1664,936] or item.get('dimensions')!=[1664,936]:errors.append('Panorama must be 1664x936')
 if item.get('blockSourcePx')!=2 or item.get('overscanFactor')!=1.3:errors.append('Panorama requires 2x2 grid and 1.30x overscan')
 generation=item.get('generation',{})
 if generation.get('tool')!='image_gen' or generation.get('primaryStyleReference')!=ref:errors.append('Canonical master must be primary image_gen style reference')
 inputs=generation.get('referenced_image_paths',[])
 try:direct=any(local(p).resolve()==local(ref).resolve() for p in inputs)
 except (TypeError,ValueError):direct=False
 if not direct:errors.append('Canonical scene master missing from image_gen image inputs')
 if item.get('space')not in ['interior','exterior']:errors.append('Panorama must declare interior or exterior')
 if item.get('space')=='interior':
  interiors={'06-grand-wooden-library.png','08-rustic-cottage-interior.png','10-modern-loft-apartment.png','13-grand-palace-marble-hall.png'}
  if Path(ref).name not in interiors or item.get('fullRoomInterior')is not True or item.get('exteriorCutaway')is not False:errors.append('Full-Room Interior Rule: require interior master and full room without exterior cutaway')
 a=np.asarray(image.convert('RGBA'))
 if np.any(a[:,:,3]!=255):errors.append('Panorama background must be opaque')
 bad=np.any(a[:,1:]!=a[:,:-1],axis=2)[:,np.arange(1,image.width)%2!=0].any() or np.any(a[1:]!=a[:-1],axis=2)[np.arange(1,image.height)%2!=0].any()
 if bad:errors.append('Panorama differs from canonical 2x2 source density')
 return errors
def audit_asset(item,p):
 path=local(item['path']);im=Image.open(path);a=np.array(im.convert('RGBA'));errors=[];cells=[]
 if list(im.size)!=item['dimensions']:errors.append('Dimensions changed')
 if item['kind']=='atlas':
  canonical_widths={c['nativePixelContract']['canonicalEyeWorldWidth'] for c in item['cells'] if c.get('nativePixelContract',{}).get('canonicalEyeWorldWidth')}
  if len(canonical_widths)>1:errors.append('Inconsistent canonical eye width declarations within character atlas')
  if any(not c.get('nativePixelContract')for c in item['cells']):
   legacy=read(ROOT/'qa/legacy-visual-locks.json')['files']
   if legacy.get(item['path'])!=digest(path):errors.append('Unconverted atlas is not an unchanged historical source; native contracts required')
  painted=np.zeros((im.height,im.width),bool)
  for c in item['cells']:
   l,t,r,b=c['sourceBoundsExclusive'];piece=frame_image(im,c);sz=logical_size(c,p);native=c.get('nativePixelContract');bad=0 if native else off_grid_changes(np.array(piece.convert('RGBA')),sz);st=statistics(piece)
   if native:errors.extend(c['id']+': '+e for e in native_pixel_errors(np.array(piece.convert('RGBA')),native)+storage_pixel_errors(im,c))
   if bad:errors.append(c['id']+': off-grid changes='+str(bad))
   if st['partialAlphaPixels']:errors.append(c['id']+': partial alpha')
   if not st['visiblePixels']:errors.append(c['id']+': empty pose')
   if painted[t:b,l:r].any():errors.append(c['id']+': overlapping crop')
   painted[t:b,l:r]=True
   canonical=grid_image(piece,sz).resize((sz[0]*2,sz[1]*2),NN);canonical_stats=statistics(canonical)
   outline=canonical_stats['outlineToInteriorMedianPx'];bounds=[p['outlineReference']['observedMin']-2,p['outlineReference']['observedMax']+2]
   if c.get('checkOutline')and(outline is None or not bounds[0]<=outline<=bounds[1]):errors.append(c['id']+': outline outside master range plus one logical cell')
   cells.append({'id':c['id'],'verification':'native material/eye/jaw/exterior contract'if native else 'legacy sampling lattice','logicalSize':sz,'sourceCellPitch':[piece.width/sz[0],piece.height/sz[1]],'offGridChanges':None if native else bad,'statistics':st,'canonical136Statistics':canonical_stats,'outlineChecked':bool(c.get('checkOutline')),'outlineAllowedRange':bounds})
  if ((a[:,:,3]>0)&~painted).any():errors.append('Pixels outside measured cells')
 else:
  if item['path'].startswith('stories/'):
   policy=read(MANIFEST)['sceneReferencePolicy'];errors.extend(scene_policy_errors(policy))
   if policy['legacyPanoramas'].get(item['path'])!=digest(path):
    manifest=read(ROOT/Path(item['path']).parts[0]/Path(item['path']).parts[1]/'manifest.json')
    declarations=[e for e in manifest.get('panoramas',[])if e.get('path','').lstrip('/')==item['path']]
    errors.extend(scene_reference_errors(declarations[0],im,policy)if len(declarations)==1 else ['Mandatory Concept-Art Scene Reference: missing/duplicate story manifest panorama declaration'])
  block=panorama_block(item,p);rgb=a[:,:,:3];xc=np.any(rgb[:,1:]!=rgb[:,:-1],axis=2);yc=np.any(rgb[1:]!=rgb[:-1],axis=2)
  bad=int(xc[:,(np.arange(1,im.width)%block)!=0].sum()+yc[(np.arange(1,im.height)%block)!=0].sum())
  if bad:errors.append('Off-grid panorama changes='+str(bad))
  cells=[{'operativeBlockSourcePx':block,'offGridChanges':bad,'partialEdgeCellsAllowed':True,'shortPlateauHistogramQuant32':plateau_histogram(im)}]
 return {'path':item['path'],'kind':item['kind'],'sha256':digest(path),'dimensions':list(im.size),'passed':not errors,'errors':errors,'cells':cells}
def run_check(spec):
 s,p=spec_profile(spec);results=[audit_asset(a,p)for a in s['assets']]
 return {'passed':all(a['passed']for a in results),'profileSha256':digest(PROFILE),'assets':results,'scope':'Exact normalized sampling, source raster and alpha only. No automatic claim of semantic style identity, staging or encoded-video certification.'}

def check_stories():
 from visual_registry import check
 return check()
def check_directory(directory='concept_art'):
 base=local(directory);catalog=read(base/'catalog.json');report=run_check(base/'pixel-density.json');errors=[];rows=[]
 actual={p.relative_to(ROOT).as_posix()for p in base.rglob('*')if p.is_file()and p.suffix.lower()in ['.png','.jpg','.jpeg','.webp']}
 entries=catalog['assets'];declared={e['path']for e in entries};audited={a['path']:a for a in report['assets']}
 manifest=read(MANIFEST);immutable={e['copy']:e for e in manifest['masters']+manifest.get('immutableVisualReferences',[])}
 if base.resolve()==(ROOT/'concept_art').resolve():
  errors.extend(scene_policy_errors(manifest['sceneReferencePolicy']))
  expected_scenes={e['path']for e in manifest['sceneReferencePolicy']['approvedSceneMasters']}
  if len(expected_scenes)!=16:errors.append('Exactly sixteen approved scene masters are required')
  if {p.relative_to(ROOT).as_posix()for p in (base/'scenes').iterdir()}!=expected_scenes:errors.append('Scene folder must contain exactly sixteen canonical PNG masters and no auxiliary files')
  expected_characters={'odyssey-core.png','second-cup-people.png','master-pose-sheet-alice.png','casual-modern-core.png','storybook-classic-core.png','fantasy-medieval-core.png','world-tales-core.png','diverse-everyday-core.png'}
  if {Path(p).name for p in actual if '/characters/'in p}!=expected_characters:errors.append('Canonical character inventory must contain exactly eight masters')
  if catalog.get('counts',{}).get('rasters')!=len(actual):errors.append('Catalog raster count mismatch')
  for key,fragment in [('characterSheets','/characters/'),('sceneReferences','/scenes/')]:
   expected={e['path']:e['sha256']for e in entries if fragment in e['path']}
   if {e['path']:e['sha256']for e in manifest.get(key,[])}!=expected:errors.append('Manifest reference inventory mismatch: '+key)
   authority=read(PROFILE).get('visualAuthority',{}).get('characters'if key=='characterSheets'else'scenes',[])
   if {e['path']:e['sha256']for e in authority}!=expected:errors.append('Density profile reference inventory mismatch: '+key)
 if len(declared)!=len(entries):errors.append('Duplicate catalog paths')
 if actual-declared:errors.append('Uncatalogued rasters: '+', '.join(sorted(actual-declared)))
 if declared-actual:errors.append('Missing catalog rasters: '+', '.join(sorted(declared-actual)))
 if set(audited)-declared:errors.append('Density spec includes uncatalogued assets')
 for e in entries:
  path=local(e['path'])
  if not path.resolve().is_relative_to(base.resolve()):raise ValueError('Catalog path outside audited directory')
  if not path.exists():continue
  with Image.open(path)as image:dimensions=list(image.size)
  mode=e['verification'];passed=digest(path)==e['sha256']and dimensions==e['dimensions']
  if mode=='normalized-grid':passed=passed and e['path']in audited and audited[e['path']]['passed']
  elif mode=='immutable-source':passed=passed and e['path']in immutable and e['sha256']==immutable[e['path']]['sha256']
  else:passed=False
  if not passed:errors.append('Catalog integrity/verification mismatch: '+e['path'])
  rows.append({'path':e['path'],'verification':mode,'passed':bool(passed)})
 for path in base.rglob('*.json'):read(path)
 if (base/'character-cores.json').exists():
  from character_cores import check
  report['nativeCharacterCores']=check((base/'character-cores.json').relative_to(ROOT).as_posix())
  if not report['nativeCharacterCores']['passed']:errors.extend(report['nativeCharacterCores']['errors'])
 report.update(passed=report['passed']and not errors,directory=base.relative_to(ROOT).as_posix(),catalogAssets=rows,rasterFiles=len(actual),errors=errors,scope='Complete directory inventory and pinned SHA256s; normalized assets use exact grid/alpha/outline checks, immutable originals use source hashes and existing calibration. Does not approve visual design or certify story runtime.')
 return report
def apply(spec,apply=False):
 if not apply:raise ValueError('Normalization requires explicit --apply; check is read-only')
 s,p=spec_profile(spec);immutable=p['masters']+read(MANIFEST).get('immutableVisualReferences',[]);forbidden={local(e[k]).resolve()for e in immutable for k in ['source','copy']};changes=[]
 # Preflight the entire batch before writing any panorama or creating backups.
 # A mixed spec must never partially apply before reaching a character sheet.
 for item in s['assets']:
  if local(item['path']).resolve()in forbidden:raise ValueError('Never normalize a Golden Master')
  if item.get('kind')=='atlas':raise ValueError('Destructive character resampling is disabled: edit native pixel blocks')
 for item in s['assets']:
  path=local(item['path'])
  if path.resolve()in forbidden:raise ValueError('Never normalize a Golden Master')
  im=Image.open(path)
  if list(im.size)!=item['dimensions']:raise ValueError('Unexpected source dimensions')
  before=digest(path);backup=artifact('.artifacts/pixel-density/originals')/path.relative_to(ROOT)
  # A newly authored image at an existing URL must never be overwritten by an
  # older backup. Preserve each distinct incoming version under its own hash.
  if backup.exists()and digest(backup)!=before:backup=artifact('.artifacts/pixel-density/originals/by-sha256')/before/path.name
  backup.parent.mkdir(parents=True,exist_ok=True)
  if not backup.exists():backup.write_bytes(path.read_bytes())
  if audit_asset(item,p)['passed']:
   changes.append({'path':item['path'],'before':before,'after':before,'originalBackup':backup.relative_to(ROOT).as_posix(),'dimensionsPreserved':True,'alreadyCanonicalNoOp':True});continue
  result=normalize_atlas(im,item['cells'],p)if item['kind']=='atlas'else normalize_panorama(im,panorama_block(item,p))
  result.save(path);changes.append({'path':item['path'],'before':before,'after':digest(path),'originalBackup':backup.relative_to(ROOT).as_posix(),'dimensionsPreserved':result.size==im.size})
 return changes
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('command',choices=['calibrate','check','normalize','check-directory','check-stories']);parser.add_argument('--spec');parser.add_argument('--directory',default='concept_art');parser.add_argument('--output',required=True);parser.add_argument('--apply',action='store_true');args=parser.parse_args()
 if args.command=='calibrate':report=calibrate()
 elif args.command=='check-directory':report=check_directory(args.directory)
 elif args.command=='check-stories':report=check_stories()
 else:
  if not args.spec:parser.error('--spec required')
  if args.command=='normalize':changes=apply(args.spec,args.apply)
  report=run_check(args.spec)
  if args.command=='normalize':report['changes']=changes
 save_json(artifact(args.output),report)
 print(json.dumps({'passed':report.get('passed',True),'assets':len(report.get('assets',[])),'output':args.output}));return 0 if report.get('passed',True)else 1
if __name__=='__main__':sys.exit(main())
