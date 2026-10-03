/* v8.7 model pages: Sides step for any gazebo shape (generalised from hp-sides.js, the approved Hampton bay sheet).
   MPSides.mount(el,{geom:{shape,w,h,slots,entr,tables}, initial, presets, name, size, img, onChange, priceBar, header, planHost}) -> {get,set,name}
   Shapes: round, oval, octagon, octagon-long, stadium, rect, rrect. The entrance is centred at the front; bays are numbered clockwise from the front left.
   Same .hps-* classes and markup as the Hampton, so hp-sides.css styles it unchanged. v8.7.2: the mount also exposes the geometry (geom/gm/idx/entr) for mp-3d.js. */
(function(){
"use strict";
var T={B:["Balustrade & blind","Open rail with a roll-down marine-grade blind","opt-balustrade.jpg"],
       F:["Full clad","Solid redwood cladding: shelter and privacy","opt-fullclad.jpg"],
       H:["Half clad, half plexiglass","Clad to sofa height, clear above for the view","opt-halfclad.jpg"]};
var O=["B","F","H"], PRN={std:"Crown’s standard",open:"Open to the view",shel:"Sheltered"};
var RM=window.matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
/* ---------- geometry: pieces in clockwise screen order, starting with the front edge ---------- */
function L(p,q,n){return {k:"l",p:p,q:q,n:n}}
function A(c,rx,ry,a0,a1,n){return {k:"a",c:c,rx:rx,ry:ry,a0:a0,a1:a1,n:n}}
function pieces(gm,cx,cy,MW,MH){var s=gm.shape,w=gm.w,h=gm.h,W,H,k;
  if(s==="round"){W=H=Math.min(MW,MH)}else{k=Math.min(MW/w,MH/h);W=w*k;H=h*k}
  var x0=cx-W/2,x1=cx+W/2,y0=cy-H/2,y1=cy+H/2,N=gm.slots,P=[],e=gm.edges||[];
  if(s==="round"||s==="oval"){var st=360/N;P.push(A([cx,cy],W/2,H/2,90-st/2,450-st/2,N))}
  else if(s==="octagon"||s==="octagon-long"){var R=1/(2*Math.cos(Math.PI/8)),v=[];
    for(var i=0;i<8;i++){var a=(67.5+45*i)*Math.PI/180;v.push([cx+W*R*Math.cos(a),cy+H*R*Math.sin(a)])}
    for(i=0;i<8;i++)P.push(L(v[i],v[(i+1)%8],e[i]||1))}
  else if(s==="stadium"){var r=H/2,ls=W-H;
    P.push(L([cx+ls/2,y1],[cx-ls/2,y1],e[0]||1));P.push(A([cx-ls/2,cy],r,r,90,270,e[1]||3));
    P.push(L([cx-ls/2,y0],[cx+ls/2,y0],e[2]||1));P.push(A([cx+ls/2,cy],r,r,270,450,e[3]||3))}
  else{P.push(L([x1,y1],[x0,y1],e[0]||3));P.push(L([x0,y1],[x0,y0],e[1]||2));P.push(L([x0,y0],[x1,y0],e[2]||3));P.push(L([x1,y0],[x1,y1],e[3]||2))}
  return {P:P,W:W,H:H,cx:cx,cy:cy}}
function G(gm,cx,cy,MW,MH){var g=pieces(gm,cx,cy,MW,MH),sl=[];
  g.P.forEach(function(pc){for(var j=0;j<pc.n;j++)sl.push({pc:pc,u0:j/pc.n,u1:(j+1)/pc.n})});
  /* rotate so slot 0 is the front-centre entrance */
  var f=g.P[0],mid=f.k==="a"?0:Math.floor((f.n-1)/2);sl=sl.slice(mid).concat(sl.slice(0,mid));
  function pt(s,d,u){var pc=s.pc,t=s.u0+(s.u1-s.u0)*u;
    if(pc.k==="l"){var dx=pc.q[0]-pc.p[0],dy=pc.q[1]-pc.p[1],l=Math.hypot(dx,dy);return [pc.p[0]+dx*t+d*dy/l,pc.p[1]+dy*t-d*dx/l]}
    var a=(pc.a0+(pc.a1-pc.a0)*t)*Math.PI/180;return [pc.c[0]+(pc.rx+d)*Math.cos(a),pc.c[1]+(pc.ry+d)*Math.sin(a)]}
  g.sl=sl;g.pt=pt;
  g.arc=function(i,d,u0,u1,mv,n){var s="",q,k2,S=sl[i];n=n||(S.pc.k==="l"?1:16);for(k2=0;k2<=n;k2++){q=pt(S,d,u0+(u1-u0)*k2/n);s+=(k2||!mv?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1)}return s};
  g.band=function(i,d0,d1,u0,u1){return g.arc(i,d1,u0,u1,1)+g.arc(i,d0,u1,u0,0)+"Z"};
  g.ticks=function(i,d0,d1,u0,u1,n){var s="";for(var k2=1;k2<n;k2++){var u=u0+(u1-u0)*k2/n,p1=pt(sl[i],d1,u),p2=pt(sl[i],d0,u);s+="M"+p1[0].toFixed(1)+" "+p1[1].toFixed(1)+"L"+p2[0].toFixed(1)+" "+p2[1].toFixed(1)}return s};
  g.outline=function(d){var s="";sl.forEach(function(S,i){s+=g.arc(i,d,0,1,!i)});return s+"Z"};
  return g}
var ST={B:"B",F:"F",H:"H"};
function lines(g,i,t,big){var a=.05,b=.95;t=ST[t]||t;
  if(t==="W") return '<path class="hps-ln hps-dsh" d="'+g.arc(i,3,a,b,1)+'"/><path class="hps-ln hps-dsh" d="'+g.arc(i,-3,a,b,1)+'"/>';
  if(t==="O") return '<path class="hps-ln hps-dsh hps-open" d="'+g.arc(i,0,a,b,1)+'"/>';
  if(t==="F") return '<path class="hps-ln" d="'+g.arc(i,3,a,b,1)+'"/><path class="hps-ln" d="'+g.arc(i,-3,a,b,1)+'"/>';
  if(t==="B") return '<path class="hps-ln" d="'+g.arc(i,3,a,b,1)+'"/><path class="hps-ln hps-tk" d="'+g.ticks(i,-4,3,a,b,big?10:5)+'"/>';
  return '<path class="hps-ln" d="'+g.arc(i,-2,a,b,1)+'"/><path class="hps-ln hps-dsh" d="'+g.arc(i,4,a,b,1)+'"/>'}
function tables(g,gm){var s="",cx=g.cx,cy=g.cy,W=g.W,H=g.H,t=gm.tables||["dining"];
  function tb(x,y,rx,ry,l1,l2){s+='<ellipse class="hps-tb" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="'+rx.toFixed(1)+'" ry="'+ry.toFixed(1)+'"/>';
    if(l2)s+='<text class="hps-tl" x="'+x.toFixed(1)+'" y="'+(y-3).toFixed(1)+'">'+l1+'</text><text class="hps-tl" x="'+x.toFixed(1)+'" y="'+(y+10).toFixed(1)+'">'+l2+'</text>';
    else s+='<text class="hps-tl" x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'">'+l1+'</text>'}
  if(t.length===1){var r=Math.min(W,H)*.25;tb(cx,cy,r*Math.max(1,W/H*.9),r,"Dining table")}
  else{var d=t.indexOf("dining"),c=t.indexOf("coffee"),dx=W*.2,left=d<c;
    tb(cx+(left?-dx:dx),cy,Math.min(W*.17,58),Math.min(H*.2,40),"Dining table");
    tb(cx+(left?dx:-dx),cy,Math.min(W*.11,40),Math.min(H*.16,32),"Coffee","table");
    if(t.indexOf("side")>=0)tb(cx+(left?dx:-dx),cy+Math.min(H*.16,32)+18,14,9,"","")}
  return s}
function sym(t){t=ST[t]||t;var m={W:'<path class="hps-dsh" d="M2 7H42"/><path class="hps-dsh" d="M2 13H42"/>',O:'<path class="hps-dsh hps-open" d="M2 10H42"/>',F:'<path d="M2 7H42M2 13H42"/>',B:'<path d="M2 7H42"/><path class="hps-tk" d="M6 7V14M11 7V14M16 7V14M21 7V14M26 7V14M31 7V14M36 7V14"/>',H:'<path d="M2 13H42"/><path class="hps-dsh" d="M2 6H42"/>'};
  return '<svg class="hps-sym" viewBox="0 0 44 20" aria-hidden="true" focusable="false">'+m[t]+'</svg>'}
var IC={undo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  l:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  r:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ck:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
/* presets from the live Premium counts: full clad furthest from the entrance, half clad next, balustrades nearest */
function presets(gm,std){var N=gm.slots,g=G(gm,0,0,100,100),E=gm.entr||[0],ed=[];
  for(var i=0;i<N;i++)if(E.indexOf(i)<0){var p=g.pt(g.sl[i],0,.5);ed.push({i:i,y:p[1]})}
  ed.sort(function(a,b){return a.y-b.y||a.i-b.i});var n=ed.length;
  function mk(F,H){var a=[];for(var i=0;i<N;i++)a.push(E.indexOf(i)>=0?"E":"B");ed.forEach(function(x,k){a[x.i]=k<F?"F":k<F+H?"H":"B"});return a.join("")}
  var P={std:mk(Math.min(std.F,n),Math.min(std.H,Math.max(0,n-std.F)))};
  var o=mk(Math.min(1,n),Math.min(2,Math.max(0,n-1))),sh=mk(Math.max(0,n-2-Math.min(2,n-2)),Math.min(2,Math.max(0,n-2)));
  if(o!==P.std)P.open=o;if(sh!==P.std&&sh!==o)P.shel=sh;return P}
function posNames(g,gm){var E=gm.entr||[0],N=gm.slots,out=[];
  for(var i=0;i<N;i++){var p=g.pt(g.sl[i],0,.5),nx=(p[0]-g.cx)/(g.W/2),ny=(p[1]-g.cy)/(g.H/2);
    var v=ny>.55?"front":ny<-.55?"back":"side",h=nx<-.3?"left":nx>.3?"right":"centre",s;
    s=v==="side"?(h==="left"?"Left side":h==="right"?"Right side":"Side"):(v==="front"?"Front":"Back")+(h==="centre"?", centre":" "+h);
    if(E.indexOf((i+1)%N)>=0||E.indexOf((i+N-1)%N)>=0)s+=", beside the entrance";out.push(s)}return out}
/* ---------- mount ---------- */
function mount(root,o){o=o||{};if(o.types){["B","F","H"].forEach(function(k){if(o.types[k])T[k]=o.types[k]})}if(o.styles){for(var sk in o.styles)ST[sk]=o.styles[sk]}var gm=o.geom,N=gm.slots,E=gm.entr||[0],img=o.img||"assets/img/",PRE=o.presets,name=o.name||"gazebo";
  var b=(o.initial||PRE.std).split(""),hist=[],cur=1,opened=false,back=null,hl=null;
  var IDX=[];for(var z=0;z<N;z++)if(E.indexOf(z)<0)IDX.push(z);var NB=IDX.length;
  var uid="mps"+Math.random().toString(36).slice(2,7);
  var g=G(gm,210,140,340,216),POS=posNames(g,gm);
  function planSVG(){var s='<svg class="hps-plan" viewBox="0 0 420 300" role="group" aria-label="Plan of the '+esc(name)+': '+NB+' bays, entrance'+(E.length?(E.length>1?"s":"")+' at the front'+(E.length>1?" and back":""):", open at the front")+'. Tap a bay to choose its panel.">';
    s+='<path class="hps-roof" d="'+g.outline(gm.shape==="rrect"?14:12)+'" fill="none" stroke="#c9a86b" stroke-dasharray="4 4" stroke-width=".8"'+(gm.shape==="rrect"?' stroke-linejoin="round"':'')+'/>';
    IDX.forEach(function(i,k){var pn=g.pt(g.sl[i],26,.5);
      s+='<g class="hps-bay" data-i="'+(k+1)+'" data-t="B" tabindex="0" role="button"><path class="hps-hit" d="'+g.band(i,-36,40,0,1)+'"/>';
      s+='<path class="hps-halo" d="'+g.arc(i,0,.08,.92,1)+'"/><g class="hps-mv">';
      O.forEach(function(t){s+='<g class="hps-s'+t+'">'+lines(g,i,t,1)+'</g>'});
      s+='</g><circle class="hps-bnc" cx="'+pn[0].toFixed(1)+'" cy="'+pn[1].toFixed(1)+'" r="10"/><text class="hps-bn" x="'+pn[0].toFixed(1)+'" y="'+(pn[1]+4).toFixed(1)+'">'+(k+1)+'</text></g>'});
    for(var i=0;i<N;i++){var q=g.pt(g.sl[i],0,0);s+='<circle class="hps-post" cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="2.6"/>'}
    s+=tables(g,gm);
    s+='<text class="hps-entl" x="210" y="270">'+(E.length?"ENTRANCE":"FRONT")+'</text><path class="hps-enta" d="M210 292V278M205 283l5-5 5 5"/>';
    if(E.length>1){var bq=g.pt(g.sl[E[1]],0,.5);s+='<text class="hps-entl" x="'+bq[0].toFixed(1)+'" y="'+(bq[1]-12).toFixed(1)+'">ENTRANCE</text>'}
    return s+'</svg>'}
  var gmi=G(gm,100,60,164,92);
  function miniSVG(lay){var s='<svg viewBox="8 6 184 108" aria-hidden="true" focusable="false">';IDX.forEach(function(i){s+=lines(gmi,i,lay[i],0)});return s+'</svg>'}
  root.classList.add("hps-root");
  root.innerHTML='<div class="hps-planw"><div class="hps-card">'+planSVG()+'</div></div>'+
    '<p class="hps-size">'+esc(o.size||"")+'</p>'+
    '<div class="hps-leg" role="group" aria-label="Key: tap to highlight those bays">'+O.map(function(t){return '<button type="button" data-k="'+t+'" aria-pressed="false">'+sym(t)+'<span class="hps-nm">'+esc(T[t][0])+'</span><span class="hps-ct" data-c="'+t+'"></span></button>'}).join("")+'</div>'+
    '<p class="hps-sum" data-sum></p>'+
    '<div class="hps-acts"><button type="button" class="hps-pill" data-undo disabled>'+IC.undo+'Undo</button><button type="button" class="hps-pill hps-pri" data-edit>Edit bay by bay</button></div>'+
    (Object.keys(PRE).length>1?'<span class="hps-k" id="'+uid+'-pk">Quick layouts</span><div class="hps-pre" role="group" aria-labelledby="'+uid+'-pk">'+Object.keys(PRE).map(function(k){return '<button type="button" data-pre="'+k+'" aria-pressed="false">'+miniSVG(PRE[k])+'<b>'+PRN[k]+'</b></button>'}).join("")+'</div>':'<div class="hps-pre" hidden></div>')+
    '<p class="hps-ok"><i aria-hidden="true">✓</i><span>Every layout is included in the price. Choose the mix that suits your garden and the views.</span></p>'+
    '<div class="hps-sr" aria-live="polite" data-live></div>';
  var q=function(s,c){return (c||root).querySelector(s)}, qa=function(s,c){return [].slice.call((c||root).querySelectorAll(s))};
  if(o.planHost){var ph=typeof o.planHost==="string"?document.querySelector(o.planHost):o.planHost;if(ph){ph.innerHTML="";ph.classList.add("hps-root");ph.appendChild(q(".hps-planw"));ph.appendChild(q(".hps-size"))}}
  var planw=(o.planHost?document:root).querySelector(".hps-planw"),card=planw.querySelector(".hps-card"),bays=[].slice.call(planw.querySelectorAll(".hps-bay")),live=q("[data-live]");
  var scrim=document.createElement("div");scrim.className="hps-scrim";
  var sh=document.createElement("div");sh.className="hps-sheet";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");sh.setAttribute("aria-labelledby",uid+"-h");sh.tabIndex=-1;
  sh.innerHTML='<div class="hps-sh-top"><div class="hps-grab" aria-hidden="true"></div><div class="hps-hdr"><button type="button" class="hps-nav" data-step="-1" aria-label="Previous bay">'+IC.l+'</button><div><h2 id="'+uid+'-h">Bay 1 of '+NB+'</h2><p data-pos></p></div><button type="button" class="hps-nav" data-step="1" aria-label="Next bay">'+IC.r+'</button></div><div class="hps-dots" aria-hidden="true">'+Array(NB+1).join("<i></i>")+'</div></div>'+
    '<div class="hps-opts"><div class="hps-optsin" role="radiogroup" aria-labelledby="'+uid+'-h">'+O.map(function(t){return '<button type="button" class="hps-opt" role="radio" data-o="'+t+'" aria-checked="false"><img src="'+img+T[t][2]+'" alt="" width="118" height="64"><span><b>'+esc(T[t][0])+'</b><small>'+esc(T[t][1])+'</small><span class="hps-n" data-n="'+t+'"></span></span><span class="hps-ck">'+IC.ck+'</span></button>'}).join("")+'</div></div>'+
    '<div class="hps-sh-ft"><button type="button" class="hps-pill" data-all>Apply to all sides</button><button type="button" class="hps-pill hps-pri" data-done>Done</button></div>';
  var toast=document.createElement("div");toast.className="hps-toast";toast.setAttribute("role","status");toast.innerHTML='<span></span><button type="button">Undo</button>';
  var pinHost=document.createElement("div");pinHost.className="hps-root hps-pinhost";document.body.appendChild(pinHost);document.body.appendChild(scrim);document.body.appendChild(sh);document.body.appendChild(toast);
  var opts=[].slice.call(sh.querySelectorAll(".hps-opt")),optsBox=sh.querySelector(".hps-opts"),optsIn=sh.querySelector(".hps-optsin"),dots=[].slice.call(sh.querySelectorAll(".hps-dots i"));
  function str(){return b.join("")}
  function at(k){return b[IDX[k-1]]}
  function counts(){var c={B:0,F:0,H:0};IDX.forEach(function(i){c[b[i]]++});return c}
  function say(m){live.textContent="";setTimeout(function(){live.textContent=m},30);if(o.say)o.say(m)}
  function presetName(){for(var k in PRE)if(PRE[k]===str())return PRN[k];return null}
  function commit(prev,msg,popList){hist.push(prev);if(hist.length>60)hist.shift();render();(popList||[]).forEach(function(k,j){var gg=bays[k-1];setTimeout(function(){pop(gg)},j*24)});
    if(o.onChange)o.onChange(b.slice());showToast(msg);say(msg)}
  function setBay(k,t){if(at(k)===t)return;var p=str();b[IDX[k-1]]=t;commit(p,"Bay "+k+" → "+T[t][0],[k])}
  function setAll(t){var p=str(),ch=[];for(var k=1;k<=NB;k++)if(at(k)!==t){b[IDX[k-1]]=t;ch.push(k)}if(!ch.length){showToast("All sides are already "+T[t][0],true);return}commit(p,"All sides → "+T[t][0],ch)}
  function preset(key){var p=str();if(p===PRE[key])return;b=PRE[key].split("");var ch=[];for(var k=1;k<=NB;k++)if(p[IDX[k-1]]!==b[IDX[k-1]])ch.push(k);commit(p,PRN[key]+" layout",ch)}
  function undo(){if(!hist.length)return;b=hist.pop().split("");render();if(o.onChange)o.onChange(b.slice());hideToast();say("Undone")}
  function pop(gg){if(!gg||RM.matches)return;gg.classList.remove("hps-pop");void gg.getBBox();gg.classList.add("hps-pop")}
  function label(k){return "Bay "+k+", "+POS[IDX[k-1]].toLowerCase()+": "+T[at(k)][0]+", tap to change"}
  function render(){var c=counts(),pn=presetName();
    bays.forEach(function(gg){var k=+gg.getAttribute("data-i");gg.setAttribute("data-t",at(k));gg.setAttribute("aria-label",label(k));gg.classList.toggle("hps-hl",hl===at(k))});
    O.forEach(function(t){q('[data-c="'+t+'"]').textContent="×"+c[t];var n=sh.querySelector('[data-n="'+t+'"]');n.textContent=c[t]+(c[t]===1?" side":" sides")+" now"});
    q("[data-sum]").innerHTML=(pn?"<b>"+pn+"</b>":"<b>Your own mix</b>")+" · "+O.map(function(t){return c[t]+" "+T[t][0].toLowerCase()}).join(" · ");
    qa("[data-pre]").forEach(function(x){x.setAttribute("aria-pressed",PRE[x.getAttribute("data-pre")]===str())});
    q("[data-undo]").disabled=!hist.length;
    if(opened)show(cur,true)}
  qa(".hps-leg button").forEach(function(x){x.addEventListener("click",function(){var k=x.getAttribute("data-k");hl=hl===k?null:k;qa(".hps-leg button").forEach(function(y){y.setAttribute("aria-pressed",y.getAttribute("data-k")===hl)});render();
    if(hl){var n=counts()[hl];say(n+" bay"+(n===1?"":"s")+" "+T[hl][0]+" highlighted")}})});
  var tt;function barH(){if(opened)return sh.getBoundingClientRect().height-2;var m=4;if(o.priceBar)[].forEach.call(document.querySelectorAll(o.priceBar),function(bar){var r=bar.getBoundingClientRect(),c=getComputedStyle(bar);if(r.height&&c.display!=="none"&&c.visibility!=="hidden"&&+c.opacity>0&&r.top<innerHeight&&r.bottom>innerHeight-4)m=Math.max(m,innerHeight-r.top)});return m}
  function place(){toast.style.setProperty("--hps-tb",barH()+"px");
    if(opened)return;var tr=toast.getBoundingClientRect(),pr=q(".hps-pre").getBoundingClientRect();
    if(pr.height&&tr.top<pr.bottom&&tr.bottom>pr.top){var top=headerBottom();toast.style.setProperty("--hps-tb",(innerHeight-top-12-48-12)+"px")}}
  function showToast(m,noUndo){toast.querySelector("span").textContent=m;toast.querySelector("button").hidden=!!noUndo;toast.style.setProperty("--hps-tb",barH()+"px");toast.classList.add("hps-on");requestAnimationFrame(place);clearTimeout(tt);tt=setTimeout(hideToast,4000)}
  function hideToast(){toast.classList.remove("hps-on")}
  toast.querySelector("button").addEventListener("click",function(e){e.stopPropagation();undo()});
  document.addEventListener("pointerdown",function(e){if(toast.classList.contains("hps-on")&&!toast.contains(e.target))setTimeout(hideToast,1200)},true);
  addEventListener("scroll",function(){if(toast.classList.contains("hps-on"))place()},{passive:true});
  function headerBottom(){var m=0;if(o.header)[].forEach.call(document.querySelectorAll(o.header),function(hd){var r=hd.getBoundingClientRect(),p=getComputedStyle(hd).position;if((p==="fixed"||p==="sticky")&&r.top<=1&&r.bottom>0&&r.bottom<innerHeight*.4&&getComputedStyle(hd).visibility!=="hidden")m=Math.max(m,r.bottom)});return m}
  function pinPlan(){var top=headerBottom()+8,sb=sh.getBoundingClientRect().height||innerHeight*.6,h=Math.max(130,innerHeight-sb-top-10-58);
    if(!card.classList.contains("hps-pinned")){planw.style.height=planw.offsetHeight+"px";pinHost.appendChild(card)}card.classList.add("hps-pinned");card.style.top=top+"px";card.style.height=h+"px"}
  function unpin(){card.classList.remove("hps-pinned");card.style.top="";card.style.height="";if(card.parentNode===pinHost)planw.appendChild(card);planw.style.height=""}
  function show(k,keep){cur=k;var t=at(k);sh.querySelector("h2").textContent="Bay "+k+" of "+NB;sh.querySelector("[data-pos]").textContent=POS[IDX[k-1]];
    opts.forEach(function(x){var on=x.getAttribute("data-o")===t;x.setAttribute("aria-checked",on);x.tabIndex=on?0:-1});
    dots.forEach(function(d,j){d.classList.toggle("hps-on",j===k-1)});
    bays.forEach(function(gg){gg.classList.toggle("hps-sel",+gg.getAttribute("data-i")===k)});
    sh.querySelector("[data-all]").setAttribute("aria-label","Make all "+NB+" sides "+T[t][0]);
    if(!keep)say("Bay "+k+", "+POS[IDX[k-1]].toLowerCase()+", currently "+T[t][0])}
  function open(k,from){if(opened){show(k);pop(bays[k-1]);return}opened=true;back=from||document.activeElement;show(k);
    if(o.priceBar)[].forEach.call(document.querySelectorAll(o.priceBar),function(x){x.classList.add("hps-hide")});document.documentElement.classList.add("hps-open");
    sh.style.transform="";sh.classList.add("hps-on");scrim.classList.add("hps-on");
    requestAnimationFrame(function(){optsBox.classList.toggle("hps-still",optsBox.scrollHeight<=optsBox.clientHeight+1);pinPlan()});
    setTimeout(function(){(sh.querySelector('.hps-opt[aria-checked=true]')||opts[0]).focus({preventScroll:true})},80);hideToast()}
  function close(){if(!opened)return;opened=false;sh.classList.remove("hps-on");sh.style.transform="";scrim.classList.remove("hps-on");unpin();
    if(o.priceBar)[].forEach.call(document.querySelectorAll(o.priceBar),function(x){x.classList.remove("hps-hide")});document.documentElement.classList.remove("hps-open");
    bays.forEach(function(gg){gg.classList.remove("hps-sel")});var gg=bays[cur-1];if(gg)gg.focus({preventScroll:true})}
  function step(d,anim){var n=((cur-1+d+NB)%NB)+1;
    if(anim!==false&&!RM.matches){optsIn.style.transition="none";optsIn.style.transform="translateX("+(d>0?40:-40)+"px)";optsIn.style.opacity=".3";requestAnimationFrame(function(){requestAnimationFrame(function(){optsIn.style.transition="";optsIn.style.transform="";optsIn.style.opacity=""})})}
    show(n);pop(bays[n-1]);var c=sh.querySelector('.hps-opt[aria-checked=true]');if(c&&sh.contains(document.activeElement))c.focus({preventScroll:true})}
  bays.forEach(function(gg){gg.addEventListener("click",function(e){e.stopPropagation();open(+gg.getAttribute("data-i"),gg)});
    gg.addEventListener("keydown",function(e){var k=bays.indexOf(gg),n=null;
      if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(k+1)%NB;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(k+NB-1)%NB;else if(e.key==="Home")n=0;else if(e.key==="End")n=NB-1;
      if(n!==null){e.preventDefault();bays[n].focus();return}if(e.key==="Enter"||e.key===" "){e.preventDefault();open(k+1,gg)}})});
  opts.forEach(function(x,k){x.addEventListener("click",function(){if(Date.now()-swiped<400)return;setBay(cur,x.getAttribute("data-o"))});
    x.addEventListener("keydown",function(e){var n=null;if(e.key==="ArrowDown"||e.key==="ArrowRight")n=(k+1)%3;if(e.key==="ArrowUp"||e.key==="ArrowLeft")n=(k+2)%3;
      if(n!==null){e.preventDefault();setBay(cur,O[n]);opts[n].focus()}
      if(e.key==="PageDown"||e.key==="]"){e.preventDefault();step(1)}if(e.key==="PageUp"||e.key==="["){e.preventDefault();step(-1)}})});
  [].forEach.call(sh.querySelectorAll("[data-step]"),function(x){x.addEventListener("click",function(){step(+x.getAttribute("data-step"))})});
  sh.querySelector("[data-all]").addEventListener("click",function(){setAll(at(cur))});
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
  return {geom:function(cx,cy,MW,MH){return G(gm,cx,cy,MW,MH)},gm:gm,idx:IDX.slice(),entr:E.slice(),name:function(){var n=presetName();return n===PRN.std?"Standard":(n||"Bespoke")},get:function(){return b.slice()},set:function(arr){b=arr.slice();render()},open:open,close:close,undo:undo,el:root,thumb:function(lay){var gt=G(gm,75,48,120,76),s='<svg viewBox="0 0 150 96" aria-hidden="true" focusable="false">';IDX.forEach(function(i){s+=lines(gt,i,lay[i],0)});return s+'</svg>'}}}
window.MPSides={mount:mount,presets:presets,T:T,PRN:PRN,ST:ST};
})();
