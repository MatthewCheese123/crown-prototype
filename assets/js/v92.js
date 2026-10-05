/* v9.2 (4 Oct 2026): what's on display (one list), model CTAs, gallery by model, quote tick, bespoke idea form, hub jump links. Vanilla JS, no network calls. */
(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var ROOT=(($("a.logo")||{}).getAttribute?$("a.logo").getAttribute("href"):"index.html").replace(/index\.html$/,"");
var qs=new URLSearchParams(location.search);
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

/* ---------- what's on display: ONE list per site (assets/js/showsites.js) ---------- */
var SS=window.CROWN_SHOWSITES||{sites:[]}, SITES=(SS.sites||[]).filter(function(s){return !s.remote});
var GR=["Heritage","Contemporary","Sandringham","Clarence","Buckingham"];
function murl(n){ return ROOT+(GR.indexOf(n)>=0?"garden-rooms/":"gazebos/")+n.replace(/^Crown /,"").replace(/\./g,"").toLowerCase().replace(/\s+/g,"-")+"/index.html" }
function key(n){ return String(n||"").toLowerCase().replace(/\s+/g," ").trim() }
function at(model){ var k=key(model); return SITES.filter(function(s){ return (s.models||[]).some(function(m){return key(m)===k}) }).sort(function(a,b){return a.town<b.town?-1:1}) }
function links(s){ return (s.models||[]).map(function(n){return '<a href="'+murl(n)+'">'+esc(n)+'</a>'}).join(", ") }
/* v9.6.0: main pages show On display names as plain text (no text-only product links) */
var V96TXT=!!document.querySelector("[data-v96txt]");
/* v9.7.0: On display names carry a small photo */
function slug(n){ return n.replace(/^Crown /,"").replace(/\./g,"").toLowerCase().replace(/\s+/g,"-") }
function names(s){ return (s.models||[]).map(function(n){ return '<a class="v97on" href="'+murl(n)+'"><img src="'+ROOT+'assets/img/thumb/'+slug(n)+'-96.webp" alt="" width="32" height="32" loading="lazy" decoding="async">'+esc(n)+'</a>' }).join(" ") }
/* site pages: the On display row */
$$("[data-v92disp]").forEach(function(dd){ var s=SITES.filter(function(x){return x.id===dd.getAttribute("data-v92disp")})[0]; if(!s) return;
  var h=links(s); if(h){ dd.innerHTML=h } else { var row=dd.parentNode; if(row) row.hidden=true } });
/* show-sites table and gazebos hub: same list, as links */
$$("[data-ss-disp]").forEach(function(el){ var s=SITES.filter(function(x){return x.id===el.getAttribute("data-ss-disp")})[0]; if(!s||!(s.models||[]).length) return;
  el.innerHTML=(V96TXT?names(s):links(s))+(s.note?' <span class="v92sn">· '+esc(s.note)+'</span>':""); el.hidden=false });
/* home: the On display line under each site */
$$("[data-v92dl]").forEach(function(el){ var s=SITES.filter(function(x){return x.id===el.getAttribute("data-v92dl")})[0]; if(!s) return;
  if((s.models||[]).length){ el.innerHTML="On display: "+(V96TXT?names(s):links(s)); el.hidden=false } else el.hidden=true });
/* model pages: "See the Tudor at Bagshot" under the hero actions */
(function(){
  var m=/\/(gazebos|garden-rooms)\/([a-z-]+)\/(index\.html)?$/.exec(location.pathname); if(!m||/^(shelters|classic|glazed|insulated)$/.test(m[2])) return;
  var h1=$("#hero h1"), cta=$("#hero [data-sticky-trigger]"); if(!h1||!cta) return;
  var name=h1.textContent.trim(), short=name.replace(/^Crown /,""), sites=at(name), q="?model="+encodeURIComponent(name)+"#book";
  var p=document.createElement("p"); p.className="v92ond";
  if(sites.length){
    var l=sites.map(function(s){return '<a href="'+ROOT+'visit-us/'+s.id+'/index.html'+q+'">'+esc(s.town)+'</a>'});
    p.innerHTML='<span class="v92dot" aria-hidden="true"></span>See the '+esc(short)+' at '+(l.length>1?l.slice(0,-1).join(", ")+" or "+l[l.length-1]:l[0])+(l.length===1?' →':'');
  } else {
    p.innerHTML='Not on display yet. <a href="'+ROOT+'visit-us/index.html'+q+'">See the '+esc(short)+' at your place →</a>';
  }
  cta.parentNode.insertBefore(p,cta.nextSibling);
})();

/* ---------- inspiration gallery: ?model= shows only that model (Full gallery links on the model pages) ---------- */
$$("[data-gal]").forEach(function(g){
  var sel=$("[data-gmodel]",g), cnt=$("[data-gcount]",g), empty=$("[data-gempty]",g); if(!sel) return;
  function fix(){ var m=sel.value;
    $$(".v92gx",g).forEach(function(i){ if(!m||i.getAttribute("data-model")!==m) i.hidden=true });
    var n=$$(".mi",g).filter(function(i){return !i.hidden}).length; if(cnt) cnt.textContent=n+" photo"+(n===1?"":"s"); if(empty) empty.hidden=n>0 }
  sel.addEventListener("change",fix); $$(".chip[data-use],[data-greset]",g).forEach(function(c){ c.addEventListener("click",fix) });
  var want=qs.get("model");
  if(want && $$("option",sel).some(function(o){return o.value===want})){ sel.value=want; sel.dispatchEvent(new Event("change",{bubbles:true})) }
  fix();
});

/* ---------- Quote me on this design: the confirmation says so ---------- */
$$("form[data-send]").forEach(function(fm){
  var q=$("[data-quote]",fm); if(!q) return; var p=fm.closest("[data-sendpanel]")||fm.parentNode, ok=$("[data-sendok]",p);
  fm.addEventListener("submit",function(){ setTimeout(function(){ if(!ok||ok.hidden) return; var x=$(".v92qok",ok);
    if(q.checked){ if(!x){ x=document.createElement("p"); x.className="v92qok"; var h=$("h3",ok); if(h) h.after(x); else ok.appendChild(x) } x.innerHTML="<b>You asked for a quote.</b> A design consultant would prepare a written quote for this design. Prices include VAT."; x.hidden=false }
    else if(x) x.hidden=true },0) });
});

/* ---------- Bespoke: Tell us your idea (prototype: nothing is sent) ---------- */
var idf=$("form[data-v92idea]");
if(idf){ var iok=$("[data-v92idea-ok]");
  idf.addEventListener("submit",function(e){ e.preventDefault(); var bad=null;
    $$("[data-req]",idf).forEach(function(x){ var v=x.value.trim(), m=!v?(x.id==="id-idea"?"Please tell us a little about your idea.":"Please fill in this field."):(x.type==="email"&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)?"Please enter a valid email address, like name@example.com.":"");
      var e2=x.parentNode.querySelector(".err"); if(e2) e2.textContent=m; if(m){ x.setAttribute("aria-invalid","true"); if(!bad) bad=x } else x.removeAttribute("aria-invalid") });
    if(bad){ bad.focus(); return }
    idf.hidden=true; iok.hidden=false; iok.focus() });
}

