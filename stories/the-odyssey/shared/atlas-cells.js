// All stories share a two-world-pixel grid; never smooth character textures.
export function ithacaHostCell(source,col,row){
 const xs=[0,1,2,3,4].map(n=>Math.round(n*source.width/4));
 // Menelaus's complete feet extend below the sheet's nominal midpoint.
 // The transparent gutter between him and the elder is at y=476/887.
 const ys=[0,476,887].map(n=>Math.round(n*source.height/887));
 return{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]};
}

export function odysseyCharacterCell(source,col,row){
 const xs=[0,321,641,962,1254].map(n=>Math.round(n*source.width/1254));
 const ys=[0,337,643,970].map(n=>Math.round(n*source.height/1254));
 // Hermes's side-pose feet end at y=956. The adjacent sail's mast begins
 // at y=965, inside the nominal gutter: do not include it in the character.
 const bottom=row===2&&col===1?Math.round(961*source.height/1254):ys[row+1];
 return{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:bottom-ys[row]};
}

