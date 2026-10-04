/* v8.7.2 (gazebo model pages): the Hampton's Plan | 3D toggle on the Sides step, with an indicative 3D drawing generated from each
   model's own plan geometry (round, oval, octagon, long octagon, stadium, rectangle, rounded rectangle; any number of bays and
   entrances). Same markup, classes and fine-line style as the Hampton (hp-v85.js / hp-refine.css), the same fill behaviour, and the
   same one-off gentle turn on the first switch to 3D (skipped with reduced motion). Editing always happens on the plan. */
(function(){
"use strict";
var api=window.__mpsides, H=window.__mpcfg, stage=document.querySelector(".hpcfg .hpplanw.hps-root"), html=document.documentElement;
if(!api||!api.geom||!H||!stage||stage.querySelector(".hpv85-vt")) return;
var S=H.state, gm=api.gm, IDX=api.idx, E=api.entr, ST=(window.MPSides&&MPSides.ST)||{};
var rm=matchMedia("(prefers-reduced-motion: reduce)");
/* plan in millimetres-ish units, centred on 0,0 */
var g=api.geom(0,0,gm.w,gm.h), N=g.sl.length;
var W3=420,H3=262,SQ=.46,EAVE=2100*.5;
/* a three-quarter view for the straight-sided shapes, so the side walls read; round shapes look the same from any angle */
var Y0=/^(rect|rrect|stadium)$/.test(gm.shape)?-26:0;
var s=1,HF=EAVE,cx0=0,cy0=0,VX=0,VY=0,VW=W3,VH=H3,fitted=false;
function raw(i,d,u,rot){var p=g.pt(g.sl[i],d,u),a=(rot+Y0)*Math.PI/180;return [p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)]}
/* fit the drawing (footprint, walls and roof line) to the frame, leaving room for the labels */
(function(){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(var i=0;i<N;i++)for(var k=0;k<=8;k++){var q=raw(i,12,k/8,0);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]*SQ);y1=Math.max(y1,q[1]*SQ)}
  var bw=x1-x0,bh=y1-y0+EAVE+10;s=Math.min(372/bw,(H3-62)/bh);HF=EAVE*s;cx0=210-(x0+x1)/2*s;cy0=H3-34-y1*s;
  /* crop the frame to the drawing (plus labels and room for the gentle turn), so it scales up to fill the stage */
  VY=Math.max(0,Math.floor(cy0+y0*s*SQ-HF-10*s-36));VH=H3-VY})();
function ptp(i,d,u,rot){var q=raw(i,d,u,rot);return [cx0+q[0]*s,cy0+q[1]*s*SQ,q[1]]}
function seg(i){return g.sl[i].pc.k==="l"?2:10}
function line(i,z,rot,u0,u1,mv){var n=seg(i),o="";u0=u0==null?0:u0;u1=u1==null?1:u1;for(var k=0;k<=n;k++){var q=ptp(i,0,u0+(u1-u0)*k/n,rot);o+=(k||!mv?"L":"M")+q[0].toFixed(1)+" "+(q[1]-z).toFixed(1)}return o}
function band(i,z0,z1,rot){var n=seg(i),b=[],t=[];for(var k=0;k<=n;k++){var q=ptp(i,0,k/n,rot);b.push([q[0],q[1]-z0]);t.push([q[0],q[1]-z1])}
  return "M"+b.concat(t.reverse()).map(function(q){return q[0].toFixed(1)+" "+q[1].toFixed(1)}).join("L")+"Z"}
function ring(z,d,rot){var o="";for(var i=0;i<N;i++){var n=seg(i);for(var k=0;k<=n;k++){var q=ptp(i,d,k/n,rot);o+=(i||k?"L":"M")+q[0].toFixed(1)+" "+(q[1]-z).toFixed(1)}}return o+"Z"}
function svg3(lay,rot){
  var o='<svg class="rf3dsvg" viewBox="'+VX+' '+VY+' '+VW+' '+VH+'" aria-hidden="true" focusable="false">';
  o+='<path class="f3" d="'+ring(0,0,rot)+'"/><path class="r3" d="'+ring(HF+10,12,rot)+'"/>';
  var NA=!!gm.numberAll,SN=function(i){return (i-(gm.numStart||0)+N)%N+1},EF=NA&&E.indexOf(0)<0,num={};IDX.forEach(function(i,k){num[i]=NA?SN(i):k+1});
  if(NA)E.forEach(function(i,j){if(EF||j)num[i]=SN(i)+' · ENTRANCE'});
  var ord=[];for(var i=0;i<N;i++)ord.push(i);
  ord.sort(function(a,b){return ptp(a,0,.5,rot)[2]-ptp(b,0,.5,rot)[2]});
  ord.forEach(function(i){var t=E.indexOf(i)>=0?"E":(lay[i]||"B"),st=ST[t]||t,gq='<g class="b3" data-t="'+t+'">',mid=ptp(i,0,.5,rot),front=mid[2]>0;
    if(st==="F")gq+='<path class="cl" d="'+band(i,0,HF,rot)+'"/>';
    if(st==="H")gq+='<path class="cl" d="'+band(i,0,HF*.44,rot)+'"/><path class="gl3" d="'+band(i,HF*.44,HF,rot)+'"/>';
    if(st==="W")gq+='<path class="gl3" d="'+band(i,HF*.06,HF,rot)+'"/><path class="ln3" d="'+line(i,HF*.06,rot,0,1,1)+'"/>';
    if(st==="B"){var sp="";for(var j=1;j<8;j++){var q=ptp(i,0,j/8,rot);sp+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1)+"v-"+(HF*.37).toFixed(1)}
      gq+='<path class="bl3" d="'+band(i,HF-7,HF,rot)+'"/><path class="ln3" d="'+line(i,HF*.37,rot,0,1,1)+sp+'"/>'}
    gq+='<path class="ln3" d="'+line(i,HF,rot,0,1,1)+'"/>';if(t!=="E")gq+='<path class="hl3" d="'+band(i,0,HF,rot)+'"/>';
    var p0=ptp(i,0,0,rot);gq+='<path class="po3" d="M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+'v-'+HF.toFixed(1)+'"/>';
    if(num[i]){var pn=ptp(i,14,.5,rot);gq+='<text class="t3" x="'+pn[0].toFixed(1)+'" y="'+(front?pn[1]+12:pn[1]-HF-6).toFixed(1)+'">'+num[i]+'</text>'}
    o+=gq+'</g>'});
  if(EF){}else if(E.length){var e=ptp(E[0],0,.5,rot);o+='<text class="t3" x="'+e[0].toFixed(1)+'" y="'+Math.min(H3-4,e[1]+20).toFixed(1)+'">'+(NA?SN(E[0])+' · ENTRANCE':'ENTRANCE')+'</text>'}
  else{var fr=ptp(0,0,.5,rot);o+='<text class="t3" x="'+fr[0].toFixed(1)+'" y="'+Math.min(H3-4,fr[1]+20).toFixed(1)+'">FRONT</text>'}
  return o+'</svg>'}
