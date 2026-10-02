/* proto-awesomeo behaviours. Vanilla JS, no network calls. Data stays in this browser tab (sessionStorage). */
(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var ROOT=(document.querySelector('a.logo')||{getAttribute:function(){return "index.html"}}).getAttribute("href").replace(/index\.html$/,"");
var PHONE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>';
/* Show-site facts: names, addresses and opening hours as listed on crownpavilions.com/showsites (checked 1 Oct 2026). */
var SITES=[
 {id:"bridgemere",town:"Bridgemere",county:"Cheshire",gc:"Bridgemere Garden Centre",addr:"Bridgemere, Nantwich, Cheshire CW5 7QB",pc:"CW5 7QB",wk:["09:00","17:00"],sun:["10:00","16:30"],note:"Gazebos only"},
 {id:"woburn-sands",town:"Woburn Sands",county:"Bucks",gc:"Frosts Garden Centre",addr:"Newport Road, Woburn Sands, Buckinghamshire MK17 8UE",pc:"MK17 8UE",wk:["09:00","17:30"],sun:["10:30","16:30"]},
 {id:"ware",town:"Ware",county:"Herts",gc:"Van Hage Garden Centre",addr:"Great Amwell, Ware, Hertfordshire SG12 9RP",pc:"SG12 9RP",wk:["09:00","17:30"],sun:["10:00","16:30"]},
 {id:"wickford",town:"Wickford",county:"Essex",gc:"Alton Garden Centre",addr:"Arterial Road, Wickford, Essex SS12 9JG",pc:"SS12 9JG",wk:["09:00","17:00"],sun:["10:00","16:30"]},
 {id:"chessington",town:"Chessington",county:"Surrey",gc:"Chessington Garden Centre",addr:"Leatherhead Road, Chessington, Surrey KT9 2NG",pc:"KT9 2NG",wk:["09:00","18:00"],sun:["09:30","16:30"],note:"Video showcase filmed here"},
 {id:"bagshot",town:"Bagshot",county:"Surrey",gc:"Longacres Garden Centre",addr:"London Road, Bagshot, Surrey GU19 5JB",pc:"GU19 5JB",wk:["08:30","17:30"],sun:["10:00","16:30"]},
 {id:"home",town:"At your home",gc:"A design consultant visits your garden",addr:"",remote:true,wk:["10:00","16:00"],sun:null},
 {id:"video",town:"By video call",gc:"For 100+ miles from a site · filmed at Chessington",addr:"",remote:true,wk:["10:00","17:00"],sun:null}];
window.PASITES=SITES;
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

/* ---------- booking: where → day → time → you ---------- */
var bk=$("[data-pabook]");
if(bk){
  var st={site:qs.get("site")||"",date:"",slot:"",model:qs.get("model")||""};
  if(qs.get("type")==="consultation" && !st.site) st.site="home";
  var grid=$("[data-sites]",bk), days=$("[data-days]",bk), slots=$("[data-slots]",bk), sum=$("[data-sum]");
  var fixed=bk.getAttribute("data-site"); if(fixed) st.site=fixed;
  grid.innerHTML=SITES.filter(function(s){return !fixed||s.id===fixed}).map(function(s){
    var hr=s.remote?"Example times, Mon–Sat (TBC)":("Mon–Sat "+s.wk.join("–")+"<br>Sun "+s.sun.join("–"));
    return '<label class="paopt"><input type="radio" name="site" value="'+s.id+'"><span class="dot" aria-hidden="true"></span><span><b>'+s.town+'</b><small>'+(s.county?s.county+" · ":"")+s.gc+(s.note?" · <strong>"+s.note+"</strong>":"")+'</small><span class="hr">'+hr+'</span></span></label>';
  }).join("");
  var mdl=$("#bk-model"); if(mdl && st.model) mdl.value=st.model;
  function stepState(){
    var s1=$("[data-step='1']",bk), s2=$("[data-step='2']",bk), s3=$("[data-step='3']",bk);
    s1.classList.toggle("done",!!st.site); s2.classList.toggle("locked",!st.site); s2.classList.toggle("done",!!st.date);
    s3.classList.toggle("locked",!st.date); s3.classList.toggle("done",!!st.slot);
    $("[data-step='4']",bk).classList.toggle("locked",!st.slot);
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
  function all(){ stepState(); renderSlots(); renderSum(); }
  grid.addEventListener("change",function(e){ st.site=e.target.value; var s=site(st.site); if(s&&s.remote&&st.date&&new Date(st.date+"T12:00:00").getDay()===0) st.date=""; renderDays(); all();
    $("[data-step='2']",bk).scrollIntoView({behavior:"smooth",block:"nearest"}); });
  days.addEventListener("click",function(e){ var b=e.target.closest("button[data-d]"); if(!b||b.disabled) return; st.date=b.getAttribute("data-d"); $$("button",days).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")}); all(); });
  slots.addEventListener("click",function(e){ var b=e.target.closest("button[data-t]"); if(!b) return; st.slot=b.getAttribute("data-t"); all(); });
  if(mdl) mdl.addEventListener("input",renderSum);
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
    lines.push('<a class="btn big" href="#" data-pdf>Download the brochure (PDF)</a><span class="pademo">Placeholder: brochure PDF link TBC</span>');
    steps=[["Read the brochure","Prices, sizes and what's included, range by range."],["See it in person","Six show sites. Pick a day and a time that suit you."],["Talk it through","A design consultant can help with size, planning and foundations."]];
    lines.push('<p style="margin-top:16px">The best next step is seeing a building in person: <a class="lnk" href="'+ROOT+'visit-us/index.html#book">book a show-site visit →</a></p>');
  } else {
    var when=fmtDate(rq.date)+" at "+rq.slot;
    $("[data-ty-sub]").innerHTML=(s.remote?s.town:("<b>"+s.town+"</b> show site, "+s.gc))+" · <b>"+when+"</b>"+(rq.model?" · to see the "+rq.model:"");
    lines.push('<div class="paacts"><a class="btn" href="#" data-ics>Add to my calendar</a>'+(s.remote?"":'<a class="btn gh" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.gc+" "+s.pc)+'" rel="noopener" target="_blank">Get directions<span class="sr"> (opens Google Maps)</span></a>')+'</div>');
    steps=[["We confirm your time","A design consultant calls or emails to confirm, and checks the model you'd like to see is on display. Response time: TBC."],[s.remote?"Your consultation":"Your visit","No obligation and no pressure. Take as long as you like."],["Your design and quote","Sized for your garden, with a scaled drawing if you'd like one."]];
  }
  $("[data-ty-acts]").innerHTML=lines.join("");
  $("[data-ty-steps]").innerHTML=steps.map(function(x){return '<li><b>'+x[0]+'</b><span>'+x[1]+'</span></li>'}).join("");
  if(rq.demo) $("[data-ty-demo]").hidden=false;
  var ics=$("[data-ics]");
  if(ics){ ics.addEventListener("click",function(e){ e.preventDefault();
    var d=rq.date.replace(/-/g,""), t=rq.slot.replace(":","")+"00", endM=mins(rq.slot)+60, t2=hhmm(endM).replace(":","")+"00";
    var body=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Crown Pavilions//proto-awesomeo//EN","BEGIN:VEVENT","UID:pa-"+Date.now()+"@crownpavilions.example","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z","DTSTART;TZID=Europe/London:"+d+"T"+t,"DTEND;TZID=Europe/London:"+d+"T"+t2,"SUMMARY:Crown Pavilions "+(s.remote?s.town.toLowerCase():"show-site visit, "+s.town),"LOCATION:"+(s.remote?"":s.gc+", "+s.addr),"DESCRIPTION:Requested on the prototype site. To be confirmed by Crown Pavilions. 01491 612820","END:VEVENT","END:VCALENDAR"].join("\r\n");
    var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([body],{type:"text/calendar"})); a.download="crown-pavilions-visit.ics"; document.body.appendChild(a); a.click(); a.remove();
    ics.textContent="Added: check your downloads ✓";
  }) }
  var pdf=$("[data-pdf]"); if(pdf) pdf.addEventListener("click",function(e){e.preventDefault(); pdf.textContent="Prototype: PDF link TBC"});
  var ex=$("[data-paextras]");
  if(ex){ var chk3=validator(ex), ph=$("[data-phone]",ex);
    function ch(){ var c=$("input[name=ch]:checked",ex), need=c&&c.value!=="email"; ph.hidden=!need; $("#ex-tel").toggleAttribute("data-req",!!need) }
    $$("input[name=ch]",ex).forEach(function(r){r.addEventListener("change",ch)}); ch();
    if(rq.tel) $("#ex-tel").value=rq.tel;
    ex.addEventListener("submit",function(e){ e.preventDefault(); if(!chk3()) return; store("paextras",{saved:true}); $(".pasaved",ex).textContent="✓ Saved. Thank you: your consultant will have this before they get in touch. (Prototype: nothing was sent.)"; $("button[type=submit]",ex).textContent="Saved ✓"; });
  }
}
})();
