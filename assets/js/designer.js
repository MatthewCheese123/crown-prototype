/* v9.5 phase 2: the shared designer shell ("iPhone-simple", Sebastian 4.7 + Leo game-UI v1/v2/Area 4 v1-v2).
   One component for every page with a .ccfg designer (23 gazebos, 5 garden rooms). It reuses each page's own logic and prices
   (mp-cfg / hp-cfg / sg-cfg / generator / ct-cfg): steps are the page's own tab panels, and every option tap is the page's own button.
   Adds: start screen, one decision per screen with "STEP x OF n" + 4px progress, green Next / plain Back, one 72px price bar fixed to
   the screen bottom, +£x delta chip, Undo toast, autosave (localStorage crown.designs), radial bay picker for Sides, Review ("Nearly there")
   with one gold per screen: on Review that is Send (v9.8); Book a visit is outline. Then the save point after sending. Nothing here changes a price. */
(function(){
"use strict";
var root=document.querySelector(".ccfg"); if(!root||root.hasAttribute("data-dz")) return; root.setAttribute("data-dz","");
var html=document.documentElement, sec=root.closest("section")||root.parentNode; sec.classList.add("dz-sec");
var $=function(s,c){return (c||root).querySelector(s)}, $$=function(s,c){return [].slice.call((c||root).querySelectorAll(s))};
var RM=matchMedia("(prefers-reduced-motion: reduce)"), PH=matchMedia("(max-width:600px)");
var gbp=function(n){return "£"+Math.round(Math.abs(n)).toLocaleString("en-GB")};
var esc=function(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")};
var IMG=(function(){var l=document.querySelector('link[href*="assets/css/"]');return l?l.getAttribute("href").split("assets/css/")[0]+"assets/img/":"../../assets/img/"})();
var BASE=IMG.replace(/assets\/img\/$/,"");
/* ---------- adapters ---------- */
var H=root.hasAttribute("data-hpcfg")?(window.__mpcfg||window.__hpcfg):null;
var SIDES=function(){return window.__mpsides||window.__hpsides||null};
var hd=$("h2",sec)||document.querySelector("h1"), NAME=((sec.querySelector(".chead h2")||{}).textContent||"").replace(/^\s*(Design|Price) your\s*/i,"").trim()||(H&&H.data&&H.data.name)||"design";
if(H&&H.data&&H.data.name) NAME=H.data.name; else if(!H){ var t1=(document.querySelector("h1")||{}).textContent||""; NAME=SLUGNAME() }
var SHORT=NAME.replace(/^Crown\s+/,""), SLUG=location.pathname.split("/").filter(Boolean).pop()||"design";
function SLUGNAME(){ var sl=location.pathname.split("/").filter(Boolean).pop()||""; return sl.split("-").map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(" ") }
var GAZ=/\/gazebos\//.test(location.pathname);
function price(){ if(H) return H.total(); var b=$("[data-sgo=price]")||$("[data-s=price]")||$("[data-cp=price]")||$(".bfoot .bfl [data-sgo],.bfoot .bfl b")||$(".bfoot .bfl"); var m=b&&b.textContent.match(/£\s?([\d,]+)/); return m?+m[1].replace(/,/g,""):null }
function radioKey(b){ var a=[]; [].forEach.call(b.attributes,function(x){ if(/^data-/.test(x.name)&&!/^data-(stage|cap|hpphoto)/.test(x.name)) a.push(x.name+"="+x.value) }); return a.sort().join("|") }
function snap(){ if(H){ var o=JSON.parse(JSON.stringify(H.state)); delete o.tab; return {hp:o} }
  var r=$$(".bp [role=radio][aria-checked=true]").map(radioKey), c={}; $$(".bp input[type=checkbox]").forEach(function(x,i){ c[radioKey(x)||("i"+i)]=x.checked });
  return {r:r,c:c} }
function same(a,b){ return JSON.stringify(a)===JSON.stringify(b) }
function restore(s){ if(!s) return;
  if(s.hp&&H){ var S=H.state, tab=S.tab; for(var k in s.hp) S[k]=s.hp[k]; S.tab=tab; var sd=SIDES(); if(sd&&S.bays) sd.set(S.bays); H.upd(); return }
  if(s.r){ var want={}; s.r.forEach(function(k){want[k]=1});
    $$(".bp [role=radio]").forEach(function(b){ if(want[radioKey(b)]&&b.getAttribute("aria-checked")!=="true") b.click() });
    $$(".bp input[type=checkbox]").forEach(function(x,i){ var k=radioKey(x)||("i"+i); if(k in s.c&&x.checked!==s.c[k]){ x.checked=s.c[k]; x.dispatchEvent(new Event("change",{bubbles:true})) } }) } }
/* ---------- steps from the page's own tabs ---------- */
var tabs=$$(".btabs [role=tab]");
var ALL=tabs.map(function(t,i){ var p=document.getElementById(t.getAttribute("aria-controls")); var nm=((t.querySelector("b")||t).textContent||"").trim();
  var kind=t.classList.contains("hpsum")?"summary":(p&&p.querySelector(".pkone")&&!p.querySelector("[role=radio]"))?"info":"step"; return {i:i,tab:t,panel:p,name:nm,kind:kind} });
var STEPS=ALL.filter(function(s){return s.kind==="step"&&s.panel&&!(/extra/i.test(s.name)&&!s.panel.querySelector("[role=radio],input,select,[aria-pressed]"))});
var SUMTAB=ALL.filter(function(s){return s.kind==="summary"})[0], INFO=ALL.filter(function(s){return s.kind==="info"})[0];
if(!STEPS.length) return;
/* v9.8.4 area 6C: Glazed / All-season get one "Package & colours" step; the swatches open under Furnished */
var MERGED=[]; (function(){ var p=STEPS.filter(function(s){return /package/i.test(s.name)&&/furnished/i.test(s.panel.textContent)&&s.panel.querySelectorAll("[role=radio]").length>1})[0], c=STEPS.filter(function(s){return /colour/i.test(s.name)})[0];
  if(p&&c&&STEPS.indexOf(c)===STEPS.indexOf(p)+1){ p.extra=c; c.merged=true; MERGED.push(c); STEPS.splice(STEPS.indexOf(c),1) } })();
function furn(){ return root.getAttribute("data-mpfurn")!=="0" }
function extraVis(){ STEPS.forEach(function(s){ if(!s.extra) return; var on=st.view==="step"&&STEPS[st.step]===s&&furn(); s.extra.panel.hidden=!on; s.extra.panel.classList.toggle("dz-xtra",on); if(on&&s.extra.subs) s.extra.subs.forEach(function(sb){ sb.g.hidden=false; if(sb.lab) sb.lab.hidden=false }) }) }
function skip(i){ var x=STEPS[i]; return !!(x&&/colour/i.test(x.name)&&!x.extra&&root.getAttribute("data-mpfurn")==="0") }
function act(){ return STEPS.map(function(_,i){return i}).filter(function(i){return !skip(i)}) }
var COPY={sides:["Choose your sides","Tap any bay on the plan to change it. Every layout is included."],roof:["Choose your roof",""],colours:["Choose your colours","Included · any mix. We’ll post fabric samples so you see the true colours."],
  heat:["Add warmth?","Infrared ceiling heaters with a built-in spotlight. Supplied and hung by our team; your electrician connects them."],extras:["Any extras?","Only extras change the price."],
  foundation:["Choose your base","Every "+SHORT+" needs a hard, level base. Choose one of ours, or prepare your own."],package:["Choose your package",""],size:["Choose your size","Width and depth, in metres."],
  interior:["Choose your interior",""],cladding:["Choose your cladding",""],doors:["Doors and roof",""]};
function copyFor(n){ var k=n.toLowerCase(); if(/side/.test(k))return COPY.sides; if(/^roof/.test(k))return COPY.roof; if(/colour/.test(k))return COPY.colours; if(/heat/.test(k))return COPY.heat; if(/extra/.test(k)&&!/clad/.test(k))return COPY.extras;
  if(/found|base/.test(k))return COPY.foundation; if(/package/.test(k))return GAZ?["Furnished or unfurnished?",""]:COPY.package; if(/size/.test(k))return COPY.size; if(/interior/.test(k))return COPY.interior; if(/door/.test(k))return COPY.doors; if(/clad/.test(k))return COPY.cladding;
  return ["Choose your "+k,""] }
STEPS.concat(MERGED).forEach(function(s){ var c=copyFor(s.name); s.title=c[0]; s.lead=c[1]; s.sides=!!s.panel.querySelector("[data-hpsides]"); s.colours=/colour/i.test(s.name)&&s.panel.querySelectorAll(".hpsw").length>1;
  if(/roof/i.test(s.name)&&!s.lead){ var pr=$$(".pr",s.panel).map(function(x){return x.textContent}); if(pr.length&&pr.every(function(t){return /Included/i.test(t)})) s.lead=(pr.length===2?"Both are":"All are")+" included in your price." } });
STEPS.forEach(function(s){ if(s.extra){ s.name="Package & colours"; s.lead=s.lead||"Choose Furnished to pick your cushion and piping colours here." } });
/* ---------- store ---------- */
var KEY="crown.designs";
function load(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"{}"); return a&&a.designs&&a.designs[SLUG]&&a.designs[SLUG].A||null }catch(_){ return null } }
function save(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"{}"); if(!a||typeof a!=="object") a={}; a.v=1; a.designs=a.designs||{};
  a.designs[SLUG]={A:{model:NAME,choices:snap(),price:price(),step:st.view==="review"?"review":st.step,visited:st.visited,updated:new Date().toISOString()}}; localStorage.setItem(KEY,JSON.stringify(a)) }catch(_){} }
