/* v9.1 (4 Oct 2026): model page gallery 'View all photos', configurator bar (Next primary, final-step Send me my design and price),
   send form extras, base guidance, mobile bar A. Vanilla JS, no network calls. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

/* ---------- model page A: 'View all N photos' opens every photo in one scrolling dialog ---------- */
(function(){
  var hero=$("#hero"), g=hero&&$("[data-gallery]",hero); if(!g||!$(".thumbs",g)) return;
  var th=$$(".thumbs button[data-src]",g); var n=th.length; if(n<2) return;
  var name=(g.getAttribute("data-name")||"").trim();
  var dlg=document.createElement("dialog"); dlg.className="v91pv"; dlg.setAttribute("aria-label","All photos of the "+name);
  dlg.innerHTML='<div class="v91pvh"><h2>The '+name+' · '+n+' photos</h2><button type="button" class="v91pvx">Close</button></div><ul>'+
    th.map(function(b){return '<li><figure><img src="'+b.getAttribute("data-src")+'"'+(b.getAttribute("data-srcset")?' srcset="'+b.getAttribute("data-srcset")+'" sizes="(max-width:900px) 100vw, 900px"':'')+' alt="'+(b.getAttribute("data-alt")||"").replace(/"/g,"&quot;")+'" loading="lazy" decoding="async"><figcaption>'+(b.getAttribute("data-alt")||"")+'</figcaption></figure></li>'}).join("")+'</ul>';
  document.body.appendChild(dlg);
  $(".v91pvx",dlg).addEventListener("click",function(){dlg.close()});
  dlg.addEventListener("click",function(e){ if(e.target===dlg) dlg.close() });
  var b=document.createElement("button"); b.type="button"; b.className="v91all"; b.textContent="View all "+n+" photos"; b.setAttribute("aria-haspopup","dialog");
  /* v9.8.1: one gallery, one count. If the page's gallery block shows the same photos, the button takes you there; otherwise the dialog. */
  var ins=document.querySelector("#installs [data-sggal]"), same=ins&&ins.querySelectorAll(".sgi").length===n;
  b.addEventListener("click",function(e){ e.stopPropagation();
    if(same){ ins.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"start"}); var f=ins.querySelector(".sgi button"); if(f) setTimeout(function(){ f.focus({preventScroll:true}) },400); return }
    if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","") });
  $(".gmain",g).appendChild(b);
})();
/* ---------- designers: base guidance dialog ---------- */
(function(){
  var d=$("#v91bg"); if(!d) return; var opener=null;
  $$("[data-v91bg]").forEach(function(b){ b.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); opener=b; if(d.showModal) d.showModal(); else d.setAttribute("open","") }) });
  $$("[data-v91close]",d).forEach(function(x){ x.addEventListener("click",function(){ d.close() }) });
  d.addEventListener("click",function(e){ if(e.target===d) d.close() });
  d.addEventListener("close",function(){ if(opener) opener.focus({preventScroll:true}) });
})();

/* ---------- fixed-panel versions (Glazed, Insulated): a read-only copy of the plan on the Package step ---------- */
(function(){
  var fx=$("[data-v91fixed]"); if(!fx) return; var out=$(".v91fxp",fx), src=$(".hpplanw");
  function copy(){ if(!src||!out) return; var svg=src.querySelector(".hps-planw")||src.querySelector("svg"); if(!svg) return;
    var c=svg.cloneNode(true); out.classList.add("hps-root"); [].forEach.call(c.querySelectorAll("[role=button],[role=group]"),function(e){ e.removeAttribute("role"); e.removeAttribute("aria-label") }); [].forEach.call(c.querySelectorAll("[id]"),function(e){ e.removeAttribute("id") });
    [].forEach.call(c.querySelectorAll("[tabindex],button,a"),function(e){ e.setAttribute("tabindex","-1") });
    out.innerHTML=""; out.appendChild(c) }
  copy(); setTimeout(copy,400); setTimeout(copy,1500);
  $$(".hps-leg button",fx).forEach(function(b){ b.setAttribute("tabindex","-1"); b.setAttribute("aria-disabled","true") });
})();

/* ---------- 'Send me my design and price': design code plus the itemised list ---------- */
(function(){
  var p=$("#hpsend"); if(!p||!$("#design .ccfg")) return; var ta=$("#hpsend-spec",p);
  function fill(){ var H=window.__hpcfg; if(!H||!ta) return; var cd=$("[data-rfcode]"), L=[];
    try{ L=H.lines() }catch(e){}
    var g=function(n){ return "£"+Math.round(n).toLocaleString("en-GB") };
    ta.value="Design code: "+(cd?cd.textContent.trim():"")+"\n"+L.map(function(l){ return "• "+l[0]+": "+l[1]+(l[2]?" ("+l[2]+")":"") }).join("\n")+"\nTotal: "+g(H.total())+" inc. VAT" }
  $$("[data-send-open='hpsend']").forEach(function(b){ b.addEventListener("click",function(){ setTimeout(fill,0) }) });
  var f=$("form[data-send]",p); if(f) f.addEventListener("submit",fill,true);
})();
/* ---------- ⓘ popovers (garden rooms hub From-price line) ---------- */
(function(){
  $$("[data-v91pop]").forEach(function(b){ var pn=document.getElementById(b.getAttribute("aria-controls")); if(!pn) return;
    function set(o){ pn.hidden=!o; b.setAttribute("aria-expanded",o?"true":"false") }
    b.addEventListener("click",function(e){ e.stopPropagation(); set(pn.hidden) });
    document.addEventListener("click",function(e){ if(!pn.hidden&&!pn.contains(e.target)) set(false) });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!pn.hidden){ set(false); b.focus() } }) });
})();

/* ---------- garden rooms brochure mini form: prototype confirmation only ---------- */
(function(){
  var f=$("form[data-v91bro]"); if(!f) return; var ok=$("[data-v91brook]"), np=$("[data-v91brnp]");
  function chk(x){ var e=document.getElementById(x.getAttribute("aria-describedby")), m="";
    if(!x.checkValidity()) m=x.validity.valueMissing?"Please fill in this field.":"Please enter a valid email address, like name@example.com.";
    if(m) x.setAttribute("aria-invalid","true"); else x.removeAttribute("aria-invalid"); if(e) e.textContent=m; return !m }
  $$("input",f).forEach(function(x){ x.addEventListener("input",function(){ if(x.getAttribute("aria-invalid")==="true") chk(x) }) });
  f.addEventListener("submit",function(e){ e.preventDefault(); var bad=$$("input",f).filter(function(x){return !chk(x)}); if(bad.length){ bad[0].focus(); return }
    /* Live build: post to https://www.crownpavilions.com/request-brochure/ and land on its thank-you page. Prototype: nothing leaves the page. */
    var n=$("input[name=name]",f).value.trim().split(/\s+/)[0]; $("[data-v91brn]",ok).textContent=n?", "+n:""; $("[data-v91bre]",ok).textContent=$("input[name=email]",f).value.trim();
    f.hidden=true; if(np) np.hidden=true; ok.hidden=false; ok.focus() });
})();
/* ---------- the page bar (.hp-stk) stays out of the way while the designer is on screen ---------- */
(function(){
  var d=$("#design"); if(!d||!$(".hp-stk")||!("IntersectionObserver" in window)) return;
  new IntersectionObserver(function(es){ es.forEach(function(e){ document.documentElement.classList.toggle("v91indesign",e.isIntersecting) }) },{rootMargin:"-30% 0px -30% 0px"}).observe(d);
})();
})();
