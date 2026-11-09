import {storage} from '../storage/storage.js';
import {savedSlugs,canonicalSlug} from '../storage/compatibility.js';
const $ = selector => document.querySelector(selector);
const view = $('#view');
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  saved: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--paper)"/><circle cx="16" cy="17" r="3" fill="var(--paper)"/>',
  book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
  play: '<path d="m9 5 10 7-10 7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  device: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
const escape = text => String(text??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(key, fallback) { try { const value = storage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } }
function write(key, value) { try { storage.setItem(key, JSON.stringify(value)); return true; } catch { toast('Your browser could not save this change.'); return false; } }
let stories = [], query = '', filter = 'All stories', toastTimer;
const stored = read('betweenlines:saved', []);
let saved = new Set(savedSlugs(Array.isArray(stored) ? stored.filter(x => typeof x === 'string') : []));
const routes = [['home','Home'],['search','Search'],['saved','Saved'],['settings','Settings']];
if(location.hash==='#story/el-primer-camino')history.replaceState(null,'','#story/the-first-path');
const normalizedHash=()=>location.hash.replace(/^#\//,'#');
const route = () => normalizedHash().startsWith('#story/') ? 'story' : routes.some(([name]) => name === location.hash.slice(1)) ? location.hash.slice(1) : 'home';
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2500); }
function progress(story) {
  const point = read('entrelineas:' + story.id, null);
  const n = story.lines.findIndex(line => line.id === point?.line);
  return n < 0 ? null : {number: n + 1, total: story.lines.length, percent: Math.round(n / story.lines.length * 100), chapterId:story.lines[n].chapterId};
}
const entryUrl = story => story.serialized ? `#story/${encodeURIComponent(story.slug)}` : readerUrl(story,!!progress(story));
const readerUrl = (story, resume = false) => `reader.html?story=${encodeURIComponent(story.slug)}${resume ? '&resume=1' : '&start=1'}`;
function saveButton(story, compact = false) {
  const on = saved.has(story.slug);
  return `<button class="${compact ? 'compact-save' : 'save-button'}" data-save="${escape(story.slug)}" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Save'} ${escape(story.title)}${on ? ' from saved stories' : ''}">${icon('saved')}</button>`;
}
function heading(title, eyebrow, description = '', count = '') {
  return `<header class="page-heading"><span class="eyebrow">${eyebrow}</span><div class="heading-row"><h1 tabindex="-1">${title}</h1>${count ? `<span class="library-count">${count}</span>` : ''}</div>${description ? `<p>${description}</p>` : ''}</header>`;
}
function feature(story) {
  const point = progress(story), completed = read('betweenlines:finished:' + story.id, false);
  return `<article class="feature"><div class="cover"><a href="${entryUrl(story)}" aria-label="Read ${escape(story.title)}"><img src="${escape(story.cover)}" alt="${escape(story.coverAlt)}"></a>${saveButton(story)}<span class="cover-label">${completed && !point ? 'READ · AVAILABLE TO REVISIT' : escape(story.label || 'AN ORIGINAL STORY')}</span></div><div class="feature-copy"><span class="eyebrow">FEATURED STORY</span><h2 class="story-title">${escape(story.title)}</h2><div class="story-meta"><span>${escape(story.category)}</span><span class="meta-dot"></span>${icon('clock')}<span>${escape(story.duration)} read</span></div><p class="synopsis">${escape(story.synopsis)}</p><div class="themes">${story.themes.map(theme => `<span class="theme">${escape(theme)}</span>`).join('')}</div><a class="primary" href="${point?readerUrl(story,true):entryUrl(story)}">${icon('book')}${point ? 'Continue reading' : completed ? 'Read again' : 'Read story'}</a>${point ? `<a class="start-over" href="${readerUrl(story)}">Start from beginning</a>` : ''}</div></article>`;
}
function seriesDetails(story){
 const point=progress(story),available=story.chapters.filter(ch=>ch.status==='available');
 const finished=ch=>read('betweenlines:chapter-finished:'+story.id+':'+ch.id,false);
 const chapterUrl=(ch,resume=false)=>readerUrl(story,resume)+'&chapter='+encodeURIComponent(ch.id);
 const next=available.find(ch=>!finished(ch))||available[0];
 const cards=story.chapters.map(ch=>{
  const live=ch.status==='available',resume=point?.chapterId===ch.id;
  return `<article class="chapter-card ${live?'available':'upcoming'}"><span class="chapter-number">${String(ch.number).padStart(2,'0')}</span><div><h3>${escape(ch.title)}</h3><p>${escape(ch.description)}</p><span class="chapter-status">${live?(finished(ch)?'READ · ':'')+ch.scenes.length+' scenes · '+escape(ch.duration||story.duration):'In preparation'}</span>${live?`<details class="chapter-scenes"><summary>Explore the scenes</summary><ol>${ch.scenes.map((name,i)=>`<li><a href="${chapterUrl(ch)}&scene=${i}"><span>${i+1}.</span> ${escape(name)}</a></li>`).join('')}</ol></details>${resume?`<a class="start-over" href="${chapterUrl(ch)}">Start chapter from beginning</a>`:''}`:''}</div>${live?`<a class="chapter-open" href="${chapterUrl(ch,resume)}" aria-label="${resume?'Continue':'Read'} chapter ${ch.number}">${resume?'Continue':'Read'} →</a>`:'<span class="chapter-soon">Soon</span>'}</article>`;
 }).join('');
 return `<a class="series-back" href="#home">← Library</a><section class="series-hero"><img src="${escape(story.cover)}" alt="${escape(story.coverAlt)}"><div class="series-copy"><span class="eyebrow">${escape(story.label||'AN ADAPTED CLASSIC')}</span><h1>${escape(story.title)}</h1><p class="series-subtitle">${escape(story.subtitle)}</p><p class="synopsis">${escape(story.synopsis)}</p><div class="story-meta">${story.chapters.length} chapters planned · ${available.length} available</div><a class="primary" href="${point?readerUrl(story,true):chapterUrl(next)}">${icon('book')}${point?'Continue reading':next.number>1?'Start chapter '+next.number:'Start reading'}</a>${point||next.number>1?`<a class="start-over" href="${readerUrl(story)}">Start from beginning</a>`:''}</div></section><section class="chapter-list"><h2>Chapters</h2><p class="chapter-note">Read continuously, or enjoy one short scene at a time. More chapters are in preparation.</p>${cards}<p class="adaptation-note">${escape(story.attribution)}. Abridged and rewritten for Pixel Nook. The complete adaptation is being developed chapter by chapter.</p></section>`;
}
function continuation(story) {
  const p = progress(story);
  return `<div class="continue-item"><a class="continue-card" href="${readerUrl(story, true)}" aria-label="Continue reading ${escape(story.title)}, passage ${p.number} of ${p.total}"><img src="${escape(story.cover)}" alt=""><div class="continue-content"><span class="eyebrow">CONTINUE READING</span><h2>${escape(story.title)}</h2><p>Passage ${p.number} of ${p.total}</p><div class="continue-progress" aria-hidden="true"><span style="width:${p.percent}%"></span></div></div><span class="continue-play">${icon('play')}</span></a><a class="start-over" href="${readerUrl(story)}" aria-label="Start ${escape(story.title)} from beginning">Start from beginning</a></div>`;
}
function compact(story) {
  const point = progress(story);
  return `<article class="compact-story"><a class="compact-cover" href="${entryUrl(story)}" aria-label="Read ${escape(story.title)}"><img src="${escape(story.cover)}" alt="${escape(story.coverAlt)}"></a><div class="compact-copy"><h2><a href="${entryUrl(story)}">${escape(story.title)}</a></h2><div class="story-meta">${escape(story.category)}<span class="meta-dot"></span>${escape(story.duration)}</div><p>${escape(story.description)}</p><a class="text-link" href="${point?readerUrl(story,true):entryUrl(story)}">${point ? 'Continue reading' : 'Read story'}</a>${point ? `<a class="start-over compact-start" href="${readerUrl(story)}">Start from beginning</a>` : ''}</div>${saveButton(story, true)}</article>`;
}
function empty(type) {
  return type === 'saved' ? `<div class="empty-state"><div class="empty-icon">${icon('saved')}</div><h2>A place for your next read</h2><p>Save a story that catches your eye.<br>It will be waiting for you here.</p><a class="primary" href="#home">Explore the library</a></div>` : `<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h2>No stories found</h2><p>Try another title or a theme like “journeys”.</p><button class="primary" data-reset-search>Clear search</button></div>`;
}
function renderResults() {
  const term = query.toLowerCase().trim();
  const results = stories.filter(s => (filter === 'All stories' || s.category === filter) && [s.title,s.description,s.synopsis,s.category,...s.themes].join(' ').toLowerCase().includes(term));
  $('#search-results').innerHTML = `<p class="result-label" role="status">${results.length} ${results.length === 1 ? 'story' : 'stories'}${term ? ' found' : ' in the library'}</p>${results.length ? results.map(compact).join('') : empty('search')}`;
  $('#clear-search').hidden = !query;
}
function settings() {
  const sound = !read('entrelineas:muted', false), auto = read('betweenlines:auto', false);
  const value = read('betweenlines:volume', .35), volume = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1,value)) : .35;
  return `${heading('Make yourself comfortable', 'SETTINGS', 'A few small preferences for your reading time.')}<section class="settings-group" aria-labelledby="appearance-label"><h2 id="appearance-label" class="section-label">APPEARANCE</h2><div class="settings-list"><div class="setting-row"><div class="setting-copy"><p id="theme-title" class="setting-title">Dark mode</p><p class="setting-description">A darker palette for quiet evenings.</p></div><button id="theme-toggle" class="switch" role="switch" aria-checked="${document.documentElement.dataset.theme==='dark'}" aria-labelledby="theme-title"></button></div></div></section><section class="settings-group" aria-labelledby="reading-label"><h2 id="reading-label" class="section-label">READING</h2><div class="settings-list"><div class="setting-row"><div class="setting-copy"><p id="sound-title" class="setting-title">Ambient sound</p><p id="sound-description" class="setting-description">Soft water, wind and birds while you read.</p></div><button id="sound-toggle" class="switch" role="switch" aria-checked="${sound}" aria-labelledby="sound-title" aria-describedby="sound-description"></button></div><div class="setting-row volume-row"><label for="library-volume" class="setting-title">Sound volume</label><div class="volume-control"><input id="library-volume" type="range" min="0" max="1" step=".05" value="${volume}" aria-describedby="volume-output"><output id="volume-output" for="library-volume">${Math.round(volume * 100)}%</output></div></div><div class="setting-row"><div class="setting-copy"><p id="auto-title" class="setting-title">Automatic reading</p><p id="auto-description" class="setting-description">Let the story advance at a gentle pace.</p></div><button id="auto-toggle" class="switch" role="switch" aria-checked="${auto}" aria-labelledby="auto-title" aria-describedby="auto-description"></button></div><div class="setting-row"><p class="setting-title">Language</p><span class="setting-value">English</span></div></div></section><aside class="device-note">${icon('device')}<p>Your saved stories, reading progress and preferences stay in this browser. No account needed.</p></aside>`;
}
function render(focus = false) {
  const active = route(),navActive=active==='story'?'home':active;
  for (const nav of document.querySelectorAll('.desktop-nav,.bottom-nav')) nav.innerHTML = routes.map(([name,label]) => `<a class="nav-link" href="#${name}" ${navActive === name ? 'aria-current="page"' : ''}>${icon(name)}<span>${label}</span></a>`).join('');
  document.title = 'Pixel Nook · ' + (active==='story'?'The Odyssey':routes.find(([name]) => name === active)[1]);
  if (active === 'home') view.innerHTML = `${heading('Your next story', 'PIXEL NOOK', '', `${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`)}${stories.filter(s => progress(s)).map(continuation).join('')}${stories[0]?feature(stories[0]):''}${stories.length>1?`<section class="more-stories"><h2>More to step into</h2>${stories.slice(1).map(compact).join('')}</section>`:''}<div class="library-footnote"><span>READ AT YOUR OWN PACE</span><span>English edition</span></div>`;
  if (active === 'saved') { const list = stories.filter(s => saved.has(s.slug)); view.innerHTML = `${heading('Saved for a quiet moment', 'YOUR COLLECTION', '', `${list.length} saved`)}${list.length ? list.map(compact).join('') : empty('saved')}`; }
  if (active === 'search') {
    view.innerHTML = `${heading('Find your next story', 'SEARCH')}<label class="search-field" for="search-input">${icon('search')}<input id="search-input" type="search" placeholder="Search stories or themes" aria-label="Search stories or themes" value="${escape(query)}" autocomplete="off"><button id="clear-search" aria-label="Clear search">${icon('close')}</button></label><div class="filter-row" aria-label="Story categories">${['All stories',...new Set(stories.map(s => s.category))].map(category => `<button class="filter" data-filter="${escape(category)}" aria-pressed="${category === filter}">${escape(category)}</button>`).join('')}</div><div id="search-results"></div>`;
    renderResults();
    $('#search-input').addEventListener('input', e => { query = e.target.value; renderResults(); });
    $('#clear-search').onclick = resetSearch;
  }
  if (active === 'settings') view.innerHTML = settings();
  if (active === 'story') {const selected=stories.find(s=>s.slug===decodeURIComponent(normalizedHash().slice(7)));view.innerHTML=selected?.serialized?seriesDetails(selected):heading('Story unavailable','PIXEL NOOK');}
  if (focus) { scrollTo(0,0); $('h1')?.focus({preventScroll:true}); }
}
function resetSearch() { query = ''; filter = 'All stories'; render(); $('#search-input')?.focus(); }
view.addEventListener('click', e => {
  const save = e.target.closest('[data-save]');
  if (save) {
    const slug = save.dataset.save, next = new Set(saved), on = !next.has(slug);
    on ? next.add(slug) : next.delete(slug);
    if (write('betweenlines:saved',[...next])) { saved = next; render(); toast(on ? 'Story saved for later' : 'Story removed from saved'); const replacement = view.querySelector(`[data-save="${slug}"]`); replacement?.focus({preventScroll:true}); }
  }
  const category = e.target.closest('[data-filter]');
  if (category) { filter = category.dataset.filter; view.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b.dataset.filter === filter)); renderResults(); }
  if (e.target.closest('[data-reset-search]')) resetSearch();
  if(e.target.closest('#theme-toggle')){const dark=document.documentElement.dataset.theme!=='dark';window.PixelNookTheme.set(dark?'dark':'light');e.target.closest('#theme-toggle').setAttribute('aria-checked',String(dark));}
  const toggle = e.target.closest('#sound-toggle,#auto-toggle');
  if (toggle) { const next = toggle.getAttribute('aria-checked') !== 'true'; if (write(toggle.id === 'sound-toggle' ? 'entrelineas:muted' : 'betweenlines:auto', toggle.id === 'sound-toggle' ? !next : next)) toggle.setAttribute('aria-checked',next); }
});
view.addEventListener('input', e => { if(e.target.id === 'library-volume') { $('#volume-output').value = Math.round(Number(e.target.value) * 100) + '%'; write('betweenlines:volume', Number(e.target.value)); } });
window.addEventListener('hashchange', () => render(true));
window.addEventListener('pageshow', () => { if (stories.length) render(); });
window.addEventListener('storage', e => { if (e.key === 'betweenlines:saved') { const value = read(e.key,[]); saved = new Set(savedSlugs(Array.isArray(value) ? value : [])); } if(stories.length) render(); });
try {
  const read=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Library resource unavailable: '+url);return r.json();};
  const catalog=await read('/stories/catalog.json');
  stories=await Promise.all(catalog.stories.map(async item=>{const entry=await read(item.manifest),books=await Promise.all(entry.chapters.filter(c=>c.status==='available').map(c=>read(c.source))),data=books[0];const lines=books.flatMap(book=>book.scenes.flatMap(scene=>scene.steps.filter(s=>s.type==='text').map(s=>({...s,chapterId:scene.chapterId||book.availableChapter}))));return {...entry,chapters:entry.serialized?entry.chapters:[],subtitle:data.subtitle??entry.subtitle??'',attribution:data.attribution??entry.attribution??'',title:typeof data.title==='string'?data.title:data.title.en,description:typeof data.description==='string'?data.description:data.description.en,lines};}));
  render();
} catch (error) { view.innerHTML = `${heading('The library could not open', 'PIXEL NOOK')}<p>Please try again in a moment.</p><button class="primary" id="reload-library" style="margin-top:24px">Try again</button>`; $('#reload-library').onclick = () => location.reload(); console.error(error); }
