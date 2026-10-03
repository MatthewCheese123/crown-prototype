/* v8.5 Hampton Sides step: bay sheet (refined option C, team vote 3 Oct 2026).
   Fine-line plan after the original live drawing; tap a bay -> iOS-style sheet with 3 photo options.
   HPSides.mount(el,{img, initial, onChange, priceBar, header, say}) -> {get, set}. All classes are .hps-* scoped. */
(function(){
"use strict";
var T={B:["Balustrade & blind","Open rail with a roll-down marine-grade blind","opt-balustrade.jpg"],
       F:["Full clad","Solid redwood cladding: shelter and privacy","opt-fullclad.jpg"],
       H:["Half clad, half plexiglass","Clad to sofa height, clear above for the view","opt-halfclad.jpg"]};
var O=["B","F","H"], PRE={std:"EBHHFFFHHB",open:"EBBBHFHBBB",shel:"EBHFFFFFHB"}, PRN={std:"Crown’s standard",open:"Open to the view",shel:"Sheltered"};
var POS=["","Front left, beside the entrance","Left side, by the dining table","Left side, by the dining table","Back left","Back, centre","Back right","Right side, by the sofa","Right side, by the sofa","Front right, beside the entrance"];
var RM=window.matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
/* ---------- geometry ---------- */
function G(cx,cy,rx,ry){var g={};
  g.p=function(d,a){a=a*Math.PI/180;return [cx+(rx+d)*Math.cos(a),cy+(ry+d)*Math.sin(a)]};
  g.arc=function(d,a0,a1,mv,n){var s="",k;n=n||16;for(k=0;k<=n;k++){var q=g.p(d,a0+(a1-a0)*k/n);s+=(k||!mv?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1)}return s};
  g.band=function(d0,d1,a0,a1){return g.arc(d1,a0,a1,1)+g.arc(d0,a1,a0,0)+"Z"};
  g.ticks=function(d0,d1,a0,a1,n){var s="";for(var k=1;k<n;k++){var a=a0+(a1-a0)*k/n,p1=g.p(d1,a),p2=g.p(d0,a);s+="M"+p1[0].toFixed(1)+" "+p1[1].toFixed(1)+"L"+p2[0].toFixed(1)+" "+p2[1].toFixed(1)}return s};
  return g}
function lines(g,t,a0,a1,big){ /* fine-line panel drawings, as the original plan */
  if(t==="F") return '<path class="hps-ln" d="'+g.arc(3,a0,a1,1)+'"/><path class="hps-ln" d="'+g.arc(-3,a0,a1,1)+'"/>';
  if(t==="B") return '<path class="hps-ln" d="'+g.arc(3,a0,a1,1)+'"/><path class="hps-ln hps-tk" d="'+g.ticks(-4,3,a0,a1,big?10:5)+'"/>';
  return '<path class="hps-ln" d="'+g.arc(-2,a0,a1,1)+'"/><path class="hps-ln hps-dsh" d="'+g.arc(4,a0,a1,1)+'"/>'}
var ang=function(i){return 90+36*i};
function planSVG(){var g=G(210,140,170,108),s='<svg class="hps-plan" viewBox="0 0 420 300" role="group" aria-label="Plan of the Hampton: 9 bays around the oval, entrance at the front. Tap a bay to choose its panel.">';
  for(var i=1;i<10;i++){var a=ang(i),a0=a-16.8,a1=a+16.8,pn=g.p(26,a);
    s+='<g class="hps-bay" data-i="'+i+'" data-t="B" tabindex="0" role="button"><path class="hps-hit" d="'+g.band(-36,40,a-18,a+18)+'"/>';
    s+='<path class="hps-halo" d="'+g.arc(0,a0+2,a1-2,1)+'"/><g class="hps-mv">';
    O.forEach(function(t){s+='<g class="hps-s'+t+'">'+lines(g,t,a0,a1,1)+'</g>'});
    s+='</g><circle class="hps-bnc" cx="'+pn[0].toFixed(1)+'" cy="'+pn[1].toFixed(1)+'" r="10"/><text class="hps-bn" x="'+pn[0].toFixed(1)+'" y="'+(pn[1]+4).toFixed(1)+'">'+i+'</text></g>'}
  for(i=0;i<10;i++){var q=g.p(0,ang(i)+18);s+='<circle class="hps-post" cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="2.6"/>'}
  s+='<ellipse class="hps-tb" cx="152" cy="140" rx="48" ry="34"/><text class="hps-tl" x="152" y="144">Dining table</text>';
  s+='<ellipse class="hps-tb" cx="272" cy="140" rx="32" ry="25"/><text class="hps-tl" x="272" y="137">Coffee</text><text class="hps-tl" x="272" y="150">table</text>';
  s+='<text class="hps-entl" x="210" y="270">ENTRANCE</text><path class="hps-enta" d="M210 292V278M205 283l5-5 5 5"/>';
  return s+'</svg>'}
function miniSVG(lay){var g=G(100,60,82,46),s='<svg viewBox="8 6 184 108" aria-hidden="true" focusable="false">';
  for(var i=1;i<10;i++){var a=ang(i);s+=lines(g,lay[i],a-15,a+15,0)}return s+'</svg>'}
function sym(t){var m={F:'<path d="M2 7H42M2 13H42"/>',B:'<path d="M2 7H42"/><path class="hps-tk" d="M6 7V14M11 7V14M16 7V14M21 7V14M26 7V14M31 7V14M36 7V14"/>',H:'<path d="M2 13H42"/><path class="hps-dsh" d="M2 6H42"/>'};
  return '<svg class="hps-sym" viewBox="0 0 44 20" aria-hidden="true" focusable="false">'+m[t]+'</svg>'}
var IC={undo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  l:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  r:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ck:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
/* ---------- mount ---------- */
function mount(root,o){o=o||{};var img=o.img||"assets/img/";var b=(o.initial||PRE.std).split(""),hist=[],cur=0,opened=false,back=null,hl=null;
  var uid="hps"+Math.random().toString(36).slice(2,7);
  root.classList.add("hps-root");
  root.innerHTML='<div class="hps-planw"><div class="hps-card">'+planSVG()+'</div></div>'+
    '<p class="hps-size">Size: 5.9 m × 4.2 m base · 6.3 m × 4.65 m roof</p>'+
    '<div class="hps-leg" role="group" aria-label="Key: tap to highlight those bays">'+O.map(function(t){return '<button type="button" data-k="'+t+'" aria-pressed="false">'+sym(t)+'<span class="hps-nm">'+esc(T[t][0])+'</span><span class="hps-ct" data-c="'+t+'"></span></button>'}).join("")+'</div>'+
    '<p class="hps-sum" data-sum></p>'+
    '<div class="hps-acts"><button type="button" class="hps-pill" data-undo disabled>'+IC.undo+'Undo</button><button type="button" class="hps-pill hps-pri" data-edit>Edit bay by bay</button></div>'+
    '<span class="hps-k" id="'+uid+'-pk">Quick layouts</span><div class="hps-pre" role="group" aria-labelledby="'+uid+'-pk">'+Object.keys(PRE).map(function(k){return '<button type="button" data-pre="'+k+'" aria-pressed="false">'+miniSVG(PRE[k])+'<b>'+PRN[k]+'</b></button>'}).join("")+'</div>'+
    '<p class="hps-ok"><i aria-hidden="true">✓</i><span>Every layout is included in the price. Choose the mix that suits your garden and the views.</span></p>'+
    '<div class="hps-sr" aria-live="polite" data-live></div>';
  var q=function(s,c){return (c||root).querySelector(s)}, qa=function(s,c){return [].slice.call((c||root).querySelectorAll(s))};
  if(o.planHost){var ph=typeof o.planHost==="string"?document.querySelector(o.planHost):o.planHost;if(ph){ph.innerHTML="";ph.classList.add("hps-root");ph.appendChild(q(".hps-planw"));ph.appendChild(q(".hps-size"))}}
  var planw=(o.planHost?document:root).querySelector(".hps-planw"),card=planw.querySelector(".hps-card"),bays=[].slice.call(planw.querySelectorAll(".hps-bay")),live=q("[data-live]");
  /* sheet + scrim + toast live on <body> so fixed positioning is never trapped by a transformed ancestor */
  var scrim=document.createElement("div");scrim.className="hps-scrim";
  var sh=document.createElement("div");sh.className="hps-sheet";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");sh.setAttribute("aria-labelledby",uid+"-h");sh.tabIndex=-1;
  sh.innerHTML='<div class="hps-sh-top"><div class="hps-grab" aria-hidden="true"></div><div class="hps-hdr"><button type="button" class="hps-nav" data-step="-1" aria-label="Previous bay">'+IC.l+'</button><div><h2 id="'+uid+'-h">Bay 1 of 9</h2><p data-pos></p></div><button type="button" class="hps-nav" data-step="1" aria-label="Next bay">'+IC.r+'</button></div><div class="hps-dots" aria-hidden="true">'+Array(10).join("<i></i>")+'</div></div>'+
    '<div class="hps-opts"><div class="hps-optsin" role="radiogroup" aria-labelledby="'+uid+'-h">'+O.map(function(t){return '<button type="button" class="hps-opt" role="radio" data-o="'+t+'" aria-checked="false"><img src="'+img+T[t][2]+'" alt="" width="118" height="64"><span><b>'+esc(T[t][0])+'</b><small>'+esc(T[t][1])+'</small><span class="hps-n" data-n="'+t+'"></span></span><span class="hps-ck">'+IC.ck+'</span></button>'}).join("")+'</div></div>'+
    '<div class="hps-sh-ft"><button type="button" class="hps-pill" data-all>Apply to all sides</button><button type="button" class="hps-pill hps-pri" data-done>Done</button></div>';
  var toast=document.createElement("div");toast.className="hps-toast";toast.setAttribute("role","status");toast.innerHTML='<span></span><button type="button">Undo</button>';
  var pinHost=document.createElement("div");pinHost.className="hps-root hps-pinhost";document.body.appendChild(pinHost);document.body.appendChild(scrim);document.body.appendChild(sh);document.body.appendChild(toast);
  var opts=[].slice.call(sh.querySelectorAll(".hps-opt")),optsBox=sh.querySelector(".hps-opts"),optsIn=sh.querySelector(".hps-optsin"),dots=[].slice.call(sh.querySelectorAll(".hps-dots i"));
  function str(){return b.join("")}
  function counts(){var c={B:0,F:0,H:0};for(var i=1;i<10;i++)c[b[i]]++;return c}
  function say(m){live.textContent="";setTimeout(function(){live.textContent=m},30);if(o.say)o.say(m)}
  function presetName(){for(var k in PRE)if(PRE[k]===str())return PRN[k];return null}
  function commit(prev,msg,popList){hist.push(prev);if(hist.length>60)hist.shift();render();(popList||[]).forEach(function(i,k){var g=bays[i-1];setTimeout(function(){pop(g)},k*24)});
    if(o.onChange)o.onChange(b.slice());showToast(msg);say(msg)}
  function setBay(i,t){if(b[i]===t)return;var p=str();b[i]=t;commit(p,"Bay "+i+" → "+T[t][0],[i])}
  function setAll(t){var p=str(),ch=[];for(var i=1;i<10;i++)if(b[i]!==t){b[i]=t;ch.push(i)}if(!ch.length){showToast("All sides are already "+T[t][0],true);return}commit(p,"All sides → "+T[t][0],ch)}
  function preset(k){var p=str();if(p===PRE[k])return;var ch=[];for(var i=1;i<10;i++)if(p[i]!==PRE[k][i])ch.push(i);b=PRE[k].split("");commit(p,PRN[k]+" layout",ch)}
  function undo(){if(!hist.length)return;b=hist.pop().split("");render();if(o.onChange)o.onChange(b.slice());hideToast();say("Undone")}
  function pop(g){if(!g||RM.matches)return;g.classList.remove("hps-pop");void g.getBBox();g.classList.add("hps-pop")}
  function label(i){return "Bay "+i+", "+POS[i].toLowerCase()+": "+T[b[i]][0]+", tap to change"}
  function render(){var c=counts(),pn=presetName();
    bays.forEach(function(g){var i=+g.getAttribute("data-i");g.setAttribute("data-t",b[i]);g.setAttribute("aria-label",label(i));g.classList.toggle("hps-hl",hl===b[i])});
    O.forEach(function(t){q('[data-c="'+t+'"]').textContent="×"+c[t];var n=sh.querySelector('[data-n="'+t+'"]');n.textContent=c[t]+(c[t]===1?" side":" sides")+" now"});
    q("[data-sum]").innerHTML=(pn?"<b>"+pn+"</b>":"<b>Your own mix</b>")+" · "+c.B+" balustrade & blind · "+c.F+" full clad · "+c.H+" half clad, half plexiglass";
    qa("[data-pre]").forEach(function(x){x.setAttribute("aria-pressed",PRE[x.getAttribute("data-pre")]===str())});
    q("[data-undo]").disabled=!hist.length;
    if(opened)show(cur,true)}
  /* ---------- legend highlight ---------- */
  qa(".hps-leg button").forEach(function(x){x.addEventListener("click",function(){var k=x.getAttribute("data-k");hl=hl===k?null:k;qa(".hps-leg button").forEach(function(y){y.setAttribute("aria-pressed",y.getAttribute("data-k")===hl)});render();
    if(hl){var n=counts()[hl];say(n+" bay"+(n===1?"":"s")+" "+T[hl][0]+" highlighted")}})});
  /* ---------- toast ---------- */
  var tt;function barH(){if(opened)return sh.getBoundingClientRect().height-2;var m=4;if(o.priceBar)[].forEach.call(document.querySelectorAll(o.priceBar),function(bar){var r=bar.getBoundingClientRect(),c=getComputedStyle(bar);if(r.height&&c.display!=="none"&&c.visibility!=="hidden"&&+c.opacity>0&&r.top<innerHeight&&r.bottom>innerHeight-4)m=Math.max(m,innerHeight-r.top)});return m}
  function place(){toast.style.setProperty("--hps-tb",barH()+"px");
    if(opened)return;var tr=toast.getBoundingClientRect(),pr=q(".hps-pre").getBoundingClientRect();
    if(tr.top<pr.bottom&&tr.bottom>pr.top){var top=headerBottom();toast.style.setProperty("--hps-tb",(innerHeight-top-12-48-12)+"px")}}
  function showToast(m,noUndo){toast.querySelector("span").textContent=m;toast.querySelector("button").hidden=!!noUndo;toast.style.setProperty("--hps-tb",barH()+"px");toast.classList.add("hps-on");requestAnimationFrame(place);clearTimeout(tt);tt=setTimeout(hideToast,4000)}
  function hideToast(){toast.classList.remove("hps-on")}
  toast.querySelector("button").addEventListener("click",function(e){e.stopPropagation();undo()});
  document.addEventListener("pointerdown",function(e){if(toast.classList.contains("hps-on")&&!toast.contains(e.target))setTimeout(hideToast,1200)},true);
  addEventListener("scroll",function(){if(toast.classList.contains("hps-on"))place()},{passive:true});
  /* ---------- sheet ---------- */
  function headerBottom(){var m=0;if(o.header)[].forEach.call(document.querySelectorAll(o.header),function(hd){var r=hd.getBoundingClientRect(),p=getComputedStyle(hd).position;if((p==="fixed"||p==="sticky")&&r.top<=1&&r.bottom>0&&r.bottom<innerHeight*.4&&getComputedStyle(hd).visibility!=="hidden")m=Math.max(m,r.bottom)});return m}
  function pinPlan(){var top=headerBottom()+8,sb=sh.getBoundingClientRect().height||innerHeight*.6,h=Math.max(130,innerHeight-sb-top-10-58);
    if(!card.classList.contains("hps-pinned")){planw.style.height=planw.offsetHeight+"px";pinHost.appendChild(card)}card.classList.add("hps-pinned");card.style.top=top+"px";card.style.height=h+"px"}
  function unpin(){card.classList.remove("hps-pinned");card.style.top="";card.style.height="";if(card.parentNode===pinHost)planw.appendChild(card);planw.style.height=""}
  function show(i,keep){cur=i;var t=b[i];sh.querySelector("h2").textContent="Bay "+i+" of 9";sh.querySelector("[data-pos]").textContent=POS[i];
    opts.forEach(function(x){var on=x.getAttribute("data-o")===t;x.setAttribute("aria-checked",on);x.tabIndex=on?0:-1});
    dots.forEach(function(d,k){d.classList.toggle("hps-on",k===i-1)});
    bays.forEach(function(g){g.classList.toggle("hps-sel",+g.getAttribute("data-i")===i)});
    sh.querySelector("[data-all]").textContent="Apply to all sides";sh.querySelector("[data-all]").setAttribute("aria-label","Make all 9 sides "+T[t][0]);
    if(!keep)say("Bay "+i+", "+POS[i].toLowerCase()+", currently "+T[t][0])}
  function open(i,from){if(opened){show(i);pop(bays[i-1]);return}opened=true;back=from||document.activeElement;show(i);
    if(o.priceBar)[].forEach.call(document.querySelectorAll(o.priceBar),function(x){x.classList.add("hps-hide")});document.documentElement.classList.add("hps-open");
    sh.style.transform="";sh.classList.add("hps-on");scrim.classList.add("hps-on");
    requestAnimationFrame(function(){optsBox.classList.toggle("hps-still",optsBox.scrollHeight<=optsBox.clientHeight+1);pinPlan()});
    setTimeout(function(){(sh.querySelector('.hps-opt[aria-checked=true]')||opts[0]).focus({preventScroll:true})},80);hideToast()}
  function close(){if(!opened)return;opened=false;sh.classList.remove("hps-on");sh.style.transform="";scrim.classList.remove("hps-on");unpin();
    if(o.priceBar)[].forEach.call(document.querySelectorAll(o.priceBar),function(x){x.classList.remove("hps-hide")});document.documentElement.classList.remove("hps-open");
    bays.forEach(function(g){g.classList.remove("hps-sel")});var g=bays[cur-1];if(g)g.focus({preventScroll:true})}
  function step(d,anim){var n=((cur-1+d+9)%9)+1;
    if(anim!==false&&!RM.matches){optsIn.style.transition="none";optsIn.style.transform="translateX("+(d>0?40:-40)+"px)";optsIn.style.opacity=".3";requestAnimationFrame(function(){requestAnimationFrame(function(){optsIn.style.transition="";optsIn.style.transform="";optsIn.style.opacity=""})})}
    show(n);pop(bays[n-1]);var c=sh.querySelector('.hps-opt[aria-checked=true]');if(c&&sh.contains(document.activeElement))c.focus({preventScroll:true})}
  bays.forEach(function(g){g.addEventListener("click",function(e){e.stopPropagation();open(+g.getAttribute("data-i"),g)});
    g.addEventListener("keydown",function(e){var k=bays.indexOf(g),n=null;
      if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(k+1)%9;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(k+8)%9;else if(e.key==="Home")n=0;else if(e.key==="End")n=8;
      if(n!==null){e.preventDefault();bays[n].focus();return}if(e.key==="Enter"||e.key===" "){e.preventDefault();open(k+1,g)}})});
  opts.forEach(function(x,k){x.addEventListener("click",function(){if(Date.now()-swiped<400)return;setBay(cur,x.getAttribute("data-o"))});
    x.addEventListener("keydown",function(e){var n=null;if(e.key==="ArrowDown"||e.key==="ArrowRight")n=(k+1)%3;if(e.key==="ArrowUp"||e.key==="ArrowLeft")n=(k+2)%3;
      if(n!==null){e.preventDefault();setBay(cur,O[n]);opts[n].focus()}
      if(e.key==="PageDown"||e.key==="]"){e.preventDefault();step(1)}if(e.key==="PageUp"||e.key==="["){e.preventDefault();step(-1)}})});
  [].forEach.call(sh.querySelectorAll("[data-step]"),function(x){x.addEventListener("click",function(){step(+x.getAttribute("data-step"))})});
  sh.querySelector("[data-all]").addEventListener("click",function(){setAll(b[cur])});
  sh.querySelector("[data-done]").addEventListener("click",close);
  scrim.addEventListener("click",close);
  q("[data-edit]").addEventListener("click",function(){open(1,this)});
  q("[data-undo]").addEventListener("click",undo);
  qa("[data-pre]").forEach(function(x){x.addEventListener("click",function(){preset(x.getAttribute("data-pre"))})});
  document.addEventListener("keydown",function(e){if(!opened)return;if(e.key==="Escape"){e.preventDefault();close();return}
    if(e.key==="Tab"){var f=[].slice.call(sh.querySelectorAll("button:not([tabindex='-1'])")).filter(function(x){return !x.hidden}),a=f[0],z=f[f.length-1];
      if(!sh.contains(document.activeElement)){e.preventDefault();a.focus();return}
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
  addEventListener("resize",function(){if(opened)pinPlan()});
  /* ---------- gestures: sheet follows the finger down; swipe left/right changes bay ---------- */
  var P=null,swiped=0;
  sh.addEventListener("pointerdown",function(e){if(e.button>0)return;P={x:e.clientX,y:e.clientY,t:Date.now(),ax:null,id:e.pointerId,inOpts:optsBox.contains(e.target)}},{passive:true});
  sh.addEventListener("pointermove",function(e){if(!P||e.pointerId!==P.id)return;var dx=e.clientX-P.x,dy=e.clientY-P.y;
    if(!P.ax){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;P.ax=Math.abs(dx)>Math.abs(dy)?"x":"y";
      if(P.ax==="y"&&(dy<0||(P.inOpts&&optsBox.scrollTop>0&&!optsBox.classList.contains("hps-still")))){P.ax="none";return}
      try{sh.setPointerCapture(e.pointerId)}catch(_){}if(P.ax==="y")sh.classList.add("hps-drag");else optsIn.style.transition="none"}
    if(P.ax==="y"){sh.style.transform="translateY("+Math.max(0,dy)+"px)"}
    else if(P.ax==="x"){optsIn.style.transform="translateX("+(dx*.6)+"px)";optsIn.style.opacity=String(Math.max(.4,1-Math.abs(dx)/400))}});
  function pend(e){if(!P||e.pointerId!==P.id)return;var dx=e.clientX-P.x,dy=e.clientY-P.y,dt=Math.max(1,Date.now()-P.t),ax=P.ax;P=null;
    if(ax==="y"){sh.classList.remove("hps-drag");var h=sh.getBoundingClientRect().height;if(dy>h*.3||(dy>40&&dy/dt>.6))close();else sh.style.transform=""}
    else if(ax==="x"){optsIn.style.transition="";optsIn.style.transform="";optsIn.style.opacity="";if(Math.abs(dx)>60||(Math.abs(dx)>30&&Math.abs(dx)/dt>.5))step(dx<0?1:-1);
      swiped=Date.now()}}
  sh.addEventListener("pointerup",pend);sh.addEventListener("pointercancel",function(e){if(P&&P.ax==="y"){sh.classList.remove("hps-drag");sh.style.transform=""}if(P&&P.ax==="x"){optsIn.style.transition="";optsIn.style.transform="";optsIn.style.opacity=""}P=null});
  render();
  return {name:function(){var n=presetName();return n===PRN.std?"Standard":(n||"Bespoke")},get:function(){return b.slice()},set:function(arr){b=arr.slice();render()},open:open,close:close,undo:undo,el:root}}
window.HPSides={mount:mount,PRE:PRE,T:T};
})();
