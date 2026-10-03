/* proto-awesomeo v3: Concept B configurator shell (tabs, summaries, one-bar rule). Runs after generator.js / ct-cfg.js. */
(function(){
  "use strict";
  var host=document.querySelector("[data-v3cfg]"); if(!host) return;
  var cfg=host.querySelector(".ccfg");
  /* tabs */
  var tabs=[].slice.call(host.querySelectorAll(".btabs [role=tab]")), ps=tabs.map(function(t){return document.getElementById(t.getAttribute("aria-controls"))});
  function sel(i,f){ tabs.forEach(function(t,j){ var on=i===j; t.setAttribute("aria-selected",on); t.tabIndex=on?0:-1; ps[j].hidden=!on });
    if(f){ tabs[i].focus({preventScroll:true}); var bar=tabs[i].parentNode, r=tabs[i].getBoundingClientRect(), br=bar.getBoundingClientRect(); if(r.left<br.left||r.right>br.right) bar.scrollLeft+=r.left-br.left-(br.width-r.width)/2 } }
  tabs.forEach(function(t,i){ t.addEventListener("click",function(){ sel(i) });
    t.addEventListener("keydown",function(e){ var n=e.key==="ArrowRight"?i+1:e.key==="ArrowLeft"?i-1:e.key==="Home"?0:e.key==="End"?tabs.length-1:null; if(n!==null){ e.preventDefault(); sel((n+tabs.length)%tabs.length,true) } }) });
  /* Heritage: tab summaries from the generator's own state and embedded data (no figures of our own) */
  if(window.__hgen && host.querySelector("[data-hgen-data]")){
    var S=window.__hgen.state, D=JSON.parse(host.querySelector("[data-hgen-data]").textContent);
    var gbp=function(n){return "£"+Math.round(n).toLocaleString("en-GB")}, mm=function(v){return String(+(v/1000).toFixed(1))};
    var find=function(l,k){for(var i=0;i<l.length;i++) if(l[i].k===k) return l[i]; return l[0]};
    var opt=function(kind){var t=D.opt[kind]||{}, k=S.roof+"|"+S.w+"|"+S.d; return t.hasOwnProperty(k)?t[k]:null};
    var put=function(k,v){ host.querySelectorAll("[data-cc="+k+"]").forEach(function(e){e.textContent=v}) };
    var fire=function(){
      var ex=[]; if(S.veranda) ex.push("Veranda"); if(S.roof==="pitched"&&S.mezz) ex.push("Mezzanine"); if(S.roof==="pitched"&&!S.dormer) ex.push("No dormer");
      put("size",mm(S.w)+" × "+mm(S.d)+" m"); put("area",+(S.w*S.d/1e6).toFixed(2)+" m²");
      put("roof",S.roof==="flat"?"Flat roof":"Pitched · "+find(D.roofFinish,S.rf).n);
      put("clad",(S.prof==="weatherboard"?"Weatherboard":"T&G")+" · "+find(D.clad,S.clad).n); put("cladname",find(D.clad,S.clad).n);
      put("rfname",find(D.roofFinish,S.rf).n); put("floorname",find(D.floor,S.floor).n); put("floor",find(D.floor,S.floor).n+" floor");
      put("extras",ex.length?ex.join(" · "):"No extras");
      put("chip",[mm(S.w)+" × "+mm(S.d)+" m",S.roof==="flat"?"Flat roof":"Pitched",find(D.clad,S.clad).n,ex.length?ex.join(" · "):"No extras"].join(" · "));
      put("pflat",gbp(D.flat[S.w+"x"+S.d])); put("ppitched",gbp(D.pitched[S.w+"x"+S.d]));
      var v=opt("veranda"); put("pver",v!==null?"+"+gbp(v):"priced on your quote");
      var z=opt("mezz"); put("pmezz",S.roof!=="pitched"?"pitched roof only":(z!==null?"+"+gbp(z):"priced on your quote"));
    };
    cfg.addEventListener("click",function(){ setTimeout(fire,0) }); cfg.addEventListener("change",function(){ setTimeout(fire,0) }); fire();
    // every "Send me this design" button (footer and the mobile one) pre-fills the real send panel with this design
    host.querySelectorAll("[data-send-open]").forEach(function(b){ b.addEventListener("click",function(){ var t=document.getElementById("hgsend-spec"); if(t) t.value=window.__hgen.spec() }) });
  }
  /* drawing-view tabs all control one shared drawing panel: site.js's generic tab code hides it for the
     non-selected tabs, so keep it shown (this also fixes v1, where Front/Side/Plan could blank the drawing) */
  host.querySelectorAll(".vtabs [role=tab]").forEach(function(t){ function show(){ var p=document.getElementById(t.getAttribute("aria-controls")); if(p) p.hidden=false }
    t.addEventListener("click",show); t.addEventListener("keydown",function(){ setTimeout(show,0) }) });
  host.querySelectorAll(".vtabs [role=tab]").forEach(function(t){ var p=document.getElementById(t.getAttribute("aria-controls")); if(p) p.hidden=false });
  /* footer price: the generator appends "+ options priced on your quote"; set that part smaller so the price stays on one line */
  var pr=host.querySelector(".bfoot [data-s=price]");
  function px(){ if(!pr) return; var t=pr.textContent, m=t.match(/^(£[\d,]+)\s*(\+.*)$/); if(m && !pr.querySelector(".px")){ pr.textContent=m[1]; var e=document.createElement("small"); e.className="px"; e.textContent=" "+m[2]; pr.appendChild(e) } }
  if(pr){ new MutationObserver(px).observe(pr,{childList:true,characterData:true,subtree:true}); px() }
  /* one bar at a time: while the configurator is on screen, hide the site's sticky bars (its footer takes over) */
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(es){ es.forEach(function(e){ inView=e.isIntersecting; bars() }) },{rootMargin:"0px 0px -90px 0px"}).observe(cfg);
  }
  /* v8.1: on phones the price footer is sticky to the bottom of the screen only while the configurator runs past it; once the
     configurator's end is on screen the footer docks there (as its closing row) and the site's own bottom bar comes back, so the
     bottom of the screen is never left empty with the price bar floating mid-page. Desktop keeps "hidden while in view". */
  var inView=false, mob=window.matchMedia("(max-width:999px)"), ft=host.querySelector(".bfoot"), tb=host.querySelector(".btabs"), raf=0;
  function bars(){ var on=inView;
    if(on && mob.matches && ft){ var r=cfg.getBoundingClientRect(); on=r.bottom>innerHeight+2 }
    document.body.classList.toggle("v3cfg-in",on) }
  function sizes(){ var R=document.documentElement.style; if(tb) R.setProperty("--btabsh",tb.offsetHeight+"px"); if(ft) R.setProperty("--bfh",ft.offsetHeight+"px") }
  window.addEventListener("scroll",function(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; bars() }) },{passive:true});
  window.addEventListener("resize",function(){ sizes(); bars() }); sizes();
  /* mobile: the sticky tab row sits under the site header while the header is showing */
  var hdr=document.querySelector(".site-h");
  function hv(){ document.documentElement.style.setProperty("--hdrvis",(hdr && !hdr.classList.contains("hid"))?hdr.offsetHeight+"px":"0px") }
  if(hdr){ new MutationObserver(hv).observe(hdr,{attributes:true,attributeFilter:["class"]}); window.addEventListener("resize",hv); hv() }
})();
