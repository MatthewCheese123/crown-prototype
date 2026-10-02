/* Crown Pavilions concept prototype. Vanilla JS. No network calls of any kind. */
(function(){
  "use strict";
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var desktop=window.matchMedia("(min-width:1080px)");

  /* ---------- header: hide on scroll down, show on scroll up ---------- */
  var hdr=$(".site-h"), lastY=window.scrollY, ticking=false;
  function anyOpen(){return !!$(".mega.open, .dd.open, .mnav.open")}
  window.addEventListener("scroll",function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      var y=window.scrollY;
      if(hdr && !anyOpen()){
        if(y>lastY && y>140) hdr.classList.add("hid"); else if(y<lastY-4 || y<140) hdr.classList.remove("hid");
      }
      lastY=y; ticking=false;
    });
  },{passive:true});
  if(hdr) hdr.addEventListener("focusin",function(){hdr.classList.remove("hid")});

  /* ---------- disclosure helpers (mega menus + brochure dropdown) ---------- */
  function closeAll(except){
    $$("[data-disclose]").forEach(function(b){
      if(b===except) return;
      b.setAttribute("aria-expanded","false");
      var p=document.getElementById(b.getAttribute("aria-controls")); if(p) p.classList.remove("open");
    });
    if(typeof syncScrim==="function") syncScrim();
  }
  /* soft blur + tint over the page while a hover menu is open; header and panel stay sharp */
  var scrim=document.createElement("div"); scrim.className="mscrim"; scrim.setAttribute("aria-hidden","true");
  if(hdr) hdr.parentNode.insertBefore(scrim,hdr.nextSibling);
  function syncScrim(){
    var on=desktop.matches && !!$(".mega.open");
    if(on && hdr) scrim.style.top=Math.max(0,Math.round(hdr.getBoundingClientRect().top))+"px"; // keep the bars above the header sharp too
    scrim.classList.toggle("on",on);
  }
  scrim.addEventListener("click",function(e){e.stopPropagation();closeAll()});
  function setOpen(b,open){
    var p=document.getElementById(b.getAttribute("aria-controls"));
    if(open) closeAll(b);
    b.setAttribute("aria-expanded",open?"true":"false");
    if(p) p.classList.toggle("open",open);
    syncScrim();
  }
  $$("[data-disclose]").forEach(function(b){
    var p=document.getElementById(b.getAttribute("aria-controls")), li=b.closest("li")||b.parentNode, t;
    b.addEventListener("click",function(e){e.stopPropagation();setOpen(b,b.getAttribute("aria-expanded")!=="true")});
    if(b.hasAttribute("data-hover")){
      [li,p].forEach(function(el){ if(!el) return;
        // 300ms intent delay on open and close (between the 150ms brief and the 300-500ms usability guidance)
        el.addEventListener("mouseenter",function(){ if(!desktop.matches) return; clearTimeout(t); if(b.getAttribute("aria-expanded")!=="true") t=setTimeout(function(){setOpen(b,true)},300)});
        el.addEventListener("mouseleave",function(){ if(!desktop.matches) return; clearTimeout(t); t=setTimeout(function(){setOpen(b,false)},300)});
      });
    }
    if(p){
      p.addEventListener("click",function(e){e.stopPropagation()});
      p.addEventListener("keydown",function(e){ if(e.key==="Escape"){setOpen(b,false);b.focus()} });
    }
    b.addEventListener("keydown",function(e){
      if(e.key==="Escape"){setOpen(b,false)}
      if(e.key==="ArrowDown" && p){e.preventDefault();setOpen(b,true);var f=$("a,button",p); if(f) f.focus()}
    });
  });
  document.addEventListener("click",function(){closeAll()});
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeAll() });
  // close a mega menu when focus leaves it
  $$(".mega").forEach(function(m){
    m.addEventListener("focusout",function(e){
      if(!m.contains(e.relatedTarget)){ var b=$('[aria-controls="'+m.id+'"]'); if(b && e.relatedTarget!==b) setOpen(b,false) }
    });
  });

  /* ---------- mobile menu ---------- */
  var burger=$(".burger"), mnav=$("#mnav");
  if(burger && mnav){
    burger.addEventListener("click",function(){
      var open=burger.getAttribute("aria-expanded")!=="true";
      burger.setAttribute("aria-expanded",open?"true":"false");
      burger.setAttribute("aria-label",open?"Close menu":"Open menu");
      burger.textContent=open?"✕":"☰";
      mnav.classList.toggle("open",open);
      document.body.style.overflow=open?"hidden":"";
    });
    mnav.addEventListener("keydown",function(e){ if(e.key==="Escape"){burger.click();burger.focus()} });
    desktop.addEventListener && desktop.addEventListener("change",function(){ if(desktop.matches && mnav.classList.contains("open")) burger.click() });
  }

  /* ---------- tabs ---------- */
  $$("[role=tablist]").forEach(function(list){
    var tabs=$$("[role=tab]",list);
    function sel(t,focus){
      tabs.forEach(function(x){
        var on=x===t; x.setAttribute("aria-selected",on?"true":"false"); x.tabIndex=on?0:-1;
        var p=document.getElementById(x.getAttribute("aria-controls")); if(p) p.hidden=!on;
      });
      if(focus) t.focus();
    }
    tabs.forEach(function(t,i){
      t.addEventListener("click",function(){sel(t)});
      t.addEventListener("keydown",function(e){
        var k=e.key, n=null;
        if(k==="ArrowRight") n=tabs[(i+1)%tabs.length]; if(k==="ArrowLeft") n=tabs[(i-1+tabs.length)%tabs.length];
        if(k==="Home") n=tabs[0]; if(k==="End") n=tabs[tabs.length-1];
        if(n){e.preventDefault();sel(n,true)}
      });
    });
  });
  // links that switch a tab, e.g. "Compare garden rooms" (#compare-gr)
  function tabFromHash(){
    var h=location.hash.slice(1); if(!h) return;
    var t=document.querySelector('[role=tab][data-hash="'+h+'"]'); if(t){t.click(); var s=t.closest("section"); if(s) s.scrollIntoView()}
  }
  window.addEventListener("hashchange",tabFromHash); tabFromHash();

  /* ---------- filter chips (carousel + gazebo listing) ---------- */
  $$("[data-filter-group]").forEach(function(g){
    var target=document.getElementById(g.getAttribute("data-target"));
    var chips=$$(".chip[data-f]",g);
    chips.forEach(function(c){
      c.addEventListener("click",function(){
        var key=c.getAttribute("data-key")||"range";
        $$('.chip[data-key="'+key+'"],.chip[data-f]:not([data-key])',g).forEach(function(x){ if((x.getAttribute("data-key")||"range")===key) x.setAttribute("aria-pressed","false")});
        c.setAttribute("aria-pressed","true");
        apply();
      });
    });
    function apply(){
      var active={};
      chips.forEach(function(x){ if(x.getAttribute("aria-pressed")==="true") active[x.getAttribute("data-key")||"range"]=x.getAttribute("data-f") });
      var n=0;
      $$("[data-range]",target).forEach(function(card){
        var ok=true;
        Object.keys(active).forEach(function(k){
          var v=active[k]; if(v==="all") return;
          if(k==="range" && card.getAttribute("data-range")!==v) ok=false;
          if(k==="price"){ var p=+card.getAttribute("data-price"); if(v==="lt20"&&!(p<20000)) ok=false; if(v==="20to30"&&!(p>=20000&&p<=30000)) ok=false; if(v==="gt30"&&!(p>30000)) ok=false; }
        });
        card.hidden=!ok; if(ok && !card.classList.contains("ph")) n++;
      });
      $$("[data-group]",target).forEach(function(gr){ gr.hidden=!$$("[data-range]:not([hidden])",gr).length });
      var cnt=$("[data-count]",g.parentNode)||$("[data-count]"); if(cnt) cnt.textContent=(n===0 && $$(".ph[data-range]:not([hidden])",target).length)?"Models to be confirmed":n+" model"+(n===1?"":"s")+" shown";
    }
  });

  /* ---------- gazebos hub: Find your pavilion (range, price, seats + live count) ----------
     Deep links pre-filter the grid: gazebos/index.html#range-glazed, #seats-intimate. Range cards and the menu use them. */
  window.addEventListener("hashchange",function(){ closeAll() });
  var fnd=$("[data-finder]");
  if(fnd){
    var fchips=$$(".chip[data-key]",fnd), fcards=$$("[data-range]",fnd), fgroups=$$("[data-group]",fnd), fcnt=$("[data-count]",fnd), fempty=$("[data-empty]",fnd), fsec=fnd.closest("section"), fh=$("h2",fnd);
    var fval=function(k){ var c=fchips.filter(function(x){return x.getAttribute("data-key")===k && x.getAttribute("aria-pressed")==="true"})[0]; return c?c.getAttribute("data-f"):"all" };
    var fset=function(k,v){ fchips.forEach(function(x){ if(x.getAttribute("data-key")===k) x.setAttribute("aria-pressed",x.getAttribute("data-f")===v?"true":"false") }) };
    var fapply=function(){
      var r=fval("range"), p=fval("price"), s=fval("seats"), us=fval("use"), n=0, soonN=0;
      fcards.forEach(function(card){
        var ok=(r==="all" || card.getAttribute("data-range")===r);
        if(card.hasAttribute("data-soon")){ ok=ok && p==="all" && s==="all" && us==="all"; card.hidden=!ok; if(ok) soonN++; return }
        var pr=+card.getAttribute("data-price");
        if(p==="lt20" && !(pr<20000)) ok=false; if(p==="20to30" && !(pr>=20000 && pr<=30000)) ok=false; if(p==="gt30" && !(pr>30000)) ok=false;
        if(s!=="all" && (" "+card.getAttribute("data-seats")+" ").indexOf(" "+s+" ")<0) ok=false;
        if(us!=="all" && (" "+(card.getAttribute("data-use")||"")+" ").indexOf(" "+us+" ")<0) ok=false;
        card.hidden=!ok; if(ok) n++;
      });
      fgroups.forEach(function(g){ g.hidden=!$$("[data-range]:not([hidden])",g).length });
      fcnt.textContent=(n===0 && soonN)?"Insulated models coming soon":n+" model"+(n===1?"":"s")+" shown";
      fempty.hidden=(n>0 || soonN>0);
    };
    var fsync=function(){ // keep the address shareable: #range-x (or #seats-x), without jumping
      var r=fval("range"), s=fval("seats"), h=r!=="all"?"#range-"+r:(s!=="all"?"#seats-"+s:"");
      if(h!==location.hash && history.replaceState) history.replaceState(null,"",h||(location.pathname+location.search));
    };
    fchips.forEach(function(c){ c.addEventListener("click",function(){ if(c.disabled) return; var k=c.getAttribute("data-key"), v=c.getAttribute("data-f"); fset(k,(c.getAttribute("aria-pressed")==="true")?"all":v); fapply(); fsync() }) });
    $("[data-reset]",fnd).addEventListener("click",function(){ ["range","price","seats","use"].forEach(function(k){fset(k,"all")}); fapply(); fsync(); fh.focus({preventScroll:true}) });
    var fhash=function(scroll){
      var m=/^(range|seats)-([a-z]+)$/.exec(location.hash.slice(1)); if(!m) return false;
      if(!fchips.some(function(x){return x.getAttribute("data-key")===m[1] && x.getAttribute("data-f")===m[2]})) return false;
      ["range","price","seats","use"].forEach(function(k){fset(k,"all")}); fset(m[1],m[2]); fapply();
      if(scroll!==false) fsec.scrollIntoView({behavior:"instant",block:"start"});
      return true;
    };
    // same-page deep links (range cards, seat cards, the menu while on the hub): filter + scroll, even if the hash is unchanged
    document.addEventListener("click",function(e){
      var a=e.target.closest && e.target.closest("a[href*='#range-'],a[href*='#seats-']");
      if(!a || a.pathname!==location.pathname || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); closeAll();
      if(location.hash!==a.hash && history.pushState) history.pushState(null,"",a.hash);
      if(fhash()) fh.focus({preventScroll:true});
    });
    window.addEventListener("hashchange",function(){ fhash() });
    fapply(); fhash();
    window.addEventListener("load",function(){ setTimeout(function(){ fhash() },60) });
  }

  /* ---------- carousel buttons ---------- */
  $$("[data-car]").forEach(function(w){
    var car=$(".car",w);
    $$("[data-dir]",w).forEach(function(b){ b.addEventListener("click",function(){ car.scrollBy({left:(+b.getAttribute("data-dir"))*car.clientWidth*0.8,behavior:"smooth"}) }) });
  });

  /* ---------- video placeholder pause toggle ---------- */
  $$(".vctl").forEach(function(b){ b.addEventListener("click",function(){
    var p=b.getAttribute("aria-pressed")==="true"; b.setAttribute("aria-pressed",p?"false":"true");
    b.textContent=p?"❚❚  Pause video":"▶  Play video";
  })});

  /* ---------- gallery ---------- */
  $$("[data-gallery]").forEach(function(g){
    var main=$(".gmain img",g), cnt=$(".cnt",g), th=$$(".thumbs button",g);
    th.forEach(function(b,i){ b.addEventListener("click",function(){
      main.src=b.getAttribute("data-src"); main.alt=b.getAttribute("data-alt");
      th.forEach(function(x){x.removeAttribute("aria-current")}); b.setAttribute("aria-current","true");
      if(cnt) cnt.textContent=(i+1)+" / "+th.length;
    })});
  });

  /* ---------- size selector ---------- */
  $$("[data-sizer]").forEach(function(s){
    var grid=JSON.parse($("script[type='application/json']",s).textContent);
    var w=s.getAttribute("data-w"), d=s.getAttribute("data-d");
    var out={size:$("[data-out=size]",s),area:$("[data-out=area]",s),price:$("[data-out=price]",s),note:$("[data-out=note]",s)};
    function fmt(n){return "£"+n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}
    function upd(){
      $$(".chip[data-w]",s).forEach(function(c){c.setAttribute("aria-checked",c.getAttribute("data-w")===w?"true":"false");c.tabIndex=c.getAttribute("data-w")===w?0:-1});
      $$(".chip[data-d]",s).forEach(function(c){c.setAttribute("aria-checked",c.getAttribute("data-d")===d?"true":"false");c.tabIndex=c.getAttribute("data-d")===d?0:-1});
      out.size.textContent=w+"m × "+d+"m";
      out.area.textContent=(Math.round(parseFloat(w)*parseFloat(d)*100)/100)+"m² floor area";
      var p=grid[w+"x"+d];
      if(p){ out.price.textContent=fmt(p); out.note.textContent="From the live price guide, 1 Oct 2026"; }
      else { out.price.textContent="TBC"; out.note.textContent="Not in the live price guide: ask our team"; }
    }
    function radios(attr){
      var cs=$$(".chip[data-"+attr+"]",s);
      cs.forEach(function(c,i){
        c.addEventListener("click",function(){ if(attr==="w") w=c.getAttribute("data-w"); else d=c.getAttribute("data-d"); upd(); });
        c.addEventListener("keydown",function(e){
          var n=null; if(e.key==="ArrowRight"||e.key==="ArrowDown") n=cs[(i+1)%cs.length]; if(e.key==="ArrowLeft"||e.key==="ArrowUp") n=cs[(i-1+cs.length)%cs.length];
          if(n){e.preventDefault(); n.click(); n.focus();}
        });
      });
    }
    radios("w"); radios("d"); upd();
  });

  /* ---------- merged sticky bar (collection pages) ----------
     Desktop: pinned under the nav once the hero CTA has scrolled away (follows the header as it hides/shows).
     Mobile: bottom bar with Book a visit + Call. Hidden while the form or footer is on screen. */
  var stk=$(".stk"), trig=$("[data-sticky-trigger]");
  if(stk && trig && "IntersectionObserver" in window){
    var past=false, nearEnd=false;
    function place(){ if(!desktop.matches){ stk.style.top=""; return } var hb=(hdr && !hdr.classList.contains("hid"))?Math.max(0,Math.round(hdr.getBoundingClientRect().top+hdr.offsetHeight)):0; stk.style.top=hb+"px" }
    function sync(){ var show=past && !nearEnd; stk.classList.toggle("show",show); document.body.classList.toggle("stk-on",show); stk.setAttribute("aria-hidden",show?"false":"true"); if(show) stk.removeAttribute("inert"); else stk.setAttribute("inert",""); place() }
    new IntersectionObserver(function(es){ es.forEach(function(e){ past=!e.isIntersecting && e.boundingClientRect.top<0; sync() }) }).observe(trig);
    var ends=$$(".formsec, footer.foot"), vis=new Set();
    var endObs=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) vis.add(e.target); else vis.delete(e.target) }); nearEnd=vis.size>0; sync() });
    ends.forEach(function(el){ endObs.observe(el) });
    window.addEventListener("scroll",function(){ var p=trig.getBoundingClientRect().bottom<0; if(p!==past){ past=p; sync() } if(stk.classList.contains("show")) requestAnimationFrame(place) },{passive:true});
    if(hdr) hdr.addEventListener("transitionend",place);
    // scroll spy for the in-page anchors
    var links=$$(".sa a",stk), secs=links.map(function(a){return document.getElementById(a.getAttribute("href").slice(1))});
    function spy(){ var y=(stk.getBoundingClientRect().bottom||0)+40, cur=-1; secs.forEach(function(s,i){ if(s && s.getBoundingClientRect().top<=y) cur=i }); links.forEach(function(a,i){ if(i===cur) a.setAttribute("aria-current","true"); else a.removeAttribute("aria-current") }) }
    window.addEventListener("scroll",function(){ requestAnimationFrame(spy) },{passive:true}); spy();
  }

  /* ---------- spec accordions: collapsible on mobile, always open on desktop ---------- */
  var accs=$$("details.acc");
  function accMode(){ accs.forEach(function(d,i){ d.open=desktop.matches || i===0 }) }
  if(accs.length){ accMode(); desktop.addEventListener("change",accMode); accs.forEach(function(d){ $("summary",d).addEventListener("click",function(e){ if(desktop.matches) e.preventDefault() }) }) }

  /* ---------- gazebo range pages: first four models, "See all", seats filter ---------- */
  $$("[data-mlist]").forEach(function(w){
    var cards=$$("[data-model]",w), more=$("[data-more]",w), chips=$$(".chip[data-seat]",w), cnt=$("[data-count]",w), expanded=false;
    function apply(){
      var f=(chips.filter(function(c){return c.getAttribute("aria-pressed")==="true"})[0]||{getAttribute:function(){return "all"}}).getAttribute("data-seat");
      cards.forEach(function(c){
        var match=f==="all" || (" "+c.getAttribute("data-seats")+" ").indexOf(" "+f+" ")>-1;
        var show=match && (f!=="all" || expanded || !c.hasAttribute("data-extra"));
        c.hidden=!show;
      });
      var total=cards.filter(function(c){ return f==="all" || (" "+c.getAttribute("data-seats")+" ").indexOf(" "+f+" ")>-1 }).length;
      if(cnt) cnt.textContent=total+" model"+(total===1?"":"s")+(f==="all"?"":" for this group");
      if(more){ more.hidden=(f!=="all"); more.setAttribute("aria-expanded",expanded?"true":"false"); more.textContent=expanded?"Show fewer models":more.getAttribute("data-label") }
    }
    if(more){ more.setAttribute("data-label",more.textContent); more.addEventListener("click",function(){ expanded=!expanded; apply(); if(expanded){ var first=$("[data-extra]",w); if(first){ var a=$("a",first); if(a) a.focus({preventScroll:false}) } } }) }
    chips.forEach(function(c){ c.addEventListener("click",function(){ chips.forEach(function(x){x.setAttribute("aria-pressed",x===c?"true":"false")}); apply() }) });
    apply();
  });

  // range pages: a hub card links to #model-x; reveal it (even if behind "See all"), scroll to it and highlight it
  function modelFromHash(){
    var h=location.hash.slice(1); if(!/^model-/.test(h)) return; var el=document.getElementById(h); if(!el || !el.hasAttribute("data-model")) return;
    var w=el.closest("[data-mlist]");
    if(el.hidden && w){ var all=$('.chip[data-seat="all"]',w); if(all && all.getAttribute("aria-pressed")!=="true") all.click(); var mb=$("[data-more]",w); if(el.hidden && mb) mb.click() }
    $$(".card.hl").forEach(function(x){x.classList.remove("hl")}); el.classList.add("hl");
    el.scrollIntoView({behavior:"instant",block:"center"});
  }
  window.addEventListener("hashchange",modelFromHash); modelFromHash();
  window.addEventListener("load",function(){ setTimeout(modelFromHash,60) });

  /* ---------- toggle-buttons (consultation ways) ---------- */
  $$("[data-toggle-group]").forEach(function(g){
    var bs=$$("button",g);
    bs.forEach(function(b){ b.addEventListener("click",function(){ bs.forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")}) }) });
  });

  /* ---------- forms: validate, then go to thank-you. Nothing is sent. ----------
     Picks 16 C + 7 B: one smart form. Boxes marked data-when="x" show when "x" is ticked; their required fields
     (data-vreq) and any field marked data-req-when="x" become required only then (e.g. phone + best time for a call-back).
     Live build: on submit, post model, postcode and source (form data-source) into Capsule CRM. */
  $$("form[data-proto]").forEach(function(f){
    var want=$$("input[data-want]",f), boxes=$$("[data-when]",f), rw=$$("[data-req-when]",f);
    boxes.forEach(function(vb){ $$("select,input",vb).forEach(function(x){ if(!x.hasAttribute("data-req-when")) x.setAttribute("data-vreq",x.required?"1":"0") }) });
    function on(v){ return want.some(function(x){return x.checked && x.value===v}) }
    function syncVisit(){
      boxes.forEach(function(vb){ var o=on(vb.getAttribute("data-when")); vb.classList.toggle("show",o);
        $$("select,input",vb).forEach(function(x){ if(x.hasAttribute("data-req-when")) return; if(o && x.getAttribute("data-vreq")==="1") x.setAttribute("required",""); else {x.removeAttribute("required"); clearErr(x)} }) });
      rw.forEach(function(x){ var o=on(x.getAttribute("data-req-when")); if(o) x.setAttribute("required",""); else {x.removeAttribute("required"); clearErr(x)}
        if(x.type!=="radio"){ var l=f.querySelector('label[for="'+x.id+'"] .opt'); if(l) l.hidden=o } });
    }
    want.forEach(function(x){x.addEventListener("change",syncVisit)});
    // preset from #brochure / #visit / #consultation / #callback
    var h=location.hash.replace("#",""); if(["brochure","visit","consultation","callback"].indexOf(h)>-1 && want.length && !f.hasAttribute("data-want-msg")){ want.forEach(function(x){x.checked=(x.value===h)}) }
    function errEl(x){ return document.getElementById(x.getAttribute("aria-describedby")) }
    function clearErr(x){ x.removeAttribute("aria-invalid"); var e=errEl(x); if(e) e.textContent="" }
    syncVisit();
    function msg(x){
      if(x.validity.valueMissing) return x.type==="radio"?"Please choose a time.":(x.tagName==="SELECT"?"Please choose an option.":"Please fill in this field.");
      if(x.validity.typeMismatch && x.type==="email") return "Please enter a valid email address, like name@example.com.";
      if(x.validity.patternMismatch) return x.getAttribute("data-msg")||"Please check this field.";
      return "Please check this field.";
    }
    $$("input,select,textarea",f).forEach(function(x){ x.addEventListener(x.type==="radio"?"change":"input",function(){ if(x.type==="radio"){ $$('input[name="'+x.name+'"]',f).forEach(clearErr); return } if(x.getAttribute("aria-invalid")==="true" && x.checkValidity()) clearErr(x) }) });
    f.addEventListener("submit",function(e){
      e.preventDefault();
      var bad=[], fe=$(".formerr",f);
      $$("input,select,textarea",f).forEach(function(x){
        if(x.type==="checkbox" && x.hasAttribute("data-want")) return;
        if(x.type==="file") return;
        if(!x.checkValidity()){ x.setAttribute("aria-invalid","true"); var el=errEl(x); if(el) el.textContent=msg(x); bad.push(x) } else clearErr(x);
      });
      if(want.length && !want.some(function(x){return x.checked})){ bad.unshift(want[0]); if(fe) fe.textContent=f.getAttribute("data-want-msg")||"Please choose at least one: brochure, visit, consultation or call-back."; }
      else if(fe) fe.textContent=bad.length?"Please correct the highlighted fields.":"";
      if(bad.length){ bad[0].focus(); return }
      // Prototype only: no data leaves the page. Go to the thank-you page.
      var kind=f.getAttribute("data-kind");
      if(!kind){ kind=["visit","consultation","callback","brochure"].filter(on)[0]||"brochure" }
      location.href=f.getAttribute("data-thanks")+"#"+kind;
    });
  });

  /* ---------- thank-you page message ---------- */
  var ty=$("[data-thanks-msg]");
  if(ty){ var k=location.hash.replace("#",""); var m={visit:"A design consultant would normally be in touch to confirm your show-site visit.",consultation:"A design consultant would normally be in touch to arrange your consultation.",callback:"A design consultant would normally call you back at your preferred time.",appointment:"A design consultant would normally call to agree your appointment time and confirm what's on display.",brochure:"Your brochure would normally be on its way."}; if(m[k]) ty.textContent=m[k]; }

  /* ---------- postcode finder placeholder ---------- */
  $$("[data-postcode]").forEach(function(f){ f.addEventListener("submit",function(e){ e.preventDefault(); var o=$("[data-pc-out]",f.parentNode); if(o) o.textContent="Prototype: the live site would sort the six show sites by distance here. No lookup is made." }) });

  /* re-align to the #anchor once images have loaded (cross-page links such as "Compare all ranges") */
  window.addEventListener("load",function(){
    var h=location.hash.slice(1); if(!h || /^(range|seats|model)-/.test(h) || document.querySelector('[role=tab][data-hash="'+h+'"]')) return;
    var el=document.getElementById(h); if(el) el.scrollIntoView({behavior:"instant",block:"start"});
  });

  /* =================== Picks 2 (2 Oct 2026). All client-side; nothing is sent. =================== */
  var base=(function(){ var sc=$('script[src$="assets/js/site.js"]'); return sc?sc.getAttribute("src").replace("assets/js/site.js",""):"" })();
  function mk(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e }
  function trap(box,e){ if(e.key!=="Tab") return; var f=$$("a[href],button:not([disabled]),input:not([disabled]),select,textarea",box).filter(function(x){return x.offsetParent!==null}); if(!f.length) return; var a=f[0], z=f[f.length-1]; if(e.shiftKey && document.activeElement===a){e.preventDefault(); z.focus()} else if(!e.shiftKey && document.activeElement===z){e.preventDefault(); a.focus()} }

  /* ---------- 10 B: full-width search overlay, grouped results over the site's own data ---------- */
  var sov=$("#site-search"), sq=$("#sov-q"), sres=$(".sovres"), sopen=$$("[data-search-open]"), sback=null;
  function sOpen(btn){ if(!sov) return; closeAll(); if(mnav && mnav.classList.contains("open")) burger.click(); sback=btn||document.activeElement; sov.hidden=false; document.body.classList.add("sov-on"); document.body.style.overflow="hidden"; sopen.forEach(function(b){b.setAttribute("aria-expanded","true")}); setTimeout(function(){ sq.focus() },20); syncBar() }
  function sClose(){ if(!sov || sov.hidden) return; sov.hidden=true; document.body.classList.remove("sov-on"); document.body.style.overflow=""; sopen.forEach(function(b){b.setAttribute("aria-expanded","false")}); if(sback && sback.focus) sback.focus(); syncBar() }
  function sRun(){
    var q=sq.value.trim().toLowerCase(), data=window.CP_SEARCH||[]; sres.textContent="";
    if(!q) return;
    var toks=q.split(/\s+/), hits=data.filter(function(d){ var h=(d.t+" "+d.s+" "+d.k).toLowerCase(); return toks.every(function(t){return h.indexOf(t)>-1}) });
    if(!hits.length){ sres.appendChild(mk("p","sovnone","No results for “"+sq.value.trim()+"”. Try a model name, a use such as hot tub, or a town.")); return }
    ["Buildings","Guides","Show sites"].forEach(function(g){
      var hs=hits.filter(function(d){return d.g===g}); if(!hs.length) return;
      var sec=mk("section","sovg"); sec.setAttribute("data-group",g); var h=mk("h3",null,g+" ("+hs.length+")"); sec.appendChild(h);
      var ul=mk("ul"); hs.slice(0,8).forEach(function(d){ var li=mk("li"), a=mk("a"); a.href=base+d.u; a.appendChild(mk("b",null,d.t)); a.appendChild(mk("span",null,d.s)); li.appendChild(a); ul.appendChild(li) });
      sec.appendChild(ul); sres.appendChild(sec);
    });
  }
  if(sov){
    sopen.forEach(function(b){ b.addEventListener("click",function(e){ e.stopPropagation(); sOpen(b) }) });
    $$("[data-search-close]",sov).forEach(function(b){ b.addEventListener("click",sClose) });
    $$("[data-q]",sov).forEach(function(b){ b.addEventListener("click",function(){ sq.value=b.getAttribute("data-q"); sRun(); sq.focus() }) });
    sq.addEventListener("input",sRun);
    sov.addEventListener("keydown",function(e){ if(e.key==="Escape"){ e.stopPropagation(); sClose() } trap(sov,e) });
    sov.addEventListener("click",function(e){ if(e.target===sov) sClose() });
    document.addEventListener("keydown",function(e){ if(e.key==="/" && sov.hidden && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||"")){ e.preventDefault(); sOpen(sopen[0]) } });
  }

  /* ---------- 8 B: mobile bottom bar Call · Visit · Brochure ---------- */
  var mbar=$("[data-mbar]"), barEnd=false;
  function syncBar(){ if(!mbar) return; var show=!desktop.matches && window.scrollY>300 && !barEnd && !(mnav && mnav.classList.contains("open")) && !document.body.classList.contains("cmp-on") && !document.body.classList.contains("sov-on");
    mbar.classList.toggle("show",show); document.body.classList.toggle("mbar-on",show); if(show) mbar.removeAttribute("inert"); else mbar.setAttribute("inert","") }
  if(mbar){
    window.addEventListener("scroll",function(){ requestAnimationFrame(syncBar) },{passive:true});
    if("IntersectionObserver" in window){ var bv=new Set(), bo=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) bv.add(e.target); else bv.delete(e.target) }); barEnd=bv.size>0; syncBar() }); $$(".formsec, footer.foot").forEach(function(x){ bo.observe(x) }) }
    if(burger) burger.addEventListener("click",function(){ setTimeout(syncBar,0) });
    desktop.addEventListener && desktop.addEventListener("change",syncBar); syncBar();
  }

  /* ---------- mobile menu: one section open at a time ---------- */
  var mds=$$("#mnav details");
  mds.forEach(function(d){ d.addEventListener("toggle",function(){ if(d.open) mds.forEach(function(o){ if(o!==d && o.parentNode===d.parentNode) o.open=false }) }) });

  /* ---------- 11 B: footer columns: open on desktop, accordions on mobile ---------- */
  var fcols=$$("details.fcol");
  function fMode(){ fcols.forEach(function(d){ d.open=desktop.matches }) }
  if(fcols.length){ fMode(); desktop.addEventListener("change",fMode); fcols.forEach(function(d){ $("summary",d).addEventListener("click",function(e){ if(desktop.matches) e.preventDefault() }) }) }

  /* ---------- 2 B: 'Send me this design' panels (email + spec PDF). Nothing is emailed. ---------- */
  function vfield(x){ var e=document.getElementById(x.getAttribute("aria-describedby")), m="";
    if(!x.checkValidity()) m=x.validity.valueMissing?"Please fill in this field.":(x.type==="email"?"Please enter a valid email address, like name@example.com.":(x.getAttribute("data-msg")||"Please check this field."));
    if(m) x.setAttribute("aria-invalid","true"); else x.removeAttribute("aria-invalid"); if(e) e.textContent=m; return !m }
  $$("[data-send-open]").forEach(function(b){ b.addEventListener("click",function(){
    var p=document.getElementById(b.getAttribute("data-send-open")); if(!p) return;
    var sz=(b.closest("section")||document).querySelector("[data-sizer]"), t=$("[data-spec]",p);
    if(sz && t){ var sv=$("[data-out=size]",sz).textContent, pv=$("[data-out=price]",sz).textContent; t.value=(p.getAttribute("data-model")||"Contemporary")+" · "+sv+" · "+(pv==="TBC"?"price TBC":"From "+pv+" (live price guide)") }
    p.hidden=false; b.setAttribute("aria-expanded","true");
    var ok=$("[data-sendok]",p), fm=$("form[data-send]",p); if(ok && !ok.hidden){ ok.hidden=true; fm.hidden=false }
    p.scrollIntoView({behavior:"smooth",block:"start"}); setTimeout(function(){ var f=$("input",p); if(f) f.focus({preventScroll:true}) },350);
  }) });
  $$("[data-sendpanel]").forEach(function(p){
    var fm=$("form[data-send]",p), ok=$("[data-sendok]",p), pick=$("[data-spec-pick]",p), t=$("[data-spec]",p);
    if(pick && t) pick.addEventListener("change",function(){ t.value=pick.value });
    $$("input[required]",fm).forEach(function(x){ x.addEventListener("input",function(){ if(x.getAttribute("aria-invalid")==="true") vfield(x) }) });
    fm.addEventListener("submit",function(e){ e.preventDefault();
      var bad=$$("input[required]",fm).filter(function(x){return !vfield(x)}); if(bad.length){ bad[0].focus(); return }
      // Live build: email the design + spec PDF, and post model, postcode and source into Capsule CRM. Prototype: nothing leaves the page.
      $("[data-ok-name]",ok).textContent=$("input[autocomplete=name]",fm).value.trim().split(/\s+/)[0];
      $("[data-ok-email]",ok).textContent=$("input[type=email]",fm).value.trim();
      fm.hidden=true; ok.hidden=false; ok.focus();
    });
    var ag=$("[data-send-again]",ok); if(ag) ag.addEventListener("click",function(){ ok.hidden=true; fm.hidden=false; var f=$("input",fm); if(f) f.focus() });
  });

  /* ---------- 5 B: masonry gallery, filter by model / use, lightbox with 'View model' ---------- */
  $$("[data-gal]").forEach(function(g){
    var items=$$(".mi",g), sel=$("[data-gmodel]",g), chips=$$(".chip[data-use]",g), cnt=$("[data-gcount]",g), empty=$("[data-gempty]",g), use="";
    function vis(){ return items.filter(function(i){return !i.hidden}) }
    function apply(){ var m=sel.value;
      items.forEach(function(i){ var dm=i.getAttribute("data-model"); var okm=!m || (m==="-"?dm==="":dm===m); var oku=!use || (" "+i.getAttribute("data-uses")+" ").indexOf(" "+use+" ")>-1; i.hidden=!(okm&&oku) });
      var n=vis().length; cnt.textContent=n+" photo"+(n===1?"":"s"); empty.hidden=n>0 }
    sel.addEventListener("change",apply);
    chips.forEach(function(c){ c.addEventListener("click",function(){ use=c.getAttribute("data-use"); chips.forEach(function(x){x.setAttribute("aria-pressed",x===c?"true":"false")}); apply() }) });
    var rs=$("[data-greset]",g); if(rs) rs.addEventListener("click",function(){ sel.value=""; chips[0].click() });
    var lb=$("#lightbox"); if(!lb) return;
    var img=$("[data-lbimg]",lb), cap=$("[data-lbcap]",lb), link=$("[data-lblink]",lb), cur=0, back=null;
    function show(b){ img.src=b.getAttribute("data-full"); img.alt=b.getAttribute("data-alt"); cap.textContent=b.getAttribute("data-cap"); link.href=b.getAttribute("data-href"); link.textContent=b.getAttribute("data-link")+" →" }
    function open(b){ back=b; var v=vis(); cur=v.indexOf(b.parentNode); show(b); lb.hidden=false; document.body.style.overflow="hidden"; $("[data-lbclose]",lb).focus() }
    function close(){ lb.hidden=true; document.body.style.overflow=""; if(back) back.focus() }
    items.forEach(function(i){ $("button",i).addEventListener("click",function(){ open(this) }) });
    $("[data-lbclose]",lb).addEventListener("click",close);
    $$("[data-lbstep]",lb).forEach(function(b){ b.addEventListener("click",function(){ var v=vis(); cur=(cur+(+b.getAttribute("data-lbstep"))+v.length)%v.length; back=$("button",v[cur]); show(back) }) });
    lb.addEventListener("click",function(e){ if(e.target===lb) close() });
    lb.addEventListener("keydown",function(e){ if(e.key==="Escape") close(); if(e.key==="ArrowRight") $('[data-lbstep="1"]',lb).click(); if(e.key==="ArrowLeft") $('[data-lbstep="-1"]',lb).click(); trap(lb,e) });
    apply();
  });

  /* ---------- 4 C: Your Project 'Where are you?' chooser ---------- */
  var wch=$$(".wch[data-where]");
  wch.forEach(function(b){ b.addEventListener("click",function(){
    var id=b.getAttribute("data-where"), el=document.getElementById(id);
    wch.forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
    $$(".yps").forEach(function(s){ var on=s===el; s.classList.toggle("on",on); var go=$("[data-ypgo]",s); if(go) go.hidden=!on });
    if(el){ el.scrollIntoView({behavior:"smooth",block:"center"}); var a=$("a",el); if(a) setTimeout(function(){ a.focus({preventScroll:true}) },400) }
  }) });

  /* ---------- 9 B: tick to compare up to 3 on the finder cards ---------- */
  var cks=$$("input[data-cmp]"), tray=$("[data-cmptray]"), cpanel=$("[data-cmppanel]");
  if(cks.length && tray && cpanel){
    var chosen=[];
    function rowsFor(list){
      var tb=mk("table","cmpt"), cap=mk("caption","sr","Side-by-side comparison of "+list.length+" models"); tb.appendChild(cap);
      var th=mk("thead"), tr=mk("tr"); tr.appendChild(mk("td")); list.forEach(function(x){ var h=mk("th"); h.scope="col"; var im=mk("img"); im.src=x.getAttribute("data-img"); im.alt=""; h.appendChild(im); h.appendChild(mk("b",null,x.getAttribute("data-name"))); tr.appendChild(h) }); th.appendChild(tr); tb.appendChild(th);
      var bd=mk("tbody");
      [["Range","data-rl"],["Size","data-sz"],["Seats","data-st"],["From","data-p"],["Included","data-inc"]].forEach(function(r){ var tr=mk("tr"), h=mk("th",null,r[0]); h.scope="row"; tr.appendChild(h); list.forEach(function(x){ tr.appendChild(mk("td",null,x.getAttribute(r[1]))) }); bd.appendChild(tr) });
      var lr=mk("tr"); lr.appendChild(mk("th")); list.forEach(function(x){ var td=mk("td"), a=mk("a","lnk","View model →"); a.href=x.getAttribute("data-href"); td.appendChild(a); lr.appendChild(td) }); bd.appendChild(lr);
      tb.appendChild(bd); return tb }
    function syncCmp(){
      chosen=cks.filter(function(x){return x.checked});
      var full=chosen.length>=3; cks.forEach(function(x){ x.disabled=!x.checked && full; x.closest(".cmpk").classList.toggle("off",x.disabled) });
      tray.hidden=!chosen.length; document.body.classList.toggle("cmp-on",!!chosen.length); syncBar();
      $("[data-cmpn]",tray).textContent=chosen.length+" of 3 chosen"+(full?" · that's the maximum":"");
      var th=$("[data-cmpthumbs]",tray); th.textContent=""; chosen.forEach(function(x){ var im=mk("img"); im.src=x.getAttribute("data-img"); im.alt=x.getAttribute("data-name"); th.appendChild(im) });
      var go=$("[data-cmpgo]",tray); go.disabled=chosen.length<2; go.textContent=chosen.length<2?"Tick one more to compare":"Compare side by side";
      if(!cpanel.hidden){ if(chosen.length<2){ if(window.__cmp) window.__cmp.close(false); else cpanel.hidden=true } else render() }
    }
    function render(){ var b=$("[data-cmpbody]",cpanel); b.textContent=""; b.appendChild(rowsFor(chosen)) }
    cks.forEach(function(x){ x.addEventListener("change",syncCmp) });
    /* v4: the comparison opens as a sheet over the grid (scrim behind); closing puts you back exactly where you were */
    var scrim=mk("div","cmpscrim"); scrim.hidden=true; document.body.appendChild(scrim); var cmpY=0, goB=$("[data-cmpgo]",tray);
    cpanel.setAttribute("role","dialog"); cpanel.setAttribute("aria-modal","true");
    function openCmp(){ render(); cmpY=window.scrollY; cpanel.hidden=false; scrim.hidden=false; document.body.classList.add("cmp-open"); document.documentElement.classList.add("cmp-lock"); cpanel.scrollTop=0; cpanel.focus({preventScroll:true}) }
    function closeCmp(back){ if(cpanel.hidden) return; cpanel.hidden=true; scrim.hidden=true; document.body.classList.remove("cmp-open"); document.documentElement.classList.remove("cmp-lock"); window.scrollTo({top:cmpY,behavior:"instant"}); if(back!==false && !goB.disabled && !tray.hidden) goB.focus({preventScroll:true}) }
    window.__cmp={open:openCmp,close:closeCmp};
    goB.addEventListener("click",openCmp);
    $("[data-cmpclear]",tray).addEventListener("click",function(){ cks.forEach(function(x){x.checked=false}); closeCmp(false); syncCmp() });
    $("[data-cmpclose]",cpanel).addEventListener("click",function(){ closeCmp() });
    scrim.addEventListener("click",function(){ closeCmp() });
    document.addEventListener("keydown",function(e){ if(cpanel.hidden) return; if(e.key==="Escape"){ e.preventDefault(); closeCmp(); return }
      if(e.key==="Tab"){ var f=[].slice.call(cpanel.querySelectorAll("a[href],button:not([disabled])")).concat([].slice.call(tray.querySelectorAll("button:not([disabled])"))).filter(function(x){return x.offsetParent});
        if(!f.length) return; var i=f.indexOf(document.activeElement); if(e.shiftKey && (i<=0)){ e.preventDefault(); f[f.length-1].focus() } else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus() } } });
    syncCmp();
  }
})();
