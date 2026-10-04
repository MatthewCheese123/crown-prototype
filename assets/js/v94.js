/* v9.4 (4 Oct 2026): focus stays inside an open desktop panel (Gazebos, Garden rooms, Menu) until Esc or a click outside;
   the phone menu sheet shows a fade when more links sit below its fold. */
(function(){
  "use strict";
  var mq=window.matchMedia("(min-width:1024px)");
  function vis(el){ return el.getClientRects().length>0 && getComputedStyle(el).visibility!=="hidden"; }
  function openPanel(){ var p=document.querySelector(".site-h [data-mmpanel]:not([hidden])"); if(!p) return null;
    var t=document.querySelector('.site-h [data-mm="'+p.id+'"][aria-expanded="true"]')||document.querySelector('.site-h [data-mm="'+p.id+'"]'); return {p:p,t:t}; }
  function loop(x){ var l=[].slice.call(x.p.querySelectorAll("a[href],button:not([disabled])")).filter(function(e){ return e.getAttribute("tabindex")!=="-1" && vis(e); }); if(x.t) l.unshift(x.t); return l; }
  document.addEventListener("keydown",function(e){
    if(e.key!=="Tab" || !mq.matches) return; var x=openPanel(); if(!x) return;
    var l=loop(x); if(!l.length) return; var i=l.indexOf(document.activeElement);
    e.preventDefault(); e.stopPropagation();
    var n=i<0?(e.shiftKey?l.length-1:0):(i+(e.shiftKey?-1:1)+l.length)%l.length; l[n].focus({preventScroll:true});
  },true);
  /* phone sheet: fade + hint while there is more below */
  var m=document.getElementById("fsmenu"), list=m&&m.querySelector(".mlist");
  if(list){
    var sync=function(){ var more=list.scrollHeight-list.clientHeight-list.scrollTop>8; m.classList.toggle("v94fade",more); var bar=m.querySelector(".mbar4"); if(bar) m.style.setProperty("--v94bar",bar.offsetHeight+"px"); };
    list.addEventListener("scroll",sync,{passive:true}); window.addEventListener("resize",sync);
    if("MutationObserver" in window) new MutationObserver(function(){ if(!m.hidden) requestAnimationFrame(sync); }).observe(m,{attributes:true,attributeFilter:["hidden","class"],subtree:true});
  }
  /* gazebo finder deep links (#range-classic …): make sure the finder heading and filters sit fully below the header once layout settles */
  var t0=Date.now(), user=false;
  ["wheel","touchstart","keydown","mousedown"].forEach(function(t){ addEventListener(t,function(){ user=true; },{passive:true,capture:true}); });
  function fixRange(){
    if(user || Date.now()-t0>2500 || !/^#range-/.test(location.hash)) return;
    var s=document.querySelector("#models .secthead[data-land]"), h=document.querySelector(".site-h"); if(!s||!h) return;
    var hb=h.classList.contains("hid")?0:Math.max(0,h.getBoundingClientRect().bottom);
    var jn=document.querySelector("[data-v92jump]"); if(jn){ var jr=jn.getBoundingClientRect(); if(jr.height && jr.top<130 && jr.bottom>0) hb=Math.max(hb,jr.bottom); }
    var d=s.getBoundingClientRect().top-(hb+16);
    if(d<-4 || d>48) window.scrollTo({top:Math.max(0,window.scrollY+d),behavior:"instant"});
  }
  addEventListener("load",function(){ setTimeout(fixRange,250); setTimeout(fixRange,900); });
  addEventListener("hashchange",function(){ t0=Date.now(); user=false; setTimeout(fixRange,120); });
  document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("a[href*='#range-']"); if(!a||a.pathname!==location.pathname) return; t0=Date.now(); user=false; setTimeout(fixRange,150); setTimeout(fixRange,600); });
})();
