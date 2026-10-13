/* ===== i18n core: identical in every GrandArchives site. Contains NO visible text. =====
 * Paste at the very top of site/js/app.js (inside the same classic <script defer> file).
 *
 * Contract
 *  - Each page declares its language in <html lang="...">; that value is the folder name under site/i18n/.
 *  - UI strings:  site/i18n/<lang>/ui.json   (flat object: "section.key": "text", may contain trusted inline HTML)
 *  - Content:     site/i18n/<lang>/data.js   (ES module, `export default {...}`)
 *  - Languages:   site/i18n/languages.json   ([{ "code": "pt-BR", "name": "Português", "path": "" }, { "code": "en", "name": "English", "path": "en/" }])
 *                 `path` is relative to the site root; "" is the Portuguese root page.
 *  - Markup:      data-i18n="key"              -> element.innerHTML = t(key)
 *                 data-i18n-attr="attr:key;attr2:key2"  -> element.setAttribute(attr, t(key))
 *  - Placeholders: "{name}" in a string is replaced from the vars object passed to t().
 *  - Plurals:     tn("key", n) uses "key.one" / "key.other" (Intl.PluralRules for the page language).
 */
const I18N = (() => {
  const ROOT = new URL('../', document.currentScript.src); // site root (this file lives in site/js/)
  const LANG = document.documentElement.lang;
  let ui = {};

  const t = (key, vars) => {
    const s = ui[key];
    if (s == null) { console.error('[i18n] missing key:', key); return key; }
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '')) : s;
  };
  const tn = (key, n, vars) => t(`${key}.${new Intl.PluralRules(LANG).select(n)}`, { n, ...vars });

  const apply = (scope = document) => {
    scope.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(x => x.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  };

  // Renders a <select> of all languages into `container` (also with a single language);
  // keeps the current hash/search so the equivalent view opens in the other language.
  const languageSwitcher = (languages, container) => {
    if (!container) return;
    const sel = document.createElement('select');
    sel.className = 'langsel';
    sel.setAttribute('aria-label', t('lang.label'));
    languages.forEach(l => {
      const o = document.createElement('option');
      o.value = l.code; o.textContent = l.name; o.selected = l.code === LANG;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => {
      const target = languages.find(l => l.code === sel.value);
      if (target) location.href = new URL(target.path, ROOT).href + location.search + location.hash;
    });
    container.appendChild(sel);
  };

  // Loads ui.json, data.js and languages.json for the page language. Returns { data, languages }.
  const load = async () => {
    const base = new URL(`i18n/${LANG}/`, ROOT);
    const [uiRes, mod, langRes] = await Promise.all([
      fetch(new URL('ui.json', base)),
      import(new URL('data.js', base).href),
      fetch(new URL('i18n/languages.json', ROOT)),
    ]);
    ui = await uiRes.json();
    return { data: mod.default, languages: await langRes.json() };
  };

  return { ROOT, LANG, t, tn, apply, languageSwitcher, load, asset: p => new URL(`assets/${p}`, ROOT).href };
})();
/* ===== end i18n core ===== */

/* ===== Stephen King multiverse guide: page logic. No user-visible text lives here: UI strings come from
 * i18n/<lang>/ui.json (I18N.t / I18N.tn) and content from i18n/<lang>/data.js. ===== */
