"""Exact state/cutaway exterior inheritance; no image mutation."""
from pathlib import Path
import json,hashlib,argparse,sys
from PIL import Image,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
def check(story):
 spec=json.loads((ROOT/'stories'/story/'shared/state-inheritance-locks.json').read_text());rows=[]
 for lock in spec['locks']:
  base=ROOT/lock['base'];b=Image.open(base).convert('RGBA');v=Image.open(ROOT/lock['variant']).convert('RGBA');assert b.size==v.size==tuple(lock['dimensions']);m=Image.new('L',(b.width//2,b.height//2));d=ImageDraw.Draw(m);d.polygon([(x//2,y//2)for x,y in lock['allowedChangePolygon']],fill=255)
  for l,t,r,z in lock.get('allowedChangeRectangles',[]):d.rectangle((l//2,t//2,r//2-1,z//2-1),fill=255)
  for l,t,r,z in lock['protectedRectangles']:d.rectangle((l//2,t//2,r//2-1,z//2-1),fill=0)
  allowed=np.array(m.resize(b.size,Image.Resampling.NEAREST))>0;diff=np.any(np.array(b)!=np.array(v),axis=2);count=int(diff[~allowed].sum());sha=hashlib.sha256(base.read_bytes()).hexdigest();rows.append({'id':lock['id'],'passed':count==0 and sha==lock['baseSha256'],'changedExteriorPixels':count,'changedInteriorPixels':int(diff[allowed].sum()),'baseSha256':sha,'dimensions':list(b.size)})
 return{'passed':all(r['passed']for r in rows),'locks':rows}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--story',required=True);p.add_argument('--output',required=True);a=p.parse_args();out=ROOT/a.output;assert out.resolve().is_relative_to(ROOT/'.artifacts');r=check(a.story);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));sys.exit(0 if r['passed']else 1)
