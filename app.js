const STORAGE_KEY = "floralens.v2";
const PHOTO_DB = "floralens-photos";
const PHOTO_STORE = "photos";

/*
  Set this to your deployed Cloudflare Worker URL after setup, e.g.
  const API_PROXY_URL = "https://floralens-api.yourname.workers.dev";
  Never put your Pl@ntNet API key in this browser file.
*/
const API_PROXY_URL = "https://floralens-api.lrthumwood.workers.dev";


const FLORALENS_CARE_LIBRARY = {
  // Species-first, then genus fallbacks. This is deliberately modest and labelled
  // separately from third-party botanical data.
  "lavandula angustifolia": {
    commonName: "English lavender",
    light: "Full sun",
    water: "Water while establishing; once established, water sparingly and avoid prolonged wet soil.",
    soil: "Free-draining soil; performs well in neutral to alkaline conditions.",
    height: "About 40–90 cm, depending on cultivar and conditions",
    bloomMonths: [6,7,8],
    growthHabit: "Woody, aromatic evergreen subshrub",
    pruning: "Trim after flowering, keeping some green growth below the cut. Avoid cutting hard into old bare wood.",
    propagation: "Semi-ripe cuttings in summer are a reliable method.",
    hardiness: "Generally hardy in UK gardens when drainage is good.",
    seasonal: {
      spring: "Remove winter damage and tidy lightly once strong new growth is visible.",
      summer: "Enjoy flowering; deadhead or trim after the main flush if a compact shape is wanted.",
      autumn: "Avoid heavy pruning late in the year.",
      winter: "Protect from waterlogged soil; cold combined with wet roots is more troublesome than cold alone."
    }
  },
  "lavandula": {
    light: "Full sun",
    water: "Low to moderate once established; avoid waterlogging.",
    soil: "Very free-draining soil is important.",
    growthHabit: "Aromatic evergreen or semi-evergreen subshrub",
    pruning: "Trim after flowering rather than cutting hard into old woody stems.",
    hardiness: "Varies by species and cultivar; drainage is especially important in winter."
  },
  "hydrangea macrophylla": {
    commonName: "Mophead / lacecap hydrangea",
    light: "Part shade or gentle sun; shelter from intense drying heat.",
    water: "Keep evenly moist, especially in warm weather and while establishing.",
    soil: "Moist but well-drained, humus-rich soil.",
    height: "Commonly around 1–2 m",
    bloomMonths: [7,8,9],
    growthHabit: "Deciduous flowering shrub",
    pruning: "Prune lightly in spring, removing old flowerheads and dead wood. Many cultivars flower on older stems, so avoid indiscriminate hard pruning.",
    propagation: "Softwood cuttings are commonly taken in summer.",
    hardiness: "Generally hardy in much of the UK; young growth can be damaged by late frost."
  },
  "hydrangea": {
    light: "Part shade to sun, with more shelter in hotter/drier positions.",
    water: "Usually prefers consistent moisture.",
    soil: "Moist but well-drained, humus-rich soil.",
    growthHabit: "Usually a deciduous shrub or climber",
    hardiness: "Varies by species and cultivar."
  },
  "rosa": {
    light: "Full sun is best for most roses; some tolerate light shade.",
    water: "Water deeply in dry spells, especially newly planted roses.",
    soil: "Fertile, moisture-retentive but well-drained soil.",
    growthHabit: "Deciduous flowering shrub or climber",
    pruning: "Main pruning is usually carried out in the dormant season; exact technique depends on whether the rose is shrub, climbing or rambling.",
    propagation: "Hardwood or semi-ripe cuttings can be used, though named cultivars may not always come true from seed.",
    hardiness: "Many garden roses are hardy across much of the UK, but cultivar differences matter."
  },
  "rosmarinus officinalis": {
    commonName: "Rosemary",
    light: "Full sun",
    water: "Low to moderate once established; avoid persistently wet roots.",
    soil: "Free-draining soil.",
    height: "Usually around 0.8–1.5 m, depending on cultivar",
    bloomMonths: [3,4,5,6],
    growthHabit: "Aromatic evergreen shrub",
    pruning: "Trim lightly after flowering to keep compact; avoid cutting back into old bare wood.",
    propagation: "Semi-ripe cuttings root readily in summer.",
    hardiness: "Generally hardy in sheltered UK gardens with good drainage."
  },
  "salvia rosmarinus": {
    commonName: "Rosemary",
    light: "Full sun",
    water: "Low to moderate once established; avoid persistently wet roots.",
    soil: "Free-draining soil.",
    height: "Usually around 0.8–1.5 m, depending on cultivar",
    bloomMonths: [3,4,5,6],
    growthHabit: "Aromatic evergreen shrub",
    pruning: "Trim lightly after flowering to keep compact; avoid cutting back into old bare wood.",
    propagation: "Semi-ripe cuttings root readily in summer.",
    hardiness: "Generally hardy in sheltered UK gardens with good drainage."
  },
  "digitalis purpurea": {
    commonName: "Foxglove",
    light: "Part shade to sun",
    water: "Moderate; avoid prolonged drought while establishing.",
    soil: "Moist but well-drained soil with organic matter.",
    height: "Often around 1–1.5 m in flower",
    bloomMonths: [5,6,7],
    growthHabit: "Usually biennial or short-lived perennial",
    pruning: "Remove spent spikes to reduce self-seeding, or leave some if you want naturalised seedlings.",
    hardiness: "Hardy in UK conditions.",
    safety: "Toxic if eaten. Keep away from children and pets that may ingest plants."
  },
  "buxus sempervirens": {
    commonName: "Common box",
    light: "Sun to shade",
    water: "Moderate; established plants tolerate some dryness.",
    soil: "Well-drained soil; avoid persistently waterlogged ground.",
    height: "Can exceed 2 m untrimmed, but commonly kept much smaller",
    growthHabit: "Dense evergreen shrub",
    pruning: "Clip during the growing season for formal shapes, avoiding very hot dry weather.",
    hardiness: "Hardy in UK gardens.",
    safety: "All parts are harmful if eaten."
  }
};

