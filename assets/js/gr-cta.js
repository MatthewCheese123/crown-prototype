/* gr-cta: keeps the jump-card facts in sync with the #specs spec tiles (so they cannot drift), and drives the chip row edge fade.
   Built by review/garden-rooms-hero-cta/tools/apply_v8.py. */
(function(){
  "use strict";
  var D=document, sp=D.getElementById("specs");
  if(sp){
    var map={};
    [].forEach.call(sp.querySelectorAll(".inc6>div"),function(d){ var b=d.querySelector("b"), s=d.querySelector("span"); if(!b) return;
      var t=b.textContent.trim(), x=s?s.textContent.trim():"";
      map[t]={t:t,d:x,bad:/\bTBC\b/i.test(t+" "+x)||/air conditioning|electric heater/i.test(t)||!!d.querySelector(".tbc,.tbc2")} });
    [].forEach.call(D.querySelectorAll(".jcard li[data-spec]"),function(li){
      var tmp=D.createElement("textarea"); tmp.innerHTML=li.getAttribute("data-spec"); var m=map[tmp.value];
      if(!m||m.bad){ li.remove(); return }   // a fact that is gone from the spec, or now marked TBC, leaves the card
      li.querySelector("b").textContent=m.t; li.querySelector("span").textContent=m.d });
  }
  [].forEach.call(D.querySelectorAll(".jrow"),function(row){ var sc=row.querySelector(".jsc"); if(!sc) return;
    function u(){ var over=sc.scrollWidth>sc.clientWidth+2; row.classList.toggle("nofr",!over); row.classList.toggle("fl",over&&sc.scrollLeft>4); row.classList.toggle("fr",over&&sc.scrollLeft+sc.clientWidth<sc.scrollWidth-4) }
    sc.addEventListener("scroll",u,{passive:true}); window.addEventListener("resize",u); u(); setTimeout(u,400) });
})();
