/* Hampton live recolour (v8.3): Clara's layers on a real Hampton (h03).
   Stack: base -> cushion -> piping -> blind. Plain swatches stay the controls;
   this only listens to them (aria-checked) and reads window.__hpcfg.state.
   Kept out of hp-refine.js so a re-port (port_a_v8.py) can't drop it. */
(function(){
  var fab=document.querySelector(".hpfab"), root=document.getElementById("design");
  if(!fab||!root) return;
  /* v8.7.3: also drives model pages. A model sets data-rc="<folder>" (and data-rc-name) on .hpfab; the base is base-1400.webp. */
  var mdl=fab.getAttribute("data-rc"), NAME=fab.getAttribute("data-rc-name")||"Hampton", CFG=function(){return window.__hpcfg||window.__mpcfg||{}};
  var P=mdl?"../../assets/img/models/"+mdl+"/recolour/":"../../assets/img/hampton/recolour/", BASE=mdl?"base-1400.webp":"h03-base-1400.webp", PARTS=["cushion","piping","blind"],
      COLS=["green","burgundy","beige","ivory","navy","taupe"],
      NM={green:"Green",burgundy:"Burgundy",beige:"Beige",ivory:"Ivory",navy:"Navy",taupe:"Taupe"};
  function src(p,c){ return P+p+"-"+c+"-1400.webp" }
  var box=document.createElement("div"); box.className="rcx"; box.setAttribute("role","img");
  box.innerHTML='<div class="rcs"><img class="rcb" alt="" decoding="async" width="1400" height="933">'+
    PARTS.map(function(p){ return '<img class="rcl" data-rcl="'+p+'" alt="" decoding="async" width="1400" height="933">' }).join("")+
    '</div><p class="rcn">Colours are indicative; ask for a swatch.</p>';
  fab.appendChild(box); fab.classList.add("rc-on");
  var base=box.querySelector(".rcb"), started=false, cache={};
  function want(p,c){ /* load off-DOM, then swap: no flash of the bare base */
    var im=box.querySelector('[data-rcl="'+p+'"]'), u=src(p,c); im.setAttribute("data-want",u);
    if(im.getAttribute("src")===u) return;
    var pre=cache[u]||(cache[u]=new Image()); if(!pre.src) pre.src=u;
    function sw(){ if(im.getAttribute("data-want")===u) im.setAttribute("src",u) }
    if(pre.complete&&pre.naturalWidth) sw(); else pre.addEventListener("load",sw,{once:true}) }
  function paint(){
    var S=CFG().state; if(!S) return;
    if(started) PARTS.forEach(function(p){ if(S[p]) want(p,S[p]) });
    box.setAttribute("aria-label","A real Crown "+NAME+" shown in "+NM[S.cushion]+" cushions, "+NM[S.piping]+" piping and "+NM[S.blind]+" blinds. Colours are indicative.") }
  function start(){ if(started) return; started=true; base.src=P+BASE; paint();
    /* the other 15 layers (~6-36 KB each) once the photo is in and the browser is idle */
    function rest(){ var idle=window.requestIdleCallback||function(f){ setTimeout(f,400) };
      idle(function(){ PARTS.forEach(function(p){ COLS.forEach(function(c){ var u=src(p,c); if(!cache[u]){ cache[u]=new Image(); cache[u].src=u } }) }) }) }
    if(base.complete) rest(); else base.addEventListener("load",rest,{once:true}) }
  /* lazy: start when the configurator is near, or as soon as Colours/summary opens */
  if("IntersectionObserver" in window){ var io=new IntersectionObserver(function(es){ if(es.some(function(e){ return e.isIntersecting })){ start(); io.disconnect() } },{rootMargin:"300px 0px"}); io.observe(root) } else start();
  new MutationObserver(function(){ var t=root.getAttribute("data-hptab"); if(t==="3"||t==="6") start(); paint() })
    .observe(root,{attributes:true,subtree:true,attributeFilter:["aria-checked","data-hptab"]});
  paint();
})();
