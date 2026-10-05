/* v8.5.2: Hampton first screen. Phone swipe gallery with dots (built from the thumbnail list) and the price ⓘ sheet. Hampton page only. */
(function(){
"use strict";
var html=document.documentElement;
/* swipe gallery */
var g=document.querySelector("#hero [data-gallery]"),gm=g&&g.querySelector(".gmain"),th=g?[].slice.call(g.querySelectorAll(".thumbs button")):[];
if(gm&&th.length>1){
 var main=gm.querySelector("img"),sw=document.createElement("div"),dots=document.createElement("div");
 sw.className="hpv-sw";sw.__scq=1;sw.tabIndex=0;sw.setAttribute("role","region");sw.setAttribute("aria-roledescription","carousel");sw.setAttribute("aria-label","Hampton photos, swipe for more");
 dots.className="hpv-dots";dots.setAttribute("role","group");dots.setAttribute("aria-label","Choose a photo");
 th.forEach(function(b,i){
  var im=document.createElement("img");
  if(window.CrownGallery) CrownGallery.apply(im,b,"100vw"); else im.src=b.getAttribute("data-src"); im.loading=i===0?"eager":"lazy";
  im.decoding="async";im.alt=b.getAttribute("data-alt")||"";im.setAttribute("aria-label",(i+1)+" of "+th.length);sw.appendChild(im);
  var d=document.createElement("button");d.type="button";d.setAttribute("aria-label","Show photo "+(i+1)+" of "+th.length);if(i===0)d.setAttribute("aria-current","true");
  d.addEventListener("click",function(){sw.scrollTo({left:i*sw.clientWidth,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})});
  dots.appendChild(d)});
 gm.appendChild(sw);gm.appendChild(dots);html.classList.add("hpv-gal");
 var ds=[].slice.call(dots.children),cur=0,raf=0;
 sw.addEventListener("scroll",function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;var i=Math.round(sw.scrollLeft/Math.max(1,sw.clientWidth));if(i!==cur){cur=i;ds.forEach(function(d,k){if(k===i)d.setAttribute("aria-current","true");else d.removeAttribute("aria-current")})}})},{passive:true});
 sw.addEventListener("keydown",function(e){if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;e.preventDefault();var i=Math.max(0,Math.min(th.length-1,cur+(e.key==="ArrowRight"?1:-1)));ds[i].click()});
}
/* price ⓘ sheet */
var dlg=document.getElementById("hpv-inc"),ib=document.querySelector("[data-hpv-i]");
if(dlg&&ib){
 ib.addEventListener("click",function(){if(dlg.showModal){dlg.showModal()}else dlg.setAttribute("open","")});
 dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
 dlg.addEventListener("close",function(){ib.focus()});
}
})();
