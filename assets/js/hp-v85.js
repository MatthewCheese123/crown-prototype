/* v8.5 (Hampton page only): mounts the refined bay-sheet Sides step (hp-sides.js) into the live configurator,
   words for the Sides subtitle and summary line, one price bar per context, summary-tab and hero tidy hooks.
   Prices are unchanged: hp-cfg.js still owns total(); the side layout never changes the price. */
(function(){
"use strict";
var H=window.__hpcfg, host=document.querySelector("[data-hpsides]");
if(!H||!window.HPSides||!host) return;
var S=H.state, root=document.querySelector("[data-hpcfg]"), html=document.documentElement;
var PRE=HPSides.PRE, NAME={std:"Standard",open:"Open to the view",shel:"Sheltered"};
function layName(){var s=S.bays.join("");for(var k in PRE)if(PRE[k]===s)return NAME[k];return "Bespoke"}
function mix(){var c={B:0,F:0,H:0};S.bays.forEach(function(t){if(c[t]!=null)c[t]++});return c.F+" clad, "+c.H+" half-perspex, "+c.B+" open"}
/* keep the 3D preview (hp-refine) when the stage plan is replaced */
var stage=document.querySelector(".hpplanw"), d3=document.querySelector(".rf3d"); if(d3) d3.remove();
var api=HPSides.mount(host,{img:"../../assets/img/hampton/",initial:S.bays.join(""),planHost:stage,
  priceBar:".hpcfg .bfoot, .hp-stk",header:".site-h, .btabs",
  say:function(){},
  onChange:function(a){S.bays=a;H.upd();words();setTimeout(function(){document.body.dispatchEvent(new MouseEvent("click",{bubbles:true}))},0)}});
/* Plan | 3D segmented toggle (top-left of the drawing). The existing inline 3D preview (hp-refine.js, .rf3d) is only
   attached and painted on the first tap of 3D; its separate "View in 3D" pill is no longer shown. */
var mob=matchMedia("(max-width:999px)"), rm=matchMedia("(prefers-reduced-motion: reduce)");
if(stage){
  var vt=document.createElement("div");vt.className="hpv85-vt";vt.setAttribute("role","radiogroup");vt.setAttribute("aria-label","Drawing view");
  vt.innerHTML='<button type="button" role="radio" data-v="plan" aria-checked="true" tabindex="0">Plan</button><button type="button" role="radio" data-v="3d" aria-checked="false" tabindex="-1">3D</button>';
  var pane=document.createElement("div");pane.className="hpv85-3d";pane.innerHTML='<div class="hpv85-ld" role="status"><i aria-hidden="true"></i><span>Loading 3D view…</span></div>';
  var cap=document.createElement("p");cap.className="hpv85-cap";cap.textContent="Indicative · tap Plan to edit sides";
  stage.insertBefore(vt,stage.firstChild);stage.appendChild(pane);stage.appendChild(cap);stage.setAttribute("data-v85view","plan");
  var loaded=false,btns=[].slice.call(vt.querySelectorAll("button"));
  var view=function(v,focus){btns.forEach(function(b){var on=b.getAttribute("data-v")===v;b.setAttribute("aria-checked",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
    if(v==="3d"&&!loaded){loaded=true;stage.classList.add("hpv85-loading");
      setTimeout(function(){if(d3){d3.open=true;pane.appendChild(d3)}
        document.body.dispatchEvent(new MouseEvent("click",{bubbles:true})); /* hp-refine repaints the 3D from the current bays */
        var t0=Date.now();(function wait(){var ok=pane.querySelector(".rf3dw svg");if(ok||Date.now()-t0>1500){stage.classList.remove("hpv85-loading");var l=pane.querySelector(".hpv85-ld");if(l)l.remove();if(ok)spin()}else requestAnimationFrame(wait)})()},rm.matches?0:120)}
    else if(v==="3d") document.body.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    stage.setAttribute("data-v85view",v)};
  btns.forEach(function(b,k){b.addEventListener("click",function(e){e.stopPropagation();view(b.getAttribute("data-v"))});
    b.addEventListener("keydown",function(e){if(/Arrow(Left|Right|Up|Down)/.test(e.key)){e.preventDefault();view(btns[1-k].getAttribute("data-v"),true)}})});
  /* editing always happens on the plan: opening the bay sheet switches back to Plan */
  new MutationObserver(function(){if(html.classList.contains("hps-open")&&stage.getAttribute("data-v85view")==="3d")view("plan")}).observe(html,{attributes:true,attributeFilter:["class"]});
  /* first switch to 3D only: a gentle one-off turn (out to ~24° and back, 1.2s), then it stops. Skipped with reduced motion. */
  var spin=function(){var w=pane.querySelector(".rf3dw");if(!w||rm.matches)return;var T0=performance.now(),D=1200,A=24;
    (function f(now){var k=Math.min(1,(now-T0)/D),e=Math.sin(Math.PI*k)*(k<.5?1:1);w.innerHTML=svg3(S.bays.join(""),A*Math.sin(Math.PI*k)*(1-.15*k));
      if(k<1)requestAnimationFrame(f);else document.body.dispatchEvent(new MouseEvent("click",{bubbles:true}))})(T0)};
  window.__hpv85view=view;
}
function P3(cx,cy,rx,ry,a){a=a*Math.PI/180;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)]}
function svg3(lay,rot){var W=420,H=262,cx=210,cy=168,rx=178,ry=66,HF=82,s='<svg class="rf3dsvg" viewBox="0 0 '+W+' '+H+'" aria-hidden="true" focusable="false">';
  function band(a0,a1,h0,h1){var t=[],b=[],k;for(k=0;k<=10;k++){var p=P3(cx,cy,rx,ry,a0+(a1-a0)*k/10);b.push([p[0],p[1]-h0]);t.push([p[0],p[1]-h1])}return "M"+b.concat(t.reverse()).map(function(q){return q[0].toFixed(1)+" "+q[1].toFixed(1)}).join("L")+"Z"}
  function ring(a0,a1,dy){var d="",k;for(k=0;k<=10;k++){var p=P3(cx,cy,rx,ry,a0+(a1-a0)*k/10);d+=(k?"L":"M")+p[0].toFixed(1)+" "+(p[1]-dy).toFixed(1)}return d}
  s+='<ellipse class="f3" cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"/><path class="r3" d="'+ring(0,360,HF+12)+'"/>';
  var ord=[0,1,2,3,4,5,6,7,8,9].sort(function(a,b){return Math.sin((90+36*a+rot)*Math.PI/180)-Math.sin((90+36*b+rot)*Math.PI/180)});
  ord.forEach(function(i){var a0=90+36*i-18+rot,a1=90+36*i+18+rot,t=lay[i],m=90+36*i+rot,front=Math.sin(m*Math.PI/180)>0,g='<g class="b3" data-t="'+t+'">';
    if(t==="F")g+='<path class="cl" d="'+band(a0,a1,0,HF)+'"/>';
    if(t==="H")g+='<path class="cl" d="'+band(a0,a1,0,36)+'"/><path class="gl3" d="'+band(a0,a1,36,HF)+'"/>';
    if(t==="B"){var bl="";for(var j=1;j<8;j++){var q=P3(cx,cy,rx,ry,a0+(a1-a0)*j/8);bl+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1)+"v-30"}g+='<path class="bl3" d="'+band(a0,a1,HF-7,HF)+'"/><path class="ln3" d="'+ring(a0,a1,30)+bl+'"/>'}
    g+='<path class="ln3" d="'+ring(a0,a1,HF)+'"/>';if(t!=="E")g+='<path class="hl3" d="'+band(a0,a1,0,HF)+'"/>';
    var pp=P3(cx,cy,rx,ry,a1);g+='<path class="po3" d="M'+pp[0].toFixed(1)+' '+pp[1].toFixed(1)+'v-'+HF+'"/>';
    if(i){var pn=P3(cx,cy,rx+16,ry+14,m);g+='<text class="t3" x="'+pn[0].toFixed(1)+'" y="'+(front?pn[1]+12:pn[1]-HF-6).toFixed(1)+'">'+i+'</text>'}
    s+=g+'</g>'});
  var e=P3(cx,cy,rx,ry,90+rot);s+='<text class="t3" x="'+e[0].toFixed(1)+'" y="'+(e[1]+20).toFixed(1)+'">ENTRANCE</text>';
  return s+'</svg>'}
/* Sides subtitle and summary line in words, never letter codes */
var busy=false;
function words(){if(busy)return;busy=true;
  [].forEach.call(document.querySelectorAll("[data-hpo=sidesv]"),function(e){var n=layName();if(e.textContent!==n)e.textContent=n});
  [].forEach.call(document.querySelectorAll("[data-hpo=lines] li"),function(li){var b=li.querySelector("b"),sm=li.querySelector("small");if(b&&sm&&b.textContent==="Sides"){var t=layName()+": "+mix();if(sm.textContent!==t)sm.textContent=t}});
  busy=false}
var mo=new MutationObserver(function(){words()});
[].forEach.call(document.querySelectorAll("[data-hpo=sidesv],[data-hpo=lines]"),function(e){mo.observe(e,{childList:true,characterData:true,subtree:true})});
words();
/* one price bar: inside the configurator the green bar carries the price; on the summary tab the page bar does */
function tab(){html.classList.toggle("hpv85-sum",root.getAttribute("data-hptab")==="6")}
new MutationObserver(tab).observe(root,{attributes:true,attributeFilter:["data-hptab"]});tab();
var ds=document.getElementById("design");
if(ds&&"IntersectionObserver" in window) new IntersectionObserver(function(es){es.forEach(function(e){html.classList.toggle("hpv85-incfg",e.isIntersecting)})},{rootMargin:"-30% 0px -30% 0px"}).observe(ds);
window.__hpsides=api;
})();
