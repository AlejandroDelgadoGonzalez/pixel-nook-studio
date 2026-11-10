// One measured room composition, independent of beat, pose, reading clock and
// caption visibility. Established at the end of S3 and inherited throughout S4.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function hallRoomFrame(s){
 const g=s.drinkGeometry.camera.roomLock,w=s.scale.width,h=s.scale.height;
 const [l,t,r,b]=w<h&&s.reader.model.eat?.active?g.mobileLateWorldRect:g.worldRect;
 const st=g.screenInsets.top,sb=Math.min(h-8,(s.readingHeight||h)+g.screenInsets.bottomReservationCredit),sl=1,sr=w-1;
 const minimum=Math.max((w+2)/3328,(h+2)/1872,(h-sb+2)/(1872-b),(st+2)/t),maximum=Math.min((sr-sl)/(r-l),(sb-st)/(b-t));
 const z=Math.max(minimum,Math.min(h/1200,maximum)),lx=Math.max((w/2+1)/z,r+(w/2-sr)/z),rx=Math.min(3328-(w/2+1)/z,l+(w/2-sl)/z),ty=Math.max((h/2+1)/z,b+(h/2-sb)/z),by=Math.min(1872-(h/2+1)/z,t+(h/2-st)/z);
 return{x:clamp((l+r)/2,lx,rx),y:clamp((t+b)/2+(h/2-(st+sb)/2)/z,ty,by),z,fits:lx<=rx&&ty<=by,lock:'hall-table-door'};
}
