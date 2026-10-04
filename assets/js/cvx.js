/* v8.8 condense: hub hero (short video band + range/collection cards).
   Loads the hero film like hero-video.js (no src in HTML, phone file under 900px, poster only for
   reduced motion / Save-Data, pause button). Optional video-expand (data-cvx-expand, desktop mouse only):
   rest the pointer on the film ~1s -> film grows, cards fold into a slim strip; pointer on the strip -> cards return. */
(function(){
  var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-cvx]").forEach(function(sec){
    var hero=sec.querySelector(".cvx-hero"), v=hero&&hero.querySelector("video"), btn=hero&&hero.querySelector(".cvx-ctl"),
        body=sec.querySelector(".cvx-body");
    if(!hero) return;
    /* ---- film ---- */
    if(v){
      var mob=window.innerWidth<900, loaded=false, userPaused=false;
      if(mob&&v.getAttribute("data-poster-m")) v.poster=v.getAttribute("data-poster-m");
      var load=function(){ if(loaded) return; loaded=true; var s=document.createElement("source");
        s.src=v.getAttribute(mob&&v.getAttribute("data-src-m")?"data-src-m":"data-src"); s.type="video/mp4"; v.appendChild(s); v.load() };
      var ui=function(p){ if(!btn) return; btn.hidden=false; btn.setAttribute("aria-label",p?"Pause background video":"Play background video");
        btn.innerHTML=p?'<span aria-hidden="true">❚❚</span>':'<span aria-hidden="true">▶</span>' };
      var play=function(){ load(); var p=v.play(); if(p&&p.catch) p.catch(function(){ ui(false) }) };
      v.addEventListener("playing",function(){ v.classList.add("on"); ui(true) });
      v.addEventListener("pause",function(){ ui(false) });
      if(btn) btn.addEventListener("click",function(){ if(v.paused){ userPaused=false; play() } else { userPaused=true; v.pause() } });
      var C=navigator.connection, SD=!!(C&&(C.saveData||/(^|-)2g$/.test(C.effectiveType||"")));
      if((RM&&RM.matches)||SD){ v.removeAttribute("autoplay"); ui(false) }
      else { ui(true); load();
        if("IntersectionObserver" in window) new IntersectionObserver(function(es){ es.forEach(function(e){
          if(e.isIntersecting){ if(!userPaused&&v.paused) play() } else if(!v.paused) v.pause() }) },{threshold:0.1}).observe(v) }
    }
    /* ---- video-expand (mock-up behaviour; only when data-cvx-expand is present) ---- */
    if(!sec.hasAttribute("data-cvx-expand")||!body) return;
    var MQ=matchMedia("(min-width:1024px) and (hover:hover) and (pointer:fine)");
    var DWELL=+sec.getAttribute("data-cvx-dwell")||900, t=0, rt=0, ax=-99, ay=-99, x=false;
    function can(){ if(!MQ.matches) return false; var r=hero.getBoundingClientRect(); return r.top>-60&&r.bottom<=window.innerHeight+8 }
    function expand(){ if(x||!can()) return;
      var r=sec.getBoundingClientRect(), cs=getComputedStyle(sec), strip=parseFloat(cs.getPropertyValue("--cvx-strip"))||64,
          total=window.innerHeight-Math.max(r.top,0) /* v9.0: the film and its strip fit the screen (the A3v2 block is taller than the old cards) */;
      sec.style.setProperty("--cvx-hx",Math.round(total-strip-6)+"px"); sec.classList.add("is-x"); x=true;
      body.setAttribute("data-strip",""); sec.dispatchEvent(new CustomEvent("cvx:change",{detail:{expanded:true}})) }
    function restore(){ if(!x) return; sec.classList.remove("is-x"); body.removeAttribute("data-strip"); x=false;
      sec.dispatchEvent(new CustomEvent("cvx:change",{detail:{expanded:false}})) }
    function arm(e){ clearTimeout(t); ax=e.clientX; ay=e.clientY; t=setTimeout(expand,DWELL) }
    hero.addEventListener("pointerenter",function(e){ if(e.pointerType==="mouse"&&!x) arm(e) });
    hero.addEventListener("pointermove",function(e){ if(e.pointerType!=="mouse"||x) return;
      if(Math.abs(e.clientX-ax)+Math.abs(e.clientY-ay)>16) arm(e) });   /* "rests" = stays roughly still */
    hero.addEventListener("pointerleave",function(){ clearTimeout(t) });
    body.addEventListener("pointerenter",function(e){ if(e.pointerType!=="mouse") return; clearTimeout(t); if(x) rt=setTimeout(restore,70) });
    body.addEventListener("pointerleave",function(){ clearTimeout(rt) });
    sec.addEventListener("focusin",function(e){ if(body.contains(e.target)) restore() });   /* keyboard always gets full cards */
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") restore() });
    if(MQ.addEventListener) MQ.addEventListener("change",function(){ if(!MQ.matches) restore() });
    window.addEventListener("resize",function(){ if(x) restore() });
    sec.cvx={expand:expand,restore:restore};   /* used by the screenshot script */
  });
})();
