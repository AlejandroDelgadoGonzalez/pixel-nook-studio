// Actual browser viewports. Portrait reading controls and MP4 are separate feature checks.
export const officialLayouts=[{name:'phone-360',width:360,height:800},{name:'phone-390',width:390,height:844},{name:'phone-430',width:430,height:932},{name:'desktop',width:1366,height:640},{name:'desktop-720',width:1280,height:720},{name:'portrait',width:1080,height:1920}];
export const officialSizes=officialLayouts.map(({width,height})=>[width,height]);