/* toggle, pane and caption: the same markup as the Hampton (hp-v85.js), so hp-v85.css lays it out and fills the stage */
var vt=document.createElement("div");vt.className="hpv85-vt";vt.setAttribute("role","radiogroup");vt.setAttribute("aria-label","Drawing view");
vt.innerHTML='<button type="button" role="radio" data-v="plan" aria-checked="true" tabindex="0">Plan</button><button type="button" role="radio" data-v="3d" aria-checked="false" tabindex="-1">3D</button>';
var pane=document.createElement("div");pane.className="hpv85-3d";pane.innerHTML='<div class="rf3dw"></div>';
var cap=document.createElement("p");cap.className="hpv85-cap";cap.textContent="Indicative · tap Plan to edit sides";
stage.insertBefore(vt,stage.firstChild);stage.appendChild(pane);stage.appendChild(cap);stage.setAttribute("data-v85view","plan");
var w=pane.querySelector(".rf3dw"),btns=[].slice.call(vt.querySelectorAll("button")),seen=false,spinning=false;
function fz(){var sv=w.querySelector("svg");if(!sv)return;var bb=sv.getBoundingClientRect(),k=Math.min(bb.width/VW,bb.height/VH)||1;
  [].forEach.call(sv.querySelectorAll(".t3"),function(t){t.style.fontSize=(11/Math.min(k,1.4)).toFixed(2)+"px"})}
/* once visible, crop the frame to the drawing as measured (labels included) across the turn, so it scales up to fill the stage */
function fit(){if(fitted)return;var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;[0,12,24].forEach(function(r){w.innerHTML=svg3(S.bays.join(""),r);var b=w.querySelector("svg").getBBox();
  if(!b.width)return;x0=Math.min(x0,b.x);y0=Math.min(y0,b.y);x1=Math.max(x1,b.x+b.width);y1=Math.max(y1,b.y+b.height)});
  if(x1>x0){VX=Math.floor(x0-8);VY=Math.floor(y0-6);VW=Math.ceil(x1-x0+16);VH=Math.ceil(y1-y0+12);fitted=true}}
function paint(rot){fit();w.innerHTML=svg3(S.bays.join(""),rot||0);fz()}
function spin(){if(rm.matches){paint(0);return}var T0=performance.now(),Dd=1200,A=24;spinning=true;
  (function f(now){var k=Math.min(1,(now-T0)/Dd);paint(A*Math.sin(Math.PI*k)*(1-.15*k));if(k<1)requestAnimationFrame(f);else{spinning=false;paint(0)}})(T0)}
function view(v,focus){btns.forEach(function(b){var on=b.getAttribute("data-v")===v;b.setAttribute("aria-checked",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
  stage.setAttribute("data-v85view",v);
  if(v==="3d"){if(!seen){seen=true;paint(0);requestAnimationFrame(spin)}else if(!spinning)paint(0)}}
btns.forEach(function(b,k){b.addEventListener("click",function(e){e.stopPropagation();view(b.getAttribute("data-v"))});
  b.addEventListener("keydown",function(e){if(/Arrow(Left|Right|Up|Down)/.test(e.key)){e.preventDefault();view(btns[1-k].getAttribute("data-v"),true)}})});
/* editing always happens on the plan: opening the bay sheet switches back to Plan; layout changes repaint the 3D */
new MutationObserver(function(){if(html.classList.contains("hps-open")&&stage.getAttribute("data-v85view")==="3d")view("plan")}).observe(html,{attributes:true,attributeFilter:["class"]});
new MutationObserver(function(){if(seen&&!spinning)paint(0)}).observe(stage,{attributes:true,subtree:true,attributeFilter:["data-t"]});
addEventListener("resize",function(){if(seen&&!spinning)fz()});
window.__mp3d={view:view,svg:svg3};
})();
