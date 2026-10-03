/* proto-awesomeo v7: top-nav behaviour.
   1. Clicking "Gazebos & Pavilions" or "Garden Rooms" in the desktop nav (or a menu's "View all" button) opens the hub
      page and frames its hero: the header slides away and the hero fills the view with the stats band at the bottom.
      This only happens when you arrive from that click (a one-shot ?from=nav flag, removed from the address bar straight away), not on refresh or a direct visit.
   2. Hover still opens the menu; ArrowDown/Escape keep working from the keyboard. */
(function(){
  "use strict";
  var desk=window.matchMedia("(min-width:1080px)");
  var HUB={"mega-0":"gazebos/index.html","mega-1":"garden-rooms/index.html"};
  function base(){ var s=document.querySelector('script[src$="assets/js/v7-nav.js"]'); return s?s.getAttribute("src").replace("assets/js/v7-nav.js",""):"" }
  function tag(u){ return u.indexOf("from=nav")>-1?u:u.replace(/(#.*)?$/,function(h){ return (u.indexOf("?")>-1?"&":"?")+"from=nav"+(h||"") }) }
  Object.keys(HUB).forEach(function(id){
    var b=document.querySelector('.site-h [aria-controls="'+id+'"]'); if(!b) return;
    b.setAttribute("data-v7href",base()+HUB[id]);
    // capture phase: runs before site.js's disclosure toggle
    b.addEventListener("click",function(e){ if(!desk.matches) return; e.preventDefault(); e.stopImmediatePropagation(); location.href=tag(b.getAttribute("data-v7href")) },true);
    var m=document.getElementById(id); if(!m) return;
    [].forEach.call(m.querySelectorAll('a.rbtn.rs'),function(a){ a.setAttribute("href",tag(a.getAttribute("href"))) });
  });
  // on the hub: frame the hero once, if we arrived from the nav
  var qs=new URLSearchParams(location.search); if(qs.get("from")!=="nav") return;
  qs.delete("from"); var q=qs.toString(); if(history.replaceState) history.replaceState(history.state,"",location.pathname+(q?"?"+q:"")+location.hash);
  if(location.hash) return;
  var hero=document.querySelector("main .hero"), facts=null;
  if(hero){ var n=hero.nextElementSibling; while(n && !n.classList.contains("facts")) n=n.nextElementSibling; facts=n }
  if(!hero) return;
  /* v8.3 round 2: the video hero is sized to the viewport with the first products peeking and the stats band moved below
     the products, so the hub frames itself at the top; nothing to scroll. */
  if(hero.classList.contains("hv2")){ document.documentElement.setAttribute("data-v7framed","1"); return }
  if("scrollRestoration" in history) history.scrollRestoration="manual";
  function frame(){
    var top=hero.getBoundingClientRect().top+scrollY, end=(facts||hero).getBoundingClientRect().bottom+scrollY;
    // stats band sits on the bottom edge. v8.3 hero-video: hero is taller, so prefer facts-on-bottom when present
    // (the old top+120 clamp left the band ~100px below the fold once .hrel was inserted).
    var y=facts?Math.max(0,end-innerHeight):Math.max(0,Math.max(top,Math.min(end-innerHeight,top+120)));
    var h=document.querySelector(".site-h");
    window.scrollTo({top:Math.round(y),behavior:"instant"});
    if(h && y>0) h.classList.add("hid");
    document.documentElement.setAttribute("data-v7framed","1");
  }
  if(document.readyState==="complete") frame(); else window.addEventListener("load",frame);
})();
