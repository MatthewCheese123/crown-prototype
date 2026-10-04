/* proto-awesomeo v5: Signature collection (Sandringham, Clarence, Buckingham) size / package / doors / interior picker.
   Prices: the live Professional and Premium price guides (crownpavilions.com, 2 Oct 2026), embedded per page.
   Tailored items (pitched roof, skylights, a non-standard door style) are not priced here: "priced by your designer". */
(function(){
  "use strict";
  var root=document.querySelector("[data-sgcfg]"); if(!root) return;
  var D=JSON.parse(root.querySelector("script[data-sg]").textContent);
  var $=function(s,c){return (c||root).querySelector(s)}, $$=function(s,c){return [].slice.call((c||root).querySelectorAll(s))};
  var gbp=function(n){return "£"+Math.round(n).toLocaleString("en-GB")};
  var PK={professional:"Professional",premium:"Premium"};
  var DOOR={french:"French doors",sliding:"Sliding doors",bifold:"Bi-fold doors"};
  var INT={whitewash:"White wash redwood",plasterboard:"Painted plasterboard",maple:"Acoustic panelling: maple veneer",teak:"Acoustic panelling: teak veneer"};
  var STDINT={professional:"whitewash",premium:"plasterboard"};
  var S={w:D.w0,d:D.d0,pkg:"professional",door:null,roof:"flat",sky:false,int:"whitewash",view:"plan"};
  var svg=$("#sg-svg"), NS="http://www.w3.org/2000/svg", live=$("[data-sg=live]");
  function key(){return S.w+"x"+S.d}
  function price(p){ return D.prices[p||S.pkg][key()] }
  function stdDoor(w){ w=+w; for(var i=0;i<D.doors.length;i++){ var r=D.doors[i]; if(w>=r.min-1e-9 && w<=r.max+1e-9) return r } return D.doors[D.doors.length-1] }
  function door(){ var s=stdDoor(S.w); return S.door||s.t }
  function tailored(){ var t=[], s=stdDoor(S.w); if(S.door && S.door!==s.t) t.push(DOOR[S.door].toLowerCase()); if(S.roof==="pitched") t.push("pitched cedar roof"); if(S.sky) t.push("skylights"); return t }
  function stdLabel(s){ return s.t==="french"?"French doors 2m × 2m":"Bi-folds ×"+s.n }
  function say(m){ if(live){ live.textContent=""; setTimeout(function(){ live.textContent=m },30) } }
  /* ---------- plan drawing, to scale ----------
     v6: drawn in the panel's own pixel space (1 unit = 1 CSS px) so it fills the panel at every size; the viewBox is then
     tightened to the content (getBBox + pad, preserveAspectRatio meet). The 1 m scale bar keeps sizes comparable. */
  function el(n,a,txt){ var e=document.createElementNS(NS,n); for(var k in a) e.setAttribute(k,a[k]); if(txt!=null) e.textContent=txt; svg.appendChild(e); return e }
  function lines(x,y,arr,a,lh){ var t=el("text",Object.assign({x:x,y:y},a)); arr.forEach(function(s,i){ var sp=document.createElementNS(NS,"tspan"); sp.setAttribute("x",x); if(i) sp.setAttribute("dy",lh); sp.textContent=s; t.appendChild(sp) }); return t }
  function box(){ return {w:svg.clientWidth,h:svg.clientHeight} }
  /* the drawing panel can be momentarily hidden while a view tab is switched (site.js hides tab panels, v3-cfg.js re-shows
     them): if the SVG has no size yet, draw on the next frames instead of at a guessed size */
  var lastSz="", waitN=0;
  function sized(fn){ var b=box(); if(b.w>0&&b.h>0){ waitN=0; lastSz=b.w+"x"+b.h; return b } if(waitN<30){ waitN++; requestAnimationFrame(fn) } return null }
  function fit(pad){ var b; try{ b=svg.getBBox() }catch(e){ return } if(!b||!b.width) return;
    svg.setAttribute("viewBox",[b.x-pad,b.y-pad,b.width+2*pad,b.height+2*pad].map(function(v){return Math.round(v*10)/10}).join(" ")); svg.setAttribute("preserveAspectRatio","xMidYMid meet") }
  function draw(){
    var B=sized(draw); if(!B) return;
    while(svg.lastChild) svg.removeChild(svg.lastChild);
    var cw=B.w, ch=B.h, nar=cw<560, lh=nar?13:15;
    var W=+S.w*1000, Dp=+S.d*1000, t=150;
    var st=stdDoor(S.w), dt=door();
    // door label: one line on desktop, two on a narrow panel
    var dl1=(dt===st.t?stdLabel(st)+" · standard":DOOR[dt]+" · tailored"), dl2=[]; if(dt!=="french") dl2.push("widths illustrative"); if(D.win) dl2.push("plus tall window");
    var dlab=nar?[dl1].concat(dl2.length?[dl2.join(" · ")]:[]):[dl1+(dt!=="french"?" (widths illustrative)":"")+(D.win?" · plus tall window":"")];
    var dly=dt==="bifold"?30:21, dlb=dly+(dlab.length-1)*lh, mT=S.sky?36:20, mL=48, mR=12;
    // measure the top-row labels so the scale bar can share that row when the plan is wide enough
    function tw(str,cls){ var e=el("text",{x:0,y:0,class:cls},str), w=e.getComputedTextLength(); svg.removeChild(e); return w }
    var roofT=S.roof==="pitched"?"Pitched cedar roof (outline illustrative)":"Flat roof · single-piece EPDM", skyT="Skylights · positions by your designer";
    var rlw=S.sky?Math.max(tw(roofT,"fl"),tw(skyT,"fl")):tw(roofT,"fl"), vw=tw("Plan · to scale","vl");
    var mB=dlb+40, s=Math.min((cw-mL-mR)/W,(ch-mT-mB)/Dp), topScale=!nar && (W*s-rlw-24 > vw+40+1000*s+20);
    if(!topScale){ mB=dlb+60; s=Math.min((cw-mL-mR)/W,(ch-mT-mB)/Dp) }
    var x0=(cw-(mL+W*s+mR))/2+mL, y0=(ch-(mT+Dp*s+mB))/2+mT, fy=y0+Dp*s;
    var X=function(m){return x0+m*s};
    el("rect",{x:x0,y:y0,width:W*s,height:Dp*s,class:"wall"});
    el("rect",{x:X(t),y:y0+t*s,width:(W-2*t)*s,height:(Dp-2*t)*s,class:"inner"});
    // roof overlay
    if(S.roof==="pitched"){ var hx=Math.min(W,Dp)/2, a=X(hx), b=X(W-hx), m=y0+Dp*s/2;
      el("path",{d:"M"+x0+" "+y0+"L"+a+" "+m+"L"+x0+" "+fy+"M"+X(W)+" "+y0+"L"+b+" "+m+"L"+X(W)+" "+fy+"M"+a+" "+m+"L"+b+" "+m,class:"ridge"}) }
    // skylights (illustrative positions)
    if(S.sky){ var n=W>5000?2:1; for(var i=0;i<n;i++){ var cx=W*(i+1)/(n+1); el("rect",{x:X(cx-400),y:y0+(Dp/2-600)*s,width:800*s,height:1200*s,class:"sky"}) } }
    // standard tall window (Buckingham)
    var wx=0;
    if(D.win){ wx=600; el("rect",{x:X(wx),y:fy-t*s,width:D.win.w*s,height:t*s,class:"pwin"}); }
    // doors on the front wall
    var ow=dt==="french"?2000:(dt==="bifold"?(st.t==="bifold"?st.n:3)*900:Math.max(2400,(st.t==="bifold"?st.n:2)*900));
    var ox=D.win?Math.max(wx+D.win.w+600,(W-ow)/2):(W-ow)/2;
    el("rect",{x:X(ox),y:fy-t*s-1,width:ow*s,height:t*s+2,class:"gap"});
    if(dt==="french"){ var r=ow/2*s;
      el("path",{d:"M"+X(ox)+" "+(fy-t*s)+"l0 "+(-r)+"M"+X(ox+ow)+" "+(fy-t*s)+"l0 "+(-r),class:"leaf"});
      el("path",{d:"M"+X(ox)+" "+(fy-t*s-r)+"A"+r+" "+r+" 0 0 1 "+X(ox+ow/2)+" "+(fy-t*s)+"M"+X(ox+ow)+" "+(fy-t*s-r)+"A"+r+" "+r+" 0 0 0 "+X(ox+ow/2)+" "+(fy-t*s),class:"arc"}) }
    else if(dt==="bifold"){ var k=st.t==="bifold"?st.n:3, pw=ow/k, pts=[]; for(var j=0;j<=k;j++){ pts.push(X(ox+j*pw)+","+(fy+(j%2?10:0))) }
      el("polyline",{points:pts.join(" "),class:"leaf"}); for(var q=1;q<k;q++) el("line",{x1:X(ox+q*pw),y1:fy-t*s,x2:X(ox+q*pw),y2:fy,class:"div"}) }
    else { el("rect",{x:X(ox),y:fy-t*s*0.75,width:ow*s*0.55,height:t*s*0.35,class:"slide"}); el("rect",{x:X(ox+ow*0.45),y:fy-t*s*0.4,width:ow*s*0.55,height:t*s*0.35,class:"slide"});
      el("path",{d:"M"+X(ox+ow*0.2)+" "+(fy+9)+"l26 0m-6 -4l6 4l-6 4",class:"arc"}) }
    // labels and dimensions
    el("text",{x:X(W/2),y:y0+Dp*s/2+(S.roof==="pitched"?-8:6),class:"ct","text-anchor":"middle"},(+S.w*+S.d).toFixed(2).replace(/\.?0+$/,"")+" m² footprint");
    lines(X(ox+ow/2),fy+dly,dlab,{class:"fl","text-anchor":"middle"},lh);
    var dl=fy+dlb+16; el("path",{d:"M"+x0+" "+dl+"H"+X(W)+"M"+x0+" "+(dl-5)+"v10M"+X(W)+" "+(dl-5)+"v10",class:"dim"});
    el("text",{x:X(W/2),y:dl+18,class:"dl","text-anchor":"middle"},(W).toLocaleString("en-GB")+" mm");
    var dx=x0-26; el("path",{d:"M"+dx+" "+y0+"V"+fy+"M"+(dx-5)+" "+y0+"h10M"+(dx-5)+" "+fy+"h10",class:"dim"});
    el("text",{x:dx-9,y:y0+Dp*s/2,class:"dl","text-anchor":"middle",transform:"rotate(-90 "+(dx-9)+" "+(y0+Dp*s/2)+")"},(Dp).toLocaleString("en-GB")+" mm");
    el("text",{x:x0,y:y0-(S.sky?24:9),class:"fl"},roofT);
    if(S.sky) el("text",{x:x0,y:y0-9,class:"fl"},skyT);
    // 1 m scale bar + "Plan · to scale": top right, level with the roof label, when there's room; otherwise its own row below
    var m1=1000*s;
    if(topScale){ var sb=y0-13, bx=X(W)-vw-40-m1;
      el("path",{d:"M"+bx+" "+sb+"h"+m1+"M"+bx+" "+(sb-4)+"v8M"+(bx+m1)+" "+(sb-4)+"v8",class:"dim"}); el("text",{x:bx+m1+6,y:sb+4,class:"fl"},"1 m");
      el("text",{x:X(W),y:y0-9,class:"vl","text-anchor":"end"},"Plan · to scale") }
    else { var sb2=fy+mB-8;
      el("path",{d:"M"+x0+" "+sb2+"h"+m1+"M"+x0+" "+(sb2-5)+"v10M"+(x0+m1)+" "+(sb2-5)+"v10",class:"dim"}); el("text",{x:x0+m1+7,y:sb2+4,class:"fl"},"1 m");
      el("text",{x:Math.max(X(W),x0+m1+44+(nar?100:120)),y:sb2+4,class:"vl","text-anchor":"end"},"Plan · to scale") }
    fit(4);
    svg.setAttribute("aria-label",D.name+" plan, "+S.w+"m × "+S.d+"m, "+(DOOR[dt])+" on the front"+(D.win?" with a tall window":"")+(S.roof==="pitched"?", pitched roof":", flat roof")+(S.sky?", skylights":""));
  }
  /* ---------- price guide table ---------- */
  var pg=document.querySelector("[data-sgpg]");
  function guide(){ if(!pg) return; var tb=$("table",pg), P=D.prices[S.pkg], h="<caption class=sr>"+D.name+" "+PK[S.pkg]+" prices by size</caption><thead><tr><th scope=col>Width →<br>Depth ↓</th>";
    D.widths.forEach(function(w){ h+="<th scope=col>"+w+"m</th>" }); h+="</tr></thead><tbody>";
    D.depths.forEach(function(d){ h+="<tr><th scope=row>"+d+"m</th>"; D.widths.forEach(function(w){ var k=w+"x"+d, v=P[k], on=k===key();
      h+="<td>"+(v?"<button type=button data-pgw=\""+w+"\" data-pgd=\""+d+"\""+(on?" aria-current=true":"")+" aria-label=\""+w+"m × "+d+"m, "+gbp(v)+"\">"+gbp(v).replace("£","£<wbr>")+"</button>":"–")+"</td>" }); h+="</tr>" });
    tb.innerHTML=h+"</tbody>"; $$("[data-pgpkg]",pg).forEach(function(b){ b.setAttribute("aria-pressed",b.getAttribute("data-pgpkg")===S.pkg) });
    $("[data-pgn]",pg).textContent=PK[S.pkg] }
  if(pg){ pg.addEventListener("click",function(e){ var b=e.target.closest("[data-pgw]"); if(b){ S.w=b.getAttribute("data-pgw"); S.d=b.getAttribute("data-pgd"); upd(); say(S.w+"m × "+S.d+"m selected: "+gbp(price())); return }
    var p=e.target.closest("[data-pgpkg]"); if(p){ setPkg(p.getAttribute("data-pgpkg")); upd() } }) }
  function setPkg(p){ if(p===S.pkg) return; if(S.int===STDINT[S.pkg]) S.int=STDINT[p]; if(p==="professional" && S.int==="plasterboard") S.int="whitewash"; S.pkg=p }
  /* ---------- update ---------- */
  function put(k,v){ $$("[data-sgo="+k+"]",document).forEach(function(e){ e.textContent=v }) }
  function radio(attr,val){ $$("[data-"+attr+"]").forEach(function(b){ var on=b.getAttribute("data-"+attr)===String(val); b.setAttribute("aria-checked",on); b.tabIndex=on?0:-1 }) }
  function upd(){
    var st=stdDoor(S.w), dt=door(), p=price(), tl=tailored(), sz=S.w+"m × "+S.d+"m", area=(+S.w*+S.d).toFixed(2).replace(/\.?0+$/,"");
    if(S.door===st.t) S.door=null;
    radio("sgw",S.w); radio("sgd",S.d); radio("sgpkg",S.pkg); radio("sgdoor",dt); radio("sgroof",S.roof); radio("sgint",S.int);
    var sk=$("[data-sgsky]"); if(sk) sk.checked=S.sky;
    $$("[data-sgdoor]").forEach(function(b){ var tg=$("small",b); if(tg) tg.textContent=b.getAttribute("data-sgdoor")===st.t?"standard at "+S.w+"m":(b.hasAttribute("data-tbc")?"confirmed on your quote":"tailored") });
    $$("[data-sgpkgp]").forEach(function(e){ var v=price(e.getAttribute("data-sgpkgp")); e.textContent=v?gbp(v)+" at "+sz:"Price on request" });
    $$("[data-sgint=plasterboard]").forEach(function(b){ b.classList.toggle("pkonly",S.pkg!=="premium") });
    put("size",sz); put("sizev",sz+" · "+area+" m² footprint"); put("pkg",PK[S.pkg]); put("int",INT[S.int]);
    put("std","Standard doors at "+S.w+"m wide: "+stdLabel(st)+(D.win?", plus a fixed tall window 0.8m × 2m":"")+".");
    put("doors",DOOR[dt]+(S.roof==="pitched"?" · pitched roof":" · flat roof")+(S.sky?" · skylights":""));
    put("price",p?gbp(p):"On request");
    put("pnote",PK[S.pkg]+" package · "+sz+" · installation and the standard specification included"+(tl.length?". Tailored: "+tl.join(", ")+", priced by your designer":""));
    put("chip",[sz,PK[S.pkg],DOOR[dt],INT[S.int]].concat(tl.length?["+ "+tl.length+" tailored"]:[]).join(" · "));
    var tg=$("[data-sgo=tailored]"); if(tg) tg.hidden=!tl.length;
    var sv=S.view==="plan"; $(".svgw").hidden=!sv; $("[data-sgview=photo]").hidden=sv;
    put("viewt",(sv?"Plan":"Photo")+" · "+sz);
    var kk=$(".stagebar .kick"); if(kk) kk.textContent=sv?"Plan drawing · to scale":"Photo";
    if(sv) draw();
    var t=document.getElementById("sgsend-spec"); if(t) t.value=spec();
    guide();
  }
  function spec(){ var p=price(), tl=tailored(); return D.name+" · "+S.w+"m × "+S.d+"m · "+PK[S.pkg]+" package · "+DOOR[door()]+" · "+(S.roof==="pitched"?"pitched cedar roof":"flat EPDM roof")+(S.sky?" · skylights":"")+" · interior: "+INT[S.int]+" · "+(p?"from "+gbp(p)+"":"price on request")+(tl.length?" · tailored items priced by your designer":"") }
  /* ---------- inputs ---------- */
  function radios(attr,fn){ var bs=$$("[data-"+attr+"]");
    bs.forEach(function(b,i){ b.addEventListener("click",function(){ fn(b.getAttribute("data-"+attr),b); upd() });
      b.addEventListener("keydown",function(e){ var grp=bs.filter(function(x){return x.parentNode===b.parentNode}), j=grp.indexOf(b), n=null;
        if(e.key==="ArrowRight"||e.key==="ArrowDown") n=grp[(j+1)%grp.length]; if(e.key==="ArrowLeft"||e.key==="ArrowUp") n=grp[(j-1+grp.length)%grp.length];
        if(n){ e.preventDefault(); n.click(); n.focus() } }) }) }
  radios("sgw",function(v){ S.w=v; if(!price()) say("This size is priced by your designer") });
  radios("sgd",function(v){ S.d=v });
  radios("sgpkg",function(v){ setPkg(v); say(PK[v]+" package: "+(price()?gbp(price()):"price on request")) });
  radios("sgdoor",function(v){ S.door=v===stdDoor(S.w).t?null:v });
  radios("sgroof",function(v){ S.roof=v });
  radios("sgint",function(v){ if(v==="plasterboard" && S.pkg!=="premium"){ S.pkg="premium"; say("Painted plasterboard comes with the Premium package, so we've switched you to Premium") } S.int=v });
  var sk=$("[data-sgsky]"); if(sk) sk.addEventListener("change",function(){ S.sky=sk.checked; upd() });
  $$("[data-sgv]").forEach(function(b,i,all){ b.addEventListener("click",function(){ S.view=b.getAttribute("data-sgv"); all.forEach(function(x){ var on=x===b; x.setAttribute("aria-selected",on); x.tabIndex=on?0:-1 }); upd() });
    b.addEventListener("keydown",function(e){ var n=e.key==="ArrowRight"?all[(i+1)%all.length]:e.key==="ArrowLeft"?all[(i-1+all.length)%all.length]:null; if(n){ e.preventDefault(); n.focus(); n.click() } }) });
  root.querySelectorAll("[data-send-open]").forEach(function(b){ b.addEventListener("click",function(){ var t=document.getElementById("sgsend-spec"); if(t) t.value=spec() }) });
  /* "Choose Professional / Premium" buttons elsewhere on the page */
  $$("[data-sgpkg-go]",document).forEach(function(b){ b.addEventListener("click",function(){ setPkg(b.getAttribute("data-sgpkg-go")); upd();
    var tab=document.getElementById("bt2"); if(tab) tab.click(); var sec=document.getElementById("design"); if(sec) sec.scrollIntoView({behavior:"smooth",block:"start"});
    say(PK[S.pkg]+" package selected: "+(price()?gbp(price()):"price on request")) }) });
  /* v6: redraw to the panel's new size (window resize, the right-hand panel changing height between tabs) */
  if(window.ResizeObserver){ new ResizeObserver(function(){ var b=box(), k=b.w+"x"+b.h; if(k===lastSz) return; lastSz=k; if(!$(".svgw").hidden) draw() }).observe($(".svgw")) }
  window.__sgcfg={draw:draw,state:S,data:D,spec:spec,price:price,stdDoor:stdDoor,upd:upd};
  // deep link: ?w=6&d=4&pkg=premium
  var qs=new URLSearchParams(location.search); if(qs.get("w")&&D.prices.professional[qs.get("w")+"x"+(qs.get("d")||S.d)]){ S.w=qs.get("w"); S.d=qs.get("d")||S.d } if(PK[qs.get("pkg")]) setPkg(qs.get("pkg"));
  upd();
})();
/* installs gallery: show all + lightbox */
(function(){
  var g=document.querySelector("[data-sggal]"); if(!g) return;
  var more=g.querySelector("[data-sgmore]"), items=[].slice.call(g.querySelectorAll(".sgi")), lb=document.getElementById("sglb");
  if(more) more.addEventListener("click",function(){ items.forEach(function(i){ i.hidden=false }); more.hidden=true; var f=items[8]&&items[8].querySelector("button"); if(f) f.focus() });
  if(!lb) return;
  var img=lb.querySelector("[data-lbimg]"), cap=lb.querySelector("[data-lbcap]"), cur=0, back=null;
  function vis(){ return items.filter(function(i){return !i.hidden}) }
  function show(i){ var v=vis(); cur=(i+v.length)%v.length; var b=v[cur].querySelector("button"); img.src=b.getAttribute("data-full"); img.alt=b.getAttribute("data-alt"); cap.textContent=b.getAttribute("data-alt")+" · "+(cur+1)+" of "+v.length }
  function open(b){ back=b; show(vis().indexOf(b.parentNode)); lb.hidden=false; document.documentElement.classList.add("sglb-open"); lb.querySelector("[data-lbclose]").focus() }
  function close(){ lb.hidden=true; document.documentElement.classList.remove("sglb-open"); if(back) back.focus() }
  items.forEach(function(i){ i.querySelector("button").addEventListener("click",function(){ open(this) }) });
  lb.querySelector("[data-lbclose]").addEventListener("click",close);
  [].slice.call(lb.querySelectorAll("[data-lbstep]")).forEach(function(b){ b.addEventListener("click",function(){ show(cur+(+b.getAttribute("data-lbstep"))) }) });
  lb.addEventListener("click",function(e){ if(e.target===lb) close() });
  lb.addEventListener("keydown",function(e){ if(e.key==="Escape") close(); if(e.key==="ArrowRight") show(cur+1); if(e.key==="ArrowLeft") show(cur-1);
    if(e.key==="Tab"){ var f=[].slice.call(lb.querySelectorAll("button")), a=f[0], z=f[f.length-1]; if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus() } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus() } } });
})();