function wipe(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"{}"); if(a.designs){ delete a.designs[SLUG]; localStorage.setItem(KEY,JSON.stringify(a)) } }catch(_){} }
/* ---------- state ---------- */
var st={view:"start",step:0,sub:0,visited:[]}, P0=price(), FIRST=snap(), saved=load();
/* ---------- build: head, start, review, bar, toast ---------- */
root.classList.add("dz");
var head=document.createElement("div"); head.className="dz-head";
head.innerHTML='<div class="dz-toprow"><button type="button" class="dz-back" data-dz-back>‹ Back</button><b class="dz-tt">Design your '+esc(SHORT)+'</b><button type="button" class="dz-x" data-dz-x aria-label="Close the designer">✕</button></div>'+
  '<div class="dz-ind"><button type="button" class="dz-eyeb" data-dz-list aria-expanded="false"><span class="dz-ey" aria-live="polite"></span><span class="dz-all">All steps <span aria-hidden="true">▾</span></span></button><div class="dz-segs" aria-hidden="true"></div><p class="dz-trail" aria-hidden="true"></p>'+
  '<ol class="dz-list" hidden>'+STEPS.map(function(s,i){return '<li><button type="button" data-dz-jump="'+i+'">'+(i+1)+' · '+esc(s.name)+'</button></li>'}).join("")+'<li><button type="button" data-dz-jump="r">Review</button></li></ol></div>';
root.insertBefore(head,root.firstChild);
var bpanel=$(".bpanel")||STEPS[0].panel.parentNode;
var ttl=document.createElement("div"); ttl.className="dz-stitle"; ttl.innerHTML='<h3 tabindex="-1"></h3><p></p>'; bpanel.insertBefore(ttl,bpanel.firstChild);
/* start screen */
var start=document.createElement("div"); start.className="dz-start";
var mainImg=(H&&H.data&&H.data.stage&&H.data.stage.main&&H.data.stage.main[0])||(($(".stg img")||{}).getAttribute?$(".stg img").getAttribute("src"):"")||"";
var inImg=(function(){ var t=[].slice.call(document.querySelectorAll("#hero .thumbs [data-src]")).map(function(b){return b.getAttribute("data-src")}).filter(function(x){return x&&x!==mainImg&&!/\/(?:\.\.\/)*$/.test(x)}); return t[1]||t[0]||mainImg })();
var IE=(function(){ var e=sec.querySelector(".ie"); if(!e||root.contains(e)) return null; e.parentNode.removeChild(e); return e })();
var STD=(function(){ var j=root.querySelector("script[data-standard]")||sec.querySelector("script[data-standard]"); try{ var d=j&&JSON.parse(j.textContent); return d&&d.confirmed?d:null }catch(_){return null} })();
function startHTML(){ var sv=load(), n=act().length, pk=INFO&&INFO.panel.querySelector(".hpinc");
  var s='<div class="dz-sh"><span class="dz-eye">Start here</span><h3>'+(STD?"How would you like to start?":"Build your "+esc(SHORT)+" your way")+'</h3><p>'+(P0?"Starts from "+gbp(P0)+" inc. VAT. ":"")+'You can change anything later.</p>';
  if(pk) s+='<p class="dz-pk">'+esc(((INFO.panel.querySelector(".pkone b,.pkone h4,.pkone strong")||{}).textContent||"Premium Package").replace(/as standard/i,"").trim())+' included. Everything included is listed on Review.</p>';
  s+='</div>';
  if(sv) s+='<div class="dz-wb" role="status"><p><b>Welcome back.</b> Your '+esc(SHORT)+' is as you left it'+(sv.price?" · "+gbp(sv.price):"")+'.</p><div class="dz-wbb"><button type="button" class="btn" data-dz-continue>Continue</button><button type="button" class="dz-lnk" data-dz-reset>Start again</button></div></div>';
  if(STD) s+='<a class="dz-card" href="#design" data-dz-std><img src="'+esc(STD.img||mainImg)+'" alt="" loading="lazy"><span class="dz-cf"><span class="dz-cl">Option 1</span><b>Most popular</b><span>'+esc(STD.desc||"")+'</span><span class="btn">See my price ›</span></span></a>';
  s+='<a class="dz-card" href="#design" data-dz-scratch><img src="'+esc(inImg)+'" alt="" loading="lazy"'+'><span class="dz-cf">'+(STD?'<span class="dz-cl">Option 2</span>':'')+'<b>Made from scratch</b><span>Choose '+esc(STEPS.map(function(x){return x.name.toLowerCase()}).join(", ").replace(/, ([^,]*)$/," and $1"))+', step by step.</span><span class="dz-cl">'+n+' short step'+(n>1?"s":"")+'</span><span class="btn gh dz-go">Start designing ›</span></span></a>';
  return s }
