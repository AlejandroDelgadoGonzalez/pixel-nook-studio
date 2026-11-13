"""Consolidate a local Gates 1/2A review into one offline HTML and a root copy."""
import argparse
import base64
import hashlib
import html
from html.parser import HTMLParser
import json
import mimetypes
from pathlib import Path
import re
import shutil
import tempfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SIZES = {(360,800),(390,844),(430,932),(1366,640),(1280,720),(1080,1920)}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def require(condition, message):
    if not condition:
        raise ValueError(message)

def inside(base, name):
    p = (base / name).resolve()
    require(p.is_relative_to(base.resolve()) and p.is_file(), f"Missing or escaping file: {name}")
    require(not (base / name).is_symlink(), f"Symlink not allowed: {name}")
    return p

class Dependencies(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        for key, val in attrs:
            if val and (key in ('src','poster') or key == 'href' and tag == 'link'):
                self.refs.append(val)
            if key == 'srcset':
                require(False, 'Embed srcset images directly or use local src files')

def json_block(value, element_id):
    return '<pre id="'+element_id+'">'+html.escape(json.dumps(value,indent=2,ensure_ascii=False))+'</pre>'

def data_uri(path):
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')

def local_dependency(base, relative, source):
    parsed=urlsplit(relative)
    require(not parsed.scheme and not parsed.netloc and not relative.startswith(('/', '\\')), 'External dependency: '+relative)
    target=(base/unquote(parsed.path)).resolve()
    require(target.is_relative_to(source) and target.is_file(), 'Missing/escaping dependency: '+relative)
    return target

def inline_css(text, base, source):
    require(not re.search(r'@import\b',text,re.I),'Inline CSS @import before packaging')
    def replace(match):
        ref=match.group(1)
        if ref.startswith(('data:','#')):return match.group(0)
        return 'url("'+data_uri(local_dependency(base,ref,source))+'")'
    return re.sub(r'url\(\s*[\'"]?([^\)\'"\s]+)[\'"]?\s*\)',replace,text)

class InlineBoard(HTMLParser):
    """Embed local images/styles/scripts without changing inline board JavaScript."""
    def __init__(self, path, source):
        super().__init__(convert_charrefs=False)
        self.base=path.parent;self.source=source;self.parts=[];self.in_style=False
    def handle_starttag(self,tag,attrs):
        require(tag!='base','Board must not override its base URL')
        values=dict(attrs)
        if tag=='link' and values.get('rel')=='stylesheet':
            p=local_dependency(self.base,values['href'],self.source)
            self.parts.append('<style>'+inline_css(p.read_text(encoding='utf-8-sig'),p.parent,self.source)+'</style>');return
        new=[]
        for key,val in attrs:
            require(key!='srcset','Use embedded src images instead of srcset')
            if val and (key in ('src','poster') or key=='href' and tag=='link') and not val.startswith(('data:','#')):
                p=local_dependency(self.base,val,self.source)
                if tag=='script' and key=='src':
                    self.parts.append('<script>'+p.read_text(encoding='utf-8-sig').replace('</script','<\\/script'));return
                if tag=='iframe':
                    key='srcdoc';val=inline_board(p,self.source)
                else:val=data_uri(p)
            if key=='style' and val:val=inline_css(val,self.base,self.source)
            new.append(key if val is None else key+'="'+html.escape(val,quote=True)+'"')
        self.parts.append('<'+tag+(' '+' '.join(new) if new else '')+'>')
        if tag=='style':self.in_style=True
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
    def handle_endtag(self,tag):
        if tag=='style':self.in_style=False
        self.parts.append('</'+tag+'>')
    def handle_data(self,data):self.parts.append(inline_css(data,self.base,self.source) if self.in_style else data)
    def handle_entityref(self,name):self.parts.append('&'+name+';')
    def handle_charref(self,name):self.parts.append('&#'+name+';')
    def handle_decl(self,decl):self.parts.append('<!'+decl+'>')
    def handle_comment(self,data):self.parts.append('<!--'+data+'-->')

def inline_board(path,source):
    parser=InlineBoard(path,source);parser.feed(path.read_text(encoding='utf-8-sig'))
    return ''.join(parser.parts)

def inline_markdown(text):
    # No CDN, raw HTML execution or external Markdown dependency.
    text=html.escape(text)
    text=re.sub(r'`([^`]+)`',r'<code>\1</code>',text)
    text=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',text)
    return text

def markdown(text):
    lines=text.splitlines();out=[];i=0
    while i<len(lines):
        line=lines[i]
        if not line.strip():i+=1;continue
        if line.startswith('```'):
            block=[];i+=1
            while i<len(lines) and not lines[i].startswith('```'):block.append(lines[i]);i+=1
            out.append('<pre>'+html.escape('\n'.join(block))+'</pre>');i+=1;continue
        heading=re.match(r'^(#{1,6})\s+(.+)',line)
        if heading:
            level=min(6,len(heading[1])+2);out.append(f'<h{level}>'+inline_markdown(heading[2])+f'</h{level}>');i+=1;continue
        if line.lstrip().startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].lstrip().startswith('|'):
                cells=lines[i].strip().strip('|').split('|');i+=1
                if all(re.fullmatch(r'\s*:?-+:?\s*',c) for c in cells):continue
                tag='th' if not rows else 'td'
                rows.append('<tr>'+''.join('<'+tag+'>'+inline_markdown(c.strip())+'</'+tag+'>' for c in cells)+'</tr>')
            out.append('<div class="table-scroll"><table>'+''.join(rows)+'</table></div>');continue
        if re.match(r'^\s*[-*]\s',line):
            items=[]
            while i<len(lines) and re.match(r'^\s*[-*]\s',lines[i]):
                items.append('<li>'+inline_markdown(re.sub(r'^\s*[-*]\s+','',lines[i]))+'</li>');i+=1
            out.append('<ul>'+''.join(items)+'</ul>');continue
        paragraph=[]
        while i<len(lines) and lines[i].strip() and not lines[i].startswith(('#','|','```')):
            paragraph.append(lines[i]);i+=1
        out.append('<p>'+inline_markdown('\n'.join(paragraph))+'</p>')
    return '\n'.join(out)