/* ---------- long mobile hubs: jump links under the hero (sticky below the header), and "Show all" on long range lists ---------- */
var jn=$("[data-v92jump]");
if(jn){
  var hdr=$(".site-h"), ph=document.createElement("div"); ph.className="v92jph"; jn.parentNode.insertBefore(ph,jn);
  var links2=$$("a",jn), secs=links2.map(function(a){return document.getElementById(a.hash.slice(1))});
  var mq=matchMedia("(max-width:899px)");
  function hb(){ if(!hdr) return 0; var r=hdr.getBoundingClientRect(); return Math.max(0,r.bottom) }
  function sync(){
    if(!mq.matches){ jn.classList.remove("v92fix"); ph.style.height="0"; return }
    var top=hb(), fixed=false; /* v9.5: jump links no longer stick */
    jn.classList.toggle("v92fix",fixed); ph.style.height=fixed?jn.offsetHeight+"px":"0"; jn.style.top=fixed?top+"px":"";
    var line=top+jn.offsetHeight+40, cur=-1; secs.forEach(function(s,i){ if(s&&s.getBoundingClientRect().top<=line) cur=i });
    links2.forEach(function(a,i){ if(i===cur) a.setAttribute("aria-current","true"); else a.removeAttribute("aria-current") });
  }
  if(hdr&&"MutationObserver" in window) new MutationObserver(function(){ sync(); setTimeout(sync,180); setTimeout(sync,340) }).observe(hdr,{attributes:true,attributeFilter:["class","style"]});
  var raf=0; addEventListener("scroll",function(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; sync() }) },{passive:true}); addEventListener("resize",sync); sync();
  links2.forEach(function(a,i){ a.addEventListener("click",function(e){ var t=secs[i]; if(!t||!mq.matches) return; e.preventDefault(); e.stopPropagation();
    var y=t.getBoundingClientRect().top+scrollY-8-(hdr?hdr.offsetHeight:0);
    scrollTo({top:Math.max(0,y),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    if(history.replaceState) history.replaceState(null,"","#"+t.id);
    setTimeout(function(){ var h=t.querySelector("h2"); if(h){ if(!h.hasAttribute("tabindex")) h.setAttribute("tabindex","-1"); h.focus({preventScroll:true}) } },450) },true) });
}
/* gazebos: on phones, a long range shows four models, then "Show all 14" */
$$("[data-v92more] .mgrp").forEach(function(g){
  var grid=$(".grid",g); if(!grid) return; var cards=$$("[data-range]",grid); if(cards.length<7) return;
  var b=document.createElement("button"); b.type="button"; b.className="btn gh v92all"; grid.after(b);
  function upd(){ var vis=cards.filter(function(c){return !c.hidden}); var open=g.classList.contains("v92open");
    cards.forEach(function(c){ c.classList.remove("v92cut") }); 
    if(vis.length>6&&!open) vis.slice(4).forEach(function(c){ c.classList.add("v92cut") });
    b.hidden=vis.length<=6||open; b.textContent="Show all "+vis.length+(g.id==="range-classic"?" Classic models":" models"); b.setAttribute("aria-expanded","false") }
  b.addEventListener("click",function(){ var first=$(".v92cut",grid); g.classList.add("v92open"); upd(); if(first){ var a=$("h3 a",first); if(a) a.focus({preventScroll:true}) } });
  new MutationObserver(upd).observe(grid,{attributes:true,subtree:true,attributeFilter:["hidden"]}); upd();
});
})();
