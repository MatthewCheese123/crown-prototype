/* proto-awesomeo v7: Crown Hampton configurator (Premium Package; sides, roof, colours, extras, foundation, summary).
   Prices: live Hampton page £41,400; heaters/side cabinet from the live Windsor page; BBQ table: brochure Smokeless BBQ, single £6,450 / double £7,850 (approved by Matthew, 2 Oct 2026);
   EcoGrid £6,500 (live); redwood/composite decks and the £460 survey from the 2026 Gazebo Brochure / live foundations page.
   The panel layout, roof and colours are all included: they never change the price.
   Colour preview (v7): the real Hampton photo (h12) stays unchanged; the chosen colours show as named fabric swatches.
   The cushion/piping recolour layers (review/proto-awesomeo/v7/recolour-wip) are parked for v7.1: set RECOLOUR=true and add the layer imgs to re-enable. */
(function(){
  "use strict";
  var root=document.querySelector("[data-hpcfg]"); if(!root) return;
  var I="../../assets/img/hampton/";
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var gbp=function(n){return "£"+Math.round(n).toLocaleString("en-GB")};
  var BASE=41400, PR={h3:1150,h36:1950,L:1250,T:1250,bbq1:6450,bbq2:7850,ecogrid:6500,tanalised:11400,composite:13110,survey:460};
  var COL={green:"Green",burgundy:"Burgundy",beige:"Beige",ivory:"Ivory",navy:"Navy",taupe:"Taupe"};
  var HEX={green:"#005224",burgundy:"#850f1b",beige:"#eae4cc",ivory:"#dee6ed",navy:"#191f54",taupe:"#7b7e77"};
  var L={roof:{cedar:"Cedar shingles",thatch:"Thatch"},heater:{none:"None",h3:"3kW infrared heater",h36:"3/6kW infrared heater"},cab:{none:"None",L:"L-shape side cabinet",T:"T-shape side cabinet"},
    found:{own:"Your own base",ecogrid:"Crown EcoGrid",tanalised:"Redwood deck",composite:"Composite deck"}};
  var BAY={E:"Entrance",B:"Balustrade & blind",F:"Full clad",H:"½ clad & ½ plexiglass"};
  var PRE={std:"EBHHFFFHHB",open:"EBBBHFHBBB",shel:"EBHFFFFFHB"};
  var RECOLOUR=false;
  var S={roof:"cedar",cushion:"beige",piping:"navy",blind:"beige",heater:"none",hq:1,cab:"none",bbq:"no",found:"own",gravel:"Cotswold",deck:"Burnt Oak",brush:"B",bays:PRE.std.split(""),tab:0};
  /* the photo is burgundy cushions with ivory piping: show it untouched for that pair, otherwise layer the recolours */
  function counts(){ var c={B:0,F:0,H:0}; S.bays.forEach(function(b){ if(c[b]!=null) c[b]++ }); return c }
  function bayText(){ var c=counts(); return c.B+" balustrade & blind · "+c.F+" full clad · "+c.H+" half clad & plexiglass" }
  function lines(){
    var a=[["Crown Hampton","Premium Package, 5.9m × 4.2m, installed",gbp(BASE)],["Sides",bayText(),"Included"],["Roof",L.roof[S.roof]+", redwood-clad underside","Included"],
      ["Colours",COL[S.cushion]+" cushions · "+COL[S.piping]+" piping · "+COL[S.blind]+" blinds","Included"]];
    if(S.heater!=="none") a.push(["Heating",S.hq+" × "+L.heater[S.heater]+": supplied and hung by our team; electrical connection by your own electrician",gbp(PR[S.heater]*S.hq)]);
    if(S.cab!=="none") a.push(["Side cabinet",L.cab[S.cab],gbp(PR[S.cab])]);
    if(S.bbq==="single") a.push(["BBQ table, single grill","Smokeless electric grill in your dining table",gbp(PR.bbq1)]); if(S.bbq==="double") a.push(["BBQ table, double grill","Larger smokeless electric grill, for hosting",gbp(PR.bbq2)]);
    if(S.found!=="own"){ a.push(["Base",L.found[S.found]+(S.found==="ecogrid"?" · "+S.gravel+" gravel":S.found==="composite"?" · "+S.deck:"")+(S.found==="ecogrid"?" · no site survey needed":" · priced after an optional site survey"),"from "+gbp(PR[S.found])]); if(S.found!=="ecogrid") a.push(["Site survey (optional)","Survey and ground-screw test, before your deck is priced","Optional, "+gbp(PR.survey)]) }
    else a.push(["Base","Your own level base, prepared to our specification","Not supplied by Crown"]);
    return a }
  function total(){ var t=BASE; if(S.heater!=="none") t+=PR[S.heater]*S.hq; if(S.cab!=="none") t+=PR[S.cab]; if(S.bbq==="single") t+=PR.bbq1; if(S.bbq==="double") t+=PR.bbq2; if(S.found!=="own") t+=PR[S.found]; return t }
  function extrasN(){ return (S.heater!=="none"?1:0)+(S.cab!=="none"?1:0)+(S.bbq!=="no"?1:0) }
  function put(k,v){ $$("[data-hpo="+k+"]").forEach(function(e){ e.textContent=v }) }
  function say(m){ var l=$("[data-hpo=live]"); if(l){ l.textContent=""; setTimeout(function(){ l.textContent=m },30) } }
  var VIEWS=["photo","plan","photo","fabric","photo","photo","fabric"];
  function stagePhoto(){
    if(S.tab===0) return [I+"h02.webp","Inside the Premium Package: glass-topped tables, clad sofa benches, redwood-clad ceiling","Photo","The Premium Package"];
    if(S.tab===2){ var b=$("[data-hp=roof][data-v="+S.roof+"]"); return [b.getAttribute("data-stage"),b.getAttribute("data-cap"),"Photo",L.roof[S.roof]] }
    if(S.tab===4){ if(S.bbq!=="no") return ["../../assets/img/smokeless.webp","The BBQ table: a smokeless grill built into the dining table (shown in another Crown pavilion)","Photo","BBQ table"];
      if(S.cab!=="none") return ["../../assets/img/h18-cab.webp","Timber side cabinet with wine shelves and space for a wine cooler","Photo","Side cabinet"]; return [I+"heat-h02.webp","Infrared heater with built-in spotlight, under the redwood ceiling","Photo","Heat & extras"] }
    if(S.tab===5){ var f=$("[data-hp=found][data-v="+S.found+"]"); return [f.getAttribute("data-stage"),f.getAttribute("data-cap"),"Photo",L.found[S.found]] }
    return [I+"h03.webp","","Photo",""] }
  function fabric(){
    var orig=S.cushion==="burgundy"&&S.piping==="ivory";
    var lc=$("[data-hpl=cushion]"), lp=$("[data-hpl=piping]");
    if(!RECOLOUR||!lc||!lp){ if(lc) lc.hidden=true; if(lp) lp.hidden=true }
    else if(orig){ lc.hidden=true; lp.hidden=true }
    else { var c=I+"fabric/h12-cushion-"+S.cushion+".webp", p=I+"fabric/h12-piping-"+S.piping+".webp";
      if(lc.getAttribute("src")!==c) lc.src=c; if(lp.getAttribute("src")!==p) lp.src=p; lc.hidden=false; lp.hidden=false }
    ["cushion","piping","blind"].forEach(function(g){ $$("[data-hpc="+g+"]").forEach(function(i){ i.style.background=HEX[S[g]] }); put(g+"n",COL[S[g]]) });
    put("fabnote",!RECOLOUR?"Photo: a real Hampton with burgundy cushions and ivory piping. Your colours are shown as swatches; we’ll post fabric samples so you can see the true colours at home.":orig?"A real Hampton, photographed with burgundy cushions and ivory piping.":"Shown on a real Hampton photo, recoloured to the brochure swatches. Blinds not in view. Ask for swatches for true colour.");
    var fi=$(".hpfi"); if(fi) fi.setAttribute("aria-label","Hampton interior with "+COL[S.cushion]+" cushions and "+COL[S.piping]+" piping"); }
  function spec(){ return "Crown Hampton · Premium Package · "+lines().map(function(l){return l[0]+": "+l[1]+(/£/.test(l[2])?" ("+l[2]+")":"")}).join(" · ")+" · Total from "+gbp(total())+" · Typical lead time 6–8 weeks" }
  function upd(){
    root.setAttribute("data-hptab",S.tab);
    $$("[data-hp]",root).forEach(function(b){ var g=b.getAttribute("data-hp"); if(!(g in S)) return; var on=String(S[g])===b.getAttribute("data-v"); b.setAttribute("aria-checked",on); });
    var t=total(), c=counts();
    put("total",gbp(t)); put("totalv",gbp(t));
    put("sidesv",c.B+" · "+c.F+" · "+c.H); put("roofv",L.roof[S.roof]); put("colv",COL[S.cushion]+" · "+COL[S.piping]);
    put("extv",extrasN()?extrasN()+" added":"None yet"); put("fndv",S.found==="own"?"Own base":L.found[S.found]);
    put("hq",S.hq); put("bays",bayText());
    put("pnote","Premium Package · "+L.roof[S.roof]+" · "+COL[S.cushion]+" cushions"+(extrasN()?" · "+extrasN()+" extra"+(extrasN()>1?"s":""):"")+" · installation included");
    put("chip",[L.roof[S.roof],c.B+" open · "+c.F+" clad · "+c.H+" half-glazed",COL[S.cushion]+"/"+COL[S.piping]].concat(S.heater!=="none"?[S.hq+" heater"+(S.hq>1?"s":"")]:[]).join(" · "));
    put("stkchip",L.roof[S.roof]+" · "+COL[S.cushion]+" cushions"+(extrasN()?" · "+extrasN()+" extra"+(extrasN()>1?"s":""):""));
    $$("[data-hpo=lines]").forEach(function(ul){ ul.innerHTML=lines().map(function(l){ return "<li><span><b>"+l[0]+"</b><small>"+l[1]+"</small></span><span class=\"lp\">"+l[2]+"</span></li>" }).join("") });
    $$(".hpplan .bay").forEach(function(g){ var i=+g.getAttribute("data-i"), v=S.bays[i]; g.setAttribute("data-t",v); var tl=$("title",g); if(tl) tl.textContent=(i?"Bay "+i+": ":"")+BAY[v]; if(i) g.setAttribute("aria-label","Bay "+i+": "+BAY[v]+". Press to apply "+BAY[S.brush]) });
    $$("[data-hpshow]").forEach(function(e){ var kv=e.getAttribute("data-hpshow").split("="); e.hidden=kv[1].split("|").indexOf(S[kv[0]])<0 });
    /* stage */
    var v=VIEWS[S.tab]; $$("[data-hpview]").forEach(function(e){ e.hidden=e.getAttribute("data-hpview")!==v });
    if(v==="photo"){ var p=stagePhoto(), im=$("[data-hpimg]"); if(im.getAttribute("src")!==p[0]) im.src=p[0]; im.alt=p[1]; put("photocap",p[1]); put("viewk",p[2]); put("viewt",p[3]) }
    else if(v==="plan"){ put("viewk","Plan · from Crown's drawing"); put("viewt","Your layout: "+bayText()) }
    else { put("viewk",S.tab===6?"Your Hampton":"Colours"); put("viewt",COL[S.cushion]+" cushions · "+COL[S.piping]+" piping · "+COL[S.blind]+" blinds") }
    fabric();
    var ta=document.getElementById("hpsend-spec"); if(ta) ta.value=spec();
  }
  root.addEventListener("click",function(e){
    var b=e.target.closest("[data-hp]");
    if(b){ var g=b.getAttribute("data-hp"), v=b.getAttribute("data-v"); S[g]=v; if(g==="heater"&&v!=="none"&&!S.hq) S.hq=1;
      upd(); if(g==="cushion"||g==="piping"||g==="blind") say(COL[S.cushion]+" cushions, "+COL[S.piping]+" piping, "+COL[S.blind]+" blinds"); else say("Your Hampton: "+gbp(total())); return }
    var q=e.target.closest("[data-hpq]"); if(q){ S.hq=Math.max(1,Math.min(4,S.hq+(+q.getAttribute("data-hpq")))); upd(); say(S.hq+" heaters, "+gbp(total())); return }
    var pr=e.target.closest("[data-hppre]"); if(pr){ S.bays=PRE[pr.getAttribute("data-hppre")].split(""); upd(); say("Layout: "+bayText()+". The price stays "+gbp(total())); return }
    var bay=e.target.closest(".hpplan .bay"); if(bay) setBay(bay);
  });
  function setBay(bay){ var i=+bay.getAttribute("data-i"); if(!i) return; S.bays[i]=S.brush; upd(); say("Bay "+i+": "+BAY[S.brush]+". Every layout is included: "+gbp(total())) }
  root.addEventListener("keydown",function(e){ var bay=e.target.closest&&e.target.closest(".hpplan .bay"); if(bay&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); setBay(bay) } });
  /* follow the tab that's open (v3-cfg.js switches the panels) */
  var tabs=$$(".btabs [role=tab]",root);
  tabs.forEach(function(t,i){ t.addEventListener("click",function(){ S.tab=i; upd() }); t.addEventListener("keydown",function(){ setTimeout(function(){ var j=tabs.findIndex(function(x){return x.getAttribute("aria-selected")==="true"}); if(j>=0&&j!==S.tab){ S.tab=j; upd() } },0) }) });
  function go(i){ tabs[i].click(); var sec=document.getElementById("design"); var J=window.__v3jump; if(sec){ var tgt=J&&J.land?J.land(sec):sec; var y=tgt.getBoundingClientRect().top+scrollY-((document.querySelector(".site-h")||{}).offsetHeight||0)-8; scrollTo({top:Math.max(0,y),behavior:"smooth"}) } }
  $$("[data-hpgo]").forEach(function(b){ b.addEventListener("click",function(e){ e.preventDefault(); go(+b.getAttribute("data-hpgo")-1) }) });
  /* deep link: ?roof=thatch&cushion=navy&piping=ivory&blind=beige&tab=7 */
  var qs=new URLSearchParams(location.search);
  ["roof","cushion","piping","blind","heater","cab","bbq","found"].forEach(function(k){ var v=qs.get(k); if(v&&document.querySelector("[data-hp="+k+"][data-v=\""+v+"\"]")) S[k]=v });
  if(+qs.get("hq")) S.hq=Math.max(1,Math.min(4,+qs.get("hq")));
  window.__hpcfg={state:S,total:total,lines:lines,spec:spec,upd:upd,prices:PR,base:BASE,go:go};
  upd();
  var t0=+qs.get("tab"); if(t0>=1&&t0<=7){ tabs[t0-1].click() }
})();
