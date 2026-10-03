/* v8.7 model pages (every gazebo except the Hampton): mounts the any-shape Sides sheet (mp-sides.js), words for the Sides
   subtitle and summary, one price bar per context (as hp-v85.js), the phone swipe gallery and the price ⓘ sheet (as hp-v852.js).
   v8.7.2: the Plan | 3D toggle and a 3D drawing generated from each model's shape are added by mp-3d.js. */
(function(){
"use strict";
var H=window.__mpcfg, html=document.documentElement, root=document.querySelector("[data-hpcfg]");
var D=H&&H.data;
if(H&&D.sides&&window.MPSides){
  var S=H.state, host=document.querySelector("[data-hpsides]"), stage=document.querySelector(".hpplanw"), PRE=H.presets, NAME={std:"Standard",open:"Open to the view",shel:"Sheltered"};
  var layName=function(){var s=S.bays.join("");for(var k in PRE)if(PRE[k]===s)return NAME[k];return "Bespoke"};
  var TY=D.sides.types,mix=function(){var c={B:0,F:0,H:0};S.bays.forEach(function(t){if(c[t]!=null)c[t]++});return TY?["F","H","B"].map(function(k){return c[k]+" "+TY[k][0].toLowerCase()}).join(", "):c.F+" clad, "+c.H+" half-plexiglass, "+c.B+" open"};
  var api=MPSides.mount(host,{geom:D.sides.geom,presets:PRE,name:D.name,size:D.sides.size,img:TY?"":"../../assets/img/hampton/",types:TY,styles:D.sides.styles,initial:S.bays.join(""),planHost:stage,
    priceBar:".hpcfg .bfoot, .hp-stk",header:".site-h, .btabs",say:function(){},
    onChange:function(a){S.bays=a;H.upd();words()}});
  window.__mpsides=api;
  var busy=false,words=function(){if(busy)return;busy=true;
    [].forEach.call(document.querySelectorAll("[data-hpo=sidesv]"),function(e){var n=layName();if(e.textContent!==n)e.textContent=n});
    [].forEach.call(document.querySelectorAll("[data-hpo=lines] li"),function(li){var b=li.querySelector("b"),sm=li.querySelector("small");if(b&&sm&&b.textContent==="Sides"){var t=layName()+": "+mix();if(sm.textContent!==t)sm.textContent=t}});
    busy=false};
  var mo=new MutationObserver(words);
  [].forEach.call(document.querySelectorAll("[data-hpo=sidesv],[data-hpo=lines]"),function(e){mo.observe(e,{childList:true,characterData:true,subtree:true})});
  H.upd();words();
}
if(root){
  var tab=function(){html.classList.toggle("hpv85-sum",root.getAttribute("data-hptab")==="6")};
  new MutationObserver(tab).observe(root,{attributes:true,attributeFilter:["data-hptab"]});tab();
  var stk=document.querySelector(".hp-stk"),raf=0,incfg=function(){raf=0;var r=root.getBoundingClientRect(),vh=window.innerHeight,h=stk?stk.offsetHeight:0,on=r.top<vh*0.7&&r.bottom>=vh,rise=!on&&r.top<vh*0.7&&r.bottom>vh-h&&r.bottom<vh;
    html.classList.toggle("hpv85-incfg",on);html.classList.toggle("hpv85-rise",rise);
    if(rise)html.style.setProperty("--hpv85-rise",Math.round(r.bottom-(vh-h))+"px");else html.style.removeProperty("--hpv85-rise")};
  var qi=function(){if(!raf)raf=requestAnimationFrame(incfg)};
  window.addEventListener("scroll",qi,{passive:true});window.addEventListener("resize",qi);if(window.ResizeObserver)new ResizeObserver(qi).observe(root);incfg();
  /* pad content by the bar heights, as hp-refine.js fit() */
  var fit=function(){var bf=document.querySelector(".hpcfg .bfoot"),st=document.querySelector(".hp-stk");
    if(bf)html.style.setProperty("--rf-bar",Math.round(bf.getBoundingClientRect().height)+"px");if(st)html.style.setProperty("--rf-stk",Math.round(st.getBoundingClientRect().height)+"px")};
  window.addEventListener("load",fit);window.addEventListener("resize",function(){clearTimeout(fit.t);fit.t=setTimeout(fit,120)});document.addEventListener("click",function(){setTimeout(fit,30)});
}
/* swipe gallery */
var g=document.querySelector("#hero [data-gallery]"),gm=g&&g.querySelector(".gmain"),th=g?[].slice.call(g.querySelectorAll(".thumbs button")):[];
if(gm&&th.length>1){
 var main=gm.querySelector("img"),sw=document.createElement("div"),dots=document.createElement("div");
 sw.className="hpv-sw";sw.__scq=1;sw.tabIndex=0;sw.setAttribute("role","region");sw.setAttribute("aria-roledescription","carousel");sw.setAttribute("aria-label",(g.getAttribute("data-name")||"Gazebo")+" photos, swipe for more");
 dots.className="hpv-dots";dots.setAttribute("role","group");dots.setAttribute("aria-label","Choose a photo");
 th.forEach(function(b,i){
  var im=document.createElement("img");
  if(i===0&&main){im.src=main.getAttribute("src");im.loading="eager"}else{im.src=b.getAttribute("data-src");im.loading="lazy"}
  im.decoding="async";im.alt=b.getAttribute("data-alt")||"";im.setAttribute("aria-label",(i+1)+" of "+th.length);sw.appendChild(im);
  var d=document.createElement("button");d.type="button";d.setAttribute("aria-label","Show photo "+(i+1)+" of "+th.length);if(i===0)d.setAttribute("aria-current","true");
  d.addEventListener("click",function(){sw.scrollTo({left:i*sw.clientWidth,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})});
  dots.appendChild(d)});
 gm.appendChild(sw);gm.appendChild(dots);html.classList.add("hpv-gal");
 var ds=[].slice.call(dots.children),cur=0,rf=0;
 sw.addEventListener("scroll",function(){if(rf)return;rf=requestAnimationFrame(function(){rf=0;var i=Math.round(sw.scrollLeft/Math.max(1,sw.clientWidth));if(i!==cur){cur=i;ds.forEach(function(d,k){if(k===i)d.setAttribute("aria-current","true");else d.removeAttribute("aria-current")})}})},{passive:true});
 sw.addEventListener("keydown",function(e){if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;e.preventDefault();var i=Math.max(0,Math.min(th.length-1,cur+(e.key==="ArrowRight"?1:-1)));ds[i].click()});
}
var dlg=document.getElementById("hpv-inc"),ib=document.querySelector("[data-hpv-i]");
if(dlg&&ib){
 ib.addEventListener("click",function(){if(dlg.showModal){dlg.showModal()}else dlg.setAttribute("open","")});
 dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
 dlg.addEventListener("close",function(){ib.focus()});
}
})();
