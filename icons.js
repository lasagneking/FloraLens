/* FloraLens 2.0 — icon layer
   Replaces the old text glyphs (☀ 💧 ✂ ❧ …) with crisp SVG icons wherever they
   appear, including content rendered later by app.js. The parent element gets a
   data-ico attribute so styles.css can give each kind of icon its own colour. */
(function(){
  const P = {
    home:'<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9"/>',
    leaf:'<path d="M5 19.5C4.5 11 10 5 20 4c-.3 9.5-6 15.2-15 15.5z"/><path d="M5 19.5c3.2-4.6 6.5-7.6 10.5-9.8"/>',
    scan:'<path d="M4 8.5V6.5A2.5 2.5 0 0 1 6.5 4h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2"/><circle cx="12" cy="12" r="3.6"/>',
    book:'<path d="M12 6.5C10.4 5 8.2 4.3 4.5 4.5v14c3.7-.2 5.9.5 7.5 2 1.6-1.5 3.8-2.2 7.5-2v-14c-3.7-.2-5.9.5-7.5 2z"/><path d="M12 6.5v14"/>',
    heart:'<path d="M12 20s-7.6-4.6-9.2-9.5C1.7 7.2 3.9 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.1 0 5.3 2.7 4.2 6C19.6 15.4 12 20 12 20z"/>',
    sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    drop:'<path d="M12 3.2s6.3 6.6 6.3 11.3a6.3 6.3 0 0 1-12.6 0C5.7 9.8 12 3.2 12 3.2z"/><path d="M9.2 15.2a2.9 2.9 0 0 0 2.6 2.6"/>',
    soil:'<path d="M3 15.5h18"/><path d="M6 19h2M11 19h3M17 19h1.5M8.5 21.5h2M14 21.5h2"/><path d="M12 15.5V10"/><path d="M12 10.5c-2.7 0-4.4-1.8-4.4-4.4 2.7 0 4.4 1.8 4.4 4.4zM12 10.5c2.7 0 4.4-1.8 4.4-4.4-2.7 0-4.4 1.8-4.4 4.4z"/>',
    snow:'<path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8"/><path d="m9.3 4.2 2.7 2 2.7-2M9.3 19.8l2.7-2 2.7 2"/>',
    height:'<path d="M12 3.5v17M8 7.5l4-4 4 4M8 16.5l4 4 4-4"/>',
    scissors:'<circle cx="6" cy="6.5" r="2.8"/><circle cx="6" cy="17.5" r="2.8"/><path d="M8.3 8.2 20 19.5M8.3 15.8 20 4.5"/>',
    sprout:'<path d="M12 21v-9"/><path d="M12 12.5c-3.4 0-5.6-2.3-5.6-5.6 3.4 0 5.6 2.3 5.6 5.6zM12 10c0-3 2-5 5.2-5 0 3-2 5-5.2 5z"/>',
    flower:'<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c-1.9 0-3-1.3-3-3s1.3-3.1 3-3.1 3 1.4 3 3.1-1.1 3-3 3zM12 14.4c1.9 0 3 1.3 3 3s-1.3 3.1-3 3.1-3-1.4-3-3.1 1.1-3 3-3zM9.6 12c0-1.9-1.3-3-3-3S3.5 10.3 3.5 12s1.4 3 3.1 3 3-1.1 3-3zM14.4 12c0 1.9 1.3 3 3 3s3.1-1.3 3.1-3-1.4-3-3.1-3-3 1.1-3 3z"/>',
    tulip:'<path d="M12 21v-8.5"/><path d="M7 4.5 9.5 7 12 3.5 14.5 7 17 4.5V8a5 5 0 0 1-10 0z"/><path d="M12 18c-1.8-2.4-4.5-3-6.8-2.2 1.1 2.4 3.9 3.3 6.8 2.2z"/>',
    pot:'<path d="M5 10h14l-1.5 9.3A2 2 0 0 1 15.5 21h-7a2 2 0 0 1-2-1.7z"/><path d="M4 10h16"/><path d="M12 10V7.5c0-2 1.4-3.5 3.8-3.5 0 2-1.4 3.5-3.8 3.5zm0 0C12 5.5 10.6 4 8.2 4c0 2 1.4 3.5 3.8 3.5z"/>',
    flask:'<path d="M9 3.5h6M10 3.5v5.8L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.3V3.5"/><path d="M7.2 15h9.6"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>',
    pencil:'<path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="m13.5 6.5 3 3"/>',
    alert:'<path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>',
    question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6v.4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    pulse:'<path d="M3 12h4l2.2-5 3.6 10 2.2-5H21"/>',
    trend:'<path d="m4 16.5 5.5-5.5 4 4L20 8.5"/><path d="M15 8.5h5v5"/>',
    wave:'<path d="M3 12c2-3.8 4-3.8 6 0s4 3.8 6 0 4-3.8 6 0"/>',
    tree:'<path d="M12 21v-5"/><path d="M12 3 6 10.5h2.8L5.5 16h13l-3.3-5.5H18z"/>',
    fruit:'<circle cx="8" cy="16.5" r="3.5"/><circle cx="16.5" cy="15" r="3.5"/><path d="M8 13c1-4 3.2-7 7.5-9M16.5 11.5c0-3-.6-5.5-1.5-7.5"/>',
    camera:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.6-2.5h5.2L16.2 7h2.3A1.5 1.5 0 0 1 20 8.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><circle cx="12" cy="13" r="3.5"/>',
    close:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    refresh:'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/>',
    download:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
    chevron:'<path d="m9.5 6 6 6-6 6"/>',
    back:'<path d="m14.5 6-6 6 6 6"/>',
    atlas:'<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H7a2 2 0 0 0-2 2z"/><path d="M5 19a2 2 0 0 0 2 2h12v-4"/><path d="M12 7.5v6M9 10.5h6"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    sparkle:'<path d="M12 3c.8 4.6 2.4 6.2 7 7-4.6.8-6.2 2.4-7 7-.8-4.6-2.4-6.2-7-7 4.6-.8 6.2-2.4 7-7z"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
    globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z"/>'
  };
  const FILLED = new Set(['heartFill']);

  // glyph → icon name
  const MAP = {
    '⌂':'home','❧':'leaf','⌾':'scan','☷':'book','♡':'heart','♥':'heartFill',
    '☀':'sun','💧':'drop','♧':'soil','❄':'snow','↕':'height','✂':'scissors',
    '🌱':'sprout','✿':'flower','❀':'flower','❦':'tulip','◌':'pot','◇':'flask',
    '⌕':'search','✎':'pencil','!':'alert','?':'question','◷':'clock','✓':'check',
    '＋':'plus','+':'plus','✚':'pulse','↗':'trend','⌁':'wave','♜':'tree','●':'fruit',
    '📷':'camera','×':'close','↻':'refresh','⇩':'download','→':'chevron','←':'back',
    '⌘':'atlas','☰':'menu','◎':'target','✦':'sparkle','▦':'grid'
  };

  function svg(name){
    if(name==='heartFill') return `<svg class="fl-ico fill" viewBox="0 0 24 24" aria-hidden="true">${P.heart}</svg>`;
    const body=P[name]; if(!body) return null;
    return `<svg class="fl-ico" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  }
  window.flIcon = svg;

  const SKIP = new Set(['SCRIPT','STYLE','TEXTAREA','OPTION','SELECT','INPUT','SVG','svg','CODE']);
  // Containers where a lone "!" or "?" or "+" really is an icon
  const SOLO_OK = /^(?:[⌂❧⌾☷♡♥☀💧♧❄↕✂🌱✿❀❦◌◇⌕✎◷✓＋✚↗⌁♜●📷×↻⇩→←⌘☰◎✦▦]|[!?+])$/u;
  const LEAD = /^\s*([⌂❧⌾☷♡♥☀💧♧❄↕✂🌱✿❀❦◌◇⌕✎◷✓＋✚↗⌁♜●📷×↻⇩←⌘◎✦▦])\s+(?=\S)/u;
  const TRAIL = /\s+→\s*$/u;

  function nameFor(g){ return MAP[g] || null; }

  function processEl(el){
    if(!el || el.nodeType!==1 || SKIP.has(el.tagName)) return;
    // Case 1: element whose only content is a single glyph
    if(el.childNodes.length===1 && el.firstChild.nodeType===3){
      const t=el.firstChild.nodeValue.trim();
      if(SOLO_OK.test(t)){
        // Only treat "!", "?" and "+" as icons inside small icon containers
        if(/^[!?+]$/.test(t) && !el.matches('.plant-today-mark,.zone-icon,.pruning-assistant-head>span,.timeline-icon,.care-icon')) return;
        const n=nameFor(t), s=n&&svg(n);
        if(s){ el.innerHTML=s; el.dataset.ico=n; return; }
      }
    }
    // Case 2: text nodes starting with "glyph + space" (buttons, chips, labels)
    for(const node of [...el.childNodes]){
      if(node.nodeType!==3) continue;
      const v=node.nodeValue;
      // Case 3: a lone glyph text node sitting beside other elements ("✿<span>Flowering</span>")
      const lone=v.trim();
      if(lone && el.childNodes.length>1 && SOLO_OK.test(lone) && (!/^[!?+]$/.test(lone) || el.matches('.journal-type-choice'))){
        const n=nameFor(lone), s=n&&svg(n);
        if(s){
          const span=document.createElement('span');
          span.className='fl-ico-wrap'; span.innerHTML=s;
          el.replaceChild(span,node);
          if(!el.dataset.ico) el.dataset.ico=n;
          continue;
        }
      }
      const m=v.match(LEAD);
      if(m){
        const n=nameFor(m[1]), s=n&&svg(n);
        if(s){
          const span=document.createElement('span');
          span.className='fl-ico-wrap';
          span.innerHTML=s; span.firstChild.classList.add('fl-ico-inline');
          node.nodeValue=v.slice(m[0].length);
          el.insertBefore(span,node);
          if(!el.dataset.ico) el.dataset.ico=n;
        }
      }
      // trailing arrows on links ("View Rose →", "Open Care Calendar →")
      if(TRAIL.test(node.nodeValue)) node.nodeValue=node.nodeValue.replace(TRAIL,'');
    }
  }
  function walk(root){
    if(!root || root.nodeType!==1) return;
    processEl(root);
    root.querySelectorAll('*').forEach(processEl);
  }

  let queued=false;
  const pending=new Set();
  const flush=()=>{queued=false;pending.forEach(walk);pending.clear();};
  const obs=new MutationObserver(muts=>{
    for(const m of muts){
      if(m.type==='childList'){
        m.addedNodes.forEach(n=>{ if(n.nodeType===1) pending.add(n); else if(n.parentElement) pending.add(n.parentElement); });
      }else if(m.type==='characterData' && m.target.parentElement){
        pending.add(m.target.parentElement);
      }
    }
    if(!queued && pending.size){queued=true;queueMicrotask(flush);}
  });
  function start(){
    walk(document.body);
    obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
