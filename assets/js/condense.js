/* v8.8 condense pass: small behaviours for the one-screen zones (Matthew's picks, 3 Oct 2026). */
(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

  /* ⓘ toggles: buttons with aria-controls open/close their panel (gazebo compare full spec, Signature price note) */
  function setT(b,open){ var p=document.getElementById(b.getAttribute("aria-controls")); if(!p) return;
    p.hidden=!open; b.setAttribute("aria-expanded",open?"true":"false"); var c=b.closest(".gz-col,.cz-sg"); if(c) c.classList.toggle("cz-open",open) }
  $$(".cz-ib[aria-controls]").forEach(function(b){ b.addEventListener("click",function(e){ e.stopPropagation();
    var open=b.getAttribute("aria-expanded")!=="true"; setT(b,open);
    if(open){ var p=document.getElementById(b.getAttribute("aria-controls")), x=p&&p.querySelector("[data-czspec-close]"); if(x) x.focus({preventScroll:true}) } }) });
  $$("[data-czspec-close]").forEach(function(x){ x.addEventListener("click",function(){ var p=x.closest("[id]"), b=$('.cz-ib[aria-controls="'+p.id+'"]'); if(b){ setT(b,false); b.focus({preventScroll:true}) } }) });
  document.addEventListener("keydown",function(e){ if(e.key!=="Escape") return; $$('.cz-ib[aria-expanded="true"]').forEach(function(b){ setT(b,false); b.focus({preventScroll:true}) }) });
  document.addEventListener("click",function(e){ $$('.cz-ibi[aria-expanded="true"]').forEach(function(b){ var p=document.getElementById(b.getAttribute("aria-controls")); if(p&&!p.contains(e.target)) setT(b,false) }) });

  /* #3 gazebos hub finder: open on the Classic tab (7-across, two rows) unless a deep link picked something; package line follows the tab */
  var fnd=$("#models [data-finder]");
  if(fnd){
    var pk=$("[data-czpk]",fnd);
    var upd=function(){ if(!pk) return; var r=$('.chip[data-key="range"][aria-pressed="true"]',fnd), k=r?r.getAttribute("data-f"):"all", g=k!=="all"&&$('[data-group="'+k+'"] .pk',fnd);
      pk.textContent=(g?g.textContent+" · ":"")+"prices inc. VAT" };
    new MutationObserver(upd).observe(fnd,{attributes:true,attributeFilter:["aria-pressed"],subtree:true});
    if(!/^#(range|seats)-/.test(location.hash)){ var c=$('.chip[data-key="range"][data-f="classic"]',fnd), url=location.href;
      if(c&&c.getAttribute("aria-pressed")!=="true"){ c.click(); if(history.replaceState) history.replaceState(null,"",url) } }
    upd();
  }

  /* #7 configurator A: Next / Back live in the sticky price bar; last step = Book a visit */
  var bar=$("#design .pc.bfoot"), k=bar&&$(".kctas",bar);
  if(k&&$("#design .ccfg")){
    var h1=$("#hero h1"), model=h1?h1.textContent.trim():"";
    var nb=document.createElement("div"); nb.className="cz-barnav";
    nb.innerHTML='<button class="cz-bk" type="button">← Back</button><a class="btn cz-nx" href="#design">Next</a>';
    k.insertBefore(nb,k.firstChild);
    var cur=function(){ return $$("#design .bp").filter(function(p){return !p.hidden})[0] };
    var nx=$(".cz-nx",nb), bkb=$(".cz-bk",nb), visit="../../visit-us/index.html?model="+encodeURIComponent(model)+"#book";
    var upd2=function(){ var p=cur(); if(!p) return; var n=$(".hpnext",p), b=$(".hpback",p);
      if(n){ var t=n.textContent.replace("→","").trim(), m=t.match(/^(Next)(:.*)$/); nx.innerHTML=""; if(m){ nx.appendChild(document.createTextNode(m[1])); var sp=document.createElement("span"); sp.className="cz-nt"; sp.textContent=m[2]; nx.appendChild(sp) } else nx.textContent=t; nx.appendChild(document.createTextNode(" →")); nx.setAttribute("href","#design"); nx.classList.remove("cz-last") }
      else { nx.textContent="Book a visit"; nx.setAttribute("href",visit); nx.classList.add("cz-last") }
      bkb.style.visibility=b?"visible":"hidden"; bar.classList.toggle("cz-step-last",!n) };
    nx.addEventListener("click",function(e){ var p=cur(), n=p&&$(".hpnext",p); if(n){ e.preventDefault(); n.click() } });
    bkb.addEventListener("click",function(){ var p=cur(), b=p&&$(".hpback",p); if(b) b.click() });
    new MutationObserver(upd2).observe($("#design .ccfg"),{attributes:true,subtree:true,attributeFilter:["hidden"]}); upd2();
  }

  /* #13 visit form B: one step at a time, progress line, Back / Next */
  var vf=$("form[data-czsteps]");
  if(vf){
    var steps=$$(".pastep",vf), at=0, L=["Where","Day","Time","Your details"], NX=["Next: choose a day","Next: choose a time","Next: your details"];
    var prog=document.createElement("ol"); prog.className="cz-prog"; prog.setAttribute("aria-label","Booking steps");
    prog.innerHTML=L.map(function(t,i){return '<li><button type="button" data-czgo="'+i+'"><span>'+(i+1)+'</span> '+t+'</button></li>'}).join("");
    vf.parentNode.insertBefore(prog,vf);
    var nav=document.createElement("div"); nav.className="cz-vnav";
    nav.innerHTML='<button type="button" class="cz-vb">← Back</button><span class="cz-sel" aria-live="polite"></span><button type="button" class="btn dk cz-vn"></button>';
    steps[2].after(nav);
    var done=function(i){ return i===0?!!$("input[name=site]:checked",vf):i===1?!!$('[data-days] button[aria-pressed="true"]',vf):i===2?!!$('[data-slots] button[aria-pressed="true"]',vf):true };
    var show=function(i,focus){ at=Math.max(0,Math.min(3,i)); steps.forEach(function(s,j){ s.classList.toggle("cz-on",j===at) });
      $$("li",prog).forEach(function(li,j){ li.className=j===at?"on":(j<at||done(j)?"ok":""); var b=$("button",li); b.disabled=j>at&&!done(j-1); if(j===at) b.setAttribute("aria-current","step"); else b.removeAttribute("aria-current") });
      var vn=$(".cz-vn",nav); nav.hidden=at===3; vn.textContent=(NX[at]||"")+" →"; vn.disabled=!done(at); $(".cz-vb",nav).style.visibility=at?"visible":"hidden";
      var sum=$("[data-sum]"), sel=$(".cz-sel",nav);
      if(sel){ var site=$("input[name=site]:checked",vf), d=$('[data-days] button[aria-pressed="true"]',vf), t=$('[data-slots] button[aria-pressed="true"]',vf);
        sel.textContent=[site&&site.closest("label").querySelector("b").textContent, d&&d.getAttribute("aria-label"), t&&t.textContent].filter(Boolean).join(" · ") }
      if(at===3){ var bb=$(".cz-vb4",steps[3]); if(!bb){ bb=document.createElement("button"); bb.type="button"; bb.className="cz-vb cz-vb4"; bb.textContent="← Back"; bb.addEventListener("click",function(){ show(2,true) }); $(".pasubmit",steps[3]).before(bb) } }
      if(focus){ var h=$("h3",steps[at]); if(h){ h.setAttribute("tabindex","-1"); h.focus({preventScroll:true}) } } };
    $(".cz-vn",nav).addEventListener("click",function(){ if(done(at)) show(at+1,true) });
    $(".cz-vb",nav).addEventListener("click",function(){ show(at-1,true) });
    prog.addEventListener("click",function(e){ var b=e.target.closest("[data-czgo]"); if(b&&!b.disabled) show(+b.getAttribute("data-czgo"),true) });
    vf.addEventListener("change",function(){ show(at) }); vf.addEventListener("click",function(){ setTimeout(function(){ show(at) },0) });
    /* deep links: ?site= pre-picks, "Book" links in the sites table pre-pick and jump to step 2 */
    $$("[data-pick]").forEach(function(a){ a.addEventListener("click",function(){ setTimeout(function(){ show(1) },0) }) });
    $$('.paerrsum').forEach(function(es){ es.addEventListener("click",function(e){ var a=e.target.closest('a[href^="#bk-step"]'); if(a){ e.preventDefault(); show(+a.getAttribute("href").slice(-1)-1,true) } }) });
    show(done(0)?1:0);
  }
})();