root.insertBefore(start,head.nextSibling);
/* review */
var rv=document.createElement("div"); rv.className="dz-review"; rv.hidden=true; bpanel.appendChild(rv);
$$("[data-sendpanel]",sec).forEach(function(p){ rv.parentNode.appendChild(p) });
$$("[data-sendpanel]",document).forEach(function(p){ var pc=p.querySelector("input[autocomplete=postal-code]"), te=p.querySelector("input[type=tel]");
  [[pc,"Optional · so we can suggest your nearest show site"],[te,"Optional · only if you’d like a call"]].forEach(function(a){ var x=a[0]; if(!x) return; x.removeAttribute("required"); var l=p.querySelector('label[for="'+x.id+'"]'); if(l&&!l.querySelector("small")) l.insertAdjacentHTML("beforeend"," <small>"+a[1]+"</small>") });
  var sp=p.querySelector("[data-spec]"); if(sp){ var f=sp.closest(".f"); if(f) f.classList.add("dz-auto") } });
/* bar */
var bar=document.createElement("div"); bar.className="dz-bar"; bar.setAttribute("role","region"); bar.setAttribute("aria-label","Your price");
bar.innerHTML='<div class="dz-bl"><span class="dz-bth" aria-hidden="true" hidden></span><div class="dz-bi"><div class="dz-pr"><span class="dz-bn">'+esc(SHORT)+'</span><span class="dz-p" data-dz-p></span><span class="dz-d" data-dz-d aria-hidden="true"></span></div><button type="button" class="dz-vs" data-dz-sum aria-expanded="false">inc. VAT · View summary ▴</button></div></div><div class="dz-br"><button type="button" class="dz-bk" data-dz-bk>Back</button><button type="button" class="dz-next" data-dz-next>Next</button></div>';
document.body.appendChild(bar);
var sumsh=document.createElement("div"); sumsh.className="dz-sumsh"; sumsh.hidden=true; sumsh.setAttribute("role","dialog"); sumsh.setAttribute("aria-label","Your design so far"); document.body.appendChild(sumsh);
var toast=document.createElement("div"); toast.className="dz-toast"; toast.setAttribute("role","status"); toast.innerHTML='<span></span><button type="button">Undo</button>'; document.body.appendChild(toast);
var live=document.createElement("p"); live.className="sr"; live.setAttribute("aria-live","polite"); root.appendChild(live);
function say(m){ live.textContent=""; setTimeout(function(){ live.textContent=m },40) }
/* ---------- photo cards from the page's own options ---------- */
var PH_OF={heater:IMG+"hampton/heat-h02.webp",cab:IMG+"h18-cab.webp",bbq:IMG+"smokeless.webp"};
function cardsFromSeg(seg){ var g=seg.querySelector("[data-hp]"); g=g&&g.getAttribute("data-hp"); if(!g||!PH_OF[g]) return;
  var row=seg.closest(".hprow"), info=row&&row.querySelector(".t>b"), desc=row&&row.querySelector(".t>small");
  var box=document.createElement("div"); box.className="dz-cards"; box.setAttribute("role","radiogroup"); box.setAttribute("aria-label",(info&&info.textContent)||g);
  $$("[data-hp]",seg).forEach(function(b){ var t=b.textContent.trim(), m=t.match(/£[\d,]+/), none=/^(none|no)$/i.test(b.getAttribute("data-v"));
    var nm=none?(g==="heater"?"No heater":"None"):t.replace(/\s*·\s*£[\d,]+/,"").replace(/^(\d.*kW)$/,"$1 heater");
    var c=document.createElement("button"); c.type="button"; c.className="dz-card dz-opt"; c.setAttribute("role","radio"); c.setAttribute("data-dz-proxy",radioKey(b));
    c.innerHTML='<img src="'+esc(none?mainImg:PH_OF[g])+'" alt="" loading="lazy"><span class="dz-ot"><b>'+esc(nm)+'</b>'+(none?'':'<small>'+esc((desc&&desc.textContent)||"")+'</small>')+'<span class="dz-op">'+(m?"+"+m[0]:"No extra cost")+'</span></span><i class="dz-tick" aria-hidden="true">✓</i>';
    c.addEventListener("click",function(){ b.click() }); box.appendChild(c) });
  seg.parentNode.insertBefore(box,seg); seg.classList.add("dz-src"); var see=row&&row.querySelector(".hpsee"); if(see) see.classList.add("dz-src") }
