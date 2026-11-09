from compact_atlas import frame_image
"""Read-only character master identity, palette, reuse and landmark gate.

Palette membership never proves correct garment placement or anatomy. Required
landmarks are compared with locked canonical limits; human semantic review stays
an explicit separate approval requirement.
"""
from pathlib import Path
import argparse,json,hashlib,sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from collections import defaultdict
from pixel_density import native_pixel_errors,storage_pixel_errors
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def palette(a):
 rgb=a[a[:,:,3]>80,:3].astype(np.uint32);return set(np.unique((rgb[:,0]<<16)|(rgb[:,1]<<8)|rgb[:,2]).tolist())

def source_registration_errors(value,context=''):
 errors=[]
 if isinstance(value,list):
  for item in value:errors.extend(source_registration_errors(item,context))
 elif isinstance(value,dict):
  if 'sourceBoundsExclusive'in value and 'origin'in value:
   l,t,r,b=value.get('nativeFrame',{}).get('sourceBoundsExclusive',value['sourceBoundsExclusive'])
   for field in ['sourceRegistrationAnchor','sourceShoeAnchor']:
    if field in value:
     x,y=value[field];origin=[(x-l)/(r-l),(y-t)/(b-t)]
     if any(abs(a-z)>1e-8 for a,z in zip(origin,value['origin'])):errors.append(context+': stale source registration '+value.get('pose','')+'/'+field)
  for item in value.values():errors.extend(source_registration_errors(item,context))
 return errors

def source_component_errors(doc,master):
 errors=[];groups=defaultdict(list)
 for pose in doc['poses']:
  provenance=pose.get('provenance',{})
  if not provenance.get('originalAsset')or not provenance.get('originalBounds')or not provenance.get('originalSourceSha256'):
   errors.append(pose['pose']+': missing independent full source reference');continue
  groups[provenance['originalAsset']].append(pose)
 for url,poses in groups.items():
  path=ROOT/url.lstrip('/');expected={p['provenance']['originalSourceSha256']for p in poses}
  if not path.exists()or expected!={sha(path)}:errors.append(url+': original source missing or changed');continue
  with Image.open(path)as image:mask=np.array(image.getchannel('A'))>80
  labels,count=ndi.label(mask,np.ones((3,3)));boxes=ndi.find_objects(labels)
  for pose in poses:
   l,t,r,b=pose['provenance']['originalBounds'];ids,counts=np.unique(labels[t:b,l:r],return_counts=True);positive=ids>0;ids=ids[positive];counts=counts[positive]
   if not len(ids):errors.append(pose['pose']+': empty original crop');continue
   selected=ids
   if pose['provenance'].get('selectLargestSourceComponent'):selected=ids[np.argmax(counts):np.argmax(counts)+1]
   if any(boxes[i-1][1].start<l or boxes[i-1][0].start<t or boxes[i-1][1].stop>r or boxes[i-1][0].stop>b for i in selected):errors.append(pose['pose']+': Zero Bounding-Box Clipping: incomplete source component')
   original=mask[t:b,l:r]
   if pose['provenance'].get('selectLargestSourceComponent'):original=labels[t:b,l:r]==selected[0]
   actual=np.array(frame_image(master,pose).getchannel('A'))>80
   if actual.shape!=original.shape or not np.array_equal(actual,original):errors.append(pose['pose']+': complete original silhouette was altered or cut')
 return errors