def value_table(values):
    return '<div class="table-scroll"><table><thead><tr><th>Dato</th><th>Valor medido / propuesto</th></tr></thead><tbody>'+''.join('<tr><td>'+html.escape(str(k))+'</td><td><code>'+html.escape(json.dumps(v,ensure_ascii=False))+'</code></td></tr>' for k,v in values.items())+'</tbody></table></div>'

def visual_payload(source,board):
    explicit=source/'REVIEW-VISUALS.json'
    if explicit.exists():return json.loads(explicit.read_text(encoding='utf-8-sig'))
    # Compatibility with existing self-contained measured boards. Decode JSON only;
    # never evaluate JavaScript or regenerate authored pixels.
    match=re.search(r'\bconst\s+D\s*=\s*',board)
    require(match,'Provide REVIEW-VISUALS.json with base64 atlasCrops for a board without embedded D data')
    data,_=json.JSONDecoder().raw_decode(board[match.end():])
    crops=[{'label':name,'dataUri':p['uri'],'width':p['size'][0],'height':p['size'][1]} for name,p in data['poses'].items()]
    crops += [{'label':'Mushroom fragment '+str(i+1),'dataUri':p['uri'],'width':p['size'][0],'height':p['size'][1]} for i,p in enumerate(data.get('fragments',[]))]
    return {'atlasCrops':crops}

