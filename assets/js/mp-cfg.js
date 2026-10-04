/* v8.7 model pages: configurator for every gazebo model (generalised from hp-cfg.js, the approved Hampton configurator).
   All figures come from the page's own <script type="application/json" id="mp-data"> (built from review/model-pages/data/<slug>.json, live prices 3 Oct 2026).
   Same data-hp / data-hpo hooks as the Hampton, so the Hampton CSS applies. Panel layout, roof (Classic) and colours never change the price. */
(function(){
  "use strict";
  var root=document.querySelector("[data-hpcfg]"), dj=document.getElementById("mp-data"); if(!root||!dj) return;
  var D=JSON.parse(dj.textContent);
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var gbp=function(n){return "£"+Math.round(n).toLocaleString("en-GB")};
  var PR={h3:1150,h36:1950,L:1250,T:1250,bbq1:6450,bbq2:7850,survey:460}; for(var k in D.found) PR[k]=D.found[k];
  var COL={green:"Green",burgundy:"Burgundy",beige:"Beige",ivory:"Ivory",navy:"Navy",taupe:"Taupe"};
  var HEX={green:"#005224",burgundy:"#850f1b",beige:"#eae4cc",ivory:"#dee6ed",navy:"#191f54",taupe:"#7b7e77"};
  var L={roof:{cedar:"Cedar shingles",thatch:"Thatch",flat:"Flat roof",hipped:"Hipped cedar roof"},heater:{none:"None",h3:"3kW infrared heater",h36:"3/6kW infrared heater"},cab:{none:"None",L:"L-shape side cabinet",T:"T-shape side cabinet"},
    pkg:{premium:"Premium Package",unfurnished:"Unfurnished",furnished:"Furnished"},
    found:{own:"Your own base",ecogrid:"Crown EcoGrid",tanalised:"Redwood deck",composite:"Composite deck",crown:"A Crown base"}};
  var BAY={E:"Entrance",B:"Balustrade & blind",F:"Full clad",H:"½ clad & ½ plexiglass"}; if(D.sides&&D.sides.types){ for(var bk in D.sides.types) BAY[bk]=D.sides.types[bk][0] }
  var FAB={green:"fab-green",burgundy:"fab-burgundy",beige:"fab-beige",navy:"fab-navy",taupe:"fab-taupe"};
  var STEPS=D.steps, IX={package:0,sides:1,roof:2,colours:3,extras:4,found:5,summary:6};
  var PRE=D.sides?MPSides.presets(D.sides.geom,D.sides.std):{};
  var S={pkg:D.pkg0,roof:D.roof0,cushion:"beige",piping:"navy",blind:"beige",heater:"none",hq:1,cab:"none",bbq:"no",found:"own",gravel:"Cotswold",deck:"Burnt Oak",bays:(PRE.std||"").split(""),tab:0};
  function base(){ return D.prices[D.pkgKind==="roof"?S.roof:S.pkg] }
  function furnished(){ return D.pkgKind==="premium"||S.pkg==="furnished" }
  function counts(){ var c={B:0,F:0,H:0}; S.bays.forEach(function(b){ if(c[b]!=null) c[b]++ }); return c }
  function bayText(){ var c=counts(); return ["B","F","H"].filter(function(k){return c[k]||!D.sides.types}).map(function(k){return c[k]+" "+BAY[k].toLowerCase()}).join(" · ") }
  function fprice(f){ return PR[f]==null?null:PR[f] }
  function lines(){
    var a=[[D.name,(D.pkgKind==="roof"?L.roof[S.roof]:L.pkg[S.pkg])+", "+D.sizeShort+", installed",gbp(base())]];
    if(D.sides) a.push(["Sides",bayText(),"Included"]);
    if(D.pkgKind==="premium") a.push(["Roof",L.roof[S.roof]+", redwood-clad underside","Included"]);
    if(D.colours&&furnished()) a.push(["Colours",COL[S.cushion]+" cushions"+(D.piping?" · "+COL[S.piping]+" piping":"")+(D.blinds?" · "+COL[S.blind]+" blinds":"")+(D.frame?" · "+D.frame:"")+(D.colourTBC?" (colours to be confirmed)":""),"Included"]);
    else if(D.frame) a.push(["Finish",D.frame,"Included"]);
    if(S.heater!=="none") a.push(["Heating",S.hq+" × "+L.heater[S.heater]+": supplied and hung by our team; electrical connection by your own electrician",gbp(PR[S.heater]*S.hq)]);
    if(S.cab!=="none") a.push(["Side cabinet",L.cab[S.cab],gbp(PR[S.cab])]);
    if(S.bbq==="single") a.push(["BBQ table, single grill","Smokeless electric grill in your dining table",gbp(PR.bbq1)]); if(S.bbq==="double") a.push(["BBQ table, double grill","Larger smokeless electric grill, for hosting",gbp(PR.bbq2)]);
    if(S.found!=="own"){ var p=fprice(S.found); a.push(["Base",L.found[S.found]+(S.found==="ecogrid"?" · "+S.gravel+" gravel":S.found==="composite"?" · "+S.deck:"")+(S.found==="ecogrid"?" · no site survey needed":S.found==="crown"?" · laid by our own team, matched to your ground":" · priced after an optional site survey"),p==null?"Priced on your quote":"from "+gbp(p)]); if(S.found!=="ecogrid") a.push(["Site survey (optional)","Survey and ground-screw test, before your base is priced","Optional, "+gbp(PR.survey)]) }
    else a.push(["Base","Your own hard, level standing: a concrete pad, paving or decking","Not supplied by Crown"]);
    return a }
  function total(){ var t=base(); if(S.heater!=="none") t+=PR[S.heater]*S.hq; if(S.cab!=="none") t+=PR[S.cab]; if(S.bbq==="single") t+=PR.bbq1; if(S.bbq==="double") t+=PR.bbq2; if(S.found!=="own"&&fprice(S.found)!=null) t+=PR[S.found]; return t }
  function extrasN(){ return (S.heater!=="none"?1:0)+(S.cab!=="none"?1:0)+(S.bbq!=="no"?1:0) }
  function put(k,v){ $$("[data-hpo="+k+"]").forEach(function(e){ e.textContent=v }) }
  function say(m){ var l=$("[data-hpo=live]"); if(l){ l.textContent=""; setTimeout(function(){ l.textContent=m },30) } }
  function step(){ return STEPS[S.tab] }
  function view(){ var s=step(); if(s==="sides") return "plan"; if(s==="colours") return "fabric"; if(s==="summary") return "photo"; /* v8.7.2: the summary shows this model's own photo (was the Hampton recolour backdrop) */ return "photo" }
  function stagePhoto(){ var s=step(), P=D.stage;
    if(s==="roof"){ var b=$("[data-hp=roof][data-v="+S.roof+"]"); return [b.getAttribute("data-stage"),b.getAttribute("data-cap"),"Photo",L.roof[S.roof]] }
    if(s==="package"&&D.pkgKind==="furnish"){ var pb=$("[data-hp=pkg][data-v="+S.pkg+"]"); return [pb.getAttribute("data-stage"),pb.getAttribute("data-cap"),"Photo",L.pkg[S.pkg]] }
    if(s==="extras"){ if(S.bbq!=="no") return ["../../assets/img/smokeless.webp","The BBQ table: a smokeless grill built into the dining table (shown in another Crown pavilion)","Photo","BBQ table"];
      if(S.cab!=="none") return ["../../assets/img/h18-cab.webp","Timber side cabinet with wine shelves and space for a wine cooler (shown in a Crown Hampton)","Photo","Side cabinet"]; return ["../../assets/img/hampton/heat-h02.webp","Infrared heater with built-in spotlight, under a redwood ceiling (shown in a Crown Hampton)","Photo","Heat & extras"] }
    if(s==="found"){ var f=$("[data-hp=found][data-v="+S.found+"]"); return [f.getAttribute("data-stage"),f.getAttribute("data-cap"),"Photo",L.found[S.found]] }
    if(s==="package") return [P.pkg[0],P.pkg[1],"Photo",D.pkgKind==="premium"?"The Premium Package":""];
    return [P.main[0],P.main[1],"Photo",""] }
  function fabric(){
    ["cushion","piping","blind"].forEach(function(g){ $$("[data-hpc="+g+"]").forEach(function(i){ i.style.background=HEX[S[g]] }); $$("[data-rf="+g+"]").forEach(function(i){ if(g==="cushion"&&FAB[S[g]]){ i.style.backgroundImage="url(../../assets/img/hampton/"+FAB[S[g]]+".webp)"; i.classList.remove("weave") } else { i.style.backgroundImage=""; i.classList.add("weave") } i.style.backgroundColor=HEX[S[g]] }); put(g+"n",COL[S[g]]) });
    put("fabnote","Indicative; ask for a swatch. "+(FAB[S.cushion]?"The cushion is a close-up of a real Crown cushion in "+COL[S.cushion]+"; piping"+(D.blinds?" and blinds":"")+" are shown as swatches.":"Shown as swatches.")+(D.colourTBC?" Colour range for the "+D.short+" to be confirmed.":"")+" We’ll post fabric samples so you can see the true colours at home.") }
  function code(){ var s=S.bays.join("")+S.pkg+S.roof+S.cushion+S.piping+S.blind+S.heater+S.hq+S.cab+S.bbq+S.found+S.gravel+S.deck, h=5381;
    for(var i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; var a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789", o=""; for(var j=0;j<4;j++){ o+=a[h%32]; h=Math.floor(h/32) } return D.code+"-"+o }
  function spec(){ return D.name+" · "+lines().map(function(l){return l[0]+": "+l[1]+(/£/.test(l[2])?" ("+l[2]+")":"")}).join(" · ")+" · Total from "+gbp(total())+" inc. VAT · Typical lead time 6–8 weeks, depending on the season" }
  function upd(){
    root.setAttribute("data-hptab",IX[step()]); root.setAttribute("data-mpstep",step()); root.setAttribute("data-mpfurn",furnished()?"1":"0");
    $$("[data-hp]",root).forEach(function(b){ var g=b.getAttribute("data-hp"); if(!(g in S)) return; var on=String(S[g])===b.getAttribute("data-v"); b.setAttribute("aria-checked",on); });
    var t=total(), c=counts();
    put("total",gbp(t)); put("totalv",gbp(t));
    put("pkgv",D.pkgKind==="premium"?"Premium":D.pkgKind==="roof"?L.roof[S.roof]:L.pkg[S.pkg]);
    put("roofv",L.roof[S.roof]||""); put("colv",furnished()?COL[S.cushion]+(D.piping?" · "+COL[S.piping]:""):"With furniture");
    put("extv",extrasN()?extrasN()+" added":"None yet"); put("fndv",S.found==="own"?"Own base":L.found[S.found]);
    put("hq",S.hq);
    var pn=[D.pkgKind==="roof"?L.roof[S.roof]:L.pkg[S.pkg]]; if(D.pkgKind==="premium") pn.push(L.roof[S.roof]); if(D.colours&&furnished()) pn.push(COL[S.cushion]+" cushions"); if(extrasN()) pn.push(extrasN()+" extra"+(extrasN()>1?"s":"")); pn.push("installation included"); if(S.found==="own") pn.push("groundworks excluded"); /* v8.7.2 */
    put("pnote",pn.join(" · "));
    var ch=[]; if(D.pkgKind!=="premium") ch.push(D.pkgKind==="roof"?L.roof[S.roof]:L.pkg[S.pkg]); else ch.push(L.roof[S.roof]); if(D.sides) ch.push(D.sides.types?c.F+" clad · "+c.H+" half · "+c.B+" "+(D.range==="shelters"?"open":"windows"):c.B+" open · "+c.F+" clad · "+c.H+" half-glazed"); if(D.colours&&furnished()) ch.push(COL[S.cushion]+"/"+COL[S.piping]); if(S.heater!=="none") ch.push(S.hq+" heater"+(S.hq>1?"s":""));
    put("chip",ch.join(" · "));
    put("stkchip",ch.slice(0,1).concat(D.colours&&furnished()?[COL[S.cushion]+" cushions"]:[]).concat(extrasN()?[extrasN()+" extra"+(extrasN()>1?"s":"")]:[]).join(" · "));
    $$("[data-hpo=lines]").forEach(function(ul){ ul.innerHTML=lines().map(function(l){ return "<li><span><b>"+l[0]+"</b><small>"+l[1]+"</small></span><span class=\"lp\">"+l[2]+"</span></li>" }).join("") });
    $$("[data-hpshow]").forEach(function(e){ var kv=e.getAttribute("data-hpshow").split("="); e.hidden=kv[1].split("|").indexOf(String(S[kv[0]]))<0 });
    var v=view(); $$("[data-hpview]").forEach(function(e){ e.hidden=e.getAttribute("data-hpview")!==v });
    if(v==="photo"){ var p=stagePhoto(), im=$("[data-hpimg]"); if(im.getAttribute("src")!==p[0]) im.src=p[0]; im.alt=p[1]; put("photocap",p[1]); put("viewk",p[2]); put("viewt",p[3]) }
    else if(v==="plan"){ put("viewk","Plan · from Crown’s drawing"); put("viewt","Your layout: "+bayText()) }
    else { put("viewk",step()==="summary"?"Your "+D.short:"Colours"); put("viewt",COL[S.cushion]+" cushions · "+COL[S.piping]+" piping"+(D.blinds?" · "+COL[S.blind]+" blinds":"")) }
    fabric();
    var cd=$("[data-rfcode]"); if(cd) cd.textContent=code();
    var th=$("[data-rfthumb]"); if(th&&window.__mpsides) th.innerHTML=window.__mpsides.thumb(S.bays);
    var ta=document.getElementById("hpsend-spec"); if(ta) ta.value=spec();
  }
  root.addEventListener("click",function(e){
    var b=e.target.closest("[data-hp]");
    if(b){ var g=b.getAttribute("data-hp"), v=b.getAttribute("data-v"); S[g]=v; if(g==="heater"&&v!=="none"&&!S.hq) S.hq=1;
      upd(); if(g==="cushion"||g==="piping"||g==="blind") say(COL[S.cushion]+" cushions, "+COL[S.piping]+" piping"+(D.blinds?", "+COL[S.blind]+" blinds":"")); else say("Your "+D.short+": "+gbp(total())+" inc. VAT"); return }
    var q=e.target.closest("[data-hpq]"); if(q){ S.hq=Math.max(1,Math.min(4,S.hq+(+q.getAttribute("data-hpq")))); upd(); say(S.hq+" heaters, "+gbp(total())); return }
  });
  var tabs=$$(".btabs [role=tab]",root);
  tabs.forEach(function(t,i){ t.addEventListener("click",function(){ S.tab=i; upd() }); t.addEventListener("keydown",function(){ setTimeout(function(){ var j=tabs.findIndex(function(x){return x.getAttribute("aria-selected")==="true"}); if(j>=0&&j!==S.tab){ S.tab=j; upd() } },0) }) });
  function go(i){ tabs[i].click(); var sec=document.getElementById("design"); var J=window.__v3jump; if(sec){ var tgt=J&&J.land?J.land(sec):sec; var y=tgt.getBoundingClientRect().top+scrollY-((document.querySelector(".site-h")||{}).offsetHeight||0)-8; scrollTo({top:Math.max(0,y),behavior:"smooth"}) } }
  /* data-hpgo="7" always means the summary (last step), as on the Hampton */
  $$("[data-hpgo]").forEach(function(b){ b.addEventListener("click",function(e){ e.preventDefault(); var n=+b.getAttribute("data-hpgo"); go(n===7?tabs.length-1:n-1) }) });
  var qs=new URLSearchParams(location.search);
  ["pkg","roof","cushion","piping","blind","heater","cab","bbq","found"].forEach(function(k){ var v=qs.get(k); if(v&&document.querySelector("[data-hp="+k+"][data-v=\""+v+"\"]")) S[k]=v });
  if(+qs.get("hq")) S.hq=Math.max(1,Math.min(4,+qs.get("hq")));
  window.__hpcfg=window.__mpcfg={state:S,total:total,lines:lines,spec:spec,upd:upd,prices:PR,base:base,go:go,presets:PRE,data:D};
  upd();
  var t0=+qs.get("tab"); if(t0>=1&&t0<=tabs.length){ tabs[t0-1].click() }
})();
