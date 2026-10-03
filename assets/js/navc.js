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
  function openMenu(){
    lastFocus=document.activeElement;
    menu.hidden=false;
    menu.classList.add("is-open");
    openBtn.setAttribute("aria-expanded","true");
    document.body.classList.add("fsm-on");
    document.body.style.overflow="hidden";
    var hdr=document.querySelector(".site-h");
    if(hdr) hdr.classList.remove("hid");
    var closeBtn=menu.querySelector("[data-fsm-close]");
    if(closeBtn) closeBtn.focus();
    syncBook();
  }
  function closeMenu(keepLock){
    if(menu.hidden) return;
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
    if(e.key==="Escape" && !menu.hidden){ e.preventDefault(); closeMenu(false); }
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
  function syncBook(){
    if(!book) return;
    var show=false;
    if(phone.matches && menu.hidden && !document.body.classList.contains("sov-on") && !document.body.classList.contains("cmp-on") && !document.body.classList.contains("fsm-on") && !document.querySelector(".stk.show")){
      show=pastHero();
      var foot=document.querySelector("footer.foot");
      if(foot && foot.getBoundingClientRect().top<window.innerHeight-8) show=false;
    }
    book.hidden=!show;
  }
  window.addEventListener("scroll",function(){ syncBook(); },{passive:true});
  window.addEventListener("resize",syncBook);
  if(phone.addEventListener) phone.addEventListener("change",syncBook);
  syncBook();
  window.addEventListener("pageshow",function(){ if(!menu.hidden) closeMenu(false); syncBook(); });
})();
