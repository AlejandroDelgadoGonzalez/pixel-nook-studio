// Deterministic pk-rgba-png/1: RGBA PNG, filter 0, stored DEFLATE blocks.
export async function sha256(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
export function pngBytes(w,h,rgba){
 const be=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255];
 const crc=a=>{let c=0xffffffff;for(const n of a){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
 const chunk=(t,b)=>{const a=[...new TextEncoder().encode(t),...b];return [...be(b.length),...a,...be(crc(a))];};
 const raw=[];for(let y=0;y<h;y++)raw.push(0,...rgba.slice(y*w*4,(y+1)*w*4));
 let a=1,b=0;for(const n of raw){a=(a+n)%65521;b=(b+a)%65521;}
 const z=[120,1];for(let p=0;p<raw.length;p+=65535){let n=Math.min(65535,raw.length-p);z.push(p+n===raw.length?1:0,n&255,n>>>8,(65535-n)&255,(65535-n)>>>8,...raw.slice(p,p+n));}z.push(...be((b*65536+a)>>>0));
 return new Uint8Array([137,80,78,71,13,10,26,10,...chunk('IHDR',[...be(w),...be(h),8,6,0,0,0]),...chunk('IDAT',z),...chunk('IEND',[])]);
}
