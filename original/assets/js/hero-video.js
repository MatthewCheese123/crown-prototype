/* v8.3 hero video: Crown's own hero films, self-hosted (assets/video/).
   Markup: <video data-hv data-src="…-1600.mp4" data-src-m="…" data-poster-m="…" data-m="portrait|narrow">.
   No src in the HTML, so the right file is chosen before anything downloads.
   Reduced motion: poster only (no source set) until the visitor presses Play. WCAG 2.2.2 pause button. */
(function(){
  var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("video[data-hv]").forEach(function(v){
    var hero=v.closest(".hero"), btn=hero&&hero.querySelector(".vctl"), userPaused=false, loaded=false;
    function mobile(){ var m=v.getAttribute("data-m"), r=v.getBoundingClientRect();
      return m==="portrait" ? r.height>r.width : (window.innerWidth<900) }
    var mob=v.getAttribute("data-src-m")&&mobile();
    if(mob&&v.getAttribute("data-poster-m")) v.poster=v.getAttribute("data-poster-m");
    function load(){ if(loaded) return; loaded=true; var s=document.createElement("source");
      s.src=v.getAttribute(mob?"data-src-m":"data-src"); s.type="video/mp4"; v.appendChild(s); v.load() }
    function ui(playing){ if(!btn) return; btn.hidden=false;
      btn.innerHTML=playing?'<span aria-hidden="true">❚❚</span> Pause video':'<span aria-hidden="true">▶</span> Play video';
      btn.setAttribute("aria-label",playing?"Pause background video":"Play background video") }
    function play(){ load(); var p=v.play(); if(p&&p.catch) p.catch(function(){ ui(false) }) }
    v.addEventListener("playing",function(){ v.classList.add("on"); ui(true) });
    v.addEventListener("pause",function(){ ui(false) });
    if(btn){ btn.removeAttribute("aria-pressed");
      btn.addEventListener("click",function(){ if(v.paused){ userPaused=false; play() } else { userPaused=true; v.pause() } }) }
    /* poster only: reduced motion, Save-Data, or a 2G connection (the visitor can still press Play) */
    var C=navigator.connection, SD=!!(C&&(C.saveData||/(^|-)2g$/.test(C.effectiveType||"")));
    if((RM&&RM.matches)||SD){ v.removeAttribute("autoplay"); hero.classList.add("hv-still"); ui(false); return }
    ui(true); load();
    /* pause off-screen to save battery; resume only if the visitor hadn't paused it */
    if("IntersectionObserver" in window) new IntersectionObserver(function(es){ es.forEach(function(e){
      if(e.isIntersecting){ if(!userPaused&&v.paused) play() } else if(!v.paused) v.pause() }) },{threshold:0.1}).observe(v);
  });
  /* home: "Explore gazebos / garden rooms" jump to "What would you like to build?" and focus that card */
  document.querySelectorAll("[data-explore]").forEach(function(a){ a.addEventListener("click",function(){
    var k=a.getAttribute("data-explore"), c=document.querySelector('#collections .pac[href*="'+k+'/index.html"]'); if(!c) return;
    setTimeout(function(){ document.querySelectorAll(".pac.pacx").forEach(function(x){ x.classList.remove("pacx") });
      c.classList.add("pacx"); c.focus({preventScroll:true}); setTimeout(function(){ c.classList.remove("pacx") },2600) },450) }) });

  /* v8.3 round 2: from 900px, size the hero so the first product tile peeks ~48px above the fold
     (never taller than viewport - header - 72px, never shorter than 460px; v8.4: viewport - header - 180px). Below 900px the CSS layout already does it. */
  var hero=document.querySelector(".hero.hv2"), prod=hero&&hero.parentNode.querySelector(".psec");
  function fit(){ if(!hero) return; if(window.innerWidth<900){ hero.style.height=""; return }
    var tile=prod&&prod.querySelector(".pac,.card"), top=hero.getBoundingClientRect().top+window.scrollY;
    var vh=window.innerHeight, h=vh-top-180; /* v8.4 decided: viewport - header - 180px, min 460px */
    hero.style.height=Math.max(460,Math.round(h))+"px" }
  if(hero){ fit(); window.addEventListener("resize",fit); window.addEventListener("load",fit) }
})();