STEPS.concat(MERGED).forEach(function(s){ var p=s.panel;
  $$(".hpseg",p).forEach(cardsFromSeg);
  $$(".hpos",p).forEach(function(g){ var o=$$(".hpo",g); g.classList.add("dz-cards",o.length>=4?"dz-B":"dz-A");
    o.forEach(function(b){ var im=b.querySelector("img"), src=b.getAttribute("data-stage"); if(!im&&src){ b.insertAdjacentHTML("afterbegin",'<img src="'+esc(src)+'" alt="" loading="lazy">') } else if(im&&src&&/models\//.test(src)) im.src=src;
      b.classList.add("dz-opt"); if(!b.querySelector(".dz-tick")) b.insertAdjacentHTML("beforeend",'<i class="dz-tick" aria-hidden="true">✓</i>') }) });
  $$(".hpsee",p).forEach(function(x){ x.classList.add("dz-src") });
  $$(".pkcard[role=radio],.icard[role=radio]",p).forEach(function(b){ b.classList.add("dz-opt") });
  /* v9.8.4 area 11A: fabric photos on cushion swatches (Ivory has no photo yet: it keeps its flat colour); Signature interiors as 4:3 photo tiles */
  $$('[data-hp=cushion]',p).forEach(function(b){ var v=b.getAttribute("data-v"), i=b.querySelector("i"); if(i&&/^(beige|burgundy|green|navy|taupe)$/.test(v)){ i.style.backgroundImage="url("+IMG+"hampton/fab-"+v+".webp)"; i.classList.add("dz-fab") } });
  $$('.icard[data-sgint]',p).forEach(function(b){ if(b.querySelector("img")) return; b.classList.add("dz-itile"); b.insertAdjacentHTML("afterbegin",'<img src="'+IMG+'sg-int-'+esc(b.getAttribute("data-sgint"))+'.webp" alt="" loading="lazy">') });
  if(s.colours){ var gs=$$(".hpsw",p); s.subs=gs.map(function(g){ var lab=document.getElementById(g.getAttribute("aria-labelledby")); return {g:g,lab:lab,name:(lab&&lab.textContent||"").trim()} });
    s.subs.forEach(function(sb,j){ if(!j) return; var key=(sb.g.querySelector("[data-hp]")||{}).getAttribute&&sb.g.querySelector("[data-hp]").getAttribute("data-hp");
      var m=document.createElement("button"); m.type="button"; m.className="dz-match"; m.setAttribute("aria-pressed","false"); m.setAttribute("data-dz-match",key); m.innerHTML='<i aria-hidden="true"></i>Match cushions';
      m.addEventListener("click",function(){ var c=H&&H.state.cushion, t=sb.g.querySelector('[data-v="'+c+'"]'); if(t) t.click() }); sb.g.insertBefore(m,sb.g.firstChild) }) }
});
/* ---------- radial bay picker (Sides) ---------- */
var rad={on:false,k:1};
function bayEls(){ return $$(".hps-plan .hps-bay",document).filter(function(g){return root.contains(g)||g.closest(".hps-pinhost")}) }
function sidesT(){ return (window.MPSides&&window.__mpsides?MPSides.T:window.HPSides?HPSides.T:{}) }
function bayIdx(k){ var sd=SIDES(); return sd&&sd.idx?sd.idx[k-1]:k }
function bayType(k){ var sd=SIDES(); return sd?sd.get()[bayIdx(k)]:null }
function setBay(k,t){ var sd=SIDES(); if(!sd) return; var before=snap(), p0=price(), a=sd.get(); if(a[bayIdx(k)]===t) return; a[bayIdx(k)]=t; sd.set(a); H.state.bays=a; H.upd();
  var T=sidesT(); changed(before,p0,"Bay "+k+" · "+((T[t]||[t])[0])); radDraw() }
function bayImg(t){ var T=sidesT()[t]; if(!T) return ""; var f=T[2]||""; return /\//.test(f)?f:IMG+"hampton/"+f }
var radBox=document.createElement("div"); radBox.className="dz-rad"; radBox.hidden=true;
var radInfo=document.createElement("div"); radInfo.className="dz-radinfo"; radInfo.hidden=true;
function radOpen(k){ rad.on=true; rad.k=k; root.classList.add("dz-radon"); radDraw(); bar.querySelector("[data-dz-next]").textContent="Done" }
function radClose(){ rad.on=false; root.classList.remove("dz-radon"); radBox.hidden=true; radInfo.hidden=true; bayEls().forEach(function(g){g.classList.remove("dz-sel")}); setNext() }
function radDraw(){ if(!rad.on) return; var bays=bayEls(), g=bays[rad.k-1], card=g&&g.closest(".hps-card"); if(!g||!card) return;
  if(radBox.parentNode!==card){ card.appendChild(radBox) } var sp=STEPS[st.step].panel; if(radInfo.parentNode!==sp) sp.insertBefore(radInfo,sp.firstChild);
  bays.forEach(function(x){x.classList.toggle("dz-sel",x===g)});
  var cr=card.getBoundingClientRect(), br=g.querySelector(".hps-halo,.hps-mv")||g, r=br.getBoundingClientRect(), cx=r.left+r.width/2-cr.left, cy=r.top+r.height/2-cr.top;
  var svgE=card.querySelector("svg"), sr=svgE?svgE.getBoundingClientRect():cr, pcx=sr.left+sr.width/2-cr.left, pcy=sr.top+sr.height/2-cr.top;
  var ox=cx-pcx, oy=cy-pcy, L=Math.hypot(ox,oy)||1, ux=ox/L, uy=oy/L, px=-uy, py=ux, T=sidesT(), cur=bayType(rad.k), S=Math.min(72,Math.max(56,cr.width/5.5));
  var keys=["B","F","H"].filter(function(t){return T[t]});
  radBox.style.setProperty("--dzb",S+"px");
  radBox.innerHTML='<svg class="dz-lead" aria-hidden="true" width="'+cr.width+'" height="'+cr.height+'"></svg><div role="radiogroup" aria-label="Bay '+rad.k+'">'+keys.map(function(t,j){ var m=j-(keys.length-1)/2, off=m*(S+34), d=S*.95-Math.abs(m)*S*.35;
    var x=cx+ux*d+px*off, y=cy+uy*d+py*off; /* fan outwards from the bay, like Leo's mock; kept inside the card */
    x=Math.max(S/2+4,Math.min(cr.width-S/2-4,x)); y=Math.max(S/2+4,Math.min(cr.height-S/2-26,y));
    return '<button type="button" class="dz-bub" role="radio" aria-checked="'+(cur===t)+'" data-t="'+t+'" style="left:'+(x-S/2).toFixed(0)+'px;top:'+(y-S/2).toFixed(0)+'px" aria-label="Bay '+rad.k+': '+esc(T[t][0])+'"><img src="'+esc(bayImg(t))+'" alt=""><span>'+esc(/plexi/i.test(T[t][0])?"Half plexi":/balustrade/i.test(T[t][0])?"Balustrade":/full/i.test(T[t][0])?"Full clad":T[t][0])+(cur===t?" ✓":"")+'</span></button>' }).join("")+'</div>';
  var sv=radBox.querySelector("svg"); radBox.querySelectorAll(".dz-bub").forEach(function(b){ var bx=parseFloat(b.style.left)+S/2, by=parseFloat(b.style.top)+S/2; sv.insertAdjacentHTML("beforeend",'<line x1="'+cx.toFixed(0)+'" y1="'+cy.toFixed(0)+'" x2="'+bx.toFixed(0)+'" y2="'+by.toFixed(0)+'"/>');
    b.addEventListener("click",function(e){ e.stopPropagation(); setBay(rad.k,b.getAttribute("data-t")) }) });
  radBox.hidden=false;
  var n=bays.length, c=H&&H.state.bays?H.state.bays:[], cnt={B:0,F:0,H:0}; (SIDES().get()).forEach(function(x){ if(cnt[x]!=null) cnt[x]++ });
  radInfo.innerHTML='<p class="dz-ri1">Bay '+rad.k+' of '+n+' · '+cnt.F+' clad, '+cnt.H+' half plexi, '+cnt.B+' open</p><h4>'+esc((T[cur]||["",""])[0])+'</h4><p class="dz-ri2">'+esc((T[cur]||["",""])[1])+'. Every layout is included.</p><div class="dz-rinav"><button type="button" class="btn gh" data-dz-bay="-1">‹ Bay '+((rad.k+n-2)%n+1)+'</button><button type="button" class="btn gh" data-dz-bay="1">Bay '+(rad.k%n+1)+' ›</button></div>';
  radInfo.hidden=false;
  radInfo.querySelectorAll("[data-dz-bay]").forEach(function(b){ b.addEventListener("click",function(){ rad.k=((rad.k-1+(+b.getAttribute("data-dz-bay"))+n)%n)+1; radDraw() }) }) }
document.addEventListener("click",function(e){ var g=e.target.closest&&e.target.closest(".hps-bay"); if(!g||st.view!=="step"||!STEPS[st.step].sides) return;
  e.stopPropagation(); e.preventDefault(); radOpen(+g.getAttribute("data-i")) },true);
document.addEventListener("keydown",function(e){ var g=e.target.closest&&e.target.closest(".hps-bay"); if(!g||st.view!=="step"||!STEPS[st.step].sides) return; if(e.key==="Enter"||e.key===" "){ e.stopPropagation(); e.preventDefault(); radOpen(+g.getAttribute("data-i")) } },true);
/* ---------- feedback: every option tap ---------- */
var undoSnap=null, tt=0, countRaf=0, shown=null;
function optLabel(b){ var x=b.querySelector("b"); var t=(x?x.textContent:(b.getAttribute("title")||b.getAttribute("aria-label")||b.textContent)).trim().replace(/\s+/g," "); return t.replace(/\s*·\s*£[\d,]+.*$/,"").slice(0,40) }
function changed(before,p0,label,q){ var now=snap(); if(same(before,now)) return; var p1=price(); undoSnap={s:before,p:p0};
  var d=(p1!=null&&p0!=null)?p1-p0:0; chip(d,q); showToast("✓ "+label+(d?" · "+(d>0?"+":"−")+gbp(d):q?" · priced by your designer":" · Included"));
  if(d) say("Price now "+gbp(p1)+" including VAT, "+(d>0?"up ":"down ")+gbp(d)+"."); if(navigator.vibrate&&!RM.matches&&/Android/.test(navigator.userAgent)) try{navigator.vibrate(8)}catch(_){}
  if(st.visited.indexOf(st.step)<0&&st.view==="step") st.visited.push(st.step); save(); sync() }
root.addEventListener("click",function(e){ if(st.view!=="step") return; var b=e.target.closest("[role=radio],[data-hpq],input[type=checkbox],.dz-match,.seg button,button[data-w],button[data-d]"); if(!b||!root.contains(b)||b.closest(".dz-head,.dz-rad")) return;
  if(b.closest("[data-dz-proxy]")) return;
  var before=snap(), p0=price(), lab=b.classList.contains("dz-match")?"Matched to cushions":b.hasAttribute("data-hpq")?"Heaters":optLabel(b.closest("label")||b);
  b.classList.add("dz-press"); setTimeout(function(){b.classList.remove("dz-press")},120);
  var q=/priced by your designer|on your quote|on request/i.test((b.closest("label")||b).textContent); setTimeout(function(){ changed(before,p0,lab,q) },0) },true);
root.addEventListener("click",function(e){ var px=e.target.closest("[data-dz-proxy]"); if(!px||st.view!=="step") return; var before=snap(), p0=price(), lab=optLabel(px); setTimeout(function(){ changed(before,p0,lab) },0) },true);
function chip(d,q){ var el=bar.querySelector("[data-dz-d]"); el.textContent=d?(d>0?"+":"−")+gbp(d):q?"Priced by your designer":"Included"; el.classList.toggle("dz-dq",!d&&!!q); el.classList.add("on"); clearTimeout(chip.t); chip.t=setTimeout(function(){el.classList.remove("on")},2000) }
function showToast(m){ toast.querySelector("span").textContent=m; toast.querySelector("button").hidden=!undoSnap; toast.classList.add("on"); clearTimeout(tt); tt=setTimeout(hideToast,4000) }
function hideToast(){ toast.classList.remove("on") }
toast.querySelector("button").addEventListener("click",function(){ if(!undoSnap) return; var u=undoSnap; undoSnap=null; restore(u.s); hideToast(); chip(price()-(u.p==null?price():price())); say("Undone"); save(); sync(); if(rad.on) radDraw() });
root.addEventListener("pointerdown",function(e){ if(toast.classList.contains("on")&&!e.target.closest("[role=radio],.dz-bub")) setTimeout(hideToast,600) },true);
/* ---------- rendering ---------- */
function curPrice(){ var p=price(); var el=bar.querySelector("[data-dz-p]"); if(p==null){ el.textContent="Price on request"; return }
  var from=shown==null?p:shown; cancelAnimationFrame(countRaf); if(RM.matches||from===p){ el.textContent=gbp(p); shown=p; return }
  var t0=0; function f(ts){ if(!t0) t0=ts; var k=Math.min(1,(ts-t0)/300); el.textContent=gbp(from+(p-from)*k); if(k<1) countRaf=requestAnimationFrame(f); else shown=p } countRaf=requestAnimationFrame(f) }
function setNext(){ var n=bar.querySelector("[data-dz-next]"); n.classList.toggle("dz-send",st.view==="review"); n.textContent=rad.on?"Done":st.view==="review"?"Send me my design and price":"Next" }
function selThumb(p){ var b=p.querySelector("[role=radio][aria-checked=true]"); if(!b) return ""; var im=b.querySelector("img"); if(im) return '<img src="'+esc(im.getAttribute("src"))+'" alt="">';
  var i=b.querySelector("i[style]"); if(i) return '<i style="'+esc(i.getAttribute("style"))+'"></i>'; return "" }
function valueOf(s){ var v=s.tab.querySelector(".v"), t=v&&v.textContent.trim();
  if(s.extra){ var pv=$$("[role=radio][aria-checked=true]",s.panel).map(optLabel).filter(Boolean).join(" · ")||t||""; return pv+(furn()?" · "+valueOf(s.extra):"") }
  if(s.sides&&H&&SIDES()){ var c={B:0,F:0,H:0}; SIDES().get().forEach(function(x){if(c[x]!=null)c[x]++}); return (t||"")+(t?": ":"")+c.F+" clad, "+c.H+" half plexi, "+c.B+" open" }
  if(/colour/i.test(s.name)&&H){ var S=H.state, C={green:"Green",burgundy:"Burgundy",beige:"Beige",ivory:"Ivory",navy:"Navy",taupe:"Taupe"}; return s.subs?s.subs.map(function(sb){var k=(sb.g.querySelector("[data-hp]")||{}).getAttribute("data-hp");return C[S[k]]}).filter(Boolean).join(" · "):t }
  if(/heat/i.test(s.name)&&H){ var S2=H.state; var a=[]; if(S2.heater!=="none") a.push(S2.hq+" × "+(S2.heater==="h3"?"3kW":"3/6kW")+" · +"+gbp(H.prices[S2.heater]*S2.hq)); if(S2.cab&&S2.cab!=="none") a.push(S2.cab+"-shape cabinet"); if(S2.bbq&&S2.bbq!=="no") a.push("BBQ table"); return a.join(" · ")||"None" }
  var sel=$$("[role=radio][aria-checked=true]",s.panel).map(optLabel).filter(Boolean); var ck=$$("input[type=checkbox]:checked",s.panel).map(function(x){var l=x.closest("label");return l?l.textContent.trim().replace(/\s+/g," ").slice(0,30):""}).filter(Boolean);
  return (t&&!/^(none yet)$/i.test(t)?t:sel.concat(ck).join(" · "))||t||"—" }
function siteFor(){ var D=window.CROWN_SHOWSITES; if(!D||!D.sites) return null; var nm=NAME, hit=D.sites.filter(function(s){return (s.models||[]).indexOf(nm)>=0})[0];
  if(hit) return {s:hit,has:true}; var alt=D.sites.filter(function(s){return GAZ||!s.gazebosOnly})[0]; return alt?{s:alt,has:false}:null }
function hours(s){ var d=new Date().getDay(), h=d===0?s.sun:s.wk; return h?(d===0?"Sun ":"Today ")+h[0]+"–"+h[1]:"" }
function siteCard(cls){ var f=siteFor(); if(!f) return ""; var s=f.s, q="?model="+encodeURIComponent(NAME)+"&site="+encodeURIComponent(s.id);
  return '<div class="dz-site '+(cls||"")+'"><img src="'+IMG+'showsite.webp" alt="" loading="lazy"><div><b>'+(f.has?"See "+(/^[AEIOU]/.test(SHORT)?"an ":"a ")+esc(SHORT)+" at "+esc(s.town):"See Crown "+(GAZ?"gazebos":"garden rooms")+" at "+esc(s.town))+'</b><span>'+esc(s.gc)+(hours(s)?" · "+hours(s):"")+'</span>'+(f.has?"":'<span>The '+esc(SHORT)+' isn’t on display yet; a design consultant can show you one like it.</span>')+'</div><a class="btn gh dz-visit" href="'+BASE+'visit-us/index.html'+q+'#book">Book a visit'+(cls?" at "+esc(s.town):"")+'</a></div>' }
function reviewHTML(){ var A=act(), n=A.length, done=A.filter(function(i){return st.visited.indexOf(i)>=0}).length, left=A.filter(function(i){return st.visited.indexOf(i)<0}).map(function(i){return STEPS[i]});
  var t=left.length?"Nearly there":"Your "+esc(SHORT)+" is ready", lead=left.length?(left.length===1?"One thing left: "+esc(left[0].name.toLowerCase())+".":left.length+" things left to choose.")+" You can still send your design now.":"Everything is chosen. Send it to yourself, or come and see one.";
  var s='<div class="dz-rh"><h3 tabindex="-1">'+t+'</h3><p>'+lead+'</p></div><div class="dz-rk"><b>Your design</b><span>'+done+' of '+n+' chosen</span></div><div class="dz-seg" aria-hidden="true">'+A.map(function(i){return '<i class="'+(st.visited.indexOf(i)>=0?"on":"")+'"></i>'}).join("")+'</div><ul class="dz-chk">';
  A.forEach(function(i){ var x=STEPS[i]; var ok=st.visited.indexOf(i)>=0, lab=x.name.replace(/&amp;/g,"&")+(/heat/i.test(x.name)?" · supplied and hung":/found|base/i.test(x.name)?" · needed":"");
    s+='<li class="'+(ok?"":"dz-open")+'"><span class="dz-ck" aria-hidden="true">'+(ok?"✓":"○")+'</span><span class="dz-th">'+(selThumb(x.panel)||(mainImg?'<img src="'+esc(mainImg)+'" alt="">':""))+'</span><span class="dz-cv"><small>'+esc(lab)+'</small><b>'+(ok?esc(valueOf(x)):"Not chosen yet")+'</b></span><button type="button" class="'+(ok?"dz-lnk":"btn gh")+'" data-dz-jump="'+i+'" aria-label="'+(ok?"Change ":"Choose ")+esc(x.name)+'">'+(ok?"Change":"Choose")+'</button></li>' });
  s+='</ul>';
  if(H&&H.lines){ s+='<details class="dz-lines"><summary>Itemised price</summary><ul>'+H.lines().map(function(l){return '<li><span><b>'+esc(l[0])+'</b><small>'+esc(l[1])+'</small></span><span>'+esc(l[2])+'</span></li>'}).join("")+'</ul></details>' }
  var FINP=price(); if(FINP!=null&&/10-Year Plan/.test(document.body.textContent)){ var fr=Math.pow(1.089,1/12)-1, fm=Math.floor(FINP*0.8*fr/(1-Math.pow(1+fr,-120))), fx=(document.body.textContent.match(/from £([0-9,]+) a month/)||[])[1]; if(fx&&P0) fm=Math.round(+fx.replace(/,/g,)*FINP/P0); /* scale the page's own representative example */ s+='<p class="dz-fin">Or from <b>'+gbp(fm)+' a month</b> on our 10-Year Plan: 8.9% APR representative, 20% deposit, 120 months. Credit is subject to status. <a class="dz-lnk" href="../../your-project/prices-finance/index.html">How finance works</a></p>' }
  var cd=$("[data-rfcode]"); if(cd&&cd.textContent.indexOf("·")<0) s+='<p class="dz-code">Design code <b>'+esc(cd.textContent)+'</b> · quote it at a show site or on the phone.</p>';
  var inc=INFO&&INFO.panel.querySelector(".hpinc"), jl=!inc&&document.querySelector(".grj .jcard .jl");
  if(IE) s+='<details class="dz-inc" data-dz-ie><summary>What’s included</summary></details>'; else if(inc) s+='<details class="dz-inc"><summary>What’s included</summary>'+inc.outerHTML+'</details>'; else if(jl) s+='<details class="dz-inc"><summary>What’s included</summary>'+jl.outerHTML+'<a class="dz-lnk" href="#included">See everything included ↓</a></details>';
  var lt=sec.querySelector(".hplead b"); s+='<ol class="dz-next3"><li><b>1</b>We email your design code and itemised price.</li><li><b>2</b>A design consultant talks it through, when you’re ready.</li><li><b>3</b>'+(lt?"Order. "+esc(lt.textContent)+", installed by our own team.":"Order when you’re ready; installed by our own team.")+'</li></ol>';
  s+=siteCard(""); s+='<p class="dz-vat">Prices include VAT, and delivery and installation'+(GAZ?" in mainland England &amp; Wales":"")+'.</p>';
  return s }
function sumHTML(){ return '<div class="dz-ssh"><b>Your '+esc(SHORT)+' so far</b><button type="button" class="dz-lnk" data-dz-sumx>Close</button></div><ul>'+act().map(function(i){var x=STEPS[i];return '<li><small>'+esc(x.name)+'</small><b>'+esc(st.visited.indexOf(i)>=0?valueOf(x):"Not chosen yet")+'</b></li>'}).join("")+'</ul><p class="dz-sst">'+(price()!=null?gbp(price())+" inc. VAT":"")+'</p>' }
function sync(){
  $$("[data-dz-proxy]").forEach(function(c){ var k=c.getAttribute("data-dz-proxy"), src=$$("[data-hp]",c.closest(".bp")).filter(function(b){return radioKey(b)===k&&!b.closest(".dz-cards")})[0]; c.setAttribute("aria-checked",src?src.getAttribute("aria-checked"):"false") });
  $$("[data-dz-match]").forEach(function(m){ var k=m.getAttribute("data-dz-match"); m.setAttribute("aria-pressed",String(!!(H&&H.state[k]===H.state.cushion))) });
  curPrice(); bthumb(st.view); }
function segs(pos,part){ var A=act(), h=""; A.forEach(function(ix,k){ var w=pos<0||k<pos?100:k===pos?Math.round(part*100):(st.visited.indexOf(ix)>=0?100:0); h+='<i class="'+(k===pos?"cur":"")+'"><b style="width:'+w+'%"></b></i>' }); head.querySelector(".dz-segs").innerHTML=h;
  head.querySelector(".dz-trail").innerHTML=A.map(function(ix,k){ var nm=esc(STEPS[ix].name.replace(/&amp;/g,"&")); return k===pos?"<b>"+nm+"</b>":(st.visited.indexOf(ix)>=0?"✓ "+nm:nm) }).join(" · ")+" · "+(pos<0?"<b>Review</b>":"Review") }
function bthumb(view){ var el=bar.querySelector(".dz-bth"); if(!el) return; var h=""; if(view==="step"){ h=selThumb(STEPS[st.step].panel) } if(!h&&mainImg) h='<img src="'+esc(mainImg)+'" alt="">'; el.innerHTML=h; el.hidden=!h }
function show(view,i,sub,dir){
  if(rad.on) radClose();
  st.view=view; if(i!=null) st.step=i; st.sub=sub||0;
  root.setAttribute("data-dz-view",view); html.classList.toggle("dz-open",view!=="start");
  start.hidden=view!=="start"; if(view==="start") start.innerHTML=startHTML();
  var stepOn=view==="step", s=STEPS[st.step];
  if(stepOn){ if(s.tab.getAttribute("aria-selected")!=="true") s.tab.click(); }
  else if(view==="review"&&SUMTAB){ if(SUMTAB.tab.getAttribute("aria-selected")!=="true") SUMTAB.tab.click() }
  ALL.forEach(function(x){ if(x.panel) x.panel.hidden=!(stepOn&&x===s) }); extraVis();
  ttl.hidden=!stepOn; rv.hidden=view!=="review";
  if(stepOn){ var t=s.title, l=s.lead, nm=s.name;
    if(s.subs){ s.subs.forEach(function(sb,j){ var on=j===st.sub; sb.g.hidden=!on; if(sb.lab) sb.lab.hidden=true }); var sb=s.subs[st.sub]; t="Choose your "+sb.name.toLowerCase(); nm=s.name+" · "+sb.name; l=st.sub?"Or keep them matched to your cushions.":s.lead }
    ttl.querySelector("h3").textContent=t; var lp=ttl.querySelector("p"); lp.textContent=l; lp.hidden=!l;
    var A=act(), pos=A.indexOf(st.step); if(pos<0) pos=0; head.querySelector(".dz-ey").textContent="Step "+(pos+1)+" of "+A.length+" · "+nm;
    segs(pos,s.subs?(st.sub+1)/s.subs.length:1);
    if(dir&&!RM.matches){ s.panel.classList.remove("dz-in-r","dz-in-l"); void s.panel.offsetWidth; s.panel.classList.add(dir>0?"dz-in-r":"dz-in-l") }
    if(st.visited.indexOf(st.step)<0) st.visited.push(st.step) }
  if(view==="review"){ rv.innerHTML=reviewHTML(); var ieh=rv.querySelector("[data-dz-ie]"); if(ieh&&IE) ieh.appendChild(IE); head.querySelector(".dz-ey").textContent="Review · "+act().filter(function(i){return st.visited.indexOf(i)>=0}).length+" of "+act().length+" chosen"; segs(-1,1) }
  bthumb(view);
  var stgE=root.querySelector(":scope>.stg"); if(stepOn&&s.sides&&stgE&&PH.matches){ if(ttl.nextSibling!==stgE) root.insertBefore(ttl,stgE) } else if(ttl.parentNode!==bpanel||bpanel.firstChild!==ttl) bpanel.insertBefore(ttl,bpanel.firstChild);
  head.hidden=view==="start"; [].forEach.call(head.querySelectorAll(".dz-list [data-dz-jump]"),function(b){ var j=b.getAttribute("data-dz-jump"); if(j!=="r"){ b.parentNode.hidden=skip(+j); b.textContent=(act().indexOf(+j)+1)+" · "+STEPS[+j].name.replace(/&amp;/g,"&") } }); root.classList.toggle("dz-sidesstep",stepOn&&!!s.sides); root.classList.toggle("dz-photostep",stepOn&&!s.sides&&!!s.panel.querySelector(".dz-cards")&&!s.subs); root.classList.toggle("dz-colstep",stepOn&&!!s.subs);
  head.querySelector(".dz-back").textContent=view==="review"?"‹ Back":"‹ Back";
  setNext(); sync(); if(view!=="start") save(); place(); setTimeout(fixLabels,80);
}
function scrollTop(){ var hdr=document.querySelector(".site-h"), off=(PH.matches||!hdr)?0:hdr.getBoundingClientRect().height; var y=root.getBoundingClientRect().top+scrollY-off-8; scrollTo({top:Math.max(0,y),behavior:RM.matches?"auto":"smooth"}) }
function focusTitle(){ setTimeout(function(){ var h=st.view==="review"?rv.querySelector("h3"):ttl.querySelector("h3"); if(h) h.focus({preventScroll:true}) },60) }
function next(){ if(rad.on){ radClose(); return }
  if(st.view==="review"){ var o=$(".bfoot [data-send-open]")||$("[data-send-open]")||sec.querySelector("[data-send-open]"); if(o) o.click(); return }
  var s=STEPS[st.step]; if(s.subs&&st.sub<s.subs.length-1){ show("step",st.step,st.sub+1,1); scrollTop(); return }
  var A=act().filter(function(i){return i>st.step}); if(A.length){ show("step",A[0],0,1) } else show("review"); scrollTop(); focusTitle() }
function back(){ if(rad.on){ radClose(); return } if(st.view==="review"){ var A0=act(), li=A0[A0.length-1], l=STEPS[li]; show("step",li,l.subs?l.subs.length-1:0,-1); scrollTop(); return }
  var s=STEPS[st.step]; if(s.subs&&st.sub>0){ show("step",st.step,st.sub-1,-1); return } var B=act().filter(function(i){return i<st.step}); if(B.length){ var pi=B[B.length-1], p=STEPS[pi]; show("step",pi,p.subs?p.subs.length-1:0,-1) } else show("start"); scrollTop(); focusTitle() }
bar.querySelector("[data-dz-next]").addEventListener("click",next); bar.querySelector("[data-dz-bk]").addEventListener("click",function(){ back() });
root.addEventListener("click",function(e){ var t=e.target.closest("[data-dz-back],[data-dz-x],[data-dz-list],[data-dz-jump],[data-dz-scratch],[data-dz-std],[data-dz-continue],[data-dz-reset]"); if(!t) return;
  if(t.hasAttribute("data-dz-back")){ back(); return }
  if(t.hasAttribute("data-dz-x")){ show("start"); scrollTop(); return }
  if(t.hasAttribute("data-dz-list")){ var L=head.querySelector(".dz-list"); L.hidden=!L.hidden; t.setAttribute("aria-expanded",String(!L.hidden)); return }
  if(t.hasAttribute("data-dz-jump")){ e.preventDefault(); head.querySelector(".dz-list").hidden=true; var j=t.getAttribute("data-dz-jump"); if(j==="r") show("review"); else show("step",+j,0,0); scrollTop(); focusTitle(); return }
  if(t.hasAttribute("data-dz-scratch")){ e.preventDefault(); show("step",act()[0],0,1); scrollTop(); focusTitle(); return }
  if(t.hasAttribute("data-dz-std")){ e.preventDefault(); restore(STD.choices); /* the base is never part of the most popular spec: it stays open on Review */ st.visited=STEPS.map(function(_,i){return i}).filter(function(i){return !/found|base/i.test(STEPS[i].name)}); show("review"); scrollTop(); focusTitle(); return }
  if(t.hasAttribute("data-dz-continue")){ var sv=load(); if(sv){ st.visited=sv.visited||[]; if(sv.step==="review") show("review"); else show("step",Math.min(+sv.step||0,STEPS.length-1),0,1) } scrollTop(); focusTitle(); return }
  if(t.hasAttribute("data-dz-reset")){ wipe(); restore(FIRST); st.visited=[]; undoSnap=null; show("start"); return }
});
bar.addEventListener("click",function(e){ if(e.target.closest("[data-dz-sum]")){ sumsh.innerHTML=sumHTML(); sumsh.hidden=!sumsh.hidden; bar.querySelector("[data-dz-sum]").setAttribute("aria-expanded",String(!sumsh.hidden)) } });
sumsh.addEventListener("click",function(e){ if(e.target.closest("[data-dz-sumx]")){ sumsh.hidden=true; bar.querySelector("[data-dz-sum]").setAttribute("aria-expanded","false") } });
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ if(!sumsh.hidden) sumsh.hidden=true; if(rad.on) radClose() } });
/* ---------- bar placement, gold rule, header ---------- */
var raf=0;
function place(){ raf=0; var r=root.getBoundingClientRect(), vh=innerHeight, inv=st.view!=="start"&&r.top<vh-80&&r.bottom>140;
  bar.classList.toggle("on",inv); html.classList.toggle("dz-inview",inv); if(inv) html.style.setProperty("--dzbh",bar.offsetHeight+"px"); if(!inv){ hideToast(); sumsh.hidden=true }
  /* one gold: while Review's gold Send is on screen, the header's Book a visit drops to outline */
  html.classList.toggle("dz-rv",st.view==="review"&&inv) }
