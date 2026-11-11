export const aspectStorageKey = 'pixelnook:aspect-ratio';
const formats = new Map([['portrait', [450, 800]], ['landscape', [1280, 720]]]);

// Camera and UI use one logical format and one uniform display scale.
export function aspectFrame(mode, availableWidth, availableHeight) {
 const dimensions = formats.get(mode);
 if (!dimensions) return null;
 const [width, height] = dimensions;
 const scale = Math.min(availableWidth / width, availableHeight / height);
 return {width, height, scale, displayWidth: width * scale, displayHeight: height * scale};
}

export function installAspectRatioLock({player, storage, onChange}) {
 const row = document.createElement('label');
 row.className = 'aspect-ratio-setting'; row.htmlFor = 'aspect-ratio'; row.append('Screen format');
 const select = document.createElement('select'); select.id = 'aspect-ratio';
 for (const [value, label] of [['auto', 'Auto (Default)'], ['portrait', 'Vertical (9:16)'], ['landscape', 'Horizontal (16:9)']]) {
  const option = document.createElement('option'); option.value = value; option.textContent = label; select.append(option);
 }
 row.append(select); document.querySelector('#settings-modal .modal-head').after(row);
 // Keep the existing fixed positions in Auto; share the player in locked mode.
 player.append(document.querySelector('.library-return'), document.querySelector('#progress'));
 let mode = 'auto';
 try {const saved = storage.getItem(aspectStorageKey); if (saved === 'auto' || formats.has(saved)) mode = saved;} catch {}
 function resize() {
  const frame = aspectFrame(mode, innerWidth, innerHeight);
  document.body.classList.toggle('aspect-locked', !!frame); document.body.dataset.aspectRatio = mode; select.value = mode;
  if (frame) {
   const properties = {'--aspect-width': frame.width + 'px', '--aspect-height': frame.height + 'px', '--aspect-scale': frame.scale,
    '--aspect-display-width': frame.displayWidth + 'px', '--aspect-display-height': frame.displayHeight + 'px'};
   for (const [name, value] of Object.entries(properties)) document.body.style.setProperty(name, String(value));
  }
  return frame;
 }
 function setMode(value, notify = true) {
  mode = value === 'auto' || formats.has(value) ? value : 'auto';
  try {storage.setItem(aspectStorageKey, mode);} catch {}
  resize(); if (notify) onChange();
 }
 select.addEventListener('change', () => setMode(select.value)); resize();
 return {resize, setMode, get mode() {return mode;}};
}
