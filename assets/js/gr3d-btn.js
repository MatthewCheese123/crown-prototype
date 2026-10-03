/* v8.3 garden-room "View in 3D" (Matthew, 3 Oct): button + panel shell only (~2 KB).
   The renderer (gr3d.js) is fetched on the first click, never on page load.
   Inline panel under the 2D drawing (not a modal) so the configurator choices stay usable and the 3D updates live.
   Close button and Esc close it; focus returns to the button. If the renderer can't run (script blocked, no SVG), a static fallback shows. */
(function(){
  var stg=document.querySelector("[data-ctcfg] .stg,[data-sgcfg] .stg,#design[data-v3cfg] .stg"); if(!stg) return;
  var bar=stg.querySelector(".stagebar")||stg, me=document.currentScript&&document.currentScript.src;
  var btn=document.createElement("button"); btn.type="button"; btn.className="g3db";
  btn.setAttribute("aria-expanded","false"); btn.setAttribute("aria-controls","g3d-panel");
  btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 3 7v10l9 5 9-5V7z M3 7l9 5 9-5 M12 12v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>View in 3D';
  bar.appendChild(btn);
  var p=document.createElement("section"); p.className="g3d"; p.id="g3d-panel"; p.hidden=true; p.setAttribute("aria-labelledby","g3d-h"); p.tabIndex=-1;
  p.innerHTML='<div class="g3dh"><div><h3 id="g3d-h">3D preview</h3><p class="g3dl">Illustrative 3D preview, not to scale for planning</p></div>'+
    '<button type="button" class="g3dx" data-g3dclose><span aria-hidden="true">✕</span> Close<span class="sr"> 3D preview</span></button></div>'+
    '<div class="g3dv" data-g3dview><p class="g3dload">Loading the 3D preview…</p></div>'+
    '<div class="g3dc" data-g3dctl hidden><button type="button" class="g3dr" data-g3drot="-1" aria-label="Rotate left"><span aria-hidden="true">↺</span></button>'+
    '<button type="button" class="g3dr g3df" data-g3dfront>Front view</button>'+
    '<button type="button" class="g3dr" data-g3drot="1" aria-label="Rotate right"><span aria-hidden="true">↻</span></button></div>'+
    '<p class="g3ds" data-g3dsum aria-live="polite"></p>';
  var svgw=stg.querySelector(".svgw"); (svgw&&svgw.parentElement===stg?svgw:(svgw?svgw.parentElement:stg.lastElementChild)).insertAdjacentElement("afterend",p);
  var loading=false;
  function fallback(why){ /* static: the current 2D drawing + the text summary */
    var v=p.querySelector("[data-g3dview]"), d=stg.querySelector("svg.fitd");
    v.innerHTML='<p class="g3dfb">The 3D preview can\'t run in this browser'+(why?' ('+why+')':'')+'. Here is your design as a 2D drawing.</p>';
    if(d){ var c=d.cloneNode(true); c.removeAttribute("id"); c.setAttribute("aria-hidden","true"); v.appendChild(c) }
    p.querySelector("[data-g3dsum]").textContent=(d&&d.getAttribute("aria-label"))||"" }
  function open(){
    p.hidden=false; btn.setAttribute("aria-expanded","true"); btn.classList.add("on");
    if(window.GR3D){ window.GR3D.start(p) }
    else if(!loading){ loading=true;
      if(!document.createElementNS||!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect){ fallback("no SVG"); }
      else { var s=document.createElement("script"); s.src=(me||"").replace(/gr3d-btn\.js(\?.*)?$/,"gr3d.js"); s.async=true;
        s.onload=function(){ try{ window.GR3D.start(p) }catch(e){ fallback() } };
        s.onerror=function(){ fallback("it didn't load") }; document.head.appendChild(s) } }
    p.scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    p.focus({preventScroll:true}) }
  function close(){ p.hidden=true; btn.setAttribute("aria-expanded","false"); btn.classList.remove("on"); if(window.GR3D) window.GR3D.stop(); btn.focus() }
  btn.addEventListener("click",function(){ p.hidden?open():close() });
  p.querySelector("[data-g3dclose]").addEventListener("click",close);
  document.addEventListener("keydown",function(e){ if((e.key==="Escape"||e.key==="Esc")&&!p.hidden){ var a=document.activeElement;
    if(p.contains(a)||a===btn||a===document.body||stg.closest(".ccfg").contains(a)){ e.preventDefault(); close() } } });
  window.__gr3dOpen=open;
})();
