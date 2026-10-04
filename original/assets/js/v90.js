/* v9.0: below 1024px the header's Gazebos / Garden rooms buttons open the menu sheet at their group (tap again to close).
   From 1024px navc.js opens the photo panels (hover, click / tap toggles, Esc closes). They never navigate. */
(function(){
  "use strict";
  var mq=window.matchMedia("(min-width:1024px)"), menu=document.getElementById("fsmenu"), mb=document.querySelector(".site-h .hmenu");
  var tabs=[].slice.call(document.querySelectorAll(".site-h .htab[data-mm]"));
  if(!menu||!mb||!tabs.length) return;
  var G={"mm-gz":"m-gz","mm-gr":"m-gr"}, last=null;
  function sync(){ if(mq.matches) return; var open=!menu.hidden;
    tabs.forEach(function(t){ t.setAttribute("aria-controls","fsmenu"); t.setAttribute("aria-expanded",open&&last===t?"true":"false"); }); }
  tabs.forEach(function(t){
    t.addEventListener("click",function(e){
      if(mq.matches) return; e.preventDefault();
      var open=!menu.hidden;
      if(open&&last===t){ mb.click(); last=null; sync(); return; }
      last=t; if(!open) mb.click();
      var h=document.getElementById(G[t.getAttribute("data-mm")]), sec=h&&h.closest("section"), list=menu.querySelector(".mlist")||menu;
      setTimeout(function(){ if(sec){ list.scrollTop=Math.max(0,sec.offsetTop-list.offsetTop-6); var a=sec.querySelector("a[href]"); if(a) try{ a.focus({preventScroll:true}); }catch(_){} } sync(); },30);
    });
  });
  new MutationObserver(function(){ if(menu.hidden) last=null; sync(); }).observe(menu,{attributes:true,attributeFilter:["hidden"]});
  window.addEventListener("resize",sync); sync();
})();
