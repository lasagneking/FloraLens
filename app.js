const STORAGE_KEY = "floralens.v1";
const API_PROXY_URL = ""; // Later: your secure proxy endpoint. Never put the Pl@ntNet private key here.

const defaultState = {
  plants: [
    {id:"rose",common:"Gertrude Jekyll",scientific:"Rosa 'Gertrude Jekyll'",family:"Rosaceae",area:"Back border",status:"Flowering",art:"rose",added:"2026-06-14",notes:"Deep pink, strongly fragrant blooms.",sun:"Full sun",water:"Moderate",soil:"Moist, well-drained",height:"1.2–1.5 m",bloom:[5,6,7,8,9]},
    {id:"lavender",common:"English Lavender",scientific:"Lavandula angustifolia",family:"Lamiaceae",area:"Patio",status:"Flowering",art:"lavender",added:"2026-07-02",notes:"Aromatic evergreen perennial loved by pollinators.",sun:"Full sun",water:"Low",soil:"Free-draining",height:"0.4–0.7 m",bloom:[6,7,8,9]},
    {id:"hydrangea",common:"Hydrangea",scientific:"Hydrangea macrophylla",family:"Hydrangeaceae",area:"Side border",status:"Flowering",art:"hydrangea",added:"2026-05-28",notes:"Large rounded flower heads with lush foliage.",sun:"Part shade",water:"Regular",soil:"Moist, fertile",height:"1–2 m",bloom:[7,8,9]}
  ],
  journal:[
    {date:"6 Sep",icon:"✿",title:"Hydrangea looking beautiful",text:"Added a quick garden note and checked the late-summer flowers."},
    {date:"2 Sep",icon:"✓",title:"Lavender care",text:"Light tidy and checked soil moisture."}
  ],
  discoveries: 12
};

let state = loadState();
let currentRoute = "home";
let lastPhoto = null;
let pendingResults = null;

