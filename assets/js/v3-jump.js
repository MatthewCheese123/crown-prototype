/* proto-awesomeo v3: in-page jumps and auto-scrolls land on the usable content, not the section heading.
   Loaded before site.js so every scrollIntoView (site.js, pa.js, generator) goes through here.
   - Top offset = what is actually pinned at the top after the jump: the sticky site header, or on collection
     pages at >=1080px the slim .stk bar (the header slides away while you move down the page).
   - Bottom offset = any visible bottom bar (.mbar / .pabar / mobile .stk / configurator footer).
   - Landing block: [data-land] inside the target if present, else the block after a section's .secthead. */
(function(){
  "use strict";
  var D=document, root=D.documentElement, GAP=16, orig=Element.prototype.scrollIntoView;
  var desk=window.matchMedia("(min-width:1080px)"), reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
  var hdr=null, stk=null, want=null, lockUntil=0;
  function q(s){return D.querySelector(s)}
  function vis(e){ if(!e) return false; var cs=getComputedStyle(e); if(cs.display==="none"||cs.visibility==="hidden") return false; var r=e.getBoundingClientRect(); return r.height>0 && r.bottom>0 && r.top<innerHeight }
  function inCfg(el){ return !!(el && el.closest && el.closest(".ccfg")) }
  function topMode(el){ // "stk" (collection page, desktop), "none" (configurator hides the bars) or "hdr"
    stk=stk||q(".stk"); if(stk && desk.matches) return inCfg(el)?"none":"stk"; return "hdr" }
  function chipsH(el){ /* v8.4: a sticky jump-chip row in the same section also covers the top */
    var sec=el&&el.closest&&el.closest(".psec"), c=sec&&sec.querySelector(".gzchips,.grchips,.grc3");
    if(!c||c===el||c.contains(el)||!c.offsetHeight||getComputedStyle(c).position!=="sticky") return 0;
    /* v8.7.3: only when the chip row comes before the target (a heading above the row is not covered by it) */
    if(!(c.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING)) return 0; return c.offsetHeight }
  function baseTop0(el){ hdr=hdr||q(".site-h"); var m=topMode(el); if(m==="none") return 0; if(m==="stk") return stk.offsetHeight||58; return hdr?hdr.offsetHeight:0 }
  function baseTop(el){ var m=topMode(el), b=baseTop0(el); return (m==="none"?0:b)+chipsH(el) }
  // Sticky toolbars that sit under the site header (finder filters, etc.) and will pin above the target
  function extraPin(el){
    if(!el || !el.closest) return 0;
    var box=el.closest(".v4f, .finder, [data-finder]"); if(!box) return 0;
    // If the land target is the filters themselves, don't add their height
    if(el.classList && el.classList.contains("filters")) return 0;
    if(el.closest && el.closest(".filters")) return 0;
    var f=box.querySelector(".filters"); if(!f || f===el || !f.offsetHeight) return 0;
    // Only when filters actually pin (desktop sticky); on mobile they are static
    var pos=getComputedStyle(f).position; if(pos!=="sticky" && pos!=="fixed") return 0;
    // Only count filters when the target is below them in the finder
    // v8.2: use document order, not geometry. When the jump starts below the finder the filters are stuck at the finder's end,
    // so their on-screen position said "below the target" and the group header landed under them.
    if(!(f.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) return 0;
    return f.offsetHeight||0;
  }
  // v8.1: on phones the configurator's step tabs stay pinned over the options panel, so panel targets land below them too
  function tabsH(el){ var p=el && el.closest && el.closest(".ccfg .bpanel"); if(!p) return 0; var bt=p.closest(".ccfg").querySelector(".btabs");
    return (bt && getComputedStyle(bt).position==="sticky")?bt.offsetHeight:0 }
  function topH(el){ return baseTop(el)+extraPin(el)+tabsH(el) }
  function botH(){ var h=0; [".mbar.show",".pabar.show",".stk.show",".ccfg .bfoot"].forEach(function(s){ var e=q(s); if(e && vis(e)){ var r=e.getBoundingClientRect(); if(r.bottom>=innerHeight-2) h=Math.max(h,innerHeight-r.top) } }); return h }
  function land(el){
    if(!el) return el;
    if(el.hasAttribute("data-land-self")) return el;
    // Zero-height seat/filter anchors: land on the finder filters (or section content)
    if(el.classList && el.classList.contains("anc") || (el.tagName==="SPAN" && !el.offsetHeight)){
      var sec=el.closest("section, .sec")||el.parentElement, f=sec && sec.querySelector(".filters");
      if(f && f.offsetParent) return f;
      return land(sec)||el;
    }
    // Range groups keep themselves (cards under the sticky filters)
    if(el.classList && el.classList.contains("mgrp")) return el;
    var t=el.querySelector("[data-land]"); if(t && t.offsetParent) return t;
    if(/^H[1-4]$/.test(el.tagName)){ var s=el.closest("section"); if(s && s.querySelector(".secthead")) return land(s); return el }
    var sh=el.matches("section, .sec")?el.querySelector(".secthead"):null;
    if(sh){ var n=sh.nextElementSibling; while(n && (n.hidden||!n.offsetHeight||n.tagName==="SCRIPT")) n=n.nextElementSibling; if(n) return n }
    if(el.tagName==="SECTION"){ // no .secthead: skip the section's top padding and land on its first block
      var w=el.querySelector(":scope > .wrap")||el, f=w.firstElementChild; while(f && (f.hidden||!f.offsetHeight||f.tagName==="SCRIPT"||f.classList.contains("anc"))) f=f.nextElementSibling; if(f) return f }
    return el;
  }
  function stkWill(y){ var t=q("[data-sticky-trigger]"); if(!t) return false; if(t.getBoundingClientRect().bottom+scrollY>y) return false;
    var ends=D.querySelectorAll(".formsec, footer.foot"); for(var i=0;i<ends.length;i++){ var b=ends[i].getBoundingClientRect(), tp=b.top+scrollY; if(tp<y+innerHeight && tp+b.height>y) return false } return true }
  function setHeader(mode){ hdr=hdr||q(".site-h"); if(!hdr) return; want=(mode==="hdr")?"show":"hide"; lockUntil=Date.now()+6000; apply() }
  function apply(){ if(!hdr||!want||Date.now()>lockUntil) return; var h=hdr.classList.contains("hid"); if(want==="hide" && !h) hdr.classList.add("hid"); else if(want==="show" && h) hdr.classList.remove("hid") }
  function go(el,opt){
    opt=opt||{}; var L=land(el), m=topMode(L), th, bh=botH(), r=L.getBoundingClientRect(), y, block=opt.block||"start", pin;
    /* v8.3 (Felix N5): a sticky landing target (finder .filters) reports where it is stuck, not where it sits; measure it unstuck */
    if(getComputedStyle(L).position==="sticky"){ var ps=L.style.position; L.style.position="static"; r=L.getBoundingClientRect(); L.style.position=ps }
    // the slim .stk bar only shows once the hero CTA has scrolled away and the form/footer are off screen: if it will not, keep the header
    pin=extraPin(L)+tabsH(L); th=baseTop(L)+pin;
    if(m==="stk" && !stkWill(r.top+scrollY-th-GAP)){ m="hdr"; th=(hdr?hdr.offsetHeight:0)+pin }
    if(block==="center"){ var avail=innerHeight-th-bh; y=r.top+scrollY-th-Math.max(GAP,(avail-r.height)/2) }
    else if(block==="nearest"||block==="end"){ if(r.top>=th && r.bottom<=innerHeight-bh) return; y=(r.top<th||block==="nearest"&&r.height>innerHeight-th-bh)?r.top+scrollY-th-GAP:r.bottom+scrollY-(innerHeight-bh)+GAP }
    else y=r.top+scrollY-th-(m==="none"?0:GAP);
    // v7: a jump down the page slides the header away (scroll up to bring it back); close to the top the header stays.
    // Keep sticky toolbars (filters) in the offset even when the site header hides.
    if(m==="hdr" && topMode(L)==="hdr" && hdr && block==="start"){ var yh=r.top+scrollY-pin-chipsH(L)-GAP; if(yh>hdr.offsetHeight+160){ y=yh; m="hide" } }
    y=Math.max(0,Math.round(y)); setHeader(m);
    window.scrollTo({top:y,behavior:(opt.behavior==="smooth"&&!reduce.matches)?"smooth":"instant"});
    if(opt.inline && opt.inline!=="nearest") try{ orig.call(el,{block:"nearest",inline:opt.inline,behavior:"auto"}) }catch(e){}
  }
  window.__v3jump={go:go,land:land,topH:topH,botH:botH,gap:GAP};
  Element.prototype.scrollIntoView=function(o){
    // horizontal-only scrollers (tab strips, tables) keep the native behaviour
    if(this.closest("[data-hscroll]")) return orig.apply(this,arguments);
    var opt=(typeof o==="object"&&o)?o:{block:o===false?"end":"start"}; go(this,opt);
  };
  // keep the header in the state the jump expects while the scroll settles (site.js toggles it on scroll direction)
  var mo=new MutationObserver(apply);
  // the lock holds until the visitor scrolls by hand (wheel, touch, keys), so site.js's scroll-direction rule
  // cannot slide the header over the content we just landed on
  function release(){ lockUntil=0 }
  ["wheel","touchstart","keydown","mousedown"].forEach(function(t){ window.addEventListener(t,function(e){ if(t==="keydown" && !/^(Arrow|Page|Home|End| )/.test(e.key)) return; if(t==="mousedown" && e.target.closest && e.target.closest("a,button")) return; release() },{passive:true,capture:true}) });
  function boot(){ hdr=q(".site-h"); stk=q(".stk"); if(hdr) mo.observe(hdr,{attributes:true,attributeFilter:["class"]}); sync() }
  // CSS fallbacks: scroll-margin/padding = the real pinned heights
  function sync(){ root.style.setProperty("--toph",(topH(null)+GAP)+"px"); root.style.setProperty("--both",botH()+"px") }
  window.addEventListener("resize",sync); window.addEventListener("scroll",function(){ if(Date.now()>lockUntil) return; requestAnimationFrame(apply) },{passive:true});
  if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",boot); else boot();
  function special(h){ return /^(range|seats|model)-/.test(h) || !!q('[role=tab][data-hash="'+h+'"]') }
  // same-page links: land on the content (site.js keeps its own handling for filters, model cards and tab hashes)
  D.addEventListener("click",function(e){
    var a=e.target.closest && e.target.closest("a[href*='#']"); if(!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    if(a.pathname!==location.pathname || a.search!==location.search) return;
    var h=decodeURIComponent(a.hash.slice(1)); if(!h || h==="main" || special(h)) return;
    var el=D.getElementById(h); if(!el) return;
    e.preventDefault(); if(history.pushState && location.hash!=="#"+h) history.pushState(null,"","#"+h);
    /* v8.3 B2: instant same-page jumps — smooth + header-hide was overshooting headings by 50–300px */
    go(el,{behavior:"instant"});
  });
  // arriving with a #hash (cross-page links such as "Compare all collections"): re-align once layout has settled
  function arrive(){ var h=decodeURIComponent(location.hash.slice(1)); if(!h || h==="main" || /^(range|seats)-/.test(h)) return; var el=D.getElementById(h);
    var t=q('[role=tab][data-hash="'+h+'"]'); if(t) el=t.closest("section");
    /* v9.0: a hub's video-hero section (#ranges, #collections) is the top of the page: no re-align past the film */
    if(el && el.hasAttribute("data-cvx")) return;
    if(el) go(el,{block:/^model-/.test(h)?"center":"start"}) }
  window.addEventListener("load",function(){ setTimeout(arrive,140); setTimeout(arrive,900) }); /* v8.3 B2: re-land after lazy images */
  // main nav (desktop, mouse): hovering "Gazebos & Pavilions" / "Garden Rooms" opens the ribbon as before; clicking goes to
  // that ribbon's "View all" page. Keyboard (Enter/Space) and touch keep the disclosure behaviour.
  var fine=window.matchMedia("(hover:hover) and (pointer:fine)");
  D.addEventListener("click",function(e){
    var b=e.target.closest && e.target.closest(".nav button[aria-controls^=mega-]"); if(!b || !e.detail || !fine.matches || !desk.matches) return;
    var v=D.querySelector("#"+b.getAttribute("aria-controls")+" .ribf a.rs"); if(!v) return;
    e.preventDefault(); e.stopImmediatePropagation(); location.href=v.href;
  },true);
})();
