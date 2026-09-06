const STORAGE_KEY = "floralens.v2";
const PHOTO_DB = "floralens-photos";
const PHOTO_STORE = "photos";

/*
  Set this to your deployed Cloudflare Worker URL after setup, e.g.
  const API_PROXY_URL = "https://floralens-api.yourname.workers.dev";
  Never put your Pl@ntNet API key in this browser file.
*/
const API_PROXY_URL = "https://floralens-api.lrthumwood.workers.dev";

const defaultState = {
  plants: [
    {id:"rose",speciesKey:"rosa-gertrude-jekyll",common:"Gertrude Jekyll",scientific:"Rosa 'Gertrude Jekyll'",family:"Rosaceae",area:"Back border",status:"Flowering",art:"rose",added:"2026-06-14",notes:"Deep pink, strongly fragrant blooms.",sun:"Full sun",water:"Moderate",soil:"Moist, well-drained",height:"1.2–1.5 m",bloom:[5,6,7,8,9]},
    {id:"lavender",speciesKey:"lavandula-angustifolia",common:"English Lavender",scientific:"Lavandula angustifolia",family:"Lamiaceae",area:"Patio",status:"Flowering",art:"lavender",added:"2026-07-02",notes:"Aromatic evergreen perennial loved by pollinators.",sun:"Full sun",water:"Low",soil:"Free-draining",height:"0.4–0.7 m",bloom:[6,7,8,9]},
    {id:"hydrangea",speciesKey:"hydrangea-macrophylla",common:"Hydrangea",scientific:"Hydrangea macrophylla",family:"Hydrangeaceae",area:"Side border",status:"Flowering",art:"hydrangea",added:"2026-05-28",notes:"Large rounded flower heads with lush foliage.",sun:"Part shade",water:"Regular",soil:"Moist, fertile",height:"1–2 m",bloom:[7,8,9]}
  ],
  speciesCache: {
    "lavandula-angustifolia": {scientific:"Lavandula angustifolia", common:"English Lavender", family:"Lamiaceae", source:"starter", fetchedAt:"2026-09-06"}
  },
  areas:["Front Garden","Back Garden","Patio","Indoors","Greenhouse","Unplaced"],
  journal:[
    {date:"6 Sep",icon:"✿",title:"Hydrangea looking beautiful",text:"Added a quick garden note and checked the late-summer flowers."},
    {date:"2 Sep",icon:"✓",title:"Lavender care",text:"Light tidy and checked soil moisture."}
  ],
  discoveries: 12,
  lastQuota: null
};

let state = loadState();
let currentRoute = "home";
let captures = []; // [{id,file,dataUrl,organ}]
let pendingResults = null;
let chosenArea = "Unplaced";

function loadState(){
  try {
    const old = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = {...structuredClone(defaultState), ...old};
    merged.speciesCache = {...defaultState.speciesCache, ...(old.speciesCache||{})};
    merged.areas = old.areas?.length ? old.areas : defaultState.areas;
    return merged;
  } catch { return structuredClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(s=""){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function slug(s=""){ return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-"); }
function toast(msg){ document.body.insertAdjacentHTML("beforeend",`<div class="toast" id="toast">${esc(msg)}</div>`); setTimeout(()=>document.getElementById("toast")?.remove(),2200); }

function photoDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(PHOTO_DB,1);
    req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(PHOTO_STORE)) req.result.createObjectStore(PHOTO_STORE); };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function savePhoto(key, blob){
  const db=await photoDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,"readwrite");
    tx.objectStore(PHOTO_STORE).put(blob,key);
    tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
  });
}
async function getPhotoUrl(key){
  if(!key) return null;
  try{
    const db=await photoDB();
    const blob=await new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,"readonly");
      const req=tx.objectStore(PHOTO_STORE).get(key);
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
    return blob ? URL.createObjectURL(blob) : null;
  }catch{return null}
}

