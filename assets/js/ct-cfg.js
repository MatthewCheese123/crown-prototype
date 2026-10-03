/* proto-awesomeo v3: Contemporary size & design configurator (Concept B).
   Prices: the live Contemporary price guide JSON already on the page (1 Oct 2026). Overall height 2.5m as drawn on the live 5m plan.
   The outline is to scale for width, depth and height only: door and window positions are not drawn (layout per size: TBC). */
(function(){
  "use strict";
  var root=document.querySelector("[data-ctcfg]"); if(!root) return;
  var P=JSON.parse(root.querySelector("[data-ct-prices]").textContent);
  var INT={melamine:"White melamine",maple:"Acoustic panelling: maple veneer",teak:"Acoustic panelling: teak veneer",whitewash:"White wash redwood"};
  var S={w:"5",d:"3",int:"melamine",view:"front"}; /* views: front, plan, photo */
  var $=function(s){return root.querySelector(s)}, $$=function(s){return [].slice.call(root.querySelectorAll(s))};
  var NS="http://www.w3.org/2000/svg", svg=$("#ct-svg");
  function gbp(n){return "£"+Math.round(n).toLocaleString("en-GB")}
  function fmt(n){return Math.round(n).toLocaleString("en-GB")}
  function el(n,a,p){var e=document.createElementNS(NS,n); for(var k in a) e.setAttribute(k,a[k]); (p||svg).appendChild(e); return e}
  function tx(x,y,s,a){a=a||{}; a.x=x; a.y=y; var e=el("text",a); e.textContent=s; return e}
  function dimH(x1,x2,y,l,yr){ el("line",{x1:x1,y1:yr,x2:x1,y2:y+6,class:"ext"}); el("line",{x1:x2,y1:yr,x2:x2,y2:y+6,class:"ext"}); el("line",{x1:x1,y1:y,x2:x2,y2:y,class:"dim"}); tx((x1+x2)/2,y+18,l,{class:"dl","text-anchor":"middle"}) }
  function dimV(x,y1,y2,l,xr){ el("line",{x1:xr,y1:y1,x2:x-6,y2:y1,class:"ext"}); el("line",{x1:xr,y1:y2,x2:x-6,y2:y2,class:"ext"}); el("line",{x1:x,y1:y1,x2:x,y2:y2,class:"dim"}); var cy=(y1+y2)/2; tx(x-9,cy,l,{class:"dl","text-anchor":"middle",transform:"rotate(-90 "+(x-9)+" "+cy+")"}) }
  function figure(x,g,s){ var h=1750*s,u=h/7.6,grp=el("g",{class:"fig"}); el("circle",{cx:x,cy:g-h+u*.55,r:u*.55},grp);
    el("path",{d:"M"+(x-u*.95)+","+(g-h+u*1.35)+" h"+(u*1.9)+" l"+(u*.15)+","+(u*3)+" h-"+(u*.5)+" l-"+(u*.1)+","+(u*3.1)+" h-"+(u*.55)+" l-"+(u*.05)+",-"+(u*2.3)+" l-"+(u*.05)+","+(u*2.3)+" h-"+(u*.55)+" l-"+(u*.1)+",-"+(u*3.1)+" h-"+(u*.5)+" Z"},grp);
    tx(x,g+14,"1.75 m figure",{class:"fl","text-anchor":"middle"}) }
  /* v6: drawn in the panel's own pixel space (1 unit = 1 CSS px), then the viewBox is tightened to the drawing's
     content (getBBox + a small pad) and scaled with preserveAspectRatio meet, so it fills the panel at every size
     and the labels stay a constant, legible size. Redrawn when the panel resizes. */
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
    var W=+S.w*1000, Dp=+S.d*1000, cw=B.w, ch=B.h, nar=cw<560;
    var L=layout(W);
    if(S.view==="front"){
      var note=S.w==="5"?["Standard doors and windows, included","layout as the live 5m drawing"]:["Standard doors and windows, included","same pattern as the live 5m drawing; exact positions TBC"];
      if(!nar) note=[note.join(" · ")];
      var lh=nar?14:14, mL=nar?44:50, mT=12+note.length*lh, mB=52, FG=nar?450:800;
      var mR=nar?42:48, s=Math.min((cw-mL-mR)/(W+FG),(ch-mT-mB)/2500);
      var x0=(cw-(mL+(W+FG)*s+mR))/2+mL, G=(ch-(mT+2500*s+mB))/2+mT+2500*s, X=function(m){return x0+m*s}, Y=function(m){return G-m*s};
      var fx=X(W+FG);
      el("line",{x1:X(0)-30,y1:G,x2:fx+44,y2:G,class:"gl"});
      el("rect",{x:X(0),y:Y(2500),width:W*s,height:2500*s,class:"wall"});
      for(var b=150;b<W;b+=150) el("line",{x1:X(b),y1:Y(2350),x2:X(b),y2:Y(0),class:"brd"});
      el("rect",{x:X(-60),y:Y(2500),width:(W+120)*s,height:150*s,class:"roof"});
      /* v4: window heads line up with the 2,100 mm door head; windows sit on a 300 mm sill above the floor (1,800 mm glass) */
      L.forEach(function(o){ var top=2100, sill=o.t==="door"?0:300, h=top-sill, x=X(o.x), y=Y(top), w=o.w*s, hh=h*s, f=45*s;
        el("rect",{x:x,y:y,width:w,height:hh,class:"frm"});
        if(o.t==="door"){ el("rect",{x:x+f,y:y+f,width:w/2-f*1.5,height:hh-f*2,class:"gls"}); el("rect",{x:x+w/2+f/2,y:y+f,width:w/2-f*1.5,height:hh-f*2,class:"gls"});
          el("line",{x1:x+w/2-f*1.6,y1:y+hh*.5,x2:x+w/2-f*1.6,y2:y+hh*.56,class:"hdl"}); el("line",{x1:x+w/2+f*1.6,y1:y+hh*.5,x2:x+w/2+f*1.6,y2:y+hh*.56,class:"hdl"}) }
        else if(o.t==="vent"){ el("rect",{x:x+f,y:y+f,width:w-f*2,height:hh*.38-f,class:"gls"}); el("rect",{x:x+f,y:y+hh*.38+f/2,width:w-f*2,height:hh*.62-f*1.5,class:"gls"}) }
        else el("rect",{x:x+f,y:y+f,width:w-f*2,height:hh-f*2,class:"gls"});
      });
      note.forEach(function(t,i){ tx(X(W/2),Y(2500)-10-(note.length-1-i)*lh,t,{class:"fl","text-anchor":"middle"}) });
      dimH(X(0),X(W),G+28,fmt(W)+" mm",G+4); dimV(x0-30,Y(0),Y(2500),"2,500 mm",x0-4);
      figure(fx,G,s);
    } else {
      var mL2=50, mB2=64, s2=Math.min((cw-mL2-10)/W,(ch-10-mB2)/Dp), x1=(cw-(mL2+W*s2+10))/2+mL2, y1=(ch-(10+Dp*s2+mB2))/2+10, t=150;
      el("rect",{x:x1,y:y1,width:W*s2,height:Dp*s2,class:"floor"}); el("rect",{x:x1+t*s2,y:y1+t*s2,width:(W-2*t)*s2,height:(Dp-2*t)*s2,class:"inner"});
      L.forEach(function(o){ el("rect",{x:x1+o.x*s2,y:y1+Dp*s2-t*s2,width:o.w*s2,height:t*s2,class:o.t==="door"?"pdoor":"pwin"}) });
      tx(x1+W*s2/2,y1+Dp*s2/2+5,(+S.w)*(+S.d)+" m² floor area",{class:"ct","text-anchor":"middle"});
      dimH(x1,x1+W*s2,y1+Dp*s2+26,fmt(W)+" mm",y1+Dp*s2+4); dimV(x1-30,y1,y1+Dp*s2,fmt(Dp)+" mm",x1-4);
      tx(x1+W*s2/2,y1+Dp*s2+60,"Front",{class:"fl","text-anchor":"middle"});
    }
    fit(4);
  }
  /* Standard doors and windows (included, not an option). The live 5m drawing: from the left 700 mm, fixed window 600, 300,
     fixed window 600, 300, French doors 1,200, 300, half-open window 600, 400 mm. Other widths use the same pattern with
     as many 600 mm fixed windows as fit (positions for those sizes: TBC). Windows 1,800 mm high on a 300 mm sill (heads level with the doors), doors 2,100 mm. */
  function layout(W){ var o=[], r=W-400-600; o.push({t:"vent",x:r,w:600}); var dx=r-300-1200; o.push({t:"door",x:dx,w:1200});
    var n=Math.max(0,Math.floor((dx-300-400)/900)); var left=W===5000?700:Math.max(300,(dx-300-(n*600+(n-1)*300))/2);
    for(var i=0;i<n;i++) o.push({t:"win",x:(W===5000?700:left)+i*900,w:600}); return o }
  function upd(){
    $$("[data-ctw]").forEach(function(c){var on=c.getAttribute("data-ctw")===S.w; c.setAttribute("aria-checked",on); c.tabIndex=on?0:-1});
    $$("[data-ctd]").forEach(function(c){var on=c.getAttribute("data-ctd")===S.d; c.setAttribute("aria-checked",on); c.tabIndex=on?0:-1});
    $$("[data-ctint]").forEach(function(c){var on=c.getAttribute("data-ctint")===S.int; c.setAttribute("aria-checked",on); c.tabIndex=on?0:-1});
    var p=P[S.w+"x"+S.d], area=+(+S.w*+S.d).toFixed(2), sz=S.w+"m × "+S.d+"m";
    var put=function(k,v){ $$("[data-cp="+k+"]").forEach(function(e){e.textContent=v}) };
    put("size",sz); put("area",area+" m² floor area"); put("sizev",sz+" · "+area+" m²"); put("intv",INT[S.int]);
    put("price",p?gbp(p):"Price TBC");
    put("pnote",p?sz+" · from the live price guide (1 Oct 2026), including installation and the standard specification":"Not in the live price guide: ask our team");
    put("viewt",({front:"Front outline",plan:"Plan",draw:"Technical drawing (5m wide)",photo:"Photo"})[S.view]+" · "+sz);
    var kk=$(".stagebar .kick"); if(kk) kk.textContent=({front:"Outline drawing · to scale",plan:"Outline drawing · to scale",draw:"Crown's technical drawing",photo:"Photo"})[S.view];
    var isSvg=S.view==="front"||S.view==="plan"; $(".svgw").hidden=!isSvg; var dv=$("[data-ctview=draw]"); if(dv) dv.hidden=S.view!=="draw"; /* v8.3: Drawing tab removed (Matthew, 03:31) */ $("[data-ctview=photo]").hidden=S.view!=="photo";
    if(isSvg){ draw(); svg.setAttribute("aria-label","Contemporary "+sz+", "+(S.view==="front"?"front outline, 2.5 m overall height":"plan, "+area+" m²")) }
    var t=document.getElementById("ctsend-spec"); if(t) t.value=spec();
  }
  function spec(){ var p=P[S.w+"x"+S.d]; return "Contemporary · "+S.w+"m × "+S.d+"m · interior: "+INT[S.int]+" · "+(p?"from "+gbp(p)+" (live price guide)":"price TBC") }
  function radios(attr,key){ var bs=$$("[data-"+attr+"]");
    bs.forEach(function(b,i){ b.addEventListener("click",function(){ S[key]=b.getAttribute("data-"+attr); upd() });
      b.addEventListener("keydown",function(e){ var n=null; if(e.key==="ArrowRight"||e.key==="ArrowDown") n=bs[(i+1)%bs.length]; if(e.key==="ArrowLeft"||e.key==="ArrowUp") n=bs[(i-1+bs.length)%bs.length]; if(n){e.preventDefault(); n.click(); n.focus()} }) }) }
  radios("ctw","w"); radios("ctd","d"); radios("ctint","int");
  var vt=$$("[data-v]"); vt.forEach(function(b,i){ b.addEventListener("click",function(){ S.view=b.getAttribute("data-v"); vt.forEach(function(x){var on=x===b; x.setAttribute("aria-selected",on); x.tabIndex=on?0:-1}); upd() });
    b.addEventListener("keydown",function(e){ var n=e.key==="ArrowRight"?vt[(i+1)%vt.length]:e.key==="ArrowLeft"?vt[(i-1+vt.length)%vt.length]:null; if(n){e.preventDefault(); n.focus(); n.click()} }) });
  root.querySelectorAll("[data-send-open]").forEach(function(b){ b.addEventListener("click",function(){ var t=document.getElementById("ctsend-spec"); if(t) t.value=spec() }) });
  /* v6: redraw to the panel's new size (window resize, the right-hand panel changing height) */
  if(window.ResizeObserver){ new ResizeObserver(function(){ var b=box(), k=b.w+"x"+b.h; if(k===lastSz) return; lastSz=k; if(!$(".svgw").hidden) draw() }).observe($(".svgw")) }
  window.__ctcfg={state:S,spec:spec,prices:P,draw:draw};
  // "Price your size" style deep link: ?w=7.5&d=4
  var qs=new URLSearchParams(location.search); if(P[(qs.get("w")||S.w)+"x"+(qs.get("d")||S.d)]){ S.w=qs.get("w")||S.w; S.d=qs.get("d")||S.d }
  upd();
})();
