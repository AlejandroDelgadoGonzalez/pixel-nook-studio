import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import http from 'node:http';
import path from 'node:path';

// The harness is outside the deployed app. This temporary localhost server
// exposes it only for this regression; managed previews use the same harness.
const root=path.resolve(import.meta.dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.mp3':'audio/mpeg'};
let server;
let url=process.env.QA_CROSSFADE_URL;
if(!url){
 server=http.createServer(async(req,res)=>{
  try{let name=new URL(req.url,'http://localhost').pathname;if(name==='/reader.html')name='/app/reader.html';
   if(!/^\/(app|platform|stories|vendor|qa)\//.test(name))throw Error('Not found');
   const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))throw Error('Not found');
   const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 url=`http://127.0.0.1:${server.address().port}/qa/alice-c2-s6-crossfade.html`;
}
let browser;
const out='.artifacts/qa/alice-c2-s6-crossfade';await fs.mkdir(out,{recursive:true});
try{
 browser=await chromium.launch(process.env.QA_BROWSER_EXECUTABLE?{executablePath:process.env.QA_BROWSER_EXECUTABLE}:{channel:process.env.QA_BROWSER_CHANNEL||'chromium'});
 const page=await browser.newPage({viewport:{width:430,height:1000}});
 await page.goto(url);
 await page.locator('#run').click();
 await page.locator('#result[data-status]').waitFor({timeout:360000});
 const report=JSON.parse(await page.locator('#result').textContent());
 await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
 await page.screenshot({path:out+'/completion.png',fullPage:true});
 assert.equal(report.passed,true,JSON.stringify(report.errors));
 assert.deepEqual(report.passes.map(p=>p.changes.length),[4,4,4]);
 console.log('PASS 12/12 crossfades: continuous, replay, manual replay');
}finally{await browser?.close();server?.close();}