(async () => {
const { data, languages } = await I18N.load();
const { t, tn } = I18N;

// Body skeleton. Every element with text carries data-i18n / data-i18n-attr, filled by I18N.apply().
document.getElementById("app").innerHTML = `
<div class="wrap">
  <div class="langbar" id="langbar"></div>
  <div class="top">
    <span class="eyebrow" data-i18n="top.eyebrow"></span>
    <h1 data-i18n="top.title"></h1>
    <p class="lede" data-i18n="top.lede"></p>
    <span class="meta" id="meta"></span>
  </div>

  <div id="mapa">
    <section class="mapbox" id="mapbox" data-i18n-attr="aria-label:map.label">
      <div class="selbar" id="selbar" aria-live="polite"></div>
      <div class="canvas" id="canvas"></div>
      <div class="lgd" id="lgd"></div>
    </section>
    <div class="panel" id="panel"></div>
  </div>
  <dialog id="reader" data-i18n-attr="aria-label:reader.label">
    <div class="rbar"><button class="btn" data-x="close" data-i18n="reader.close"></button></div>
    <div class="detail" id="rbody"></div>
  </dialog>

  <div class="sech">
    <h2 class="sec" data-i18n="explore.title"></h2>
    <p data-i18n="explore.intro"></p>
  </div>

  <div class="grid">
    <aside class="pick" data-i18n-attr="aria-label:pick.label">
      <div class="tabs" role="tablist">
        <button role="tab" id="tab-b" aria-selected="true" data-i18n="tab.books"></button>
        <button role="tab" id="tab-f" aria-selected="false" data-i18n="tab.profiles"></button>
        <button role="tab" id="tab-c" aria-selected="false" data-i18n="tab.concepts"></button>
      </div>
      <input id="q" type="search" data-i18n-attr="placeholder:search.placeholder.b;aria-label:search.label">
      <div class="sort" id="sort">
        <span data-i18n="sort.label"></span>
        <button id="s-y" aria-pressed="true" data-i18n="sort.year"></button>
        <button id="s-n" aria-pressed="false" data-i18n="sort.connected"></button>
      </div>
      <div class="list" id="list"></div>
    </aside>
    <section class="detail" id="detail" aria-live="polite"></section>
  </div>

  <section class="credits" id="creditos" data-i18n-attr="aria-label:credits.label">
    <div>
      <h4 data-i18n="credits.sources.title"></h4>
      <p data-i18n="credits.sources.text"></p>
    </div>
    <div>
      <h4 data-i18n="credits.map.title"></h4>
      <p data-i18n="credits.map.text"></p>
    </div>
    <div>
      <h4 data-i18n="credits.licenses.title"></h4>
      <p data-i18n="credits.licenses.text"></p>
    </div>
    <details>
      <summary id="srcsum"></summary>
      <div id="srclist"></div>
    </details>
  </section>

  <footer class="foot">
    <p data-i18n="footer.copyright"></p>
    <p data-i18n="footer.notice"></p>
  </footer>
</div>`;
I18N.apply();
I18N.languageSwitcher(languages, document.getElementById("langbar"));

// Content (see i18n/<lang>/data.js for the structure of each collection)
const B = data.books, S = data.sources, F = data.profiles, HUBS = data.regions;

// Entity type labels (type codes: l place, p character, g group, e entity or force, v event, c concept)
const TY = k => t("type." + k);
const TYP = k => t("typeplural." + k);
const TORD = {l:0,p:1,g:2,e:3,v:4,c:5};
const IC = {
 p:'<circle cx="8" cy="4.8" r="3"/><path d="M2.3 14.5c.5-3.4 2.7-5 5.7-5s5.2 1.6 5.7 5z"/>',
 g:'<circle cx="5.3" cy="5.2" r="2.5"/><circle cx="11.3" cy="5.8" r="2.1"/><path d="M.8 14c.4-3 2.1-4.6 4.5-4.6S9.4 11 9.8 14zM11 14c-.1-1.5-.6-2.8-1.4-3.8.5-.3 1.1-.4 1.7-.4 2 0 3.5 1.4 3.9 4.2z"/>',
 l:'<path fill-rule="evenodd" d="M8 1.2a4.8 4.8 0 0 0-4.8 4.8c0 3.5 4.8 8.8 4.8 8.8s4.8-5.3 4.8-8.8A4.8 4.8 0 0 0 8 1.2zm0 6.7a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8z"/>',
 e:'<path fill-rule="evenodd" d="M8 3C3.6 3 .8 8 .8 8s2.8 5 7.2 5 7.2-5 7.2-5S12.4 3 8 3zm0 8.1a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2z"/><circle cx="8" cy="8" r="1.5"/>',
 v:'<path d="M9.4.8 3 9.2h3.9l-1 6 7.1-9H8.9z"/>',
 c:'<path d="M8 1.2a4.9 4.9 0 0 0-2.9 8.9c.5.4.8 1 .8 1.6h4.2c0-.6.3-1.2.8-1.6A4.9 4.9 0 0 0 8 1.2zM6 12.7h4v1a1.1 1.1 0 0 1-1.1 1.1H7.1A1.1 1.1 0 0 1 6 13.7z"/>'
};
const ic = ty => '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true">'+IC[ty]+'</svg>';
const ids = Object.keys(B);
const fById = Object.fromEntries(F.map(f=>[f.id,f]));
const hById = Object.fromEntries(HUBS.map(h=>[h.id,h]));
const hubOf = {}; HUBS.forEach(h=>h.books.forEach(b=>hubOf[b]=h.id));
const threadsOf = id => F.filter(f=>f.books[id]);
const size = f => Object.keys(f.books).length;
const sn = f => f.short||f.name;
const entsOf = h => F.filter(f=>f.region===h).sort((a,b)=>TORD[a.type]-TORD[b.type]||sn(a).localeCompare(sn(b),I18N.LANG));
const neigh = {};
ids.forEach(id=>{const s=new Set();threadsOf(id).forEach(f=>Object.keys(f.books).forEach(o=>{if(o!==id)s.add(o)}));neigh[id]=s.size});
// search folding: drop accents (combining marks after NFD) and ignore case, using the page language
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLocaleLowerCase(I18N.LANG);
const byYear = (a,b)=>B[a].year-B[b].year||ids.indexOf(a)-ids.indexOf(b);
// regions a thread touches, besides its home region
function reach(f){const s=new Set(Object.keys(f.books).map(b=>hubOf[b]));if(f.region)s.delete(f.region);return [...s]}
// a thread links two regions when it was born in one of them and appears in books of the other
function bridges(hid){
  const out={};
  F.forEach(f=>{const home=f.region||f.regionProfile; if(!home) return; const hs=new Set(Object.keys(f.books).map(b=>hubOf[b])); hs.delete(home);
    if(home===hid) hs.forEach(o=>{(out[o]=out[o]||[]).push(f)});
    else if(hs.has(hid)) (out[home]=out[home]||[]).push(f)});
  return out;
}

let tab="b", sortBy="y", sel={k:"b",id:"it"}, mapSel={k:"h",id:"torre"};
const $ = id => document.getElementById(id);
$("meta").textContent = t("meta.line",{
  books: tn("count.books", ids.length),
  profiles: tn("count.profiles", F.filter(f=>f.type!=="c").length),
  concepts: tn("count.concepts", F.filter(f=>f.type==="c").length)});

/* ---------- map ---------- */
const TOWER = '<svg viewBox="0 0 80 132" width="62" height="102" aria-hidden="true"><ellipse class="gr" cx="40" cy="122" rx="38" ry="9"/>'
 +'<path class="tw" d="M30 122 L34 34 L31 31 L31 26 L35 26 L36 14 L38.5 14 L40 3 L41.5 14 L44 14 L45 26 L49 26 L49 31 L46 34 L50 122 Z"/>'
 +'<rect class="win" x="39" y="42" width="2.2" height="5"/><rect class="win" x="36.5" y="58" width="2.2" height="5"/><rect class="win" x="41.5" y="74" width="2.2" height="5"/><rect class="win" x="37" y="90" width="2.2" height="5"/><rect class="win" x="42" y="106" width="2.2" height="5"/>'
 +[[12,121],[19,125],[25,119],[58,120],[64,125],[70,121],[33,127],[47,127],[7,125],[54,126]].map(p=>'<circle class="rs" cx="'+p[0]+'" cy="'+p[1]+'" r="1.9"/>').join("")+'</svg>';
// positions in wide mode: [dx, dy] from the Tower. Left and right, with the names always on the outside.
const WIDE = {castle:[-300,-232],holly:[-322,8],colorado:[-300,236],maine:[252,-300],derry:[316,-126],america:[316,98],territorios:[252,302]};
const RING = ["derry","maine","america","territorios","colorado","holly","castle"];
let pos={}, leafPos={}, wide=false, lastW=0;
function buildMap(){
  const W=Math.floor($("mapbox").clientWidth-24);
  if(W<=0||W===lastW) return; lastW=W;
  wide = W>=940;
  const cv=$("canvas"), H = wide?764:Math.max(430,Math.min(600,Math.round(W*1.22))), cx=W/2, cy=H/2;
  pos={torre:[cx,cy-11]}; leafPos={};
  let h='<svg id="wires" aria-hidden="true" viewBox="0 0 '+W+' '+H+'"></svg>';
  h+=`<button class="tower h-torre" data-h="torre" data-g="torre" style="left:${cx}px;top:${cy}px" aria-label="${hById.torre.fullName}">${TOWER}<span>${hById.torre.name}</span></button>`;
  if(wide){
    const k=Math.min(1,(W/2-222)/322);
    const te=entsOf("torre"), up=te.filter(f=>f.type==="p"), dn=te.filter(f=>f.type!=="p");
    up.forEach((f,i)=>{leafPos[f.id]=[cx,cy-82-28*(up.length-1-i),"sm"]});
    dn.forEach((f,i)=>{leafPos[f.id]=[cx,cy+84+28*i,"sm"]});
    Object.keys(WIDE).forEach(id=>{
      const x=cx+WIDE[id][0]*k, y=cy+WIDE[id][1], s=WIDE[id][0]>0?1:-1, es=entsOf(id);
      pos[id]=[x,y];
      es.forEach((f,i)=>{leafPos[f.id]=[x+s*70,y+(i-(es.length-1)/2)*28,s>0?"sr":"sl"]});
    });
  } else {
    const rx=W/2-46, ry=H/2-48;
    RING.forEach((id,i)=>{const a=(-90+i*360/RING.length)*Math.PI/180;pos[id]=[cx+rx*Math.cos(a),cy+ry*Math.sin(a)]});
  }
  Object.keys(pos).forEach(id=>{if(id==="torre")return;
    h+=`<button class="hubc h-${id}" data-h="${id}" data-g="${id}" style="left:${pos[id][0].toFixed(1)}px;top:${pos[id][1].toFixed(1)}px" aria-label="${hById[id].fullName}"><span>${hById[id].name}</span></button>`});
  Object.keys(leafPos).forEach(id=>{const f=fById[id],p=leafPos[id];
    h+=`<button class="leaf ${p[2]} h-${f.region}" data-e="${id}" data-g="${f.region}" title="${t("leaf.title",{type:TY(f.type),name:f.name})}" style="left:${p[0].toFixed(1)}px;top:${p[1].toFixed(1)}px">${ic(f.type)}<span>${sn(f)}</span></button>`});
  cv.style.width=W+"px"; cv.style.height=H+"px";
  cv.className="canvas"+(wide?"":" compact");
  cv.innerHTML=h;
  paintMap();
}
function targets(){
  if(mapSel.k==="e"){const f=fById[mapSel.id];return {home:f.region,to:reach(f)}}
  return {home:mapSel.id,to:Object.keys(bridges(mapSel.id))};
}
function paintMap(){
  const {home,to}=targets(), all=mapSel.k==="h"&&mapSel.id==="torre", inv=new Set([home,...to]);
  document.querySelectorAll("#canvas [data-g]").forEach(el=>{
    const g=el.dataset.g, leaf=el.classList.contains("leaf");
    el.classList.toggle("dim", !all && (leaf ? (mapSel.k==="e" ? el.dataset.e!==mapSel.id : g!==home) : !inv.has(g)));
    if(leaf) el.classList.toggle("on",mapSel.k==="e"&&mapSel.id===el.dataset.e);
    else { el.classList.toggle("on",mapSel.k==="h"&&mapSel.id===g); el.classList.toggle("tg",!all&&g!==home&&inv.has(g)); if(mapSel.k==="e"&&g===home) el.classList.add("tg"); }
  });
  // lines
  const P=(a,b,col,cls)=>`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}" class="${cls}" style="stroke:var(--l-${col})"/>`;
  let s="";
  HUBS.forEach(h=>{if(h.id==="torre")return;
    const hit=!all&&((home==="torre"&&to.includes(h.id))||(home===h.id&&to.includes("torre")));
    s+=P(pos.torre,pos[h.id],hit?home:h.id,"trunk"+(hit?" sel":(h.direct?"":" ind")+(all?"":" faint")))});
  if(!all) to.forEach(o=>{if(o!=="torre"&&home!=="torre") s+=P(pos[home],pos[o],home,"trunk sel")});
  if(wide) Object.keys(leafPos).forEach(id=>{const f=fById[id]; if(f.region==="torre") return;
    const p=leafPos[id], hp=pos[f.region], sg=p[2]==="sr"?1:-1, x1=hp[0]+sg*46, on=mapSel.k==="e"&&mapSel.id===id;
    const faint=!all&&!on&&!(mapSel.k==="h"&&home===f.region);
    s+=`<path d="M${x1.toFixed(1)} ${hp[1].toFixed(1)} C${(x1+sg*14).toFixed(1)} ${hp[1].toFixed(1)} ${(p[0]-sg*14).toFixed(1)} ${p[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}" class="conn${on?" sel":""}${faint?" faint":""}" style="stroke:var(--l-${f.region})"/>`});
  const w=$("wires"); if(w) w.innerHTML=s;
  renderBar(); renderPanel();
}
function renderBar(){
  const bar=$("selbar");
  if(mapSel.k==="e"){
    const f=fById[mapSel.id], to=reach(f);
    bar.className="selbar h-"+f.region;
    bar.innerHTML=`<span class="nm">${ic(f.type)}${f.name}</span><span class="tx">${t(to.length?"bar.entity.multi":"bar.entity.single",{type:TY(f.type),region:hById[f.region].fullName,others:to.map(o=>hById[o].name).join(t("list.sep"))})}</span><button class="btn" data-f="${f.id}">${t("btn.open_profile")}</button>`;
  } else {
    const h=hById[mapSel.id];
    bar.className="selbar h-"+h.id;
    bar.innerHTML=`<span class="nm"><i class="sw2"></i>${h.fullName}</span><span class="tx">${t(h.id==="torre"?"bar.region.torre":"bar.region.other",{books:tn("count.books",h.books.length),names:tn("count.names",entsOf(h.id).length)})}</span>`+(h.profile?`<button class="btn" data-f="${h.profile}">${t("btn.open_profile")}</button>`:"");
  }
}
const echip = (f,on) => `<button class="chip ech h-${f.region}${on?" on":""}" data-e="${f.id}" title="${TY(f.type)}">${ic(f.type)}${sn(f)}</button>`;
function renderPanel(){
  const P=$("panel"); let L="", R="";
  if(mapSel.k==="e"){
    const f=fById[mapSel.id], hub=hById[f.region];
    P.className="panel h-"+f.region;
    L=`<div class="kick">${ic(f.type)}${t("panel.kick.entity",{type:TY(f.type),region:`<button class="lk" data-h="${f.region}">${hub.fullName}</button>`})}</div><h3>${f.name}</h3><p>${f.summary}</p><p>${f.paragraphs[0]}</p><button class="btn" data-f="${f.id}">${t("btn.read_full_profile")}</button>`;
    R=`<h4>${t("panel.passes")}</h4><ul class="refs">`+Object.keys(f.books).sort(byYear).map(b=>`<li class="h-${hubOf[b]}"><span class="sw" title="${hById[hubOf[b]].fullName}"></span><span><button class="lk" data-b="${b}">${B[b].title}</button> <span class="n">${t("panel.ref.region",{region:hById[hubOf[b]].name})}</span><br>${f.books[b]}</span></li>`).join("")+`</ul>`
     +`<h4>${t("panel.others",{region:hub.name})}</h4><div class="chips">`+entsOf(f.region).map(o=>echip(o,o.id===f.id)).join("")+`</div>`;
  } else {
    const h=hById[mapSel.id], br=bridges(mapSel.id), c=h.id==="torre", es=entsOf(h.id);
    P.className="panel h-"+h.id;
    L=`<div class="kick">${t(c?"panel.kick.center":"panel.kick.region",{books:tn("count.books",h.books.length)})}</div><h3>${h.fullName}</h3><p>${h.summary}</p>`+(h.towerLink?`<p>${h.towerLink}</p>`:"")+(h.profile?`<button class="btn" data-f="${h.profile}">${t("btn.read_profile_of",{name:fById[h.profile].name})}</button>`:"");
    R=`<h4>${t("panel.born")}</h4><div class="chips">`+es.map(f=>echip(f,false)).join("")+`</div>`
     +`<h4>${t("panel.books")}</h4><div class="chips">`+h.books.slice().sort(byYear).map(b=>`<button class="chip" data-b="${b}">${B[b].title}</button>`).join("")+`</div>`;
    const ks=Object.keys(br).sort((a,b)=>br[b].length-br[a].length);
    R+=`<h4>${t(c?"panel.bridge.torre":"panel.bridge.region")}</h4>`;
    R+= ks.length ? `<ul class="refs">`+ks.map(o=>`<li class="h-${o}"><span class="sw"></span><span>${t("panel.bridge.item",{region:`<button class="lk" data-h="${o}">${hById[o].name}</button>`,items:br[o].map(f=>f.region?`<button class="lk" data-e="${f.id}">${sn(f)}</button>`:`<button class="lk" data-f="${f.id}">${f.name}</button>`).join(t("list.sep"))})}</span></li>`).join("")+`</ul>` : `<p>${t("panel.bridge.none")}</p>`;
  }
  P.innerHTML=`<div class="col">${L}</div><div class="col">${R}</div>`;
}
function pickMap(k,id,scroll){
  mapSel={k,id}; paintMap();
  if(scroll) $("mapa").scrollIntoView({block:"start"});
}
$("lgd").innerHTML = `<span><i class="bo"></i>${t("legend.region")}</span>`+["l","p","g","e","v","c"].map(ty=>`<span>${ic(ty)}${t("legend.type."+ty)}</span>`).join("")+`<span><i></i>${t("legend.direct")}</span><span><i class="ld"></i>${t("legend.indirect")}</span>`;

/* ---------- explore ---------- */
function renderList(){
  const q = norm($("q").value.trim());
  let h="";
  if(tab==="b"){
    let arr = ids.filter(id=>!q||norm(B[id].title+" "+B[id].originalTitle).includes(q));
    arr.sort(sortBy==="y"?byYear:(a,b)=>neigh[b]-neigh[a]||byYear(a,b));
    h = arr.map(id=>`<button class="item" data-b="${id}" aria-current="${sel.k==="b"&&sel.id===id}"><span class="y">${B[id].year}</span><span class="t">${B[id].title}</span><span class="n" title="${t("list.title.connected")}">${neigh[id]}</span></button>`).join("");
  } else {
    (tab==="c"?["c"]:["l","p","g","e","v"]).forEach(ty=>{
      const arr = F.filter(f=>f.type===ty&&(!q||norm(f.name).includes(q)));
      if(ty!=="c") arr.sort((a,b)=>size(b)-size(a));
      if(!arr.length) return;
      h += (tab==="c"?"":`<h4 class="${ty}">${TYP(ty)}</h4>`)+arr.map(f=>`<button class="item th ${ty}" data-f="${f.id}" aria-current="${sel.k==="f"&&sel.id===f.id}">${ic(ty)}<span class="t">${f.name}</span><span class="n" title="${t("list.title.books")}">${size(f)}</span></button>`).join("");
    });
  }
  $("list").innerHTML = h || `<p class="empty">${t("list.empty")}</p>`;
}
function line(f,cur){
  return `<ol class="line">`+Object.keys(f.books).sort(byYear).map(id=>{
    const c = id===cur;
    const title = c ? `<span class="ti">${B[id].title}</span><span class="here">${t("detail.thisbook")}</span>` : `<button class="bk" data-b="${id}">${B[id].title}</button>`;
    return `<li class="st${c?" cur":""}"><span class="yr">${B[id].year}</span><div class="b">${title}<p>${f.books[id]}</p></div></li>`;
  }).join("")+`</ol>`;
}
// Link to a consulted page; `trim` lists label prefixes to drop (used by the credits list).
const srcLink = (k,trim=[]) => {
  let label = S[k].label;
  for (const p of trim) if (label.startsWith(p)) { label = label.slice(p.length); break; }
  return S[k].url ? `<a href="${S[k].url}" target="_blank" rel="noopener">${label}</a>` : label;
};
const srcList = keys => keys.map(k=>srcLink(k)).join(t("list.sep"));
function detailHTML(s){
  if(s.k==="b"){
    const b=B[s.id], th=threadsOf(s.id).sort((x,y)=>TORD[x.type]-TORD[y.type]||size(y)-size(x)), hub=hById[hubOf[s.id]];
    const orig = b.originalTitle!==b.title ? " · "+b.originalTitle : "";
    return `<div><div class="kick">${b.year}${orig}${b.remark?" · "+b.remark:""}</div><h2>${b.title}</h2>
      <div class="blk"><h4>${t("detail.synopsis")}</h4><div class="prose"><p>${b.synopsis}</p></div>
      <p class="sum">${t("detail.onmap",{link:`<button class="lk" data-h="${hub.id}">${hub.fullName}</button>`})}</p></div>${b.aside?`<aside class="note"><h4>${b.aside.heading}</h4>${b.aside.paragraphs.map(p=>`<p>${p}</p>`).join("")}<p class="srcs">${t("detail.aside.source",{sources:srcList(b.aside.sources)})}</p></aside>`:""}</div>
      <div class="blk"><h4>${t("detail.connections")}</h4>
      <p class="sum">${th.length ? t("detail.summary",{books:tn("count.books",neigh[s.id]),threads:tn("count.threads",th.length)}) : t("detail.noconnections")}</p></div>`
      + th.map(f=>`<article class="thread ${f.type}"><header><span class="ty">${ic(f.type)}${t("detail.thread.header",{type:TY(f.type),count:tn("count.books",size(f))})}</span><h3><button data-f="${f.id}">${f.name}</button></h3><p class="d">${f.summary}</p></header>${line(f,s.id)}</article>`).join("");
  }
  const f=fById[s.id];
  const onmap = f.region ? `<p class="sum">${t("detail.onmap",{link:`<button class="lk" data-e="${f.id}">${hById[f.region].fullName}</button>`})}</p>` : f.regionProfile ? `<p class="sum">${t("detail.onmap",{link:`<button class="lk" data-h="${f.regionProfile}">${hById[f.regionProfile].fullName}</button>`})}</p>` : "";
  return `<div class="${f.type}"><div class="kick">${ic(f.type)}${t("detail.profile.kick",{type:TY(f.type),count:tn("count.books",size(f))})}</div><h2>${f.name}</h2>
    <div class="blk"><div class="prose">${f.paragraphs.map(p=>`<p>${p}</p>`).join("")}</div>${onmap}</div></div>
    <div class="blk"><h4>${t("detail.where")}</h4><article class="thread ${f.type}">${line(f,null)}</article></div>
    <p class="srcs">${t("detail.profile.sources",{sources:srcList(f.sources)})}</p>`;
}
function setTab(which){
  tab=which;
  ["b","f","c"].forEach(k=>$("tab-"+k).setAttribute("aria-selected",which===k));
  $("sort").hidden = which!=="b";
  $("q").placeholder = t("search.placeholder."+which);
  $("q").value="";
  renderList();
}
function go(k,id,fromList){
  sel={k,id};
  const want = k==="b"?"b":(fById[id].type==="c"?"c":"f");
  if(tab!==want) setTab(want); else renderList();
  $("detail").innerHTML = detailHTML(sel);
  // Hash prefixes are language-independent on purpose, so a link keeps working after a language switch.
  try{ history.replaceState(null,"","#"+(k==="b"?"livro-":"fio-")+id); }catch(e){}
  const narrow = window.matchMedia("(max-width:860px)").matches;
  const cur = $("list").querySelector('[aria-current="true"]');
  if(cur && !fromList){ const L=$("list"); L.scrollTop = Math.max(0, cur.offsetTop - L.offsetTop - L.clientHeight/2); }
  if(narrow || !fromList) $("detail").scrollIntoView({block:"start"});
}
/* reading dialog, opened from the map */
function openReader(k,id){
  const d=$("reader");
  $("rbody").innerHTML = detailHTML({k,id});
  if(!d.open){ if(d.showModal) d.showModal(); else d.setAttribute("open",""); }
  document.documentElement.style.overflow="hidden";
  d.scrollTop=0;
}
$("reader").addEventListener("close",()=>{document.documentElement.style.overflow=""});
function closeReader(){ const d=$("reader"); if(d.open){ if(d.close) d.close(); else d.removeAttribute("open"); } document.documentElement.style.overflow=""; }

document.addEventListener("click",e=>{
  if(e.target.id==="reader"){ closeReader(); return; }
  const el = e.target.closest("[data-b],[data-f],[data-h],[data-e],[data-x]");
  if(!el) return;
  if(el.dataset.x==="close"){ closeReader(); return; }
  const inReader = !!el.closest("#reader"), inMap = !!el.closest("#mapa");
  if(el.dataset.e||el.dataset.h){ if(inReader) closeReader(); pickMap(el.dataset.e?"e":"h", el.dataset.e||el.dataset.h, !inMap||!!el.closest("#panel")); return; }
  const k = el.dataset.b?"b":"f", id = el.dataset.b||el.dataset.f;
  if(inMap||inReader) openReader(k,id); else go(k,id,!!el.closest("#list"));
});
["b","f","c"].forEach(k=>$("tab-"+k).onclick=()=>setTab(k));
$("q").oninput=renderList;
$("s-y").onclick=()=>{sortBy="y";$("s-y").setAttribute("aria-pressed",true);$("s-n").setAttribute("aria-pressed",false);renderList()};
$("s-n").onclick=()=>{sortBy="n";$("s-n").setAttribute("aria-pressed",true);$("s-y").setAttribute("aria-pressed",false);renderList()};

// credits: list of consulted pages, grouped as defined in data.sourceGroups
$("srclist").innerHTML = data.sourceGroups.map(g=>`<h4>${g.title}</h4><ul>`+g.keys.map(k=>`<li>${srcLink(k,g.trimPrefixes)}</li>`).join("")+`</ul>`).join("");
$("srcsum").textContent = tn("credits.pages.summary", data.sourceGroups.reduce((n,g)=>n+g.keys.length,0));

let deep=false;
try{
  const m = /^#(livro|fio)-([a-z]+)$/.exec(location.hash||"");
  if(m){ if(m[1]==="livro"&&B[m[2]]){sel={k:"b",id:m[2]};deep=true} if(m[1]==="fio"&&fById[m[2]]){sel={k:"f",id:m[2]};deep=true} }
}catch(e){}
buildMap();
setTab(sel.k==="b"?"b":(fById[sel.id].type==="c"?"c":"f"));
$("detail").innerHTML = detailHTML(sel);
if(window.ResizeObserver) new ResizeObserver(buildMap).observe($("mapbox")); else window.addEventListener("resize",buildMap);
if(deep) $("detail").scrollIntoView({block:"start"});
})();