function setRoute(route, data={}){
  currentRoute=route;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.route===route));
  if(route==="home") renderHome();
  if(route==="garden") renderGarden();
  if(route==="lens") renderLens();
  if(route==="journal") renderJournal();
  if(route==="discover") renderDiscover();
  if(route==="profile" && data.id) renderProfile(data.id);
  window.scrollTo({top:0,behavior:"smooth"});
}

function pin(p){
  return `<article class="pin" onclick="setRoute('profile',{id:'${p.id}'})">
    <div class="plant-art ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}"></div>
    <div class="pin-body"><b>${esc(p.common)}</b><small><i>${esc(p.scientific)}</i></small><br><span class="chip">✿ ${esc(p.status||p.area||"Saved")}</span></div>
  </article>`;
}
async function hydratePhotos(scope=document){
  const nodes=[...scope.querySelectorAll("[data-photo-key]")].filter(n=>n.dataset.photoKey);
  for(const n of nodes){
    const url=await getPhotoUrl(n.dataset.photoKey);
    if(url){ n.style.backgroundImage=`url("${url}")`; n.style.backgroundSize="cover"; n.style.backgroundPosition="center"; }
  }
}

function renderHome(){
  const flowering=state.plants.filter(p=>p.status==="Flowering").length;
  view.innerHTML=`
    <section class="hero"><div class="eyebrow">Your botanical scrapbook</div><h1>Your little world<br>in bloom.</h1><p class="sub">Keep every flower, story and small garden discovery in one beautiful place.</p><div class="hero-bloom">❀</div></section>
    <button class="lens-banner" onclick="setRoute('lens')"><span class="lens-icon">⌾</span><span><strong>Identify something beautiful</strong><small>One photo is enough. Add up to five when a plant is tricky.</small></span></button>
    <div class="stats-strip"><div class="stat"><b>${state.plants.length}</b><small>in your garden</small></div><div class="stat"><b>${flowering}</b><small>flowering now</small></div><div class="stat"><b>${state.discoveries}</b><small>discoveries</small></div></div>
    <div class="section-title"><h3>From your garden</h3><button class="link-btn" onclick="setRoute('garden')">See all</button></div>
    <section class="masonry">${state.plants.map(pin).join("")}</section>
    <div class="section-title"><h3>FloraLens memory</h3></div>
    <div class="note-card"><div class="eyebrow">Species cache</div><h2 style="font-size:25px;margin-top:6px">${Object.keys(state.speciesCache).length} plant types remembered</h2><p class="sub" style="margin-bottom:0">Once FloraLens has enriched a species, future plants of the same species can reuse that botanical record.</p></div>`;
  hydratePhotos();
}

function renderGarden(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">My collection</div><h1>My Garden</h1><p class="sub">${state.plants.length} plants, each with its own little story.</p></section>
    <input class="search" id="gardenSearch" placeholder="Search your plants…" oninput="filterGarden(this.value)">
    <div class="toolbar">${["All",...state.areas].map((a,i)=>`<button class="filter ${i===0?"active":""}" onclick="filterByArea('${esc(a)}',this)">${esc(a)}</button>`).join("")}</div>
    <section class="masonry" id="gardenPins">${state.plants.map(pin).join("")}</section>`;
  hydratePhotos();
}
function filterGarden(q){
  const list=state.plants.filter(p=>(p.common+p.scientific+p.area).toLowerCase().includes(q.toLowerCase()));
  gardenPins.innerHTML=list.map(pin).join("") || `<div class="empty-card">No plants matched that search.</div>`;
  hydratePhotos(gardenPins);
}
function filterByArea(area,btn){
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  const list=area==="All"?state.plants:state.plants.filter(p=>p.area===area);
  gardenPins.innerHTML=list.map(pin).join("") || `<div class="empty-card">Nothing saved in ${esc(area)} yet.</div>`;
  hydratePhotos(gardenPins);
}

function renderLens(){
  captures=[];
  pendingResults=null;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>What did you find?</h1>${state.lastQuota!==null?`<span class="quota-pill">❧ ${state.lastQuota} identifications left today</span>`:""}</section>
    <section class="lens-screen"><div class="camera-stage" id="cameraStage"><div class="camera-copy"><h2>Point at a flower or plant</h2><p>Start with the clearest view. FloraLens can combine several views of the same plant.</p></div><div class="focus-corners"></div>
      <div class="camera-controls"><button class="mini-cam" onclick="galleryInput.click()">▧</button><button class="capture" onclick="beginCapture('auto')"></button><button class="mini-cam" onclick="showLensTips()">?</button></div></div></section>`;
}
function beginCapture(organ="auto"){ window.captureOrgan=organ; multiPhotoInput.click(); }

