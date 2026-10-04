/* v8.7.3 home hero: the quiet "Explore ↓" cue smooth-scrolls to the Gazebos and Garden rooms tiles straight below
   (instant with reduced motion), clear of the sticky header, and moves focus there for keyboard users. */
(function(){
"use strict";
var a=document.querySelector("[data-hvex]"),t=a&&document.querySelector(a.getAttribute("href"));if(!t)return;
a.addEventListener("click",function(e){e.preventDefault();
  var rm=matchMedia("(prefers-reduced-motion: reduce)").matches,h=document.querySelector(".site-h"),off=h?h.getBoundingClientRect().height:0;
  scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-off),behavior:rm?"auto":"smooth"});
  if(!t.hasAttribute("tabindex"))t.setAttribute("tabindex","-1");t.focus({preventScroll:true});
  if(history.replaceState)history.replaceState(null,"",a.getAttribute("href"))});
})();