function qp(){ if(!raf) raf=requestAnimationFrame(place) }
addEventListener("scroll",qp,{passive:true}); addEventListener("resize",function(){ qp(); if(rad.on) radDraw(); fixLabels() });
/* ---------- save point: after Send ---------- */
$$("[data-sendpanel]",document).forEach(function(p){ var ok=p.querySelector("[data-sendok]"); if(!ok) return;
  new MutationObserver(function(){ if(ok.hidden) return; if(ok.querySelector(".dz-save")) return; var code=$("[data-rfcode]"), th=STEPS.map(function(x,i){return '<span class="dz-th'+(st.visited.indexOf(i)>=0?"":" dz-dim")+'">'+(selThumb(x.panel)||"")+'</span>'}).join("");
    ok.insertAdjacentHTML("beforeend",'<div class="dz-save"><div class="dz-dcard"><img src="'+esc(mainImg)+'" alt="Your '+esc(SHORT)+'"><div><b>Your '+esc(SHORT)+'</b><span>'+(price()!=null?gbp(price())+" inc. VAT":"")+(code?" · design code "+esc(code.textContent):"")+'</span><div class="dz-ths">'+th+'</div><p>Saved on this device: come back any time and it’s as you left it.</p></div></div><h4>Next: see it in person</h4>'+siteCard("dz-sp")+'</div>'); place() }).observe(ok,{attributes:true,attributeFilter:["hidden"]}) });
