/* Hampton refine layer (v8, direction A). Runs BEFORE hp-cfg.js (both defer), so new [data-hp] controls are live. */
(function(){
"use strict";
var D=document.documentElement.getAttribute("data-dir")||"a";
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var NS="http://www.w3.org/2000/svg";
var PRE={std:"EBHHFFFHHB",open:"EBBBHFHBBB",shel:"EBHFFFFFHB"};
var PRN={std:["Crown’s standard","Balustrades either side of the entrance, half-glazed views, cladding behind the sofa"],
         open:["Open to the view","Balustrade and blinds almost all round, one clad bay for the sofa"],
         shel:["Sheltered","Cladding round the back and sides; half-glazed bays beside the entrance"]};
/* ---------- fine-line oval plan ---------- */
function P(cx,cy,rx,ry,a){ a=a*Math.PI/180; return [cx+rx*Math.cos(a), cy+ry*Math.sin(a)] }
function arc(cx,cy,rx,ry,a0,a1,n){ var d="",k; n=n||16; for(k=0;k<=n;k++){ var p=P(cx,cy,rx,ry,a0+(a1-a0)*k/n); d+=(k?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1) } return d }
function planSVG(o){ /* o:{w,h,rx,ry,big,lay} */
  var cx=o.w/2, cy=o.h/2-(o.big?14:0), rx=o.rx, ry=o.ry, s="", i, lay=o.lay||PRE.std;
  s+='<svg class="'+(o.big?"rfplan hpplan":"rfmini")+'" viewBox="0 0 '+o.w+' '+o.h+'" role="'+(o.big?"group":"img")+'" aria-label="'+(o.big?"Plan of the Hampton: tap a bay to apply the chosen panel":"Layout thumbnail")+'">';
  if(o.big) s+='<path class="roofl" d="'+arc(cx,cy,rx+26,ry+22,0,360,90)+'"/>';
  for(i=0;i<10;i++){
    var a0=90+36*i-18+1.2, a1=90+36*i+18-1.2, t=lay[i];
    var g='<g class="bay" data-i="'+i+'" data-t="'+t+'"'+(o.big&&i?' tabindex="0" role="button"':'')+'>'+(o.big?'<title></title>':'');
    if(o.big) g+='<path class="hit" d="'+arc(cx,cy,rx,ry,a0,a1)+'"/>';
    if(i===0){ g+='<path class="ent" d="'+arc(cx,cy,rx,ry,a0+6,a1-6,6)+'"/>' }
    else {
      /* F: solid double wall */
      g+='<g class="sF"><path d="'+arc(cx,cy,rx+3,ry+3,a0,a1)+'"/><path d="'+arc(cx,cy,rx-3,ry-3,a0,a1)+'"/></g>';
      /* B: rail + balusters */
      var tk=""; if(o.big){ for(var k=1;k<10;k++){ var aa=a0+(a1-a0)*k/10, p1=P(cx,cy,rx+3,ry+3,aa), p2=P(cx,cy,rx-4,ry-4,aa); tk+='M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1) } }
      else { for(var k2=1;k2<5;k2++){ var ab=a0+(a1-a0)*k2/5, q1=P(cx,cy,rx+2,ry+2,ab), q2=P(cx,cy,rx-2.5,ry-2.5,ab); tk+='M'+q1[0].toFixed(1)+' '+q1[1].toFixed(1)+'L'+q2[0].toFixed(1)+' '+q2[1].toFixed(1) } }
      g+='<g class="sB"><path d="'+arc(cx,cy,rx+3,ry+3,a0,a1)+'"/><path class="tk" d="'+tk+'"/></g>';
      /* H: solid lower clad + parallel glass line */
      g+='<g class="sH"><path d="'+arc(cx,cy,rx-2,ry-2,a0,a1)+'"/><path class="gl" d="'+arc(cx,cy,rx+4,ry+4,a0,a1)+'"/></g>';
      if(o.big){ var pn=P(cx,cy,rx+44,ry+36,90+36*i); g+='<text class="bn" x="'+pn[0].toFixed(1)+'" y="'+(pn[1]+4).toFixed(1)+'">'+i+'</text>' }
    }
    s+=g+'</g>';
    var pp=P(cx,cy,rx,ry,90+36*i+18); s+='<circle class="post" cx="'+pp[0].toFixed(1)+'" cy="'+pp[1].toFixed(1)+'" r="'+(o.big?3:1.6)+'"/>';
  }
  if(o.big){
    s+='<ellipse class="tb" cx="'+(cx-rx*0.33)+'" cy="'+cy+'" rx="'+rx*0.27+'" ry="'+ry*0.33+'"/><text class="tl" x="'+(cx-rx*0.33)+'" y="'+(cy+4)+'">Dining table</text>';
    s+='<ellipse class="tb" cx="'+(cx+rx*0.36)+'" cy="'+cy+'" rx="'+rx*0.17+'" ry="'+ry*0.24+'"/><text class="tl" x="'+(cx+rx*0.36)+'" y="'+(cy+4)+'">Coffee table</text>';
    var e=P(cx,cy,rx,ry,90); s+='<text class="entl" x="'+e[0]+'" y="'+(e[1]+30)+'">Entrance</text>';
    var yb=o.h-14; s+='<path class="dimln" d="M'+(cx-rx)+' '+(yb-6)+'v12M'+(cx+rx)+' '+(yb-6)+'v12M'+(cx-rx)+' '+yb+'H'+(cx+rx)+'"/><text class="dim" x="'+cx+'" y="'+(yb-6)+'">5.9 m × 4.2 m base · 6.3 m × 4.65 m roof</text>';
  }
  return s+'</svg>' }
function sym(t){ /* legend symbol, matches the plan line styles */
  var m={F:'<path d="M2 9H46M2 15H46"/>',B:'<path d="M2 9H46"/><path class="tk" d="M7 9V16M13 9V16M19 9V16M25 9V16M31 9V16M37 9V16M43 9V16"/>',H:'<path d="M2 15H46"/><path class="gl" d="M2 8H46"/>'};
  return '<svg class="rfsym s'+t+'" viewBox="0 0 48 22" aria-hidden="true">'+m[t]+'</svg>' }
var PANEL={B:["Balustrade & blind","Open rail with a roll-down marine-grade blind","../../assets/img/hampton/opt-balustrade.jpg"],
           F:["Full clad","Solid redwood cladding: shelter and privacy","../../assets/img/hampton/opt-fullclad.jpg"],
           H:["Half clad, half plexiglass","Clad to sofa height, clear above for the view","../../assets/img/hampton/opt-halfclad.jpg"]};
function legendHTML(){ return '<div class="rfleg" role="radiogroup" aria-label="Panel type">'+["B","F","H"].map(function(t){ var p=PANEL[t];
  return '<button type="button" role="radio" aria-checked="false" data-hp="brush" data-v="'+t+'"><img src="'+p[2]+'" alt="">'+'<span class="tx"><b>'+p[0]+'</b><small>'+p[1]+'</small></span>'+sym(t)+'</button>' }).join("")+'</div>' }
function presetsHTML(big){ return '<div class="rfpre'+(big?' big':'')+'">'+["std","open","shel"].map(function(k){
  return '<button type="button" data-hppre="'+k+'" data-pk="'+k+'">'+planSVG({w:big?220:150,h:big?140:96,rx:big?88:60,ry:big?54:36,lay:PRE[k]})+'<span><b>'+PRN[k][0]+'</b>'+(big?'<small>'+PRN[k][1]+'</small>':'')+'</span></button>' }).join("")+'</div>' }
function elevHTML(){ var s='<div class="rfelev" aria-label="View from the garden, bays 1 to 9"><div class="ek">View from the garden · bays 1–9 unrolled</div><div class="er">';
  for(var i=1;i<10;i++) s+='<button type="button" class="eb" data-ei="'+i+'" aria-label="Bay '+i+'"><svg viewBox="0 0 60 80" preserveAspectRatio="none" aria-hidden="true">'+
    '<g class="eF"><rect x="2" y="8" width="56" height="70"/><path d="M9 8V78M16 8V78M23 8V78M30 8V78M37 8V78M44 8V78M51 8V78"/></g>'+
    '<g class="eB"><path d="M2 46H58M2 50H58"/><path d="M8 50V78M14 50V78M20 50V78M26 50V78M32 50V78M38 50V78M44 50V78M50 50V78M56 50V78"/><rect class="bl" x="3" y="8" width="54" height="7"/></g>'+
    '<g class="eH"><rect x="2" y="48" width="56" height="30"/><path d="M9 48V78M16 48V78M23 48V78M30 48V78M37 48V78M44 48V78M51 48V78"/><rect class="gls" x="3" y="9" width="54" height="38"/><path class="gli" d="M12 40L26 14M22 42L36 16"/></g>'+
    '<path class="beam" d="M0 4H60"/></svg><span>'+i+'</span></button>';
  return s+'</div></div>' }
/* ---------- build ---------- */
function build(){
  var w=$(".hpplanw"); if(w) w.innerHTML=planSVG({w:640,h:430,rx:240,ry:150,big:true})+(D==="b"?elevHTML():"");
  var bp2=$("#bp2");
  if(bp2){
    var leg=$(".hpleg",bp2), pre=$(".hppre",bp2), good=$(".hpgood",bp2), klab=$(".klab",bp2), cnt=$(".hpcount",bp2);
    if(klab) klab.outerHTML='<p class="rfins">'+(D==="c"?"Start with a layout. You can fine-tune any bay afterwards.":"Pick a panel, then tap the bays on the plan.")+'</p>';
    if(leg) leg.outerHTML=legendHTML();
    if(pre) pre.outerHTML='<div class="rfprew"><span class="rfk">Quick layouts</span>'+presetsHTML(D==="c")+'</div>';
    if(good) good.outerHTML='<p class="rfok"><i aria-hidden="true">✓</i> Every layout is included in the price.</p>';
    if(D==="c"){ /* presets first, bay-by-bay secondary */
      var pw=$(".rfprew",bp2), lg=$(".rfleg",bp2); bp2.insertBefore(pw,bp2.firstChild.nextSibling);
      var det=document.createElement("details"); det.className="rfcust"; det.innerHTML='<summary>Customise bay by bay</summary>';
      det.appendChild(lg); if(cnt) det.appendChild(cnt); pw.after(det); var ins=$(".rfins",bp2); if(ins) bp2.insertBefore(ins,pw) }
  }
  /* colours: real fabric close-ups (cropped from Crown photos/brochure); ivory has no close-up yet */
  var fab=$(".hpfab");
  if(fab){ var cl='<div class="rffab"><figure class="fc"><div class="fi" data-rf="cushion"></div><figcaption><b data-hpo="cushionn"></b> cushions</figcaption></figure>'+
      '<figure class="fp"><div class="fi pip" data-rf="piping"></div><figcaption><b data-hpo="pipingn"></b> piping</figcaption></figure>'+
      '<figure class="fb"><div class="fi bl" data-rf="blind"></div><figcaption><b data-hpo="blindn"></b> blinds</figcaption></figure></div>'+
      '<p class="rffn" data-rffn></p>';
    fab.insertAdjacentHTML("afterbegin",cl) }
  /* summary: design code + plan thumbnail */
  var sm=$("#bp7 h3"); if(sm){ sm.insertAdjacentHTML("afterend",'<div class="rfcode"><div class="rfthumb" data-rfthumb></div><div><span class="rfk">Your Hampton design code</span><b data-rfcode>HAM-····</b><small>Quote it at a show site or on the phone and we’ll load your design.</small></div></div>') }
  /* colour swatch chips -> circular fabric swatches */
  $$("#bp4 .hpsw button").forEach(function(b){ b.classList.add("rfsw") });
  /* 3 real installs before the configurator (Arthur) */
  var ds=$("#design"); if(ds){ var st=document.createElement("section"); st.className="rfreal"; st.setAttribute("aria-label","Real Hampton installs");
    st.innerHTML='<div class="wrap"><div class="rk">Real Hampton installs</div><ul>'+
      [["../../assets/img/hampton/h03-1400.webp","Beside the house, cedar roof","Location TBC"],["../../assets/img/hampton/h07.webp","Lakeside, on a raised deck","Location TBC"],["../../assets/img/hampton/h13.webp","On the lawn of a country house","Location TBC"]].map(function(x){ return '<li><img src="'+x[0]+'" alt="'+x[1]+'" loading="lazy"><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></li>' }).join("")+'</ul><a class="lnk" href="#installs">All Hampton photos →</a></div>';
    ds.parentNode.insertBefore(st,ds) }
}
var FAB={green:"fab-green",burgundy:"fab-burgundy",beige:"fab-beige",navy:"fab-navy",taupe:"fab-taupe"};
var HEX={green:"#005224",burgundy:"#850f1b",beige:"#eae4cc",ivory:"#dee6ed",navy:"#191f54",taupe:"#7b7e77"};
function code(S){ var s=S.bays.join("")+S.roof[0]+S.cushion.slice(0,2)+S.piping.slice(0,2)+S.blind.slice(0,2)+S.heater+S.hq+S.cab+S.bbq+S.found+S.gravel+S.deck, h=5381;
  for(var i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; var a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789", o=""; for(var j=0;j<4;j++){ o+=a[h%32]; h=Math.floor(h/32) } return "HAM-"+o }
function paint(){
  var H=window.__hpcfg; if(!H) return; var S=H.state;
  $$("[data-rf]").forEach(function(e){ var g=e.getAttribute("data-rf"), c=S[g];
    if(g==="cushion"&&FAB[c]){ e.style.backgroundImage="url(../../assets/img/hampton/"+FAB[c]+".webp)"; e.style.backgroundColor=""; e.classList.remove("weave") }
    else { e.style.backgroundImage=""; e.style.backgroundColor=HEX[c]; e.classList.add("weave") } });
  var fn=$("[data-rffn]"); if(fn) fn.textContent=FAB[S.cushion]?"Close-up of a real Crown cushion in "+S.cushion+" (from Crown photography). Piping and blind shown as swatches. We’ll post fabric samples.":"No close-up photo of "+S.cushion+" yet: shown as a swatch. We’ll post fabric samples.";
  var c=$("[data-rfcode]"); if(c) c.textContent=code(S);
  var t=$("[data-rfthumb]"); if(t) t.innerHTML=planSVG({w:150,h:96,rx:60,ry:36,lay:S.bays.join("")});
  var lay=S.bays.join(""); $$("[data-pk]").forEach(function(b){ b.setAttribute("aria-pressed",PRE[b.getAttribute("data-pk")]===lay) });
  $$(".rfelev .eb").forEach(function(b){ b.setAttribute("data-t",S.bays[+b.getAttribute("data-ei")]) });
}
document.addEventListener("click",function(e){
  var eb=e.target.closest(".rfelev .eb"); if(eb){ var g=$('.hpplan .bay[data-i="'+eb.getAttribute("data-ei")+'"]'); if(g) g.dispatchEvent(new MouseEvent("click",{bubbles:true})) }
  var bay=e.target.closest(".hpplan .bay"); if(bay){ $$(".hpplan .bay.lit").forEach(function(x){x.classList.remove("lit")}); bay.classList.add("lit") }
  setTimeout(paint,0) });
build();
if(D==="c"){ var inf=$("#hero .info"); if(inf){ var c1=document.createElement("div"), c2=document.createElement("div"); c1.className="c1"; c2.className="c2"; [].slice.call(inf.children).forEach(function(ch){ (ch.matches(".kick,h1,.story,.rfsee")?c1:c2).appendChild(ch) }); inf.appendChild(c1); inf.appendChild(c2) } }
window.addEventListener("load",function(){ paint(); setTimeout(paint,300); fit() });
/* Clara must-fixes: plan labels >= 11px on screen whatever the SVG scale; pad content by the sticky bar heights */
function fit(){
  $$(".rfplan").forEach(function(svg){ var vb=svg.viewBox&&svg.viewBox.baseVal; if(!vb||!vb.width) return; var bb=svg.getBoundingClientRect(), k=Math.min(bb.width/vb.width,bb.height/vb.height); if(!k) return;
    $$(".bn,.tl,.entl,.dim",svg).forEach(function(t){ var want=t.classList.contains("tl")?12:11; t.style.fontSize=(Math.max(want,want)/Math.min(k,1.4)).toFixed(2)+"px" }) });
  var bf=$(".hpcfg .bfoot"), st=$(".hp-stk");
  if(bf) document.documentElement.style.setProperty("--rf-bar",Math.round(bf.getBoundingClientRect().height)+"px");
  if(st) document.documentElement.style.setProperty("--rf-stk",Math.round(st.getBoundingClientRect().height)+"px");
}
window.addEventListener("resize",function(){ clearTimeout(fit.t); fit.t=setTimeout(fit,120) });
document.addEventListener("click",function(){ setTimeout(fit,30) });

/* iter-14: read-only "View in 3D" axonometric preview, generated from the SAME bay data as the 2D plan (votes: Clara, Felix, Harriet = 2D editor + 3D preview) */
var N3={B:"balustrade & blind",F:"full clad",H:"half clad, half plexiglass"};
function v3svg(lay,lit){ var W=420,H=262,cx=210,cy=168,rx=178,ry=66,HF=82,s='<svg class="rf3dsvg" viewBox="0 0 '+W+' '+H+'" aria-hidden="true" focusable="false">';
  function band(a0,a1,h0,h1){ var t=[],b=[],k; for(k=0;k<=10;k++){ var p=P(cx,cy,rx,ry,a0+(a1-a0)*k/10); b.push([p[0],p[1]-h0]); t.push([p[0],p[1]-h1]) } return "M"+b.concat(t.reverse()).map(function(q){return q[0].toFixed(1)+" "+q[1].toFixed(1)}).join("L")+"Z" }
  function ring(a0,a1,dy){ var d="",k; for(k=0;k<=10;k++){ var p=P(cx,cy,rx,ry,a0+(a1-a0)*k/10); d+=(k?"L":"M")+p[0].toFixed(1)+" "+(p[1]-dy).toFixed(1) } return d }
  s+='<ellipse class="f3" cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"/><path class="r3" d="'+ring(0,360,HF+12).replace(/^M/,"M")+'" transform="translate(0,0)"/>';
  var ord=[0,1,2,3,4,5,6,7,8,9].sort(function(a,b){ return Math.sin((90+36*a)*Math.PI/180)-Math.sin((90+36*b)*Math.PI/180) });
  ord.forEach(function(i){ var a0=90+36*i-18,a1=90+36*i+18,t=lay[i],m=90+36*i,front=Math.sin(m*Math.PI/180)>0, g='<g class="b3'+(i===lit?' on':'')+'" data-t="'+t+'">';
    if(t==="F") g+='<path class="cl" d="'+band(a0,a1,0,HF)+'"/>';
    if(t==="H") g+='<path class="cl" d="'+band(a0,a1,0,36)+'"/><path class="gl3" d="'+band(a0,a1,36,HF)+'"/>';
    if(t==="B"){ var bl=""; for(var j=1;j<8;j++){ var q=P(cx,cy,rx,ry,a0+(a1-a0)*j/8); bl+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1)+"v-30" } g+='<path class="bl3" d="'+band(a0,a1,HF-7,HF)+'"/><path class="ln3" d="'+ring(a0,a1,30)+bl+'"/>' }
    g+='<path class="ln3" d="'+ring(a0,a1,HF)+'"/>'; if(t!=="E") g+='<path class="hl3" d="'+band(a0,a1,0,HF)+'"/>';
    var pp=P(cx,cy,rx,ry,a1); g+='<path class="po3" d="M'+pp[0].toFixed(1)+' '+pp[1].toFixed(1)+'v-'+HF+'"/>';
    if(i){ var pn=P(cx,cy,rx+16,ry+14,m); g+='<text class="t3" x="'+pn[0].toFixed(1)+'" y="'+(front?pn[1]+12:pn[1]-HF-6).toFixed(1)+'">'+i+'</text>' }
    s+=g+'</g>' });
  var e=P(cx,cy,rx,ry,90); s+='<text class="t3" x="'+e[0]+'" y="'+(e[1]+20)+'">ENTRANCE</text>';
  return s+'</svg>' }
function v3text(lay){ var grp={}; for(var i=1;i<10;i++){ (grp[lay[i]]=grp[lay[i]]||[]).push(i) }
  return "Entrance at the front (bay 0). "+["B","F","H"].filter(function(t){return grp[t]}).map(function(t){ var b=grp[t]; return (b.length>1?"Bays ":"Bay ")+b.join(", ").replace(/, (\d+)$/," and $1")+": "+N3[t] }).join(". ")+"." }
var v3lit=-1;
function v3paint(){ var H=window.__hpcfg; if(!H) return; var lay=H.state.bays.join(""), w=$(".rf3d .rf3dw"), tx=$(".rf3d .rf3dt"); if(!w) return;
  w.innerHTML=v3svg(lay,v3lit); tx.textContent=v3text(lay);
  $$(".rf3d .t3").forEach(function(t){ var sv=t.ownerSVGElement, bb=sv.getBoundingClientRect(), k=Math.min(bb.width/420,bb.height/262)||1; t.style.fontSize=(11/Math.min(k,1.4)).toFixed(2)+"px" }) }
(function(){ var bp2=$("#bp2"); if(!bp2&&!$(".hpplanw")) return; var d=document.createElement("details"); d.className="rf3d"; d.open=true;
  d.innerHTML='<summary><span class="rf3dp"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 3 7v10l9 5 9-5V7z M3 7l9 5 9-5 M12 12v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>View in 3D</span><small>Updates as you design</small></summary><div class="rf3dbody"><div class="rf3dw" role="img" aria-label="3D preview of your Hampton (read-only)"></div><div><p class="rf3dt" aria-live="polite"></p><p class="rf3dn">Preview only: edit the bays on the plan.</p></div></div>';
  var mob=window.matchMedia("(max-width:999px)").matches, st=$(".hpplanw"); if(st&&!mob) st.appendChild(d); else { d.open=false; (bp2||st).appendChild(d) }
  d.addEventListener("toggle",v3paint) })();
document.addEventListener("click",function(e){ var bay=e.target.closest(".hpplan .bay"); if(bay) v3lit=+bay.getAttribute("data-i"); if(e.target.closest("[data-hppre]")) v3lit=-1; setTimeout(v3paint,10) });
document.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" ") setTimeout(v3paint,10) });
window.addEventListener("load",function(){ setTimeout(v3paint,320) }); window.addEventListener("resize",function(){ clearTimeout(v3paint.t); v3paint.t=setTimeout(v3paint,150) });

})();