def consolidated(scene,source,c,names):
    proposal=(source/'PROPUESTA.md').read_text(encoding='utf-8-sig')
    geo=json.loads(inside(source,'GEOMETRIA-PROPUESTA.json').read_text(encoding='utf-8-sig'))
    board=inline_board(source/'MEASURED-ART-BOARD.html',source)
    visuals=visual_payload(source,board);crops=visuals['atlasCrops'];require(crops,'Atlas crop gallery required')
    gallery=[]
    for p in crops:
        require(p['dataUri'].startswith('data:image/') and ';base64,' in p['dataUri'],'Gallery images must be embedded base64')
        require(p['width']>0 and p['height']>0,'Invalid crop dimensions')
        gallery.append('<figure><figcaption>'+html.escape(p['label'])+' · 400% nativo</figcaption><div class="crop-scroll"><img loading="lazy" alt="'+html.escape(p['label'],quote=True)+'" src="'+html.escape(p['dataUri'],quote=True)+'" width="'+str(p['width']*4)+'" height="'+str(p['height']*4)+'"></div></figure>')
    compositions=visuals.get('compositions',[])
    require({(p['width'],p['height']) for p in compositions}==SIZES,'Six base64 viewport composition plates required in REVIEW-VISUALS.json')
    routes=visuals.get('masksRoutes',[])
    require(routes,'Base64 mask/route plate required in REVIEW-VISUALS.json (annotate absence of occluders when applicable)')
    plates=[]
    for p in compositions+routes:
        require(p['dataUri'].startswith('data:image/') and ';base64,' in p['dataUri'],'Composition/route plates must be embedded base64')
        plates.append('<figure class="composition"><figcaption>'+html.escape(p['label'])+'</figcaption><img loading="lazy" alt="'+html.escape(p['label'],quote=True)+'" src="'+html.escape(p['dataUri'],quote=True)+'" style="display:block;max-width:100%;max-height:760px;width:auto;height:auto;image-rendering:pixelated"></figure>')
    density=[]
    for name in sorted(names):
        if 'density' in name.lower() and name.endswith('.json'):
            report=json.loads(inside(source,name).read_text(encoding='utf-8-sig'))
            if 'passed' in report:
                require(report['passed'] is True,'Pixel density report failed: '+name)
                density.append({'report':name,'result':'PASS','assets':len(report.get('assets',[])),'sha256':sha(source/name)})
    require(density,'Executed pixel_density.py PASS report required')
    viewport_rows=''.join('<tr>'+''.join('<td>'+html.escape(str(x))+'</td>' for x in [str(v['width'])+'×'+str(v['height']),v.get('zoom','See measured board'),v.get('center','See measured board'),v.get('minimumCaptionGapPx','See measured board'),'PASS'])+'</tr>' for v in c['viewports'])
    viewport_table='<div class="table-scroll"><table><thead><tr><th>Viewport</th><th>Zoom fijo</th><th>Centro X/Y</th><th>Margen diálogo px</th><th>Resultado</th></tr></thead><tbody>'+viewport_rows+'</tbody></table></div>'
    new_atlases=sum(bool(a.get('newOrModified')) for a in c.get('atlases',[]))
    reuse='Se reutilizaron al 100% los atlas existentes.' if not new_atlases else str(new_atlases)+' atlas nuevos o modificados en esta propuesta.'
    asset_downloads=''.join('<a class="button" download="'+html.escape(a['packagePath'],quote=True)+'" href="'+data_uri(inside(source,a['packagePath']))+'">'+html.escape(a['packagePath'])+'</a> ' for a in c.get('atlases',[]))
    manifest={'scene':scene,'scope':c['scope'],'files':[{'path':n,'sha256':sha(inside(source,n))} for n in sorted(names)]}
    css='''*{box-sizing:border-box}body{margin:0;background:#101c2a;color:#f4edde;font:16px/1.65 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:28px 22px}h1{font:38px/1.2 Georgia,serif}h2{font:28px/1.3 Georgia,serif;color:#d1c1ed;margin-top:48px}h3,h4{color:#b5e3d5}.notice{padding:18px;border-left:4px solid #9de6b0;background:#213448}a{color:#b6e6ff}nav{display:flex;flex-wrap:wrap;gap:16px;margin:24px 0}section{scroll-margin-top:24px}.table-scroll,.crop-scroll{overflow:auto;max-width:100%}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:10px;border-bottom:1px solid #435366;text-align:left;vertical-align:top}td{min-width:110px}pre{background:#09131e;border:1px solid #435366;padding:18px;overflow:auto;max-height:560px;white-space:pre;font:13px/1.6 Consolas,monospace}code{overflow-wrap:anywhere}p,li{overflow-wrap:anywhere}figure{margin:24px 0;border:1px solid #435366;padding:16px;border-radius:10px}figcaption{margin-bottom:12px;color:#d8e8bf}.crop-scroll{height:440px;background:repeating-conic-gradient(#293846 0% 25%,#192632 0% 50%) 0/24px 24px}.crop-scroll img{max-width:none;image-rendering:pixelated;display:block}iframe{display:block;width:100%;height:1500px;border:1px solid #435366;border-radius:12px;background:#101c2c}.button{display:inline-block;padding:9px;border:1px solid #7d9db2;border-radius:5px;margin:4px}summary{cursor:pointer;color:#b6e6ff;padding:10px}@media(max-width:700px){main{padding:20px 12px}h1{font-size:29px}h2{font-size:24px}.crop-scroll{height:340px}iframe{height:1700px}td,th{padding:8px}}'''
    return ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Review Board '+scene+' · '+html.escape(c.get('title',''))+'</title><style>'+css+'</style></head><body><main>'
        '<h1>'+scene+' · '+html.escape(c.get('title',''))+'</h1><p class="notice"><strong>PASS técnico estático · Compuertas 1 y 2A.</strong> Aprobación de Alejandro pendiente. No es una escena implementada ni un certificado de Compuertas 3/4. '+reuse+' El empaquetador no genera ningún archivo PNG: recortes y gráficos están incrustados.</p>'
        '<nav><a href="#gate1">1 · Guion y tabla causal</a><a href="#gate2">2 · Geometría y certificado</a><a href="#visual">3 · Visor visual</a><a href="#atlas">Atlas al 400%</a></nav>'
        '<section id="gate1"><h2>Sección 1 · Compuerta 1 — Guion y Tabla Causal</h2>'+markdown(proposal)+'<details><summary>PROPUESTA.md íntegro, texto original</summary><pre id="proposal-original">'+html.escape(proposal)+'</pre></details></section>'
        '<section id="gate2"><h2>Sección 2 · Compuerta 2A — Geometría, Activos y Certificación</h2><h3>Continuidad / spawns</h3>'+value_table(geo.get('spawns',{}))+'<h3>Coordenadas y anclas</h3>'+value_table(geo.get('anchors',{}))+'<h3>Foco, zoom y paneos</h3>'+value_table(geo.get('camera',{}))+'<h3>Recorridos y superficies</h3>'+value_table({p.get('name',str(i)):p for i,p in enumerate(geo.get('walkPaths',[]))})+'<p>'+html.escape(geo.get('surface','See source geometry'))+'</p><h3>Oclusores / máscaras</h3>'+(json_block(geo['occluders'],'occluders') if geo.get('occluders') else '<p>No hay oclusores nuevos en esta propuesta. El Caterpillar y el narguile conservan su estado oculto heredado.</p>')+'<h3>Escala y propiedad de objetos</h3>'+value_table(geo.get('alice',{}))+value_table(geo.get('propOwnership',{}))+'<h3>Seis viewports oficiales</h3>'+viewport_table+'<h3>qa/pixel_density.py — PASS</h3>'+json_block(density,'density-results')+'<h3>CERTIFICACION.json completo</h3>'+json_block(c,'certificate')+'<details><summary>Geometría íntegra</summary>'+json_block(geo,'full-geometry')+'</details></section>'
        '<section id="visual"><h2>Sección 3 · Visor visual interactivo — composiciones, máscaras y recorridos</h2><p>Todo está incrustado en este archivo. Selecciona viewport, beat, fase y formato dentro del visor. Sus placas son estáticas; los recorridos y la reserva invisible del diálogo se muestran como guías de revisión.</p><iframe id="measured-board" title="Measured Art Board interactivo" sandbox="allow-scripts allow-downloads" srcdoc="'+html.escape(board,quote=True)+'"></iframe><h3>Composiciones de los seis viewports y mapa de recorridos · imágenes base64</h3>'+''.join(plates)+'</section>'
        '<section id="atlas"><h2>Recortes de atlas al 400%</h2><p>Ampliación exacta de cuatro píxeles por píxel nativo, sin suavizado. Desplázate dentro de cada recorte para inspeccionar contorno, manos y pies. No se han generado PNG independientes.</p>'+''.join(gallery)+'<h3>Atlas completos incrustados</h3>'+asset_downloads+'</section><details><summary>Fuentes y hashes de esta entrega</summary>'+json_block(manifest,'source-manifest')+'</details></main></body></html>')

