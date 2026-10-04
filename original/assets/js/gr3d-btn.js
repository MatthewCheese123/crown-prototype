/* v8.4 garden-room "View in 3D" (Matthew, 04:06): opens Crown's own 3D configurator (gardenroomplanner.com, more options)
   in a new tab. It replaces the "Explore more options in 3D" text link, whose URL it takes, and the v8.3 inline preview
   (gr3d.js is kept in assets but no longer loaded). The configurator accepts only a range filter (?o={"ranges":[…]}), so
   that is all we carry: Heritage passes Flat or Pitched to match the chosen roof. Size and cladding have no known parameter. */
(function(){
  var stg=document.querySelector("[data-ctcfg] .stg,[data-sgcfg] .stg,#design[data-v3cfg] .stg"); if(!stg) return;
  var old=document.querySelector(".stagebar a.lnk3d"); if(!old) return;
  var base=old.getAttribute("href"); old.parentNode.removeChild(old);
  var a=document.createElement("a"); a.className="g3db"; a.href=base; a.target="_blank"; a.rel="noopener";
  a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 3 7v10l9 5 9-5V7z M3 7l9 5 9-5 M12 12v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'+
    '<span>View in 3D</span><span aria-hidden="true" class="g3da">↗</span><span class="sr">, opens Crown\'s 3D configurator in a new tab</span>';
  var bar=stg.querySelector(".stagebar"), tabs=bar&&bar.querySelector(".vtabs");
  if(tabs) bar.insertBefore(a,tabs); else (bar||stg).appendChild(a); if(bar) bar.classList.add("g3dbar");
  function href(){ /* Heritage: narrow the range to the roof the visitor picked, when we can tell */
    if(!/Heritage/.test(decodeURIComponent(base))) return base;
    var t=((stg.querySelector("[data-out=title]")||{}).textContent||"").toLowerCase();
    var r=/pitched/.test(t)?"Heritage Pitched":/flat/.test(t)?"Heritage Flat":null;
    return r? base.split("?")[0]+"?o="+encodeURIComponent(JSON.stringify({ranges:[r]})) : base }
  a.addEventListener("click",function(){ a.href=href() });
  a.addEventListener("focus",function(){ a.href=href() });
})();
