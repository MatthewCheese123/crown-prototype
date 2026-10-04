/* v8.4 (Matthew 04:03): scroll cues on every horizontally scrolling tab/chip/card row.
   A soft edge fade (CSS mask on the row itself) on the side(s) with more content, plus a small chevron button
   (36px visual, 44px hit area) that appears only when there is more that way and hides at the ends.
   The buttons are pointer helpers kept outside the rows (tabindex -1), so tablist semantics are untouched; keyboard users
   move with the tabs themselves, and the active step is always scrolled into view. */
(function(){
  var D=document, rows=[], raf=0;
  function isRow(e){ var c=getComputedStyle(e); return (c.overflowX==="auto"||c.overflowX==="scroll") && e.clientWidth>40 && e.tagName!=="TEXTAREA" && e.tagName!=="PRE" && !e.closest("[role=dialog],.mega,.mnav,.sov") }
  function stuck(e){ for(var n=e,i=0;n&&i<4;n=n.parentElement,i++){ var p=getComputedStyle(n).position; if(p==="sticky"||p==="fixed") return true } return false }
  function label(e){ return e.getAttribute("role")==="tablist"||e.querySelector("[role=tab]") ? "steps" : "" }
  function mk(r,dir){ var b=D.createElement("button"); b.type="button"; b.className="scq scq-"+dir; b.tabIndex=-1; b.hidden=true;
    var w=label(r); b.setAttribute("aria-label","Scroll "+(w?w+" ":"")+(dir==="l"?"left":"right"));
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+(dir==="l"?"M15 5l-7 7 7 7":"M9 5l7 7-7 7")+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    b.addEventListener("click",function(){ r.scrollBy({left:(dir==="l"?-1:1)*Math.max(120,r.clientWidth*.7),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}) });
    D.body.appendChild(b); return b }
  function upd(o){ var r=o.r, max=r.scrollWidth-r.clientWidth, x=r.scrollLeft, L=max>2&&x>2, R=max>2&&x<max-2;
    if(r.classList.contains("scq-ml")!==L) r.classList.toggle("scq-ml",L); if(r.classList.contains("scq-mr")!==R) r.classList.toggle("scq-mr",R);
    var b=r.getBoundingClientRect(), on=b.width>0&&b.bottom>0&&b.top<innerHeight&&getComputedStyle(r).visibility!=="hidden";
    [[o.l,L,b.left],[o.rt,R,b.right-44]].forEach(function(t){ var btn=t[0]; btn.hidden=!(t[1]&&on);
      if(!btn.hidden){ btn.style.top=Math.round(b.top+b.height/2-22)+"px"; btn.style.left=Math.round(t[2])+"px" } }) }
  function all(){ raf=0; rows.forEach(upd) }
  function q(){ if(!raf) raf=requestAnimationFrame(all) }
  function active(r){ if(!label(r)) return; var a=r.querySelector("[aria-selected=true],[aria-current=step],[aria-current=true],.on,.cur"); if(!a) return;
    var ar=a.getBoundingClientRect(), rr=r.getBoundingClientRect();
    if(ar.left<rr.left+8||ar.right>rr.right-8) r.scrollTo({left:r.scrollLeft+(ar.left-rr.left)-(rr.width-ar.width)/2,behavior:"auto"}) }
  function scan(){
    D.querySelectorAll("main *, .ccfg *").forEach(function(e){
      if(e.__scq||!isRow(e)) return; e.__scq=1; var o={r:e,l:mk(e,"l"),rt:mk(e,"r")}; rows.push(o); e.setAttribute("data-scq",rows.length); o.l.setAttribute("data-scq-for",rows.length); o.rt.setAttribute("data-scq-for",rows.length); e.classList.add("scq-row"); if(stuck(e)){ e.classList.add("scq-solid"); o.l.classList.add("scq-bg"); o.rt.classList.add("scq-bg") }
      e.addEventListener("scroll",q,{passive:true});
      new MutationObserver(function(){ active(e); q() }).observe(e,{subtree:true,attributes:true,attributeFilter:["aria-selected","aria-current"]});
      active(e) });
    q() }
  function boot(){ scan(); addEventListener("scroll",q,{passive:true}); addEventListener("resize",function(){ scan(); q() });
    setTimeout(scan,800); setTimeout(scan,2500) }
  if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",boot); else boot();
})();