async function addCapture(file, organ="auto"){
  if(!file || captures.length>=5) return;
  if(!["image/jpeg","image/png"].includes(file.type)){ toast("Use a JPG or PNG photo."); return; }
  const dataUrl=await fileToDataUrl(file);
  captures.push({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),file,dataUrl,organ});
  renderCaptureReview();
}
function fileToDataUrl(file){ return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}); }

function renderCaptureReview(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Closer look</div><h1>${captures.length===1?"Lovely shot.":"More clues."}</h1><p class="sub">Label each view if you know the plant part, or leave it on Auto.</p></section>
    <div class="capture-stack">${captures.map((c,i)=>`<div class="capture-card"><button class="capture-remove" onclick="removeCapture(${i})">×</button><img src="${c.dataUrl}"><span class="organ">${esc(c.organ)}</span></div>`).join("")}${captures.length<5?`<button class="add-capture" onclick="chooseOrganForNext()">＋<br>Add view</button>`:""}</div>
    <div class="result-hero" style="min-height:330px"><img class="preview-img" src="${captures[0].dataUrl}"><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${captures.length} of 5 photos</div><h1>Ready to identify?</h1><span class="confidence">${captures.map(c=>c.organ).join(" · ")}</span></div></div>
    <div class="actions"><button class="btn primary" onclick="identifyPlant()">✿ Identify plant</button><button class="btn secondary" onclick="chooseOrganForNext()" ${captures.length>=5?"disabled":""}>＋ Another view</button></div>
    <button class="btn outline" style="width:100%" onclick="setRoute('lens')">Start again</button>
    ${!API_PROXY_URL?`<div class="setup-card"><div class="eyebrow">Demo mode</div><p class="sub" style="margin:6px 0 0">The complete flow works now. Deploy the included free Cloudflare Worker and set <code>API_PROXY_URL</code> to switch on real Pl@ntNet results.</p></div>`:""}`;
}
function removeCapture(i){ captures.splice(i,1); captures.length?renderCaptureReview():setRoute("lens"); }
function chooseOrganForNext(){
  if(captures.length>=5) return;
  modal(`<div class="eyebrow">Add another view</div><h2>What will you photograph?</h2><div class="organ-grid">
    <button class="organ-choice" onclick="pickOrgan('flower')"><span>✿</span>Flower</button>
    <button class="organ-choice" onclick="pickOrgan('leaf')"><span>❧</span>Leaf</button>
    <button class="organ-choice" onclick="pickOrgan('fruit')"><span>●</span>Fruit</button>
    <button class="organ-choice" onclick="pickOrgan('bark')"><span>♜</span>Bark</button>
    <button class="organ-choice" onclick="pickOrgan('auto')"><span>⌾</span>Auto</button>
  </div><p class="small">All photos in one identification should be of the same individual plant.</p>`);
}
function pickOrgan(o){ closeModal(); beginCapture(o); }

async function identifyPlant(){
  if(!captures.length) return;
  const first=captures[0].dataUrl;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>Looking closely…</h1></section><div class="result-hero"><img class="preview-img" src="${first}"><div class="identify-overlay"><div><div class="flower-loader">✿</div><h2 style="margin:12px 0 5px">Comparing the details</h2><p style="opacity:.8">${captures.length} ${captures.length===1?"view":"views"} of the same plant.</p></div></div></div>`;
  try{
    if(API_PROXY_URL){
      const fd=new FormData();
      captures.forEach(c=>{ fd.append("images",c.file,c.file.name||"plant.jpg"); fd.append("organs",c.organ); });
      fd.append("lang","en");
      fd.append("nb-results","5");
      const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/identify`,{method:"POST",body:fd});
      if(!res.ok) throw new Error(`Identification failed (${res.status})`);
      const data=await res.json();
      pendingResults=data.results||[];
      if(Number.isFinite(data.remainingIdentificationRequests)){state.lastQuota=data.remainingIdentificationRequests;saveState();}
    } else {
      await new Promise(r=>setTimeout(r,1150));
      pendingResults=[
        {score:.963,species:{scientificNameWithoutAuthor:"Lavandula angustifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["English Lavender","True Lavender"]}},
        {score:.742,species:{scientificNameWithoutAuthor:"Lavandula latifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["Spike Lavender"]}},
        {score:.516,species:{scientificNameWithoutAuthor:"Lavandula × intermedia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["Lavandin"]}}
      ];
    }
    if(!pendingResults.length) throw new Error("No plant match was returned");
    renderResult();
  }catch(err){
    view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>Couldn’t settle on a match</h1><p class="sub">${esc(err.message)}</p></section><button class="btn primary" style="width:100%" onclick="renderCaptureReview()">Try these photos again</button>`;
  }
}

function resultInfo(r){
  const s=r?.species||{};
  return {common:s.commonNames?.[0]||s.scientificNameWithoutAuthor||"Possible match", sci:s.scientificNameWithoutAuthor||"", family:s.family?.scientificNameWithoutAuthor||"Plant", genus:s.genus?.scientificNameWithoutAuthor||""};
}
function renderResult(){
  const r=pendingResults[0], info=resultInfo(r);
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens match</div><h1>I think I found it!</h1>${state.lastQuota!==null?`<span class="quota-pill">❧ ${state.lastQuota} identifications left today</span>`:""}</section>
    <div class="result-hero"><img class="preview-img" src="${captures[0].dataUrl}"><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${esc(info.family)}</div><h1>${esc(info.common)}</h1><em>${esc(info.sci)}</em><br><span class="confidence">${Math.round(r.score*100)}% match</span></div></div>
    <div class="actions"><button class="btn primary" onclick="chooseSaveArea()">✓ That’s it</button><button class="btn secondary" onclick="showMatches()">Other matches</button></div>
    <div class="profile-card"><div class="eyebrow">Identification evidence</div><h2 style="font-size:25px;margin-top:7px">${captures.length} ${captures.length===1?"photo":"photos"} considered</h2><div class="photo-strip">${captures.map(c=>`<div><img class="thumb" src="${c.dataUrl}"><div class="small" style="text-align:center">${esc(c.organ)}</div></div>`).join("")}</div><p class="small">Confidence is Pl@ntNet's ranked identification score, not a guarantee. Confirming the visual match keeps FloraLens's garden records cleaner.</p></div>`;
}
function showMatches(){
  modal(`<div class="eyebrow">Possible matches</div><h2>What looks right?</h2>${pendingResults.slice(0,5).map((r,i)=>{const x=resultInfo(r);return `<button class="match-card" onclick="selectMatch(${i})"><span><b>${esc(x.common)}</b><br><small><i>${esc(x.sci)}</i> · ${esc(x.family)}</small></span><span class="match-score">${Math.round(r.score*100)}%</span></button>`}).join("")}`);
}
function selectMatch(i){ pendingResults=[pendingResults[i],...pendingResults.filter((_,x)=>x!==i)]; closeModal(); renderResult(); }

function chooseSaveArea(){
  chosenArea="Unplaced";
  modal(`<div class="eyebrow">Add to My Garden</div><h2>Where does it live?</h2><div class="area-grid">${state.areas.map(a=>`<button class="area-choice ${a===chosenArea?"active":""}" onclick="selectArea('${esc(a)}',this)">${esc(a)}</button>`).join("")}</div><button class="btn primary" style="width:100%" onclick="confirmPlant()">Save this plant</button><button class="link-btn" style="width:100%;margin-top:12px" onclick="addAreaPrompt()">＋ Create an area</button>`);
}
function selectArea(a,btn){ chosenArea=a; document.querySelectorAll(".area-choice").forEach(x=>x.classList.remove("active"));btn.classList.add("active"); }
function addAreaPrompt(){
  closeModal();
  modal(`<div class="eyebrow">Garden areas</div><h2>Create a new area</h2><input id="newArea" class="search" placeholder="e.g. Rose bed"><button class="btn primary" style="width:100%" onclick="saveNewArea()">Add area</button>`);
}
function saveNewArea(){ const a=document.getElementById("newArea").value.trim();if(!a)return;if(!state.areas.includes(a))state.areas.push(a);saveState();chosenArea=a;closeModal();chooseSaveArea(); }

async function confirmPlant(){
  const r=pendingResults[0], x=resultInfo(r);
  const speciesKey=slug(x.sci);
  if(!state.speciesCache[speciesKey]){
    state.speciesCache[speciesKey]={scientific:x.sci,common:x.common,family:x.family,genus:x.genus,source:"Pl@ntNet identification",fetchedAt:new Date().toISOString(),care:null};
  }
  const id="plant-"+Date.now(), photoKey=`${id}-hero`;
  try{ await savePhoto(photoKey,captures[0].file); }catch(e){ console.warn("Photo storage failed",e); }
  const cached=state.speciesCache[speciesKey]||{};
  state.plants.unshift({id,speciesKey,photoKey,common:x.common,scientific:x.sci,family:x.family,area:chosenArea,status:"New",added:new Date().toISOString().slice(0,10),notes:cached.notes||"Newly identified with FloraLens.",sun:cached.sun||"Care data coming next",water:cached.water||"Care data coming next",soil:cached.soil||"Care data coming next",height:cached.height||"Care data coming next",bloom:cached.bloom||[]});
  saveState(); closeModal(); captures=[]; toast(`${x.common} saved to ${chosenArea}`); renderProfile(id,true);
}

async function renderProfile(id,isNew=false){
  currentRoute="profile";
  const p=state.plants.find(x=>x.id===id); if(!p)return setRoute("garden");
  const cached=state.speciesCache[p.speciesKey]||{};
  view.innerHTML=`<section class="page-head"><button class="link-btn" onclick="setRoute('garden')">← My Garden</button></section>
    <div class="result-hero" id="profileHero" style="min-height:390px"><div class="plant-art ${p.art||""}" style="position:absolute;inset:0"></div><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${esc(p.family)}</div><h1>${esc(p.common)}</h1><em>${esc(p.scientific)}</em><br><span class="confidence">♡ ${esc(p.area)}</span></div></div>
    <section style="padding:20px 2px 0"><div class="eyebrow">Meet ${esc(p.common)}</div><h2 style="margin-top:6px">A little about this plant</h2><p class="sub">${esc(p.notes)}</p><div class="species-cache">FloraLens species record: ${cached.source?esc(cached.source):"local"} · ${esc(p.speciesKey||"")}</div></section>
    <div class="info-grid"><div class="info"><span>☀</span><b>Happy place</b><small>${esc(p.sun)}</small></div><div class="info"><span>💧</span><b>Water</b><small>${esc(p.water)}</small></div><div class="info"><span>♧</span><b>Soil</b><small>${esc(p.soil)}</small></div><div class="info"><span>↕</span><b>Size</b><small>${esc(p.height)}</small></div></div>
    <div class="profile-card"><div class="eyebrow">In bloom</div><h2 style="font-size:25px;margin-top:6px">Flowering year</h2><div class="months">${["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>`<div class="month ${p.bloom?.includes(i+1)?"on":""}">${m}</div>`).join("")}</div></div>
    <div class="section-title"><h3>Our story</h3><button class="link-btn" onclick="addJournalForPlant('${p.id}')">＋ Add moment</button></div>
    <div class="profile-card"><div class="timeline-item"><div class="timeline-icon">✿</div><div><b>Added to FloraLens</b><div class="small">${esc(p.added)}</div></div></div><div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Plant profile created</b><div class="small">Its original identification photo is stored on this device.</div></div></div></div>`;
  if(p.photoKey){
    const url=await getPhotoUrl(p.photoKey);
    if(url){ document.querySelector("#profileHero .plant-art")?.remove(); profileHero.insertAdjacentHTML("afterbegin",`<img class="photo-hero" src="${url}" alt="${esc(p.common)}">`); }
  }
}

function renderJournal(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Garden journal</div><h1>Little moments</h1><p class="sub">The small things are the ones worth remembering.</p></section><button class="lens-banner" style="background:linear-gradient(135deg,#9f777d,#c49ca1)" onclick="newJournal()"><span class="lens-icon">＋</span><span><strong>Add a journal moment</strong><small>Photo, note, care task or something you noticed.</small></span></button><div class="profile-card">${state.journal.map(j=>`<div class="timeline-item"><div class="timeline-icon">${j.icon}</div><div><b>${esc(j.title)}</b><div class="small">${esc(j.date)}</div><p class="small" style="margin:5px 0 0">${esc(j.text)}</p></div></div>`).join("")}</div>`;
}
function newJournal(){modal(`<div class="eyebrow">New journal moment</div><h2>What happened today?</h2><textarea id="journalText" class="search" style="min-height:110px" placeholder="A new flower, something you pruned, a little garden win…"></textarea><button class="btn primary" style="width:100%" onclick="saveJournal()">Save moment</button>`)}
function saveJournal(){const text=document.getElementById("journalText").value.trim();if(!text)return;state.journal.unshift({date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"}),icon:"✿",title:"Garden note",text});saveState();closeModal();renderJournal()}
function addJournalForPlant(id){const p=state.plants.find(x=>x.id===id);modal(`<div class="eyebrow">${esc(p.common)}</div><h2>Add to its story</h2><textarea id="journalText" class="search" style="min-height:110px" placeholder="What did you notice?"></textarea><button class="btn primary" style="width:100%" onclick="saveJournal()">Save moment</button>`)}

function renderDiscover(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Saved inspiration</div><h1>Discover</h1><p class="sub">Plants you've spotted, loved or want to remember.</p></section><div class="stats-strip"><div class="stat"><b>${state.discoveries}</b><small>discoveries</small></div><div class="stat"><b>5</b><small>families</small></div><div class="stat"><b>3</b><small>wishlist</small></div></div><div class="empty-card" style="text-align:center;padding:38px 22px"><div style="font-size:52px;color:var(--rose)">❀</div><h2 style="font-size:27px">Your botanical scrapbook</h2><p class="sub">When you identify something away from home, save it here instead of adding it to your garden.</p><button class="btn primary" onclick="setRoute('lens')">Find something</button></div>`;
}
function showLensTips(){modal(`<div class="eyebrow">Photo tips</div><h2>Help FloraLens see clearly</h2><p class="sub">Fill most of the frame with the plant, use good light and photograph a distinctive flower or leaf. All images in one request should show the same individual plant.</p><button class="btn primary" style="width:100%" onclick="closeModal()">Got it</button>`)}
function modal(html){document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">${html}</div></div>`)}
function closeModal(){document.getElementById("modal")?.remove()}

document.addEventListener("click",e=>{const route=e.target.closest("[data-route]")?.dataset.route;if(route)setRoute(route)});
cameraInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],"auto"); e.target.value=""; });
galleryInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],"auto"); e.target.value=""; });
multiPhotoInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],window.captureOrgan||"auto"); e.target.value=""; });

renderHome();