/* ---------- plan labels: never under 14px on screen ---------- */
function fixLabels(){ $$("svg text",sec).forEach(function(t){ var svg=t.ownerSVGElement; if(!svg||!t.getScreenCTM||!svg.getBoundingClientRect().width) return; var m=t.getScreenCTM(); if(!m) return; var k=Math.hypot(m.a,m.b)||1;
  var cur=parseFloat(t.getAttribute("data-dzfs")||getComputedStyle(t).fontSize)||12; if(!t.getAttribute("data-dzfs")) t.setAttribute("data-dzfs",cur); var need=14.3/k; if(cur*k<14) t.style.setProperty("font-size",need.toFixed(2)+"px","important"); else t.style.removeProperty("font-size") }) }
if(MERGED.length) new MutationObserver(function(){ extraVis(); if(st.view==="step") qp() }).observe(root,{attributes:true,attributeFilter:["data-mpfurn"]});
var lt=0; new MutationObserver(function(){ clearTimeout(lt); lt=setTimeout(fixLabels,60) }).observe(sec,{childList:true,subtree:true});
/* ---------- deep links: ?tab= or #design-step ---------- */
var qs=new URLSearchParams(location.search), qt=+qs.get("tab");
if(saved&&saved.choices){ restore(saved.choices); st.visited=saved.visited||[] }
show("start");
if(qt){ var tgt=ALL[qt-1]; var j=STEPS.indexOf(tgt); if(tgt&&tgt.kind==="summary") show("review"); else if(j>=0) show("step",j,0,0) }
setTimeout(function(){ fixLabels(); place() },300); addEventListener("load",function(){ fixLabels(); place() });
function toIncluded(){ show("review"); var d=rv.querySelector("[data-dz-ie]")||rv.querySelector(".dz-inc"); if(d){ d.open=true; setTimeout(function(){ d.scrollIntoView({block:"start",behavior:RM.matches?"auto":"smooth"}) },80) } }
if(IE){ document.addEventListener("click",function(e){ var a=e.target.closest('a[href="#included"]'); if(!a||rv.contains(a)) return; e.preventDefault(); toIncluded() });
  if(location.hash==="#included") setTimeout(toIncluded,350) }
window.__dz={show:show,state:st,steps:STEPS,price:price,snap:snap,restore:restore,next:next,back:back,radOpen:radOpen};
})();