def check(story):
 base=ROOT/'stories'/story; registry=read(base/'shared/character-masters.json');errors=[];rows=[]
 for who,item in registry['characters'].items():
  doc=read(ROOT/item['metadata']);source=ROOT/item['canonicalSource'];master=ROOT/doc['asset'].lstrip('/');s=np.array(Image.open(source).convert('RGBA'));allowed=palette(s);im=Image.open(master).convert('RGBA');a=np.array(im);preserved=item.get('paletteRevision',{}).get('preservedPoseHashes',{});alien=set()
  if im.width>2048 or im.height>3072:errors.append(who+': master storage exceeds 2048x3072')
  if not preserved:alien=palette(a)-allowed
  if alien:errors.append(who+': noncanonical RGB '+str(sorted(alien)[:5]))
  if sha(source)!=item['canonicalSha256']:errors.append(who+': canonical source changed')
  if doc.get('schemaVersion',1)>=2:errors.extend(who+': '+e for e in source_component_errors(doc,im))
  if item.get('masterSha256') and sha(master)!=item['masterSha256']:errors.append(who+': locked master pixels changed; remeasure anatomy before approval')
  for p in doc['poses']:
   crop=frame_image(im,p);cropHash=hashlib.sha256(crop.tobytes()).hexdigest()
   if doc.get('schemaVersion',1)>=2:
    if not p.get('cellBoundsExclusive')or not p.get('nativePixelContract'):errors.append(who+': missing complete padded cell contract '+p['pose'])
    else:
     cell={'sourceBoundsExclusive':p['sourceBoundsExclusive'],'cellBoundsExclusive':p['cellBoundsExclusive'],'nativePixelContract':p['nativePixelContract'],'nativeFrame':p.get('nativeFrame')}
     errors.extend(who+'/'+p['pose']+': '+e for e in native_pixel_errors(np.array(crop),p['nativePixelContract'])+storage_pixel_errors(im,cell))
   if p['pose']in preserved:
    if cropHash!=preserved[p['pose']]:errors.append(who+': preserved pre-revision pose changed '+p['pose'])
   elif preserved:
    poseAlien=palette(np.array(crop))-allowed;alien.update(poseAlien)
    if poseAlien:errors.append(who+': revised pose has noncanonical RGB '+p['pose'])
   if p.get('lockedCropSha256') and cropHash!=p['lockedCropSha256']:errors.append(who+': pose pixels changed '+p['pose'])
   if p['asset']!=doc['asset']:errors.append(who+': pose outside master '+p['pose'])
   if p['provenance'].get('reuse','').startswith('new extraordinary') and Path(p['provenance']['directMasterReference']).as_posix()!=Path(item['canonicalSource']).as_posix():errors.append(who+': chained extraordinary reference')
  for derived in item.get('derivedCopies',[]):
   pose=next((p for p in doc['poses']if p['pose']==derived['pose']),None);path=ROOT/derived['path']
   if pose is None:errors.append(who+': unknown derived-copy pose');continue
   copy=Image.open(path).convert('RGBA');expected=frame_image(im,pose)
   if copy.size!=expected.size or copy.tobytes()!=expected.tobytes():errors.append(who+': derived copy differs from master pose '+derived['pose'])
   if sha(path)!=derived['sha256']:errors.append(who+': derived-copy hash changed '+derived['pose'])
  landmark=item.get('proportionChecks',[])
  for m in landmark:
   value=m['measuredRatio'];lo,hi=m['allowedRange']
   if not lo<=value<=hi:errors.append(who+': proportion '+m['name'])
  if set(preserved)-{p['pose']for p in doc['poses']}:errors.append(who+': unknown preserved pose')
  rows.append({'character':who,'poses':len(doc['poses']),'alienColors':len(alien),'byteLockedPreRevisionPoses':len(preserved),'canonicalSourceUnchanged':sha(source)==item['canonicalSha256'],'proportionChecks':landmark})
 # Reject production metadata that asks for a character's pose on a scene sheet.
 for f in (base/'shared').glob('*atlas-cells.json'):
  data=read(f)
  errors.extend(source_registration_errors(data,str(f.relative_to(ROOT))))
  def walk(v):
   if isinstance(v,list):
    for c in v:walk(c)
   elif isinstance(v,dict):
    who=v.get('masterCharacter')or v.get('actor')
    if who in registry['characters'] and 'sourceBoundsExclusive'in v:
     expected=read(ROOT/registry['characters'][who]['metadata'])['asset']
     if v.get('asset')!=expected:errors.append(str(f.relative_to(ROOT))+': bypassed master '+v.get('pose',''))
    for c in v.values():walk(c)
  walk(data)
 return {'passed':not errors,'errors':errors,'characters':rows,'scope':'Exact RGB identity, pinned canonical source, production master references, recorded proportion landmarks. Does not certify semantic stripe placement or visual approval.'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--story',required=True);p.add_argument('--output',required=True);args=p.parse_args();out=ROOT/args.output
 if not out.resolve().is_relative_to(ROOT/'.artifacts'):raise ValueError('Reports only in .artifacts')
 report=check(args.story);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'passed':report['passed'],'errors':report['errors']}));sys.exit(0 if report['passed']else 1)
