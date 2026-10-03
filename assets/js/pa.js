/* proto-awesomeo behaviours. Vanilla JS, no network calls. Data stays in this browser tab (sessionStorage). */
(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var ROOT=(document.querySelector('a.logo')||{getAttribute:function(){return "index.html"}}).getAttribute("href").replace(/index\.html$/,"");
var PHONE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>';
/* Show-site facts: names, addresses and opening hours as listed on crownpavilions.com/showsites (checked 1 Oct 2026). */
var SITES=[
 {id:"bridgemere",town:"Bridgemere",county:"Cheshire",gc:"Bridgemere Garden Centre",addr:"Bridgemere, Nantwich, Cheshire CW5 7QB",pc:"CW5 7QB",wk:["09:00","17:00"],sun:["10:00","16:30"],display:"Gazebos only"},
 {id:"woburn-sands",town:"Woburn Sands",county:"Bucks",gc:"Frosts Garden Centre",addr:"Newport Road, Woburn Sands, Buckinghamshire MK17 8UE",pc:"MK17 8UE",wk:["09:00","17:30"],sun:["10:30","16:30"],display:"Crown Hampton",models:["crown hampton"]},
 {id:"ware",town:"Ware",county:"Herts",gc:"Van Hage Garden Centre",addr:"Great Amwell, Ware, Hertfordshire SG12 9RP",pc:"SG12 9RP",wk:["09:00","17:30"],sun:["10:00","16:30"]},
 {id:"wickford",town:"Wickford",county:"Essex",gc:"Alton Garden Centre",addr:"Arterial Road, Wickford, Essex SS12 9JG",pc:"SS12 9JG",wk:["09:00","17:00"],sun:["10:00","16:30"],display:"Crown Hampton",models:["crown hampton"]},
 {id:"chessington",town:"Chessington",county:"Surrey",gc:"Chessington Garden Centre",addr:"Leatherhead Road, Chessington, Surrey KT9 2NG",pc:"KT9 2NG",wk:["09:00","18:00"],sun:["09:30","16:30"],note:"Video showcase filmed here"},
 {id:"bagshot",town:"Bagshot",county:"Surrey",gc:"Longacres Garden Centre",addr:"London Road, Bagshot, Surrey GU19 5JB",pc:"GU19 5JB",wk:["08:30","17:30"],sun:["10:00","16:30"],display:"Crown Hampton",models:["crown hampton"]},
 {id:"home",town:"At your home",gc:"A design consultant visits your garden",addr:"",remote:true,wk:["10:00","16:00"],sun:null},
 {id:"video",town:"By video call",gc:"For 100+ miles from a site · filmed at Chessington",addr:"",remote:true,wk:["10:00","17:00"],sun:null}];
window.PASITES=SITES;
/* v8.3 (Arthur #1/#2): one "On display" field per site. Unknown = no field (never "TBC").
   models[] = models we know are on show there; a model with any known site is "tracked". */
function mkey(m){return String(m||"").toLowerCase().replace(/\s+/g," ").trim()}
function showsAt(m){var k=mkey(m); if(!k) return null; var a=SITES.filter(function(s){return (s.models||[]).some(function(x){return k.indexOf(x)>=0||x.indexOf(k)>=0&&k.length>5})}); return a.length?a.sort(function(x,y){return x.town<y.town?-1:1}):null}
function siteName(s){return s.town+" · "+s.gc.replace(/ Garden Centre$/,"")}
var DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
function site(id){return SITES.filter(function(s){return s.id===id})[0]}
function mins(t){var p=t.split(":");return +p[0]*60+ +p[1]}
function hhmm(m){return ("0"+Math.floor(m/60)).slice(-2)+":"+("0"+m%60).slice(-2)}
function fmtDate(iso){var d=new Date(iso+"T12:00:00");return DAYS[d.getDay()]+" "+d.getDate()+" "+MON[d.getMonth()]}
function store(k,v){try{if(v===undefined) return JSON.parse(sessionStorage.getItem(k)||"null"); sessionStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
var qs=new URLSearchParams(location.search);

/* ---------- header: label the menu button (Jakob: conventional "Menu" label under the icon) ---------- */
var bg=$(".burger");
if(bg){ var lab=function(){ var o=bg.getAttribute("aria-expanded")==="true"; bg.innerHTML='<span aria-hidden="true">'+(o?"✕":"☰")+'</span><span class="bl" aria-hidden="true">'+(o?"Close":"Menu")+'</span>' }; lab(); bg.addEventListener("click",function(){setTimeout(lab,0)}) }

/* ---------- sticky action bar on range and model pages (one hero action, always in reach) ---------- */
var bd=document.body.getAttribute("data-pabar");
if(bd && !document.querySelector(".stk")){
  var parts=bd.split("|"), bar=document.createElement("div");
  bar.className="pabar"; bar.setAttribute("role","region"); bar.setAttribute("aria-label","Quick actions");
  var q=parts[2]?("?"+parts[2]):"";
  bar.innerHTML='<div class="in"><div class="what"><b>'+parts[0]+'</b>'+(parts[1]||"")+'<span class="s" aria-hidden="true">★★★★★</span> 5.0 · 348 reviews</div>'+
   '<a class="btn" href="'+ROOT+'visit-us/index.html'+q+'#book">Book a visit</a><a class="btn b2" href="'+ROOT+'brochure/index.html">Brochure</a>'+
   '<a class="btn b3" href="tel:01491612820" aria-label="Call 01491 612820">'+PHONE+'<span>01491 612820</span></a></div>';
  document.body.appendChild(bar); document.body.classList.add("pahasbar");
  var trig=$("main .ctas")||$("h1"), past=false, end=false;
  function sync(){ var on=past&&!end; bar.classList.toggle("show",on); if(on) bar.removeAttribute("inert"); else bar.setAttribute("inert","") }
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(es){es.forEach(function(e){past=!e.isIntersecting&&e.boundingClientRect.top<0;sync()})}).observe(trig);
    var vis=new Set(); var eo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)vis.add(e.target);else vis.delete(e.target)});end=vis.size>0;sync()});
    $$(".panext,footer.foot").forEach(function(x){eo.observe(x)});
  }
  sync();
}