function loadState(){
  try { return {...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")}; }
  catch { return structuredClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(s=""){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }

function setRoute(route, data={}){
  currentRoute = route;
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
    <div class="plant-art ${p.art||""}"></div>
    <div class="pin-body"><b>${esc(p.common)}</b><small><i>${esc(p.scientific)}</i></small><br><span class="chip">✿ ${esc(p.status||p.area||"Saved")}</span></div>
  </article>`;
}

function renderHome(){
  const flowering=state.plants.filter(p=>p.status==="Flowering").length;
  view.innerHTML=`
    <section class="hero">
      <div class="eyebrow">Sunday in the garden</div>
      <h1>Your little world<br>in bloom.</h1>
      <p class="sub">Keep every flower, story and small garden discovery in one beautiful place.</p>
      <div class="hero-bloom">❀</div>
    </section>
    <button class="lens-banner" onclick="setRoute('lens')">
      <span class="lens-icon">⌾</span>
      <span><strong>Identify something beautiful</strong><small>Take a photo and FloraLens will look closely.</small></span>
    </button>
    <div class="stats-strip">
      <div class="stat"><b>${state.plants.length}</b><small>in your garden</small></div>
      <div class="stat"><b>${flowering}</b><small>flowering now</small></div>
      <div class="stat"><b>${state.discoveries}</b><small>discoveries</small></div>
    </div>
    <div class="section-title"><h3>From your garden</h3><button class="link-btn" onclick="setRoute('garden')">See all</button></div>
    <section class="masonry">${state.plants.map(pin).join("")}</section>
    <div class="section-title"><h3>Little moments</h3><button class="link-btn" onclick="setRoute('journal')">Journal</button></div>
    <div class="note-card">
      <div class="eyebrow">Today</div>
      <h2 style="font-size:25px;margin-top:6px">Late-summer colour ✿</h2>
      <p class="sub" style="margin-bottom:0">Your hydrangea and lavender are both marked as flowering. A perfect excuse for another photo.</p>
    </div>`;
}

function renderGarden(){
  view.innerHTML=`
    <section class="page-head"><div class="eyebrow">My collection</div><h1>My Garden</h1><p class="sub">${state.plants.length} plants, each with its own little story.</p></section>
    <input class="search" id="gardenSearch" placeholder="Search your plants…" oninput="filterGarden(this.value)">
    <div class="toolbar"><button class="filter active">All</button><button class="filter">Flowering</button><button class="filter">Patio</button><button class="filter">Borders</button></div>
    <section class="masonry" id="gardenPins">${state.plants.map(pin).join("")}</section>`;
}
function filterGarden(q){
  const list=state.plants.filter(p=>(p.common+p.scientific+p.area).toLowerCase().includes(q.toLowerCase()));
  gardenPins.innerHTML=list.map(pin).join("") || `<div class="empty-card">No plants matched that search.</div>`;
}

function renderLens(){
  view.innerHTML=`
    <section class="page-head"><div class="eyebrow">FloraLens</div><h1>What did you find?</h1></section>
    <section class="lens-screen">
      <div class="camera-stage" id="cameraStage">
        <div class="camera-copy"><h2>Point at a flower or plant</h2><p>Clear, close photos give the best match. You can add more views afterwards.</p></div>
        <div class="focus-corners"></div>
        <div class="camera-controls">
          <button class="mini-cam" onclick="galleryInput.click()" aria-label="Choose photo">▧</button>
          <button class="capture" onclick="cameraInput.click()" aria-label="Take photo"></button>
          <button class="mini-cam" onclick="showLensTips()" aria-label="Photo tips">?</button>
        </div>
      </div>
    </section>`;
}

function handlePhoto(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    lastPhoto=e.target.result;
    cameraStage.insertAdjacentHTML("beforeend",`<img class="preview-img" src="${lastPhoto}" alt="Plant photo preview"><div class="identify-overlay" id="scanOverlay"><div><div class="flower-loader">✿</div><h2 style="margin:12px 0 5px">Looking closely…</h2><p style="opacity:.8">Checking shape, flower and foliage.</p></div></div>`);
    identifyPlant(file);
  };
  reader.readAsDataURL(file);
}

async function identifyPlant(file){
  try{
    if(API_PROXY_URL){
      const fd=new FormData();
      fd.append("images", file);
      fd.append("organs","auto");
      const res=await fetch(API_PROXY_URL,{method:"POST",body:fd});
      if(!res.ok) throw new Error("Identification request failed");
      const data=await res.json();
      pendingResults=data.results || [];
    } else {
      // Demonstration fallback so the interface is fully testable before a proxy/API key is added.
      await new Promise(r=>setTimeout(r,1200));
      pendingResults=[
        {score:.963,species:{scientificNameWithoutAuthor:"Lavandula angustifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},commonNames:["English Lavender","True Lavender"]}},
        {score:.742,species:{scientificNameWithoutAuthor:"Lavandula latifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},commonNames:["Spike Lavender"]}},
        {score:.516,species:{scientificNameWithoutAuthor:"Lavandula × intermedia",family:{scientificNameWithoutAuthor:"Lamiaceae"},commonNames:["Lavandin"]}}
      ];
    }
    renderResult();
  }catch(err){
    scanOverlay.innerHTML=`<div><div class="flower-loader">!</div><h2>Couldn’t identify this one</h2><p>${esc(err.message)}</p><button class="btn secondary" onclick="setRoute('lens')">Try again</button></div>`;
  }
}

function renderResult(){
  const r=pendingResults?.[0];
  const s=r?.species || {};
  const common=s.commonNames?.[0] || "Possible match";
  const sci=s.scientificNameWithoutAuthor || "Unknown";
  const family=s.family?.scientificNameWithoutAuthor || "Plant";
  view.innerHTML=`
    <section class="page-head"><div class="eyebrow">FloraLens match</div><h1>I think I found it!</h1></section>
    <div class="result-hero">
      ${lastPhoto?`<img class="preview-img" src="${lastPhoto}" alt="">`:""}
      <div class="result-gradient"></div>
      <div class="result-copy"><div class="eyebrow" style="color:white">Likely match</div><h1>${esc(common)}</h1><em>${esc(sci)}</em><br><span class="confidence">${Math.round((r?.score||0)*100)}% match</span></div>
    </div>
    <div class="actions"><button class="btn primary" onclick="confirmPlant()">✓ That’s it</button><button class="btn secondary" onclick="showMatches()">Other matches</button></div>
    <div class="profile-card">
      <div class="eyebrow">${esc(family)}</div>
      <h2 style="font-size:25px;margin-top:7px">A new garden story?</h2>
      <p class="sub">Confirm the match and FloraLens will create a permanent profile where you can keep photos, notes, care history and flowering memories.</p>
      <button class="btn outline" style="width:100%" onclick="addAnotherPhoto()">＋ Add leaf or flower photo</button>
    </div>`;
}

function showMatches(){
  const cards=(pendingResults||[]).slice(0,5).map((r,i)=>{
    const s=r.species||{}; const n=s.commonNames?.[0]||s.scientificNameWithoutAuthor||"Unknown";
    return `<button class="option" onclick="selectMatch(${i})"><b>${esc(n)}</b><br><small><i>${esc(s.scientificNameWithoutAuthor||"")}</i></small><br><span class="chip">${Math.round((r.score||0)*100)}%</span></button>`;
  }).join("");
  modal(`<div class="eyebrow">Possible matches</div><h2>What looks right?</h2><div class="option-row">${cards}</div>`);
}
function selectMatch(i){ pendingResults=[pendingResults[i],...pendingResults.filter((_,x)=>x!==i)]; closeModal(); renderResult(); }

function confirmPlant(){
  const r=pendingResults?.[0], s=r?.species||{};
  const common=s.commonNames?.[0]||s.scientificNameWithoutAuthor||"New Plant";
  const sci=s.scientificNameWithoutAuthor||"";
  const id="plant-"+Date.now();
  state.plants.unshift({id,common,scientific:sci,family:s.family?.scientificNameWithoutAuthor||"",area:"Unplaced",status:"New",art:"lavender",added:new Date().toISOString().slice(0,10),notes:"Newly identified with FloraLens.",sun:"Add care data",water:"Add care data",soil:"Add care data",height:"Add details",bloom:[]});
  saveState();
  renderProfile(id,true);
}
function addAnotherPhoto(){
  modal(`<div class="eyebrow">Closer look</div><h2>Add another view</h2><p class="sub">A flower, leaf, fruit or bark photo can help with difficult identifications. FloraLens is structured for up to five images in one identification request.</p><button class="btn primary" style="width:100%" onclick="closeModal();cameraInput.click()">Take another photo</button>`);
}

function renderProfile(id,isNew=false){
  currentRoute="profile";
  const p=state.plants.find(x=>x.id===id); if(!p) return setRoute("garden");
  view.innerHTML=`
    <section class="page-head"><button class="link-btn" onclick="setRoute('garden')">← My Garden</button></section>
    <div class="result-hero" style="min-height:390px">
      ${isNew && lastPhoto?`<img class="preview-img" src="${lastPhoto}" alt="">`:`<div class="plant-art ${p.art}" style="position:absolute;inset:0"></div>`}
      <div class="result-gradient"></div>
      <div class="result-copy"><div class="eyebrow" style="color:white">${esc(p.family)}</div><h1>${esc(p.common)}</h1><em>${esc(p.scientific)}</em><br><span class="confidence">♡ ${esc(p.area)}</span></div>
    </div>
    <section style="padding:20px 2px 0">
      <div class="eyebrow">Meet ${esc(p.common)}</div>
      <h2 style="margin-top:6px">A little about this plant</h2>
      <p class="sub">${esc(p.notes)}</p>
    </section>
    <div class="info-grid">
      <div class="info"><span>☀</span><b>Happy place</b><small>${esc(p.sun)}</small></div>
      <div class="info"><span>💧</span><b>Water</b><small>${esc(p.water)}</small></div>
      <div class="info"><span>♧</span><b>Soil</b><small>${esc(p.soil)}</small></div>
      <div class="info"><span>↕</span><b>Size</b><small>${esc(p.height)}</small></div>
    </div>
    <div class="profile-card">
      <div class="eyebrow">In bloom</div>
      <h2 style="font-size:25px;margin-top:6px">Flowering year</h2>
      <div class="months">${["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>`<div class="month ${p.bloom?.includes(i+1)?"on":""}">${m}</div>`).join("")}</div>
    </div>
    <div class="section-title"><h3>Our story</h3><button class="link-btn" onclick="addJournalForPlant('${p.id}')">＋ Add moment</button></div>
    <div class="profile-card">
      <div class="timeline-item"><div class="timeline-icon">✿</div><div><b>Added to FloraLens</b><div class="small">${esc(p.added)}</div></div></div>
      <div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Plant profile created</b><div class="small">Ready for photos, notes and care history.</div></div></div>
    </div>`;
}

function renderJournal(){
  view.innerHTML=`
  <section class="page-head"><div class="eyebrow">Garden journal</div><h1>Little moments</h1><p class="sub">The small things are the ones worth remembering.</p></section>
  <button class="lens-banner" style="background:linear-gradient(135deg,#9f777d,#c49ca1)" onclick="newJournal()"><span class="lens-icon">＋</span><span><strong>Add a journal moment</strong><small>Photo, note, care task or something you noticed.</small></span></button>
  <div class="profile-card">${state.journal.map(j=>`<div class="timeline-item"><div class="timeline-icon">${j.icon}</div><div><b>${esc(j.title)}</b><div class="small">${esc(j.date)}</div><p class="small" style="margin:5px 0 0">${esc(j.text)}</p></div></div>`).join("")}</div>`;
}
function newJournal(){ modal(`<div class="eyebrow">New journal moment</div><h2>What happened today?</h2><textarea id="journalText" class="search" style="min-height:110px" placeholder="A new flower, something you pruned, a little garden win…"></textarea><button class="btn primary" style="width:100%" onclick="saveJournal()">Save moment</button>`); }
function saveJournal(){
  const text=document.getElementById("journalText").value.trim(); if(!text) return;
  state.journal.unshift({date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"}),icon:"✿",title:"Garden note",text});
  saveState(); closeModal(); renderJournal();
}
function addJournalForPlant(id){ const p=state.plants.find(x=>x.id===id); modal(`<div class="eyebrow">${esc(p.common)}</div><h2>Add to its story</h2><textarea id="journalText" class="search" style="min-height:110px" placeholder="What did you notice?"></textarea><button class="btn primary" style="width:100%" onclick="saveJournal();">Save moment</button>`); }

function renderDiscover(){
  view.innerHTML=`
    <section class="page-head"><div class="eyebrow">Saved inspiration</div><h1>Discover</h1><p class="sub">Plants you've spotted, loved or want to remember.</p></section>
    <div class="stats-strip"><div class="stat"><b>${state.discoveries}</b><small>discoveries</small></div><div class="stat"><b>5</b><small>families</small></div><div class="stat"><b>3</b><small>wishlist</small></div></div>
    <div class="empty-card" style="text-align:center;padding:38px 22px"><div style="font-size:52px;color:var(--rose)">❀</div><h2 style="font-size:27px">Your botanical scrapbook</h2><p class="sub">When you identify something away from home, save it here instead of adding it to your garden.</p><button class="btn primary" onclick="setRoute('lens')">Find something</button></div>`;
}

function showLensTips(){ modal(`<div class="eyebrow">Photo tips</div><h2>Help FloraLens see clearly</h2><p class="sub">Fill most of the frame with the plant, use good light, avoid motion blur, and photograph a distinctive flower or leaf. For tricky plants, add more than one plant part.</p><button class="btn primary" style="width:100%" onclick="closeModal()">Got it</button>`); }
function modal(html){ document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">${html}</div></div>`); }
function closeModal(){ document.getElementById("modal")?.remove(); }

document.addEventListener("click",e=>{
  const route=e.target.closest("[data-route]")?.dataset.route;
  if(route) setRoute(route);
});
cameraInput.addEventListener("change",e=>handlePhoto(e.target.files[0]));
galleryInput.addEventListener("change",e=>handlePhoto(e.target.files[0]));

renderHome();
