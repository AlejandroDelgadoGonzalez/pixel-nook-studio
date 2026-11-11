// DOM rectangles are display pixels; camera fitting uses logical canvas pixels.
// A locked frame can be both translated and uniformly scaled on screen.
export function dialogueTop(scene, fallback) {
 if (scene.game.canvas.closest('.export-render-host')) return fallback;
 const panel = document.querySelector('#dialogue')?.getBoundingClientRect();
 const canvas = scene.game.canvas.getBoundingClientRect();
 return panel && canvas.height > 0 ? (panel.top - canvas.top) * scene.scale.height / canvas.height : fallback;
}
