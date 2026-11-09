from compact_atlas import frame_image
"""Inventory gate: exact native contracts for new sprites; immutable legacy only."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from pixel_density import ROOT,MANIFEST,read,scene_policy_errors,scene_reference_errors,native_pixel_errors,storage_pixel_errors

def panorama_problems(rel,path,declaration,policy):
 historical=policy['legacyPanoramas'].get(rel)==hashlib.sha256(path.read_bytes()).hexdigest()
 problems=scene_reference_errors(declaration,Image.open(path),policy)if declaration is not None else ([]if historical else ['Mandatory Concept-Art Scene Reference: missing story manifest declaration'])
 return historical,problems

def check():
 registry=json.loads((ROOT/'qa/legacy-visual-locks.json').read_text());legacy=registry['files'];declared={};errors=[];rows=[]
 for spec in (ROOT/'stories').glob('*/shared/pixel-density.json'):
  for asset in json.loads(spec.read_text(encoding='utf-8-sig'))['assets']:declared[asset['path']]=asset
 actual={p.relative_to(ROOT).as_posix():p for p in (ROOT/'stories').rglob('*.png') if 'assets' in p.parts}
 policy=read(MANIFEST)['sceneReferencePolicy'];errors.extend(scene_policy_errors(policy));panoramas={}
 for entry in read(ROOT/'stories/catalog.json')['stories']:
  for item in read(ROOT/entry['manifest'].lstrip('/')).get('panoramas',[]):
   rel=item.get('path','').lstrip('/')
   if rel in panoramas:errors.append(rel+': duplicate panorama declaration')
   if not rel.startswith('stories/'+entry['slug']+'/assets/'):errors.append(rel+': panorama declaration outside its story')
   panoramas[rel]=item
   if rel not in actual:errors.append(rel+': declared panorama missing')
 for rel,p in actual.items():
  asset=declared.get(rel);native=asset and asset.get('kind')=='atlas' and all(c.get('nativePixelContract')for c in asset.get('cells',[]))
  is_panorama=rel in policy['legacyPanoramas'] or rel in panoramas or (asset and asset.get('kind')=='panorama') or any(s in p.parts for s in ['backgrounds','environments'])
  if is_panorama:
   historical,problems=panorama_problems(rel,p,panoramas.get(rel),policy)
   if problems:errors.append({'path':rel,'errors':problems})
   rows.append({'path':rel,'mode':'preserved-pre-policy-panorama'if historical and rel not in panoramas else 'direct-scene-reference','passed':not problems})
  elif native:
   im=Image.open(p).convert('RGBA');a=np.array(im);problems=[]
   for c in asset['cells']:
    contract=c['nativePixelContract']
    if rel not in registry.get('nativeBaselinePaths',[]) and contract.get('spriteType','human')=='human':
     if not contract.get('strictHuman')or not contract.get('hairTonesRGB')or not contract.get('logicalEyeWidth'):problems.append(c['id']+': new human lacks strict face/hair/one-cell contract')
    l,t,r,b=c['sourceBoundsExclusive'];problems += [c['id']+': '+e for e in native_pixel_errors(np.array(frame_image(im,c)),contract)+storage_pixel_errors(im,c)]
   if problems:errors.append({'path':rel,'errors':problems})
   rows.append({'path':rel,'mode':'native-contract','sprites':len(asset['cells']),'passed':not problems})
  elif rel in legacy:
   good=hashlib.sha256(p.read_bytes()).hexdigest()==legacy[rel]
   if not good:errors.append(rel+': legacy image changed; requires measured native contract, not renewed exemption')
   rows.append({'path':rel,'mode':'immutable-legacy','passed':good})
  else:errors.append(rel+': new art missing measured native sprite or panorama contract')
 for rel in legacy:
  if rel not in actual:errors.append(rel+': pinned historical image missing')
 return {'passed':not errors,'errors':errors,'assets':rows,'scope':'All story PNG inventory. Native contracts audit source pixels; legacy hash pins preserve approved art and do not certify its eye/hair purity. No runtime, physical-device or MP4 certification.'}