/* ---------- form helpers (Baymard/NNg: inline validation after leaving a field, clear messages, error summary) ---------- */
function validator(form){
  var fields=$$("[data-v]",form);
  function msgFor(x){
    var v=x.value.trim(), t=x.getAttribute("data-v");
    if(x.hasAttribute("data-req") && !v) return x.getAttribute("data-empty")||"Please fill this in.";
    if(!v) return "";
    if(t==="email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "That email doesn't look complete. Check for a missing @ or a typo, like name@example.com.";
    if(t==="postcode" && !/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(v)) return "Please enter a full UK postcode, like OX49 5EQ.";
    if(t==="name" && v.length<2) return "Please enter your name.";
    if(t==="tel" && v.replace(/[^0-9]/g,"").length<10) return "Please enter a phone number with at least 10 digits, or leave it blank.";
    return "";
  }
  function show(x,force){
    var m=msgFor(x), w=x.closest(".paf"), e=w&&$(".err",w);
    if(!force && !x.dataset.touched) return !m;
    if(e) e.textContent=m; x.setAttribute("aria-invalid",m?"true":"false");
    if(w) w.classList.toggle("ok",!m && !!x.value.trim()); return !m;
  }
  fields.forEach(function(x){
    x.addEventListener("blur",function(){ x.dataset.touched=1; if(x.getAttribute("data-v")==="postcode" && x.value.trim()){ var v=x.value.toUpperCase().replace(/\s+/g,""); if(v.length>3) x.value=v.slice(0,-3)+" "+v.slice(-3) } show(x) });
    x.addEventListener("input",function(){ if(x.getAttribute("aria-invalid")==="true"||x.dataset.touched) show(x) });
  });
  return function check(){
    var bad=[]; fields.forEach(function(x){ if(x.closest("[hidden]")) return; x.dataset.touched=1; if(!show(x,true)) bad.push(x) });
    var sum=$(".paerrsum",form);
    if(sum){ sum.innerHTML=bad.length?('<b>Please check '+(bad.length===1?"one thing":bad.length+" things")+':</b><ul style="margin:6px 0 0 18px">'+bad.map(function(x){var l=$("label[for='"+x.id+"']");return '<li><a href="#'+x.id+'">'+(l?l.childNodes[0].textContent.trim():"This field")+'</a></li>'}).join("")+'</ul>'):""; }
    if(bad.length){ (sum&&sum.innerHTML?sum:bad[0]).focus(); }
    return !bad.length;
  };
}

/* ---------- brochure form: three fields, extras after sending ---------- */
var bf=$("[data-pabrochure]");
if(bf){
  var chk=validator(bf), addr=$("[data-printed]",bf);
  function fmt(){ var p=$("input[name=format]:checked",bf).value==="printed"; addr.hidden=!p; $$("input",addr).forEach(function(x){ if(p) x.setAttribute("data-req",""); else x.removeAttribute("data-req") }) }
  $$("input[name=format]",bf).forEach(function(r){r.addEventListener("change",fmt)}); fmt();
  bf.addEventListener("submit",function(e){ e.preventDefault(); if(!chk()) return;
    var btn=$("button[type=submit]",bf); btn.disabled=true; btn.textContent="Sending…";
    store("pareq",{kind:"brochure",format:$("input[name=format]:checked",bf).value,name:$("#br-name").value.trim(),email:$("#br-email").value.trim(),pc:$("#br-pc").value.trim()});
    setTimeout(function(){ location.href=ROOT+"thank-you/index.html#brochure" },450);
  });
}

/* ---------- v8.3 (Felix C1): garden-room pages pass the model (and the size you've designed) into booking ---------- */
var cpm=document.querySelector('meta[name="cp-model"]');
if(cpm){ var mname=cpm.getAttribute("content");
  function sizeTxt(){ var c=window.__sgcfg||window.__ctcfg||window.__hgen, st=c&&c.state; if(!st||!st.w||!st.d) return "";
    var w=+st.w, d=+st.d; if(w>100){ w=w/1000; d=d/1000 } var t=w+"m × "+d+"m"; if(st.pkg) t+=", "+st.pkg.charAt(0).toUpperCase()+st.pkg.slice(1)+" package"; return t }
  $$("main a[href*='visit-us/index.html'], .stk a[href*='visit-us/index.html']").forEach(function(a){
    var hr=a.getAttribute("href"); if(!/#book$/.test(hr)||/[?&]model=/.test(hr)||/site=video/.test(hr)) return;
    a.setAttribute("href",hr.replace("#book",(hr.indexOf("?")>=0?"&":"?")+"model="+encodeURIComponent(mname)+"#book"));
    a.addEventListener("click",function(){ var sz=sizeTxt(); if(sz) a.href=a.getAttribute("href").replace(/model=[^&#]*/,"model="+encodeURIComponent(mname+", "+sz)) });
  });
}
/* ---------- booking: where → day → time → you ---------- */
var bk=$("[data-pabook]");
if(bk){
  var st={site:qs.get("site")||"",date:"",slot:"",model:qs.get("model")||""};
  if(qs.get("type")==="consultation" && !st.site) st.site="home";
  var grid=$("[data-sites]",bk), days=$("[data-days]",bk), slots=$("[data-slots]",bk), sum=$("[data-sum]");
  var fixed=bk.getAttribute("data-site"); if(fixed) st.site=fixed;
  function opt(s){
    var hr=s.remote?"Mon–Sat":("Mon–Sat "+s.wk.join("–")+"<br>Sun "+s.sun.join("–"));
    return '<label class="paopt"><input type="radio" name="site" value="'+s.id+'"><span class="dot" aria-hidden="true"></span><span><b>'+s.town+'</b><small>'+s.gc+(s.county?", "+s.county:"")+(s.note?" · "+s.note:"")+'</small>'+(s.display?'<span class="pashow">On display: <strong>'+s.display+'</strong></span>':'')+'<span class="hr">'+hr+'</span></span></label>';
  }
  var GR=/sandringham|clarence|buckingham|heritage|contemporary|garden room/i.test(st.model||"");
  var pool=SITES.filter(function(s){return (!fixed||s.id===fixed)&&!(GR&&!fixed&&s.display==="Gazebos only")}), has=!fixed&&showsAt(st.model);
  if(has){
    var ids=has.map(function(s){return s.id}), rest=pool.filter(function(s){return ids.indexOf(s.id)<0&&!s.remote}), rem=pool.filter(function(s){return s.remote});
    grid.classList.add("pagrp");
    grid.innerHTML='<p class="pagh">On display: '+st.model+'</p>'+has.map(opt).join("")+
      '<p class="pagh">Other show sites <span>('+st.model+' not on display)</span></p>'+rest.map(opt).join("")+
      '<p class="pagh">Or meet a design consultant</p>'+rem.map(opt).join("");
  } else grid.innerHTML=pool.map(opt).join("");
  var warn=document.createElement("p"); warn.className="pawarn"; warn.setAttribute("role","status"); warn.hidden=true; grid.after(warn);
  function checkWarn(){
    var s=site(st.site), m=(mdl&&mdl.value.trim())||st.model, at=showsAt(m);
    var bad=!!(s&&!s.remote&&at&&at.indexOf(s)<0);
    warn.hidden=!bad; warn.innerHTML=bad?'<b>The '+m+' isn’t on display at '+s.town+'.</b> To see one, choose '+at.map(function(x){return x.town}).join(", ").replace(/, ([^,]*)$/," or $1")+'. You’re still welcome at '+s.town+' to see other models.':"";
  }
  var mdl=$("#bk-model"); if(mdl && st.model) mdl.value=st.model;
  function stepState(){
    var s1=$("[data-step='1']",bk), s2=$("[data-step='2']",bk), s3=$("[data-step='3']",bk);
    s1.classList.toggle("done",!!st.site); s2.classList.toggle("locked",!st.site); s2.classList.toggle("done",!!st.date);
    s3.classList.toggle("locked",!st.date); s3.classList.toggle("done",!!st.slot);
    $("[data-step='4']",bk).classList.toggle("locked",!st.slot);
    /* v8.2: locked pickers are inert (no keyboard focus), headings and hints stay readable */
    [s2,s3].forEach(function(s){ var c=s.querySelector(".padays,.paslots"); if(c){ if(s.classList.contains("locked")) c.setAttribute("inert",""); else c.removeAttribute("inert"); } });
  }
  function renderDays(){
    var s=site(st.site), out=[], d=new Date(); d.setHours(12,0,0,0);
    for(var i=1;i<=14;i++){ var x=new Date(d.getTime()+i*864e5), iso=x.getFullYear()+"-"+("0"+(x.getMonth()+1)).slice(-2)+"-"+("0"+x.getDate()).slice(-2);
      var closed=s && s.remote && x.getDay()===0;
      out.push('<button type="button" data-d="'+iso+'" aria-pressed="'+(iso===st.date)+'"'+(closed?' disabled aria-label="'+fmtDate(iso)+', not available"':' aria-label="'+fmtDate(iso)+'"')+'><small>'+DAYS[x.getDay()].slice(0,3)+'</small><b>'+x.getDate()+'</b><span>'+MON[x.getMonth()].slice(0,3)+'</span></button>'); }
    days.innerHTML=out.join("");
  }
  function slotList(){
    var s=site(st.site); if(!s||!st.date) return [];
    var dow=new Date(st.date+"T12:00:00").getDay(), h=(dow===0?s.sun:s.wk); if(!h) return [];
    var o=mins(h[0]), c=mins(h[1]), first=Math.ceil((o+30)/30)*30, r=[];
    for(var m=first;m<=c-90;m+=90) r.push(hhmm(m)); return r;
  }
  function renderSlots(){
    var l=slotList(); if(l.indexOf(st.slot)<0) st.slot="";
    slots.innerHTML=l.length?l.map(function(t){return '<button type="button" data-t="'+t+'" aria-pressed="'+(t===st.slot)+'">'+t+'</button>'}).join(""):'<p class="why" style="margin:0">Choose a day first.</p>';
  }
  function renderSum(){
    var s=site(st.site);
    function row(k,v,ph){return '<dt>'+k+'</dt><dd class="'+(v?"":"empty")+'">'+(v||ph)+'</dd>'}
    sum.innerHTML=row("Where",s?(s.town+(s.remote?"":" show site")):"","Choose a place")+row("Day",st.date?fmtDate(st.date):"","Choose a day")+row("Time",st.slot,"Choose a time")+row("To see",(mdl&&mdl.value.trim())||"","Anything (optional)");
  }
  function all(){ stepState(); renderSlots(); renderSum(); checkWarn(); }
  grid.addEventListener("change",function(e){ st.site=e.target.value; var s=site(st.site); if(s&&s.remote&&st.date&&new Date(st.date+"T12:00:00").getDay()===0) st.date=""; renderDays(); all();
    $("[data-step='2']",bk).scrollIntoView({behavior:"smooth",block:"nearest"}); });
  days.addEventListener("click",function(e){ var b=e.target.closest("button[data-d]"); if(!b||b.disabled) return; st.date=b.getAttribute("data-d"); $$("button",days).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")}); all(); });
  slots.addEventListener("click",function(e){ var b=e.target.closest("button[data-t]"); if(!b) return; st.slot=b.getAttribute("data-t"); all(); });
  if(mdl) mdl.addEventListener("input",function(){ renderSum(); checkWarn() });
  if(st.site){ var r=$("input[value='"+st.site+"']",grid); if(r) r.checked=true; }
  renderDays(); all();
  // "Book at this site" links further down the page pre-select the site
  $$("[data-pick]").forEach(function(a){ a.addEventListener("click",function(){ var r=$("input[value='"+a.getAttribute("data-pick")+"']",grid); if(r){ r.checked=true; r.dispatchEvent(new Event("change",{bubbles:true})) } }) });
  var chk2=validator(bk);
  bk.addEventListener("submit",function(e){ e.preventDefault();
    var miss=!st.site?"1":!st.date?"2":!st.slot?"3":"", es=$(".paerrsum",bk);
    if(miss){ es.innerHTML='<b>Almost there:</b> please choose '+({"1":"where you'd like to meet","2":"a day","3":"a time"})[miss]+'. <a href="#bk-step'+miss+'">Go to step '+miss+'</a>'; es.focus(); return; }
    if(!chk2()) return;
    var btn=$("button[type=submit]",bk); btn.disabled=true; btn.textContent="Booking…";
    store("pareq",{kind:site(st.site).remote?"consultation":"visit",site:st.site,date:st.date,slot:st.slot,model:(mdl&&mdl.value.trim())||"",name:$("#bk-name").value.trim(),email:$("#bk-email").value.trim(),tel:$("#bk-tel").value.trim()});
    setTimeout(function(){ location.href=ROOT+"thank-you/index.html#visit" },450);
  });
}

/* ---------- thank-you: what happens next + optional extras ---------- */
var ty=$("[data-paty]");
if(ty){
  var rq=store("pareq");
  if(!rq){ var k=location.hash.slice(1)||"visit"; rq=k==="brochure"?{kind:"brochure",format:"digital",name:"",demo:true}:{kind:"visit",site:"bagshot",date:(function(){var d=new Date(Date.now()+3*864e5);return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)})(),slot:"11:30",model:"Crown Windsor",name:"",demo:true}; }
  var s=rq.site&&site(rq.site), first=(rq.name||"").split(" ")[0];
  $("[data-ty-h]").textContent=(rq.kind==="brochure"?"Your brochure is on its way":"Your visit is requested")+(first?", "+first:"");
  var lines=[], steps=[];
  if(rq.kind==="brochure"){
    $("[data-ty-sub]").textContent=rq.format==="printed"?"We'll post your printed brochure. You can read the digital version straight away.":"Read it now, or find it in your inbox.";
    lines.push('<a class="btn big" href="https://www.crownpavilions.com/request-brochure/thank-you/" rel="noopener" target="_blank">Download the brochure<span class="sr"> (opens the Crown Pavilions brochures page)</span></a>');
    steps=[["Read the brochure","Prices, sizes and what's included, range by range."],["See it in person","Six show sites. Pick a day and a time that suit you."],["Talk it through","A design consultant can help with size, planning and foundations."]];
    lines.push('<p style="margin-top:16px">The best next step is seeing a building in person: <a class="lnk" href="'+ROOT+'visit-us/index.html#book">book a show-site visit →</a></p>');
  } else {
    var when=fmtDate(rq.date)+" at "+rq.slot;
    $("[data-ty-sub]").innerHTML=(s.remote?s.town:("<b>"+s.town+"</b> show site, "+s.gc))+" · <b>"+when+"</b>"+(rq.model?" · to see the "+rq.model:"");
    var at=!s.remote&&rq.model&&showsAt(rq.model);
    if(at&&at.indexOf(s)<0) $("[data-ty-sub]").innerHTML=(s.remote?s.town:("<b>"+s.town+"</b> show site, "+s.gc))+" · <b>"+when+"</b>"+'<span class="tyno">The '+rq.model+' isn’t on display at '+s.town+'; it’s at '+at.map(siteName).join(", ").replace(/, ([^,]*)$/," and $1")+'. We’ll talk this through when we confirm your visit.</span>';
    lines.push('<p class="tyconf">We’ll be in touch to confirm your visit.</p><div class="paacts">'+(s.remote?"":'<a class="btn gh" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.gc+" "+s.pc)+'" rel="noopener" target="_blank">Get directions<span class="sr"> (opens Google Maps)</span></a>')+'</div>');
    steps=[["We confirm your visit","A design consultant calls or emails to confirm, and checks the model you'd like to see is on display."],[s.remote?"Your consultation":"Your visit","No obligation and no pressure. Take as long as you like."],["Your design and quote","Sized for your garden, with a scaled drawing if you'd like one."]];
  }
  $("[data-ty-acts]").innerHTML=lines.join("");
  $("[data-ty-steps]").innerHTML=steps.map(function(x){return '<li><b>'+x[0]+'</b><span>'+x[1]+'</span></li>'}).join("");
  if(rq.demo) $("[data-ty-demo]").hidden=false;
  var ics=$("[data-ics]");
  if(ics){ ics.addEventListener("click",function(e){ e.preventDefault();
    var d=rq.date.replace(/-/g,""), t=rq.slot.replace(":","")+"00", endM=mins(rq.slot)+60, t2=hhmm(endM).replace(":","")+"00";
    var body=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Crown Pavilions//proto-awesomeo//EN","BEGIN:VEVENT","UID:pa-"+Date.now()+"@crownpavilions.example","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z","DTSTART;TZID=Europe/London:"+d+"T"+t,"DTEND;TZID=Europe/London:"+d+"T"+t2,"SUMMARY:Provisional: Crown Pavilions "+(s.remote?s.town.toLowerCase():"show-site visit, "+s.town),"LOCATION:"+(s.remote?"":s.gc+", "+s.addr),"DESCRIPTION:Requested on the prototype site. To be confirmed by Crown Pavilions. 01491 612820","END:VEVENT","END:VCALENDAR"].join("\r\n");
    var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([body],{type:"text/calendar"})); a.download="crown-pavilions-visit.ics"; document.body.appendChild(a); a.click(); a.remove();
    ics.textContent="Saved as provisional: check your downloads ✓";
  }) }
  var ex=$("[data-paextras]");
  if(ex){ var chk3=validator(ex), ph=$("[data-phone]",ex);
    function ch(){ var c=$("input[name=ch]:checked",ex), need=c&&c.value!=="email"; ph.hidden=!need; $("#ex-tel").toggleAttribute("data-req",!!need) }
    $$("input[name=ch]",ex).forEach(function(r){r.addEventListener("change",ch)}); ch();
    if(rq.tel) $("#ex-tel").value=rq.tel;
    ex.addEventListener("submit",function(e){ e.preventDefault(); if(!chk3()) return; store("paextras",{saved:true}); $(".pasaved",ex).textContent="✓ Saved. Thank you: your consultant will have this before they get in touch. (Prototype: nothing was sent.)"; $("button[type=submit]",ex).textContent="Saved ✓"; });
  }
}
})();
