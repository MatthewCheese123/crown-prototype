/* Nav option C: full-screen menu + floating "Book a visit" after the hero on phones. */
(function(){
  "use strict";
  var menu=document.getElementById("fsmenu");
  var openBtn=document.querySelector(".hmenu");
  var book=document.querySelector(".fbook");
  if(!menu || !openBtn) return;
  var phone=window.matchMedia("(max-width:899px)");
  var lastFocus=null;

  /* v8.7.5 menu (Matthew's pick): desktop = drop-down panel under the header, the header's Menu button reads "Close" and is the
     only close control there; phones = full-screen list with a close in the bottom bar. Scroll position is kept exactly,
     the browser Back button closes the menu, Escape closes and returns focus to Menu. */
  var desk={matches:true}; /* v8.7.5 option D: below 1024px the menu is a bottom sheet under a live header whose Menu button reads "Close"; 1024px+ uses the drop-down below */
  var mega=window.matchMedia("(min-width:1024px)");
  var hdr=document.querySelector(".site-h");
  var savedY=0, pushed=false;
  var btnLabel=openBtn.firstChild&&openBtn.firstChild.nodeType===3?openBtn.firstChild:null;
  function vis(el){ return (el.getClientRects().length>0 && getComputedStyle(el).visibility!=="hidden") || el===document.activeElement; }
  function focusables(){
    var l=Array.prototype.slice.call(menu.querySelectorAll("a[href],button:not([disabled])")).filter(vis);
    /* v9.4: the live header (logo, phone, Book a visit, Close) leads the loop */
    var hl=hdr?Array.prototype.slice.call(hdr.querySelectorAll(".hrow > a[href], .hrow > .hact > a[href], .hrow > .hact > button.hmenu")).filter(vis):[];
    if(hl.indexOf(openBtn)<0 && desk.matches && vis(openBtn)) hl.push(openBtn);
    l=hl.concat(l);
    return l;
  }
  function inLoop(el){ return menu.contains(el) || el===openBtn || focusables().indexOf(el)>=0; }
  /* v8.6.1: everything behind the open menu is inert, so screen readers and Tab can't reach it.
     v8.7.5: on desktop the header stays live (it sits above the panel and holds the Close button and search). */
  var inerted=[];
  function setInert(on){
    if(on){
      inerted=Array.prototype.filter.call(document.body.children,function(el){
        return el!==menu && !el.contains(menu) && el.tagName!=="SCRIPT" && el.id!=="site-search" && !el.classList.contains("sov") && !el.hasAttribute("inert") && !(desk.matches && el===hdr);
      });
      inerted.forEach(function(el){ el.setAttribute("inert",""); });
    } else {
      inerted.forEach(function(el){ el.removeAttribute("inert"); });
      inerted=[];
    }
  }
  function setLabel(open){ if(btnLabel) btnLabel.nodeValue=open&&desk.matches?"Close":"Menu"; }
  function placePanel(){ if(hdr) document.documentElement.style.setProperty("--fsm-top",Math.max(0,Math.round(hdr.getBoundingClientRect().bottom))+"px"); }
  function restoreY(){ if(Math.abs(window.scrollY-savedY)>1) window.scrollTo({top:savedY,left:0,behavior:"instant"}); }
  /* If the header was hidden (slid away on scroll-down) and focusing or clicking Menu made the browser scroll the page up in one
     jump to reveal it, open from where the visitor actually was. (This was the ~470px "jump" Arthur measured.) */
  var scr={y:window.scrollY,from:window.scrollY,t:0,hid:false};
  window.addEventListener("scroll",function(){
    var y=window.scrollY; scr.from=scr.y; scr.hid=scr.nowHid; scr.y=y; scr.t=Date.now();
  },{passive:true,capture:true});
  function sampleHid(){ scr.nowHid=!!(hdr&&hdr.classList.contains("hid")); }
  sampleHid(); if("MutationObserver" in window && hdr) new MutationObserver(function(){ if(hdr.classList.contains("hid")) scr.nowHid=true; else setTimeout(sampleHid,0); }).observe(hdr,{attributes:true,attributeFilter:["class"]});
  function openMenu(){
    savedY=window.scrollY;
    if(Date.now()-scr.t<400 && scr.hid && scr.from-window.scrollY>200) savedY=scr.from;
    lastFocus=document.activeElement;
    if(hdr) hdr.classList.remove("hid");
    placePanel();
    menu.hidden=false;
    menu.classList.add("is-open");
    menu.setAttribute("aria-modal",desk.matches?"false":"true");
    openBtn.setAttribute("aria-expanded","true"); setLabel(true);
    document.body.classList.add("fsm-on");
    document.body.style.overflow="hidden";
    setInert(true);
    var first=desk.matches?menu.querySelector(".tile"):menu.querySelector(".tile");
    if(first) first.focus({preventScroll:true});
    restoreY();
    if(history.pushState && !pushed){ try{ history.pushState({fsm:1},""); pushed=true; }catch(e){} }
    syncBook();
  }
  /* how: "user" (close button, Esc, backdrop) steps back over the menu's history entry;
     "pop" (Back button) has already done so; "link"/"search" leave history alone. */
  function closeMenu(keepLock,how){
    if(menu.hidden) return;
    setInert(false);
    menu.hidden=true;
    menu.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded","false"); setLabel(false);
    document.body.classList.remove("fsm-on");
    if(!keepLock && !document.body.classList.contains("sov-on")) document.body.style.overflow="";
    restoreY();
    if(pushed){ pushed=false; if(how==="user" && history.state && history.state.fsm){ try{ history.back(); }catch(e){} } }
    syncBook();
    if(!keepLock){
      try{ openBtn.focus({preventScroll:true}); }catch(e){}
      restoreY();
    }
  }
  window.addEventListener("popstate",function(){ if(!menu.hidden){ pushed=false; closeMenu(false,"pop"); } });
  /* tap on the dimmed page above the sheet closes it */
  document.addEventListener("click",function(e){ if(!menu.hidden && e.target===document.body) closeMenu(false,"user"); });

  openBtn.addEventListener("click",function(e){
    if(mega.matches) return; /* desktop: the mega-menu script handles Menu */
    if(menu.hidden) openMenu(); else closeMenu(false,"user");
  });
  /* expandable Gazebos / Garden rooms sections, one open at a time so the menu stays on one screen */
  var accs=[].slice.call(menu.querySelectorAll(".fsm-acc"));
  accs.forEach(function(b){ b.addEventListener("click",function(){
    var on=b.getAttribute("aria-expanded")!=="true";
    accs.forEach(function(o){ var x=o===b&&on; o.setAttribute("aria-expanded",x?"true":"false"); var pnl=document.getElementById(o.getAttribute("aria-controls")); if(pnl) pnl.hidden=!x; });
  }); });
  mega.addEventListener&&mega.addEventListener("change",function(){ if(mega.matches&&!menu.hidden) closeMenu(false,"user"); });
  menu.querySelectorAll("[data-fsm-close]").forEach(function(b){
    b.addEventListener("click",function(e){ closeMenu(false,e.isTrusted?"user":"link"); });
  });
  menu.addEventListener("click",function(e){
    if(e.target===menu){ closeMenu(false,"user"); return; } /* desktop: click on the dimmed page below the panel */
    var a=e.target.closest && e.target.closest("a[href]");
    if(a) closeMenu(false,"link");
  });
  menu.addEventListener("keydown",function(e){
    if(e.key==="Escape"){ e.stopPropagation(); closeMenu(false,"user"); return; }
  });
  document.addEventListener("keydown",function(e){
    if(menu.hidden) return;
    if(e.key==="Escape"){ e.preventDefault(); closeMenu(false,"user"); return; }
    if(e.key!=="Tab") return;
    var f=focusables(); if(!f.length) return;
    var i=f.indexOf(document.activeElement);
    if(i<0){ e.preventDefault(); (e.shiftKey?f[f.length-1]:f[0]).focus(); return; }
    e.preventDefault(); f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus(); /* v9.4: always step within the loop */
  });
  document.addEventListener("focusin",function(e){
    if(!menu.hidden && !inLoop(e.target) && !(e.target.closest && e.target.closest(".sov,#site-search,.hsrch"))){
      var f=focusables(); if(f.length) f[0].focus({preventScroll:true});
    }
  });
  window.addEventListener("resize",function(){ if(!menu.hidden){ placePanel(); setLabel(true); } });

  /* Search: the header icon (desktop) and the menu's search (phones) close the menu; the search overlay keeps the scroll lock. */
  document.querySelectorAll("[data-search-open]").forEach(function(b){
    b.addEventListener("click",function(){ if(!menu.hidden) closeMenu(true,"user"); });
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
  window.addEventListener("pageshow",function(){ if(!menu.hidden) closeMenu(false,"pop"); syncBook(); });
})();

/* v8.9 desktop photo panels (>=1024px), built on the v8.7.6 panel code. */
/* v8.7.6 desktop menu panel (>=1024px): the Menu button toggles it on click, Enter or Space (it reads Close while open); no hover.
   (v8.7.5 also opened it on hover over Gazebos / Garden rooms; removed at Matthew's request.) Menu opens a small drop-down of secondary links.
   Disclosure pattern, not a modal: no scroll lock, the page stays visible under a light dim. Esc closes and returns focus;
   focus leaving the tab and its panel closes it; Back closes a panel opened by click or keyboard. All panel items are real links. */
(function(){
  "use strict";
  var mq=window.matchMedia("(min-width:1024px)"), hdr=document.querySelector(".site-h");
  if(!hdr) return;
  /* v8.9: Gazebos and Garden rooms each open their own photo panel, on hover (250ms) and on click / Enter / Space; a second click goes to the page.
     The Menu button is phones/tablets only (the bar shows every section from 1024px). */
  var pairs=[].slice.call(hdr.querySelectorAll("[data-mm]")).map(function(t){ return {t:t,p:document.getElementById(t.getAttribute("data-mm")),hover:!t.classList.contains("hmenu")}; }); /* v9.3: Menu = click only */
  var mb=null, mp=null;
  pairs=pairs.filter(function(x){ return x.p; });
  if(!pairs.length) return;
  var dim=document.createElement("div"); dim.className="mm-dim"; dim.hidden=true; document.body.appendChild(dim);
  var cur=null, openT=0, closeT=0, openedAt=0, pushed=false;
  function prep(){ pairs.forEach(function(x){ if(mq.matches){ x.t.setAttribute("aria-expanded",x.p.hidden?"false":"true"); x.t.setAttribute("aria-controls",x.p.id); } }); }
  function place(x){
    var b=hdr.getBoundingClientRect().bottom; document.documentElement.style.setProperty("--mmtop",Math.round(b)+"px");
  }
  /* v9.0 sliver fix: keep the open panel glued to the header while the page scrolls (banner, compact and hidden header states) */
  addEventListener("scroll",function(){ if(cur) place(cur); },{passive:true});
  var lbl=mb&&mb.firstChild&&mb.firstChild.nodeType===3?mb.firstChild:null;
  function mark(p,on){ pairs.forEach(function(y){ if(y.p===p) y.t.setAttribute("aria-expanded",on?"true":"false"); }); if(lbl&&p===mp) lbl.nodeValue=on?"Close":"Menu"; }
  function open(x,how){
    clearTimeout(openT); clearTimeout(closeT);
    if(cur===x) return;
    if(cur&&cur.p===x.p){ x.how=cur.how==="hover"?how:cur.how; cur=x; return; } /* same panel, another trigger: keep it open */
    if(cur) shut(cur,true);
    cur=x; x.how=how; openedAt=Date.now(); place(x);
    x.p.hidden=false; dim.hidden=false; mark(x.p,true);
    document.body.classList.add("mm-on"); hdr.classList.remove("hid");
    if(how!=="hover" && history.pushState && !pushed){ try{ history.pushState({mm:1},""); pushed=true; }catch(e){} }
    if(how==="key"){ var f=x.p.querySelector("a[href]:not([tabindex='-1'])"); if(f) f.focus({preventScroll:true}); }
  }
  function shut(x,switching,how){
    if(!x||x.p.hidden) return;
    x.p.hidden=true; mark(x.p,false);
    if(cur===x) cur=null;
    if(!switching){ dim.hidden=true; document.body.classList.remove("mm-on");
      if(pushed){ pushed=false; if(how!=="pop" && how!=="link" && history.state && history.state.mm){ try{ history.back(); }catch(e){} } } }
  }
  function closeAll(how){ clearTimeout(openT); clearTimeout(closeT); if(cur) shut(cur,false,how); }
  pairs.forEach(function(x){
    if(x.hover){
      x.t.addEventListener("mouseenter",function(){ if(!mq.matches) return; clearTimeout(closeT); clearTimeout(openT);
        if(cur) open(x,cur.p===x.p?cur.how:"hover"); else openT=setTimeout(function(){ open(x,"hover"); },250); });
      /* only a panel opened by hover closes when the pointer leaves; one opened by click or keyboard stays until dismissed */
      x.t.addEventListener("mouseleave",function(){ clearTimeout(openT); if(cur&&cur.p===x.p&&cur.how==="hover"){ var c=cur; closeT=setTimeout(function(){ shut(c,false,"hover"); },300); } });
      x.p.addEventListener("mouseenter",function(){ if(cur&&cur.p===x.p) clearTimeout(closeT); });
      x.p.addEventListener("mouseleave",function(){ if(cur&&cur.p===x.p&&cur.how==="hover"){ var c=cur; closeT=setTimeout(function(){ shut(c,false,"hover"); },300); } });
    }
    /* window capture: runs before hub-nav's same-page smooth scroll */
    window.addEventListener("click",function(e){
      if(!mq.matches || !(e.target.closest&&e.target.closest("[data-mm],.hmenu")===x.t)) return;
      /* v8.7.5 link check: a tab link whose panel is already open (hover, or a first click/tap/Enter) goes to its page */
      /* v9.0: Gazebos / Garden rooms are buttons that only open their panel; a click or tap toggles it (no navigation).
         A click on a panel that hover opened keeps it open (it then stays until dismissed). */
      if(cur&&cur.p===x.p&&cur.how==="hover"){ e.preventDefault(); e.stopPropagation(); clearTimeout(closeT); cur.how=e.detail===0?"key":"click"; return; }
      e.preventDefault(); e.stopPropagation();
      if(cur&&cur.p===x.p){ shut(cur,false,"user"); }
      else open(x,e.detail===0?"key":"click");
    },true);
    x.t.addEventListener("keydown",function(e){
      if(!mq.matches) return;
      if(e.key===" "&&x.t.tagName==="A"){ e.preventDefault(); if(cur&&cur.p===x.p) shut(cur,false,"user"); else open(x,"key"); }
      if(e.key==="ArrowDown"){ e.preventDefault(); open(x,"key"); var f=x.p.querySelector("a[href]:not([tabindex='-1'])"); if(f) f.focus({preventScroll:true}); }
    });
    x.p.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("a[href]")) closeAll("link"); });
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape" && cur){ var t=cur.t; e.preventDefault(); closeAll("user"); try{ t.focus({preventScroll:true}); }catch(_){} }
  });
  /* Tab: the panel follows its tab in the reading order; leaving both closes it */
  document.addEventListener("focusin",function(e){
    if(!cur) return; var el=e.target; if(cur.p.contains(el)||pairs.some(function(y){ return y.p===cur.p&&y.t===el; })) return;
    if(el.closest&&el.closest("#site-search,.sov")) return; closeAll("user");
  });
  dim.addEventListener("click",function(){ closeAll("user"); });
  dim.addEventListener("mouseenter",function(){ if(cur&&cur.hover&&cur.how==="hover"){ clearTimeout(closeT); var x=cur; closeT=setTimeout(function(){ shut(x,false,"hover"); },300); } });
  window.addEventListener("popstate",function(){ if(cur){ pushed=false; closeAll("pop"); } });
  window.addEventListener("resize",function(){ if(!mq.matches) closeAll("user"); else if(cur) place(cur); prep(); });
  document.querySelectorAll("[data-search-open]").forEach(function(b){ b.addEventListener("click",function(){ closeAll("user"); }); });
  window.addEventListener("pageshow",function(){ closeAll("pop"); });
  prep();
})();
