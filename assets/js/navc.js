/* Nav option C: full-screen menu + floating "Book a visit" after the hero on phones. */
(function(){
  "use strict";
  var menu=document.getElementById("fsmenu");
  var openBtn=document.querySelector(".hmenu");
  var book=document.querySelector(".fbook");
  if(!menu || !openBtn) return;
  var phone=window.matchMedia("(max-width:899px)");
  var lastFocus=null;

  function focusables(){
    return Array.prototype.slice.call(menu.querySelectorAll("a[href],button:not([disabled])")).filter(function(el){
      return el.offsetParent!==null || el===document.activeElement;
    });
  }
  /* v8.6.1: everything behind the open menu is inert, so screen readers and Tab can't reach it. */
  var inerted=[];
  function setInert(on){
    if(on){
      inerted=Array.prototype.filter.call(document.body.children,function(el){
        return el!==menu && !el.contains(menu) && el.tagName!=="SCRIPT" && el.id!=="site-search" && !el.classList.contains("sov") && !el.hasAttribute("inert");
      });
      inerted.forEach(function(el){ el.setAttribute("inert",""); });
    } else {
      inerted.forEach(function(el){ el.removeAttribute("inert"); });
      inerted=[];
    }
  }
  function openMenu(){
    lastFocus=document.activeElement;
    menu.hidden=false;
    menu.classList.add("is-open");
    openBtn.setAttribute("aria-expanded","true");
    document.body.classList.add("fsm-on");
    document.body.style.overflow="hidden";
    setInert(true);
    var hdr=document.querySelector(".site-h");
    if(hdr) hdr.classList.remove("hid");
    var closeBtn=menu.querySelector("[data-fsm-close]");
    if(closeBtn) closeBtn.focus();
    syncBook();
  }
  function closeMenu(keepLock){
    if(menu.hidden) return;
    setInert(false);
    menu.hidden=true;
    menu.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded","false");
    document.body.classList.remove("fsm-on");
    if(!keepLock && !document.body.classList.contains("sov-on")) document.body.style.overflow="";
    syncBook();
    if(!keepLock){
      try{ openBtn.focus(); }catch(e){}
    }
  }

  openBtn.addEventListener("click",function(){
    if(menu.hidden) openMenu(); else closeMenu(false);
  });
  menu.querySelectorAll("[data-fsm-close]").forEach(function(b){
    b.addEventListener("click",function(){ closeMenu(false); });
  });
  menu.addEventListener("click",function(e){
    var a=e.target.closest && e.target.closest("a[href]");
    if(a) closeMenu(false);
  });
  menu.addEventListener("keydown",function(e){
    if(e.key==="Escape"){ e.stopPropagation(); closeMenu(false); return; }
    if(e.key!=="Tab") return;
    var f=focusables(); if(!f.length) return;
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  });
  document.addEventListener("keydown",function(e){
    if(menu.hidden) return;
    if(e.key==="Escape"){ e.preventDefault(); closeMenu(false); return; }
    /* v8.6.1: if focus has somehow left the menu (e.g. a click on the backdrop), Tab brings it back in. */
    if(e.key==="Tab" && !menu.contains(document.activeElement)){
      var f=focusables(); if(!f.length) return;
      e.preventDefault(); (e.shiftKey?f[f.length-1]:f[0]).focus();
    }
  });
  document.addEventListener("focusin",function(e){
    if(!menu.hidden && !menu.contains(e.target) && !(e.target.closest && e.target.closest(".sov,#site-search"))){
      var f=focusables(); if(f.length) f[0].focus();
    }
  });

  /* Search lives in the menu. Leave the scroll lock to the search overlay. */
  menu.querySelectorAll("[data-search-open]").forEach(function(b){
    b.addEventListener("click",function(){ closeMenu(true); });
  });

  function pastHero(){
    var gate=document.querySelector("main .hero, main #hero, main .rhead, main .yphd");
    if(gate) return gate.getBoundingClientRect().bottom<=1;
    return window.scrollY>window.innerHeight*0.72;
  }
  /* v8.6.1 pill rules: hides on scroll-down (back on scroll-up or after a pause), well before the
     footer and any booking form, whenever a sticky bar actually shows, and whenever a heading
     would sit under it. Visit and booking pages carry no pill at all. */
  var lastY=window.scrollY, goingDown=false, idleT=0, ticking=false;
  var PILL_ZONE=96; /* px from the viewport bottom the pill + its margin occupy */
  function visible(el){
    if(!el) return false;
    var cs=getComputedStyle(el);
    if(cs.display==="none"||cs.visibility==="hidden"||+cs.opacity===0) return false;
    var r=el.getBoundingClientRect();
    return r.height>0 && r.bottom>0 && r.top<window.innerHeight;
  }
  function stickyShowing(){
    var l=document.querySelectorAll(".stk.show");
    for(var i=0;i<l.length;i++) if(visible(l[i])) return true;
    return false;
  }
  function nearBottomBlock(){
    var lim=window.innerHeight+100;
    var l=document.querySelectorAll("footer.foot, .formsec, [data-pabook], #book, form");
    for(var i=0;i<l.length;i++){
      var r=l[i].getBoundingClientRect();
      if(r.height>0 && r.top<lim && r.bottom>0) return true;
    }
    return false;
  }
  function headingUnder(){
    var top=window.innerHeight-PILL_ZONE, l=document.querySelectorAll("main h1, main h2, main h3");
    for(var i=0;i<l.length;i++){
      var r=l[i].getBoundingClientRect();
      if(r.height>0 && r.bottom>top-8 && r.top<window.innerHeight) return true;
    }
    return false;
  }
  function openDialog(){ /* lightboxes and any other modal dialog */
    var l=document.querySelectorAll('[role="dialog"][aria-modal="true"]:not([hidden]), dialog[open]');
    for(var i=0;i<l.length;i++) if(l[i]!==menu && l[i].getClientRects().length && getComputedStyle(l[i]).display!=="none") return true;
    return false;
  }
  function blocked(){
    var b=document.body.classList;
    return b.contains("sov-on")||b.contains("cmp-on")||b.contains("fsm-on")||b.contains("v3cfg-in")||openDialog();
  }
  function syncBook(){
    if(!book) return;
    var show=false;
    if(phone.matches && menu.hidden && !blocked() && !stickyShowing() && !goingDown){
      show=pastHero() && !nearBottomBlock() && !headingUnder();
    }
    if(book.hidden===show) book.hidden=!show;
  }
  function onScroll(){
    var y=window.scrollY, dy=y-lastY;
    if(Math.abs(dy)>6){
      goingDown=dy>0; lastY=y;
      /* back after a pause; only real movement restarts the clock (scroll anchoring nudges don't) */
      clearTimeout(idleT);
      idleT=setTimeout(function(){ goingDown=false; syncBook(); },1100);
    }
    if(!ticking){ ticking=true; requestAnimationFrame(function(){ ticking=false; syncBook(); }); }
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",syncBook);
  if(phone.addEventListener) phone.addEventListener("change",syncBook);
  /* dialogs/lightboxes toggle via hidden or class: re-check when they change */
  if("MutationObserver" in window) new MutationObserver(function(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ ticking=false; syncBook(); }); } }).observe(document.body,{attributes:true,attributeFilter:["class","hidden"],subtree:true});
  syncBook();
  window.addEventListener("pageshow",function(){ if(!menu.hidden) closeMenu(false); syncBook(); });
})();