function floralensCareFor(scientificName=""){
  const n=String(scientificName).toLowerCase().trim();
  if(FLORALENS_CARE_LIBRARY[n]) return {...FLORALENS_CARE_LIBRARY[n], source:"FloraLens care library"};
  const genus=n.split(/\s+/)[0];
  if(genus && FLORALENS_CARE_LIBRARY[genus]) return {...FLORALENS_CARE_LIBRARY[genus], source:"FloraLens care library · genus guidance"};
  return null;
}

function seasonKey(){
  const m=new Date().getMonth()+1;
  if([3,4,5].includes(m)) return "spring";
  if([6,7,8].includes(m)) return "summer";
  if([9,10,11].includes(m)) return "autumn";
  return "winter";
}

function usable(v){
  if(v===null||v===undefined||v==="") return null;
  const s=String(v).trim();
  if(!s) return null;
  if(["not available","care detail not yet available","gathering botanical notes…","gathering botanical notes..."].includes(s.toLowerCase())) return null;
  return v;
}

function perenualHeight(p){
  if(!p || (p.dimensionMin===null && p.dimensionMax===null)) return null;
  const unit=p.dimensionUnit||"";
  if(p.dimensionMin!==null && p.dimensionMax!==null) return `${p.dimensionMin}–${p.dimensionMax} ${unit}`.trim();
  const v=p.dimensionMax ?? p.dimensionMin;
  return `${v} ${unit}`.trim();
}
function perenualSun(p){
  if(!p?.sunlight?.length) return null;
  return p.sunlight.map(x=>String(x).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())).join(" · ");
}
function perenualWater(p){
  if(!p) return null;
  if(p.wateringGeneralBenchmark?.value && p.wateringGeneralBenchmark?.unit)
    return `${p.watering || "Water"} · about every ${p.wateringGeneralBenchmark.value} ${p.wateringGeneralBenchmark.unit}`;
  return usable(p.watering);
}
function perenualSoil(p){
  return p?.soil?.length ? p.soil.join(" · ") : null;
}
function perenualHardiness(p){
  if(!p || (p.hardinessMin===null && p.hardinessMax===null)) return null;
  if(p.hardinessMin!==null && p.hardinessMax!==null) return `USDA zones ${p.hardinessMin}–${p.hardinessMax}`;
  return `USDA zone ${p.hardinessMin ?? p.hardinessMax}`;
}
function floweringSeasonMonths(season){
  const s=String(season||"").toLowerCase();
  if(s.includes("spring")) return [3,4,5];
  if(s.includes("summer")) return [6,7,8];
  if(s.includes("autumn")||s.includes("fall")) return [9,10,11];
  if(s.includes("winter")) return [12,1,2];
  return [];
}