def package(scene, source, replace=False):
    require(re.fullmatch(r'C[1-9]\d*-S[1-9]\d*',scene), 'Use scene ID C3-S3')
    source = source.resolve(); artifacts = ROOT / '.artifacts'
    require(source.is_relative_to(artifacts.resolve()), 'Review source must be inside .artifacts')
    required = ['PROPUESTA.md','MEASURED-ART-BOARD.html','CERTIFICACION.json']
    for name in required: inside(source,name)
    c = json.loads((source/'CERTIFICACION.json').read_text(encoding='utf-8-sig'))
    require(c['scene']==scene and c['verdict']=='PASS', 'Scene mismatch or certificate not PASS')
    require(c['creativeApproval']=='PENDING Alejandro' and c['gate3Started'] is False and c['newAudioFiles']==0, 'Proposal-only scope required')
    require(60<=c['durationSeconds']<=80, 'Planned duration must be 60–80 seconds')
    total=0; silent=0
    for beat in c['beats']:
        duration=beat['durationSeconds']; require(duration>0,'Invalid beat duration'); total+=duration
        if not beat.get('text'):
            silent+=duration
            require(beat.get('visiblePhysicalAction') and duration<=8 and silent<=8,'Static or excessive silent sequence')
        else: silent=0
    require(abs(total-c['durationSeconds'])<.001,'Beat timing sum mismatch')
    require({(v['width'],v['height']) for v in c['viewports']}==SIZES and all(v['passed'] for v in c['viewports']), 'Six official measured PASS viewports required')
    require(c.get('productionBaseline'),'Production snapshot required')
    require(c.get('technicalChecks') and all(v is True for v in c['technicalChecks'].values()), 'Executed technical checks must all PASS')
    for entry in c['productionBaseline']:
        require(sha(inside(ROOT,entry['path']))==entry['sha256'], 'Production changed: '+entry['path'])
    names=set(required+c.get('packageFiles',[]))
    for atlas in c.get('atlases',[]):
        if atlas.get('newOrModified'):
            names.update([atlas['packagePath'],atlas['contractPath']])
            require(sha(inside(source,atlas['packagePath']))==atlas['sha256'],'Atlas hash mismatch')
    # Validate transitive HTML/CSS dependencies; navigation hyperlinks may be citations.
    pending=list(names); seen=set()
    while pending:
        name=pending.pop(); p=inside(source,name)
        if name in seen: continue
        seen.add(name)
        if p.suffix.lower() not in ('.html','.css'): continue
        body=p.read_text(encoding='utf-8-sig'); refs=[]
        if p.suffix.lower()=='.html':
            parser=Dependencies(); parser.feed(body); refs+=parser.refs
        refs+=re.findall(r'url\(\s*[\'"]?([^\)\'"\s]+)',body)
        for ref in refs:
            if ref.startswith(('data:','#')): continue
            parsed=urlsplit(ref)
            require(not parsed.scheme and not parsed.netloc and not ref.startswith(('/', '\\')), 'External dependency: '+ref)
            dep=(p.parent/unquote(parsed.path)).resolve()
            require(dep.is_relative_to(source) and dep.is_file(),'Missing/escaping dependency: '+ref)
            relative=dep.relative_to(source).as_posix(); names.add(relative); pending.append(relative)
    names.add('GEOMETRIA-PROPUESTA.json')
    if (source/'REVIEW-VISUALS.json').exists():names.add('REVIEW-VISUALS.json')
    for atlas in c.get('atlases',[]):
        names.add(atlas['packagePath'])
        require(sha(inside(source,atlas['packagePath']))==atlas['sha256'],'Atlas hash mismatch')
    output=artifacts/f'REVIEW-BOARD-{scene}.html';root_copy=ROOT/output.name
    require(replace or not output.exists() and not root_copy.exists(), 'HTML exists; use --replace to intentionally regenerate')
    document=consolidated(scene,source,c,names)
    with tempfile.NamedTemporaryFile(dir=artifacts,suffix='.html',delete=False) as temp: temp_path=Path(temp.name)
    try:
        temp_path.write_text(document,encoding='utf-8')
        temp_path.replace(output)
        shutil.copyfile(output,root_copy)
        require(sha(output)==sha(root_copy),'Root HTML copy differs')
    finally:
        temp_path.unlink(missing_ok=True)
    return {'path':str(output),'rootCopy':str(root_copy),'sha256':sha(output),'sourceFiles':len(names),'newPngFilesGenerated':0,'newOrModifiedAtlases':sum(bool(a.get('newOrModified')) for a in c.get('atlases',[])),'passed':True}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scene',required=True); parser.add_argument('--source',required=True,type=Path); parser.add_argument('--replace',action='store_true')
    args=parser.parse_args()
    try: print(json.dumps(package(args.scene,args.source,args.replace),indent=2))
    except (ValueError,KeyError,TypeError,json.JSONDecodeError) as error: parser.exit(1,f'Review not packaged: {error}\n')
