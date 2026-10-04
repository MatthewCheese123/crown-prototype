/* proto-awesomeo v4: --hdrvis (visible height of the sliding site header) on every page, so sticky
   filter lines and table headers sit just under the header when it is showing and at the top when it slides away. */
(function(){
  var h=document.querySelector(".site-h"), r=document.documentElement; if(!h) return;
  function hv(){ var v=h.classList.contains("hid")?0:Math.max(0,h.getBoundingClientRect().bottom); r.style.setProperty("--hdrvis",Math.round(v)+"px") }
  addEventListener("scroll",function(){ requestAnimationFrame(hv) },{passive:true}); addEventListener("resize",hv);
  new MutationObserver(function(){ hv(); setTimeout(hv,320) }).observe(h,{attributes:true,attributeFilter:["class"]}); hv();
})();