function resolvedCare(scientificName,t,pn){
  const local=floralensCareFor(scientificName);
  const trefleSoil = t ? usable(soilLabel(t)) : null;

  const pCare={
    light: usable(perenualSun(pn)),
    water: usable(perenualWater(pn)),
    soil: usable(perenualSoil(pn)),
    height: usable(perenualHeight(pn)),
    bloomMonths: floweringSeasonMonths(pn?.floweringSeason),
    growthHabit: usable(pn?.type),
    growthRate: usable(pn?.growthRate),
    hardiness: usable(perenualHardiness(pn)),
    safety: pn?.poisonousToHumans===true || pn?.poisonousToPets===true
      ? `Recorded as poisonous${pn.poisonousToHumans===true?" to humans":""}${pn.poisonousToHumans===true&&pn.poisonousToPets===true?" and":""}${pn.poisonousToPets===true?" to pets":""}.`
      : null
  };

  const tCare={
    light: t?.light!==null && t?.light!==undefined ? usable(lightLabel(t.light)) : null,
    water: t?.soilHumidity!==null && t?.soilHumidity!==undefined ? usable(moistureLabel(t.soilHumidity)) : null,
    soil: trefleSoil,
    height: t && (t.averageHeightCm||t.maximumHeightCm) ? usable(formatHeight(t.averageHeightCm,t.maximumHeightCm)) : null,
    bloomMonths: t?.bloomMonths?.length ? monthsToNumbers(t.bloomMonths) : [],
    growthHabit: usable(t?.growthHabit),
    growthRate: usable(t?.growthRate),
    hardiness: t?.minimumTemperatureC!==null && t?.minimumTemperatureC!==undefined ? `Recorded minimum temperature ${t.minimumTemperatureC}°C` : null,
    safety: toxicityCopy(t)
  };

  const pick=(k)=>usable(pCare[k]) || usable(tCare[k]) || usable(local?.[k]) || null;
  const bloom = pCare.bloomMonths?.length ? pCare.bloomMonths :
                tCare.bloomMonths?.length ? tCare.bloomMonths :
                local?.bloomMonths || [];

  return {
    light:pick("light"), water:pick("water"), soil:pick("soil"), height:pick("height"),
    bloomMonths:bloom,
    growthHabit:pick("growthHabit"), growthRate:pick("growthRate"),
    pruning:usable(local?.pruning), propagation:usable(local?.propagation),
    hardiness:pick("hardiness"), safety:pCare.safety || tCare.safety || usable(local?.safety),
    seasonal:local?.seasonal||null,
    localSource:local?.source||null,
    usedPerenual:!!pn && Object.values(pCare).some(v=>Array.isArray(v)?v.length:!!v),
    usedTrefle:!!t && Object.values(tCare).some(v=>Array.isArray(v)?v.length:!!v),
    usedLocal:!!local
  };
}


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

