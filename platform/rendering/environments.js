export {prepareLandscapeShot,cameraCenterX,keepCameraInsideEnvironment} from './camera.js';
export function landscapeView(scene){
 // Export and portrait mode use a genuinely vertical stage even on a computer.
 return scene.scale.width>=700&&scene.scale.width>scene.scale.height||scene.bounds?.().fullPanorama===true;
}

const configuration=scene=>scene.reader.story.environmentConfig||{rooms:{},fills:{}};
export function preloadLandscape(scene){
 const config=configuration(scene),custom=scene.reader.story.visuals?.rooms||{};
 scene.landscapeRooms=Object.fromEntries(Object.entries(config.rooms).map(([room,spec])=>[room,[spec.group,spec.index]]));
 const customRooms=Object.keys(custom).filter(room=>custom[room].src);
 for(const room of customRooms)scene.landscapeRooms[room]=[room,null];
 const rooms=customRooms.length?Object.keys(scene.landscapeRooms):Object.keys(scene.reader.story.visuals?.rooms||scene.landscapeRooms);
 for(const room of rooms){const {key,url}=panoramaAsset(scene,room);if(!scene.textures.exists(key))scene.load.image(key,url);}
 if(config.portraitFill)for(const group of new Set(rooms.filter(room=>!custom[room]?.nativeBounds&&!config.rooms[room]?.nativeBounds).map(room=>scene.landscapeRooms[room]?.[0]).filter(group=>config.fills[group])))scene.load.image('wide-'+group,config.fills[group]);
}
function panoramaAsset(scene,room){const custom=scene.reader.story.visuals?.rooms?.[room];if(custom?.src)return{key:'panorama-'+room,url:custom.src};const spec=configuration(scene).rooms[room];if(!spec?.url)throw Error('Missing panorama art for '+room);return{key:spec.key,url:spec.url};}
function continuousPanel(scene,room,height){
 const {key}=panoramaAsset(scene,room),image=scene.textures.get(key).getSourceImage();
 // Chapter 2 retains its approved panorama proportions. The other panoramas
 // were authored at three native widths and the original full ground height.
 const fullDepth=scene.reader.story.visuals?.rooms?.[room]?.fullDepth||configuration(scene).rooms[room]?.fullDepth;
 return{key,height:fullDepth?4608*image.height/image.width:height,x:configuration(scene).rooms[room]?.centerX??768};
}

export function fitEnvironment(scene,sprite,room,original,height,wing=null){
 // Never layer a sharper native center over lower-resolution side pieces.
 const wide=landscapeView(scene);
 if(wing===null){
  sprite.environment={room,original,height,wide,continuous:wide};
  if(wide){const panel=continuousPanel(scene,room,height);sprite.setTexture(panel.key).setPosition(panel.x,0).setDisplaySize(4608,panel.height);}
  else sprite.setTexture(original).setPosition(768,0).setDisplaySize(1536,height);
  return;
 }
 if(wide||!configuration(scene).portraitFill||configuration(scene).rooms[room]?.nativeBounds||scene.reader.story.visuals?.rooms?.[room]?.nativeBounds){sprite.setVisible(false);return;}
 const [group,index]=scene.landscapeRooms[room],key='wide-'+group,texture=scene.textures.get(key),atlas=texture.getSourceImage(),frame=`wing-${index}-${wing}`,seam=48;
 if(!texture.has(frame)){
  const panelX=index===null?0:index%2*atlas.width/2,panelY=index===null?0:Math.floor(index/2)*atlas.height/2,panelW=index===null?atlas.width:atlas.width/2,panelH=index===null?atlas.height:atlas.height/2,overlap=panelW*seam/4608;
  const x=Math.round(panelX+(wing===0?0:panelW*2/3-overlap)),right=Math.round(panelX+(wing===0?panelW/3+overlap:panelW));
  texture.add(frame,0,x,Math.round(panelY),right-x,Math.round(panelY+panelH)-Math.round(panelY));
 }
 sprite.setVisible(true).setTexture(key,frame).setDisplaySize(1536+seam,height).setPosition(wing===0?-768+seam/2:2304-seam/2,0).setFlipX(false).setDepth(sprite.depth>.5?.9:-.1);
}

export function refreshEnvironmentEdges(scene){
 const wide=landscapeView(scene);
 if(wide)for(const sprite of [...scene.sides,...scene.previousSides])sprite.setVisible(false);
 for(const [sprite,sides] of [[scene.background,scene.sides],[scene.previousBackground,scene.previousSides]]){
  const info=sprite.environment;
  if(info&&info.wide!==wide){
   fitEnvironment(scene,sprite,info.room,info.original,info.height);
   sides.forEach((side,i)=>fitEnvironment(scene,side,info.room,info.original,info.height,i));
  }
 }
 const floorPrefix=configuration(scene).floorPrefix;
 if(floorPrefix)for(const [floor,background]of [[scene.floor,scene.background],[scene.previousFloor,scene.previousBackground]]){
  const info=background.environment;if(!floor||!info)continue;
  let key=floorPrefix+'-floor-'+info.room;
  if(info.continuous){
   key=panoramaAsset(scene,info.room).key+'-floor';
   if(!scene.textures.exists(key)){
    const source=background.texture.getSourceImage(),strip=Math.max(1,Math.round(32/background.displayHeight*source.height)),tex=scene.textures.createCanvas(key,4608,32);
    tex.context.imageSmoothingEnabled=false;tex.context.drawImage(source,0,source.height-strip,source.width,strip,0,0,4608,32);tex.refresh();
   }
  }
  if(floor.displayTexture.key!==key)floor.setTexture(key);
  floor.setPosition(768,background.displayHeight-2);
 }
}

