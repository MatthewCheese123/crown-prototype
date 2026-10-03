/* v8.7.3 (gazebos and garden rooms hubs): on the hub itself, the header's Gazebos / Garden rooms links, the menu links and the
   garden-room collection chips smooth-scroll (instant with reduced motion) to their section through v3-jump's landing rules,
   clear of the sticky header and chip row. The chip row marks the collection in view. */
(function(){
"use strict";
var D=document;
D.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest("a[href*='#']"); if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button) return;
  if(a.pathname!==location.pathname) return;
  var h=decodeURIComponent(a.hash.slice(1)), el=h&&D.getElementById(h); if(!el) return;
  if(!a.closest(".site-h,.fsmenu,.grc3")&&!/^(ranges|collections|compare)$/.test(h)) return;
  e.preventDefault();
  var m=a.closest(".fsmenu"); if(m){var x=m.querySelector("[data-fsm-close]"); if(x) x.click()}
  if(history.pushState&&location.hash!=="#"+h) history.pushState(null,"",location.pathname+"#"+h);
  setTimeout(function(){ if(window.__v3jump) __v3jump.go(el,{behavior:"smooth"}); else el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}) },m?60:0);
},true);
var nav=D.querySelector("[data-grc3]"); if(!nav) return;
var chips=[].slice.call(nav.querySelectorAll(".grc3c")), secs=chips.map(function(c){return D.getElementById(c.hash.slice(1))});
function cur(){ var nb=nav.getBoundingClientRect().bottom, on=[], best=-1e9;
  secs.forEach(function(s,i){ if(!s) return; var r=s.getBoundingClientRect(); if(r.top<=nb+60&&r.bottom>nb){ if(r.top>best+4){best=r.top;on=[i]} else if(Math.abs(r.top-best)<=4) on.push(i) } });
  chips.forEach(function(c,i){ var y=on.indexOf(i)>=0; if(y) c.setAttribute("aria-current","true"); else c.removeAttribute("aria-current") });
  nav.classList.toggle("stuck",Math.abs(nav.getBoundingClientRect().top-(parseFloat(getComputedStyle(nav).top)||0))<1&&scrollY>0) }
var raf=0; addEventListener("scroll",function(){ if(!raf) raf=requestAnimationFrame(function(){raf=0;cur()}) },{passive:true}); addEventListener("resize",cur); cur();
})();