async function enrichSpecies(scientificName, speciesKey, force=false){
  const cached=state.speciesCache[speciesKey]||{};
  if(!force && cached.enrichment?.fetchedAt) return cached.enrichment;
  try{
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/enrich?name=${encodeURIComponent(scientificName)}`);
    if(!res.ok) throw new Error(`Botanical notes failed (${res.status})`);
    const data=await res.json();
    const enrichment={...data,fetchedAt:new Date().toISOString()};
    state.speciesCache[speciesKey]={...cached,enrichment,source:[...(data.sources||[]),"Pl@ntNet"].join(" + "),fetchedAt:new Date().toISOString()};
    saveState();
    syncPlantsFromSpecies(speciesKey);
    return enrichment;
  }catch(err){
    console.warn("Enrichment failed",err);
    state.speciesCache[speciesKey]={...cached,enrichmentError:String(err.message||err)};
    saveState();
    return null;
  }
}

function syncPlantsFromSpecies(speciesKey){
  const cache=state.speciesCache[speciesKey];
  if(!cache) return;
  const intel=cache.enrichment||{};
  state.plants.filter(p=>p.speciesKey===speciesKey).forEach(p=>{
    const care=resolvedCare(p.scientific,intel.trefle||null,intel.perenual||null);
    if(care.bloomMonths?.length) p.bloom=care.bloomMonths;
    if(care.height) p.height=care.height;
    if(care.light) p.sun=care.light;
    if(care.water) p.water=care.water;
    if(care.soil) p.soil=care.soil;
    const desc=intel.perenual?.description||intel.trefle?.growthDescription||intel.trefle?.observations;
    if(desc) p.notes=desc;
  });
  saveState();
}

async function confirmPlant(){
  const r=pendingResults[0], x=resultInfo(r);
  const speciesKey=slug(x.sci);
  if(!state.speciesCache[speciesKey]){
    state.speciesCache[speciesKey]={scientific:x.sci,common:x.common,family:x.family,genus:x.genus,source:"Pl@ntNet identification",fetchedAt:new Date().toISOString(),enrichment:null};
  }
  const id="plant-"+Date.now(), photoKey=`${id}-hero`;
  try{ await savePhoto(photoKey,captures[0].file); }catch(e){ console.warn("Photo storage failed",e); }
  const cached=state.speciesCache[speciesKey]||{};
  state.plants.unshift({id,speciesKey,photoKey,common:x.common,scientific:x.sci,family:x.family,area:chosenArea,status:"New",added:new Date().toISOString().slice(0,10),notes:cached.notes||"Newly identified with FloraLens.",sun:cached.sun||"Gathering botanical notes…",water:cached.water||"Gathering botanical notes…",soil:cached.soil||"Gathering botanical notes…",height:cached.height||"Gathering botanical notes…",bloom:cached.bloom||[]});
  saveState(); closeModal(); captures=[]; toast(`${x.common} saved to ${chosenArea}`);
  await renderProfile(id,true);
  const existing=state.speciesCache[speciesKey]?.enrichment;
  if(!existing){
    const intel=await enrichSpecies(x.sci,speciesKey);
    if(intel){ toast("Botanical notes added"); await renderProfile(id,false); }
  }
}

function monthsToNumbers(months=[]){
  const map={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,september:9,sept:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
  return months.map(m=>map[String(m).toLowerCase()]).filter(Boolean);
}
function formatHeight(avg,max){
  const vals=[avg,max].filter(v=>typeof v==="number"&&v>0);
  if(!vals.length)return "Not available";
  if(vals.length===1)return vals[0]>=100?`${(vals[0]/100).toFixed(vals[0]%100?1:0)} m`:`${Math.round(vals[0])} cm`;
  const a=vals[0]>=100?`${(vals[0]/100).toFixed(1)} m`:`${Math.round(vals[0])} cm`;
  const b=vals[1]>=100?`${(vals[1]/100).toFixed(1)} m`:`${Math.round(vals[1])} cm`;
  return `${a} avg · ${b} max`;
}
function lightLabel(v){ if(v===null||v===undefined)return "Not available"; if(v>=8)return "Full sun"; if(v>=5)return "Sun to part shade"; if(v>=3)return "Part shade"; return "Shade / low light"; }
function moistureLabel(v){ if(v===null||v===undefined)return "Not available"; if(v<=2)return "Dry / drought-tolerant"; if(v<=4)return "Allow some drying"; if(v<=7)return "Even moisture"; return "Moist to wet"; }
function soilLabel(t){
  const bits=[];
  if(t.phMinimum!==null||t.phMaximum!==null){
    const lo=t.phMinimum??"—", hi=t.phMaximum??"—"; bits.push(`pH ${lo}–${hi}`);
  }
  if(t.soilTexture!==null){
    bits.push(t.soilTexture<=3?"Finer / clay-leaning":t.soilTexture>=7?"Coarser / free-draining":"Balanced texture");
  }
  return bits.join(" · ")||"Not available";
}
function toxicityCopy(t){
  if(!t || !t.toxicity) return null;
  const level=String(t.toxicity).toLowerCase();
  if(level==="none") return "Trefle records no known toxicity in its plant specification.";
  return `Trefle records ${level} relative toxicity. Treat this as a caution flag, not medical or veterinary advice.`;
}
function currentSeasonNote(t,p){
  const month=new Date().getMonth()+1;
  const bloom=monthsToNumbers(t?.bloomMonths||p.bloom||[]);
  const growth=monthsToNumbers(t?.growthMonths||[]);
  if(bloom.includes(month)) return {title:"In its flowering window",text:"This species is recorded as typically blooming around this time of year."};
  if(growth.includes(month)) return {title:"Active growth time",text:"This month falls within the species' recorded active-growth period."};
  if(bloom.length){
    const next=bloom.find(m=>m>month)||bloom[0];
    const names=["","January","February","March","April","May","June","July","August","September","October","November","December"];
    return {title:"Between flowering periods",text:`Its recorded flowering window next includes ${names[next]}.`};
  }
  return {title:"A quieter botanical note",text:"There isn't enough seasonal data yet to give this plant a reliable month-by-month status."};
}
function dataCoverage(t,g){
  const vals=[t?.light,t?.soilHumidity,t?.phMinimum,t?.phMaximum,t?.averageHeightCm,t?.maximumHeightCm,t?.bloomMonths?.length,t?.growthHabit,g?.family,g?.rank];
  const present=vals.filter(v=>v!==null&&v!==undefined&&v!==""&&v!==0).length;
  return Math.round((present/vals.length)*100);
}

async function refreshIntel(id){
  const p=state.plants.find(x=>x.id===id); if(!p)return;
  toast("Refreshing botanical notes…");
  const intel=await enrichSpecies(p.scientific,p.speciesKey,true);
  if(intel){ toast("Botanical notes refreshed"); renderProfile(id); }
  else toast("Couldn’t refresh botanical notes");
}

async function renderProfile(id,isNew=false){
  currentRoute="profile";
  const p=state.plants.find(x=>x.id===id); if(!p)return setRoute("garden");
  const cached=state.speciesCache[p.speciesKey]||{};
  const intel=cached.enrichment||null;
  const t=intel?.trefle||null;
  const pn=intel?.perenual||null;
  const g=intel?.gbif||null;
  const care=resolvedCare(p.scientific,t,pn);
  const sourceNames=[...(intel?.sources||[])];
  if(care.localSource && !sourceNames.includes(care.localSource)) sourceNames.push(care.localSource);
  const bloom=care.bloomMonths?.length?care.bloomMonths:(p.bloom||[]);
  const desc=pn?.description||t?.growthDescription||t?.observations||g?.descriptions?.find(d=>d.description)?.description||p.notes;
  const currentSeason=seasonKey();
  const seasonalLocal=care.seasonal?.[currentSeason]||null;
  const taxonConfirmed=!!(g||t);
  const careAvailable=[care.light,care.water,care.soil,care.height,care.growthHabit,care.pruning,care.hardiness].filter(Boolean).length;
  const careCoverage=Math.round((careAvailable/7)*100);

  let intelTitle="Gathering botanical notes…";
  let intelText="FloraLens is building a reusable species record so this only has to happen once.";
  if(intel){
    if(careAvailable>=4){
      intelTitle="Growing guide ready";
      intelText=care.usedPerenual
        ?"FloraLens found horticultural care data for this species and combined it with the botanical record."
        :care.usedLocal
          ?"Connected botanical records were sparse, so FloraLens filled available gaps with its curated care library."
          :"Connected botanical sources supplied useful growing information for this species.";
    }else if(taxonConfirmed){
      intelTitle="Botanical record found";
      intelText="The species is confirmed, but detailed horticultural care information is still limited for this plant.";
    }
  }

  view.innerHTML=`<section class="page-head"><button class="link-btn" onclick="setRoute('garden')">← My Garden</button></section>
    <div class="result-hero" id="profileHero" style="min-height:390px"><div class="plant-art ${p.art||""}" style="position:absolute;inset:0"></div><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${esc(p.family)}</div><h1>${esc(p.common)}</h1><em>${esc(p.scientific)}</em><br><span class="confidence">♡ ${esc(p.area)}</span></div></div>

    <div class="intel-banner ${!intel?"loading":""}">
      <div class="eyebrow">Botanical intelligence</div>
      <h2 style="font-size:24px;margin:5px 0">${esc(intelTitle)}</h2>
      <p class="small">${esc(intelText)}</p>
      ${intel?`<div class="coverage"><span style="width:${careCoverage}%"></span></div>
      <div class="small" style="margin-top:6px">${careCoverage}% of core care fields available</div>
      <div class="source-row">${sourceNames.map(s=>`<span class="source-pill">${esc(s)}</span>`).join("")}</div>
      <div class="action-row"><button class="mini-action" onclick="refreshIntel('${p.id}')">↻ Refresh notes</button><button class="mini-action" onclick="exportBackup()">⇩ Backup garden</button></div>`:""}
    </div>

    <section style="padding:10px 2px 0"><div class="eyebrow">Meet ${esc(p.common)}</div><h2 style="margin-top:6px">A little about this plant</h2><p class="sub">${esc(desc||"The species is identified, but the connected botanical records do not currently include a fuller description.")}</p><div class="species-cache">Species record: ${esc(p.speciesKey||"")} · ${cached.fetchedAt?new Date(cached.fetchedAt).toLocaleDateString("en-GB"):"local"}</div></section>

    <div class="season-card"><div class="eyebrow">Right now</div><h2>${seasonalLocal?"Seasonal care":"Seasonal note"}</h2><p class="sub" style="margin:0">${esc(seasonalLocal||currentSeasonNote(t,p).text)}</p></div>

    <div class="care-grid">
      <div class="care-tile"><span class="care-icon">☀</span><b>Light</b><small>${esc(care.light||"Care detail not yet available")}</small></div>
      <div class="care-tile"><span class="care-icon">💧</span><b>Water</b><small>${esc(care.water||"Care detail not yet available")}</small></div>
      <div class="care-tile"><span class="care-icon">♧</span><b>Soil</b><small>${esc(care.soil||"Care detail not yet available")}</small></div>
      <div class="care-tile"><span class="care-icon">↕</span><b>Size</b><small>${esc(care.height||"Care detail not yet available")}</small></div>
      ${care.growthHabit?`<div class="care-tile"><span class="care-icon">❧</span><b>Growth habit</b><small>${esc(care.growthHabit)}</small></div>`:""}
      ${care.hardiness?`<div class="care-tile"><span class="care-icon">❄</span><b>Hardiness</b><small>${esc(care.hardiness)}</small></div>`:""}
      ${care.pruning?`<div class="care-tile care-wide"><span class="care-icon">✂</span><b>Pruning</b><small>${esc(care.pruning)}</small></div>`:""}
      ${care.propagation?`<div class="care-tile care-wide"><span class="care-icon">🌱</span><b>Propagation</b><small>${esc(care.propagation)}</small></div>`:""}
    </div>

    <div class="profile-card"><div class="eyebrow">In bloom</div><h2 style="font-size:25px;margin-top:6px">Flowering year</h2><div class="months">${["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>`<div class="month ${bloom.includes(i+1)?"on":""}">${m}</div>`).join("")}</div>${!bloom.length?`<p class="small data-missing">Flowering months are not yet available for this plant.</p>`:""}</div>

    ${(care.growthHabit||care.growthRate||t?.flowerColors?.length||t?.foliageColors?.length)?`<div class="profile-card"><div class="eyebrow">How it grows</div><h2 style="font-size:25px;margin-top:6px">Botanical details</h2><div class="fact-list">
      ${care.growthHabit?`<div class="fact-row"><span class="fact-icon">❧</span><div><b>Habit</b><div class="small">${esc(care.growthHabit)}</div></div></div>`:""}
      ${care.growthRate?`<div class="fact-row"><span class="fact-icon">↗</span><div><b>Growth rate</b><div class="small">${esc(care.growthRate)}</div></div></div>`:""}
      ${t?.flowerColors?.length?`<div class="fact-row"><span class="fact-icon">✿</span><div><b>Flower colours</b><div class="small">${esc(t.flowerColors.join(", "))}</div></div></div>`:""}
      ${t?.foliageColors?.length?`<div class="fact-row"><span class="fact-icon">❧</span><div><b>Foliage</b><div class="small">${esc(t.foliageColors.join(", "))}</div></div></div>`:""}
    </div></div>`:""}

    ${care.safety?`<div class="good-know"><div class="eyebrow">Good to know</div><h2 style="font-size:25px;margin:5px 0 7px">Safety</h2><p class="sub" style="margin:0">${esc(care.safety)}</p></div>`:""}

    ${care.usedLocal?`<div class="good-know"><div class="eyebrow">About these care notes</div><p class="sub" style="margin:0">Some horticultural details come from FloraLens' curated care library because the connected botanical APIs returned incomplete care fields. Species-specific API data takes priority whenever it is available.</p></div>`:""}

    <div class="section-title"><h3>Our story</h3><button class="link-btn" onclick="addJournalForPlant('${p.id}')">＋ Add moment</button></div>
    <div class="profile-card"><div class="timeline-item"><div class="timeline-icon">✿</div><div><b>Added to FloraLens</b><div class="small">${esc(p.added)}</div></div></div><div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Plant profile created</b><div class="small">Its original identification photo is stored on this device.</div></div></div>${intel?`<div class="timeline-item"><div class="timeline-icon">❧</div><div><b>Botanical record enriched</b><div class="small">${new Date(intel.fetchedAt).toLocaleDateString("en-GB")} · ${sourceNames.map(esc).join(" + ")||"connected sources"}</div></div></div>`:""}</div>`;

  if(p.photoKey){
    const url=await getPhotoUrl(p.photoKey);
    if(url){ document.querySelector("#profileHero .plant-art")?.remove(); profileHero.insertAdjacentHTML("afterbegin",`<img class="photo-hero" src="${url}" alt="${esc(p.common)}">`); }
  }
}
async function exportBackup(){
  try{
    const photos={};
    for(const p of state.plants){
      if(!p.photoKey) continue;
      const db=await photoDB();
      const blob=await new Promise((resolve,reject)=>{
        const tx=db.transaction(PHOTO_STORE,"readonly");
        const req=tx.objectStore(PHOTO_STORE).get(p.photoKey);
        req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
      });
      if(blob) photos[p.photoKey]=await blobToDataUrl(blob);
    }
    const payload={format:"FloraLens Backup",version:3,exportedAt:new Date().toISOString(),state,photos};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`FloraLens-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    toast("Garden backup created");
  }catch(err){ console.error(err); toast("Backup couldn’t be created"); }
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});}

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


function refreshStoredCareFields(){
  let changed=false;
  for(const p of state.plants){
    const intel=state.speciesCache[p.speciesKey]?.enrichment||null;
    const care=resolvedCare(p.scientific,intel?.trefle||null,intel?.perenual||null);
    const set=(k,v)=>{ if(usable(v) && p[k]!==v){p[k]=v;changed=true;} };
    set("sun",care.light); set("water",care.water); set("soil",care.soil); set("height",care.height);
    if(care.bloomMonths?.length && JSON.stringify(p.bloom)!==JSON.stringify(care.bloomMonths)){p.bloom=care.bloomMonths;changed=true;}
  }
  if(changed) saveState();
}

menuBtn?.addEventListener("click",()=>{
  modal(`<div class="eyebrow">FloraLens</div><h2>Garden tools</h2><div class="backup-card"><b>Keep your garden safe</b><p class="small">Export a single backup containing plant records, journal data, species intelligence and locally stored hero photos.</p><button class="btn primary" style="width:100%" onclick="exportBackup();closeModal()">⇩ Export backup</button></div><div class="small">FloraLens v0.3 · private botanical journal</div>`);
});

refreshStoredCareFields();
renderHome();
