/* Crown Pavilions prototype: 2D design generator (Heritage). Clean SVG line art drawn here, no CAD exports.
   All dimensions in mm. Data (prices, options) is embedded by the build from live-site sources. */
(function(){
  "use strict";
  var root=document.querySelector("[data-hgen]"); if(!root) return;
  var D=JSON.parse(root.querySelector("[data-hgen-data]").textContent);
  var $=function(s,c){return (c||root).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||root).querySelectorAll(s))};
  var NS="http://www.w3.org/2000/svg", svg=document.getElementById("hg-svg");
  var reduce=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S={w:3000,d:3000,roof:"flat",rf:"asphalt-black",dormer:true,mezz:false,veranda:false,clad:"Cloverleaf",prof:"tg",floor:"plywood",view:"front"};
  var A={w:S.w,d:S.d}; // animated values
  var INK="#123627", GOLD="#c9a86b", CREAM="#f6f1e6";
  function fmt(n){return Math.round(n).toLocaleString("en-GB")}
  function gbp(n){return "£"+fmt(n)}
  function m(v){return (v/1000).toFixed(1)}
  function find(list,k){for(var i=0;i<list.length;i++) if(list[i].k===k) return list[i]; return list[0]}
  function key(){return S.roof+"|"+S.w+"|"+S.d}
  function base(roof){return D[roof||S.roof][S.w+"x"+S.d]}
  function layout(w){ // standard front layout per width (planner windoorsFront; matches the live drawings at 3, 4.5 and 6m)
    var n=w<=4000?1:(w<=5500?2:3), it=[], i;
    for(i=0;i<n;i++) it.push({t:"win",w:600,h:1800,b:450});
    it.push({t:"door",w:1200,h:2100,b:150});
    for(i=0;i<n;i++) it.push({t:"win",w:600,h:1800,b:450});
    return it;
  }
  function nWin(w){return layout(w).length-1}
  // Pitched heights from the live Heritage drawings, by overall footprint depth (room + veranda).
  var PH=[[3000,2200,3000],[4000,2250,3250],[5500,2250,3500]];
  function heights(d,roof,ver){
    if(roof==="flat") return {e:2250,r:2500,ok:true,src:"2,500 mm overall"};
    var T=d+(ver?1000:0), i, a, b;
    for(i=0;i<PH.length;i++) if(Math.abs(PH[i][0]-T)<1) return {e:PH[i][1],r:PH[i][2],ok:true,src:fmt(PH[i][2])+" mm overall, as drawn on Crown's live "+(PH[i][0]/1000)+"m-deep Heritage drawing"};
    if(T<PH[0][0]){a=PH[0];b=PH[1]} else if(T>PH[2][0]){a=PH[1];b=PH[2]} else {for(i=0;i<PH.length-1;i++) if(T>PH[i][0]&&T<PH[i+1][0]){a=PH[i];b=PH[i+1]}}
    var f=(T-a[0])/(b[0]-a[0]); return {e:Math.round(a[1]+(b[1]-a[1])*f),r:Math.round((a[2]+(b[2]-a[2])*f)/5)*5,ok:false,src:"pitched height at this depth not on the live drawings: drawn approximately"};
  }
  function opt(kind,sub){var t=D.opt[kind]||{}; var k=(sub?sub+"|":"")+key(); return t.hasOwnProperty(k)?t[k]:null}
  function price(){
    var b=base(), add=0, tbc=[], parts=[];
    if(S.roof==="pitched"&&S.rf==="cedar"){var c=opt("cedar"); if(c===null) tbc.push("cedar shingles"); else {add+=c; parts.push("cedar shingles +"+gbp(c))}}
    if(S.roof==="pitched"&&S.mezz){var z=opt("mezz"); if(z===null) tbc.push("mezzanine"); else {add+=z; parts.push("mezzanine +"+gbp(z))}}
    if(S.veranda){var v=opt("veranda"); if(v===null) tbc.push("veranda"); else {add+=v; parts.push("veranda +"+gbp(v))}}
    if(S.floor!=="plywood"){var f=opt("floor",S.floor); if(f===null) tbc.push(find(D.floor,S.floor).n+" flooring"); else {add+=f; parts.push(find(D.floor,S.floor).n+" flooring +"+gbp(f))}}
    return {base:b,total:b+add,tbc:tbc,parts:parts};
  }
  /* ---------- SVG helpers ---------- */
  function el(n,a,p){var e=document.createElementNS(NS,n); for(var k in a) e.setAttribute(k,a[k]); (p||svg).appendChild(e); return e}
  function tx(x,y,s,a,p){a=a||{}; a.x=x; a.y=y; var e=el("text",a,p); e.textContent=s; return e}
  function defs(){
    var d=el("defs",{});
    var mk=function(id,dir){var mm=el("marker",{id:id,viewBox:"0 0 10 10",refX:dir>0?9:1,refY:5,markerWidth:7,markerHeight:7,orient:"auto"},d); el("path",{d:dir>0?"M0,1 L9,5 L0,9 Z":"M10,1 L1,5 L10,9 Z",fill:GOLD},mm)};
    mk("hgA",1); mk("hgB",-1);
  }
  function dimH(x1,x2,y,label,yref){ // horizontal dimension with gold arrowheads
    el("line",{x1:x1,y1:yref,x2:x1,y2:y+6,class:"ext"}); el("line",{x1:x2,y1:yref,x2:x2,y2:y+6,class:"ext"});
    el("line",{x1:x1,y1:y,x2:x2,y2:y,class:"dim","marker-start":"url(#hgB)","marker-end":"url(#hgA)"});
    tx((x1+x2)/2,y+18,label,{class:"dl","text-anchor":"middle"});
  }
  function dimV(x,y1,y2,label,xref){
    el("line",{x1:xref,y1:y1,x2:x-6,y2:y1,class:"ext"}); el("line",{x1:xref,y1:y2,x2:x-6,y2:y2,class:"ext"});
    el("line",{x1:x,y1:y1,x2:x,y2:y2,class:"dim","marker-start":"url(#hgB)","marker-end":"url(#hgA)"});
    var t=tx(x-8,(y1+y2)/2,label,{class:"dl","text-anchor":"middle",transform:"rotate(-90 "+(x-8)+" "+((y1+y2)/2)+")"});
  }
  var NAR=false; // v6: narrow panel (mobile): callouts drop their small second line so the drawing keeps its size
  function tw(str,cls){ var e=tx(0,0,str,{class:cls}), w=e.getComputedTextLength(); svg.removeChild(e); return w }
  function cw2(title,sub){ return Math.max(tw(title,"ct"),sub&&!NAR?tw(sub,"cs"):0) }
  function callout(x,y,lx,ly,title,sub,anchor){
    anchor=anchor||"middle"; var dx=anchor==="end"?-4:(anchor==="start"?4:0);
    el("line",{x1:x,y1:y,x2:lx,y2:ly+4,class:"lead"}); el("circle",{cx:x,cy:y,r:2.2,fill:GOLD});
    if(sub&&!NAR) tx(lx+dx,ly,sub,{class:"cs","text-anchor":anchor,dy:"-1.45em"});
    tx(lx+dx,ly,title,{class:"ct","text-anchor":anchor});
  }
  function figure(x,g,s){ // faint human silhouette, 1,750 mm
    var h=1750*s, u=h/7.6, grp=el("g",{class:"fig"});
    el("circle",{cx:x,cy:g-h+u*0.55,r:u*0.55},grp);
    el("path",{d:"M"+(x-u*0.95)+","+(g-h+u*1.35)+" h"+(u*1.9)+" l"+(u*0.15)+","+(u*3)+" h-"+(u*0.5)+" l-"+(u*0.1)+","+(u*3.1)+" h-"+(u*0.55)+" l-"+(u*0.05)+",-"+(u*2.3)+" l-"+(u*0.05)+","+(u*2.3)+" h-"+(u*0.55)+" l-"+(u*0.1)+",-"+(u*3.1)+" h-"+(u*0.5)+" Z"},grp);
    tx(x,g+14,"1.75 m figure",{class:"fl","text-anchor":"middle"});
  }
  var clipN=0;
  function clip(d){ var id="hgclip"+(++clipN), cp=el("clipPath",{id:id},svg.querySelector("defs")); el("path",{d:d},cp); return "url(#"+id+")" }
  function boards(x,y,w,h,col,step,s,vertical,cl){ // subtle featheredge board lines
    var g=el("g",{stroke:col,"stroke-opacity":.35,"stroke-width":.6}), i; if(cl) g.setAttribute("clip-path",cl);
    if(vertical){for(i=x+step*s;i<x+w;i+=step*s) el("line",{x1:i,y1:y,x2:i,y2:y+h},g)}
    else {for(i=y+h-step*s;i>y;i-=step*s) el("line",{x1:x,y1:i,x2:x+w,y2:i},g)}
  }
  // exterior cladding by profile (Matthew, 2 Oct 2026): T&G = flush boards; Weatherboard = overlapping boards with a shadow line
  function clad(x,y,w,h,col,s,cl){
    if(S.prof!=="weatherboard"){ boards(x,y,w,h,col,110,s,false,cl); return }
    var g=el("g",{"stroke-width":.6}), i; if(cl) g.setAttribute("clip-path",cl);
    for(i=y+h-170*s;i>y;i-=170*s){ el("line",{x1:x,y1:i,x2:x+w,y2:i,stroke:col,"stroke-opacity":.6,"stroke-width":1.1},g); el("line",{x1:x,y1:i+2.2,x2:x+w,y2:i+2.2,stroke:"#fff","stroke-opacity":.35},g) }
  }
  function profName(){return S.prof==="weatherboard"?"Weatherboard":"T&G"}
  function shade(hex,f){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255; r=Math.round(r*f);g=Math.round(g*f);b=Math.round(b*f); return "rgb("+r+","+g+","+b+")"}
  /* ---------- views ---------- */
  /* v6: each view is drawn in the panel's own pixel space (1 unit = 1 CSS px, so labels keep a constant legible size) and
     scaled to fill it; the viewBox is then tightened to the content (getBBox + pad) with preserveAspectRatio meet, so nothing
     clips at any size. The panel background is the drawing's cream, so there's no inner card. */
  function box(){ return {w:svg.clientWidth,h:svg.clientHeight} }
  /* the drawing panel can be momentarily hidden while a view tab is switched (site.js hides tab panels, v3-cfg.js re-shows
     them): if the SVG has no size yet, draw on the next frames instead of at a guessed size */
  var lastSz="", waitN=0;
  function sized(fn){ var b=box(); if(b.w>0&&b.h>0){ waitN=0; lastSz=b.w+"x"+b.h; return b } if(waitN<30){ waitN++; requestAnimationFrame(fn) } return null }
  function fit(pad){ var b; try{ b=svg.getBBox() }catch(e){ return } if(!b||!b.width) return;
    svg.setAttribute("viewBox",[b.x-pad,b.y-pad,b.width+2*pad,b.height+2*pad].map(function(v){return Math.round(v*10)/10}).join(" ")); svg.setAttribute("preserveAspectRatio","xMidYMid meet") }
  function draw(){
    if(!sized(draw)) return;
    while(svg.lastChild) svg.removeChild(svg.lastChild);
    var t=el("title",{id:"hg-svg-t"}); t.textContent=title(); defs();
    if(S.view==="plan") plan(); else elevation(S.view);
    fit(4);
  }
  function elevation(view){
    var front=view==="front", W=front?A.w:A.d+(S.veranda?1000:0), span=front?6500:6800;
    var h=heights(A.d,S.roof,S.veranda), cl=find(D.clad,S.clad), rfc=S.roof==="flat"?"#3b3d40":find(D.roofFinish,S.rf).hex;
    var B=box(), mezzOn=S.mezz&&S.roof==="pitched", topH0=S.roof==="flat"?2500:h.r, FG=700;
    var nar=B.w<560, pitSide=!front&&S.roof==="pitched"; NAR=nar;
    var cT=nar?28:48, mL0=S.roof==="pitched"?84:60, mL=mL0, mT=cT, mB=front?52:68+(S.veranda&&nar?14:0), mR=48, xm=mezzOn&&!nar?150:0, s, stack=false;
    // label extents that depend on the scale: the front "Fixed windows" callout runs left of its window; on the pitched side
    // view the gable skylight callout sits right of the window callout, or is stacked above it if that runs past the figure
    var fw=0, it0=layout(A.w), g0=(A.w-it0.reduce(function(a,b){return a+b.w},0))/(it0.length+1), ac0=g0;
    for(var q0=0;q0<it0.length;q0++){ if(it0[q0].t!=="door"){ fw=ac0+it0[q0].w/2; break } ac0+=it0[q0].w+g0 }
    var wlw=front?cw2("Fixed windows ×"+nWin(A.w),"600 × 1,800 mm"):cw2("Opening window ×1","600 × 1,800 mm · each side"), glw=pitSide?cw2("Gable skylight","500 × 500 mm · each side"):0;
    for(var it=0;it<3;it++){
      s=Math.min((B.w-mL-mR-xm)/(W+FG),(B.h-mT-mB)/topH0);
      if(front) mL=Math.max(mL0,wlw+18-fw*s);
      if(pitSide){ var wr=(479-0)*s-2+wlw+(S.veranda?1000*s:0), gx=Math.max(W/2*s+40,wr+18); stack=gx+glw>(W+FG)*s+44; mT=cT+(stack?(nar?18:34):0) }
    }
    s=Math.min((B.w-mL-mR-xm)/(W+FG),(B.h-mT-mB)/topH0);
    var x0=(B.w-(mL+(W+FG)*s+mR+xm))/2+mL, G=(B.h-(mT+topH0*s+mB))/2+mT+topH0*s, X=function(mm){return x0+mm*s}, Y=function(mm){return G-mm*s};
    var figX=X(W+FG);
    // ground
    el("line",{x1:x0-mL+10,y1:G,x2:figX+44,y2:G,class:"gl"}); el("rect",{x:x0-mL+10,y:G,width:figX+34-x0+mL,height:8,fill:"url(#none)",class:"gh"});
    var roomX0=0, roomW=front?A.w:A.d, gable=null;
    if(!front&&S.veranda) roomX0=1000;
    // veranda deck
    if(S.veranda){ if(front){el("rect",{x:X(-60),y:Y(150),width:(A.w+120)*s,height:150*s,class:"deck"})} else {el("rect",{x:X(0),y:Y(150),width:1000*s,height:150*s,class:"deck"}); boards(X(0),Y(150),1000*s,150*s,"#6b5a45",140,s,true)} }
    // plinth + walls
    el("rect",{x:X(roomX0),y:Y(150),width:roomW*s,height:150*s,class:"plinth"});
    var wallTop=h.e;
    var wall=el("rect",{x:X(roomX0),y:Y(wallTop),width:roomW*s,height:(wallTop-150)*s,fill:cl.hex,"fill-opacity":.62,class:"wall"});
    clad(X(roomX0),Y(wallTop),roomW*s,(wallTop-150)*s,shade(cl.hex,.6),s);
    el("rect",{x:X(roomX0),y:Y(wallTop),width:roomW*s,height:(wallTop-150)*s,class:"ol"});
    // corner trims
    el("line",{x1:X(roomX0+100),y1:Y(150),x2:X(roomX0+100),y2:Y(wallTop),class:"thin"}); el("line",{x1:X(roomX0+roomW-100),y1:Y(150),x2:X(roomX0+roomW-100),y2:Y(wallTop),class:"thin"});
    // roof
    var ov=S.roof==="flat"?150:200, roofL=front?-ov:-ov, roofR=W+ov;
    if(S.roof==="flat"){
      el("rect",{x:X(roofL),y:Y(2500),width:(roofR-roofL)*s,height:250*s,fill:rfc,"fill-opacity":.7,class:"ol"});
    } else if(front){
      el("rect",{x:X(roofL),y:Y(h.r),width:(roofR-roofL)*s,height:(h.r-h.e)*s,fill:rfc,"fill-opacity":.45,class:"ol"});
      boards(X(roofL),Y(h.r),(roofR-roofL)*s,(h.r-h.e)*s,shade(rfc,.6),S.rf==="cedar"?120:170,s,false);
      el("line",{x1:X(roofL),y1:Y(h.r),x2:X(roofR),y2:Y(h.r),class:"ol"});
      if(S.dormer){ var it=layout(A.w), gap=(A.w-it.reduce(function(a,b){return a+b.w},0))/(it.length+1), cx=0, acc=gap, i;
        for(i=0;i<it.length;i++){ if(it[i].t==="door") cx=acc+it[i].w/2; acc+=it[i].w+gap }
        var bw=1600, ap=h.e+(h.r-h.e)*0.9;
        var bb="M"+X(cx-bw/2-80)+","+Y(h.e)+" L"+X(cx)+","+Y(ap+60)+" L"+X(cx+bw/2+80)+","+Y(h.e)+" Z";
        el("path",{d:bb,fill:CREAM}); el("path",{d:bb,fill:rfc,"fill-opacity":.55,class:"ol"});
        var tri="M"+X(cx-bw/2)+","+Y(h.e)+" L"+X(cx)+","+Y(ap)+" L"+X(cx+bw/2)+","+Y(h.e)+" Z";
        el("path",{d:tri,fill:CREAM}); el("path",{d:tri,fill:cl.hex,"fill-opacity":.62});
        clad(X(cx-bw/2),Y(ap),bw*s,(ap-h.e)*s,shade(cl.hex,.6),s,clip(tri));
        el("path",{d:"M"+X(cx-bw/2)+","+Y(h.e)+" L"+X(cx)+","+Y(ap)+" L"+X(cx+bw/2)+","+Y(h.e)+" Z",fill:"none",class:"ol"});
        el("line",{x1:X(cx),y1:Y(h.e),x2:X(cx),y2:Y(ap),class:"thin"});
        el("line",{x1:X(cx-bw/4),y1:Y(h.e),x2:X(cx),y2:Y(h.e+(ap-h.e)*0.45),class:"thin"}); el("line",{x1:X(cx+bw/4),y1:Y(h.e),x2:X(cx),y2:Y(h.e+(ap-h.e)*0.45),class:"thin"});
        // mask board lines under the dormer triangle (above it the roof shows)
      }
    } else { // side: gable
      var rl=-ov, rr=W+ov, mid=W/2;
      var drop=(h.r-h.e)/(W/2)*ov;
      el("path",{d:"M"+X(0)+","+Y(h.e)+" L"+X(mid)+","+Y(h.r-60)+" L"+X(W)+","+Y(h.e)+" Z",fill:cl.hex,"fill-opacity":.62,class:"ol"});
      clad(X(0),Y(h.r),W*s,(h.r-h.e)*s,shade(cl.hex,.6),s,clip("M"+X(0)+","+Y(h.e)+" L"+X(mid)+","+Y(h.r-60)+" L"+X(W)+","+Y(h.e)+" Z"));
      el("path",{d:"M"+X(0)+","+Y(h.e)+" L"+X(mid)+","+Y(h.r-60)+" L"+X(W)+","+Y(h.e)+" Z",fill:"none",class:"ol"});
      el("path",{d:"M"+X(rl)+","+Y(h.e-drop)+" L"+X(mid)+","+Y(h.r)+" L"+X(rr)+","+Y(h.e-drop)+" L"+X(rr)+","+Y(h.e-drop+90)+" L"+X(mid)+","+Y(h.r-110)+" L"+X(rl)+","+Y(h.e-drop+90)+" Z",fill:rfc,"fill-opacity":.6,class:"ol"});
      // gable skylight (diamond, 500 x 500) as on the live drawings
      var gy=h.e+(h.r-h.e)*0.42; el("path",{d:"M"+X(mid)+","+Y(gy+250)+" L"+X(mid+250)+","+Y(gy)+" L"+X(mid)+","+Y(gy-250)+" L"+X(mid-250)+","+Y(gy)+" Z",class:"glass"});
      gable={x:X(mid+200),y:Y(gy),mid:X(mid)};
    }
    // veranda posts / roof extension
    if(S.veranda){
      if(front){ [210,A.w-310].forEach(function(px){ el("rect",{x:X(px),y:Y(S.roof==="flat"?2250:h.e),width:100*s,height:((S.roof==="flat"?2250:h.e)-150)*s,fill:cl.hex,"fill-opacity":.85,class:"ol"}) }) }
      else { el("rect",{x:X(60),y:Y(S.roof==="flat"?2250:h.e),width:100*s,height:((S.roof==="flat"?2250:h.e)-150)*s,fill:cl.hex,"fill-opacity":.85,class:"ol"}); }
    }
    // openings
    if(front){
      var it2=layout(A.w), gap2=(A.w-it2.reduce(function(a,b){return a+b.w},0))/(it2.length+1), acc2=gap2, firstWin=null, door=null;
      it2.forEach(function(o){
        var ox=acc2; acc2+=o.w+gap2;
        el("rect",{x:X(ox),y:Y(o.b+o.h),width:o.w*s,height:o.h*s,class:"frame"});
        el("rect",{x:X(ox+50),y:Y(o.b+o.h-50),width:(o.w-100)*s,height:(o.h-100)*s,class:"glass"});
        if(o.t==="door"){ el("rect",{x:X(ox+50),y:Y(o.b+170),width:(o.w-100)*s,height:120*s,fill:find(D.floor,S.floor).hex,"fill-opacity":.55}); el("line",{x1:X(ox+o.w/2),y1:Y(o.b+o.h),x2:X(ox+o.w/2),y2:Y(o.b),class:"thin"}); el("line",{x1:X(ox+o.w/2-60),y1:Y(1050),x2:X(ox+o.w/2-60),y2:Y(950),class:"hdl"}); el("line",{x1:X(ox+o.w/2+60),y1:Y(1050),x2:X(ox+o.w/2+60),y2:Y(950),class:"hdl"}); door={x:ox+o.w/2,top:o.b+o.h} }
        else if(!firstWin) firstWin={x:ox+o.w/2,top:o.b+o.h};
      });
      var top=S.roof==="flat"?2500:h.r;
      callout(X(door.x),Y(door.top-300),X(door.x)+20,Y(top)-14,"French doors ×1","1,200 × 2,100 mm","start");
      callout(X(firstWin.x),Y(firstWin.top-300),X(firstWin.x)-14,Y(top)-14,"Fixed windows ×"+nWin(A.w),"600 × 1,800 mm","end");
      if(S.roof==="pitched"&&S.dormer) el("text",{x:X(door.x),y:Y(h.e)-6,class:"fl","text-anchor":"middle"}).textContent="";
    } else {
      var wx=roomX0+(S.veranda?479:479); // planner places the side window 479 mm from the front corner
      el("rect",{x:X(wx-300),y:Y(2250),width:600*s,height:1800*s,class:"frame"});
      el("rect",{x:X(wx-250),y:Y(2200),width:500*s,height:1700*s,class:"glass"});
      el("line",{x1:X(wx-250),y1:Y(1500),x2:X(wx+250),y2:Y(1500),class:"thin"});
      callout(X(wx),Y(1900),X(wx)-6,Y(S.roof==="pitched"?h.r:2500)-14,"Opening window ×1","600 × 1,800 mm · each side","start");
      // gable skylight label: same row, right of the window label when there's room; otherwise stacked above it
      if(gable){ var wr=0; [svg.lastChild,svg.lastChild.previousSibling].forEach(function(t){ try{ var b=t.getBBox(); wr=Math.max(wr,b.x+b.width) }catch(e){} });
        var gx=Math.max(gable.mid+40,wr+18), n0=svg.childNodes.length; callout(gable.x,gable.y,gx,Y(h.r)-14,"Gable skylight","500 × 500 mm · each side","start");
        var gr=0; for(var q=n0;q<svg.childNodes.length;q++){ try{ var bb=svg.childNodes[q].getBBox(); gr=Math.max(gr,bb.x+bb.width) }catch(e){} }
        if(gr>figX+44){ while(svg.childNodes.length>n0) svg.removeChild(svg.lastChild); callout(gable.x,gable.y,gable.mid+20,Y(h.r)-14-(NAR?18:34),"Gable skylight","500 × 500 mm · each side","start") } }
      tx(X(roomX0)+6,Y(150)-6,"",{});
      tx(X(0),G+64,"Front"+(S.veranda&&!nar?" · veranda 1,000 mm":""),{class:"fl"}); tx(X(W),G+64,"Rear",{class:"fl","text-anchor":"end"});
      if(S.veranda&&nar) tx(X(0),G+78,"Veranda 1,000 mm",{class:"fl"});
    }
    // mezzanine: internal floor line at truss level
    if(S.mezz&&S.roof==="pitched"){
      var my=h.e-40, mx1=front?roomX0+300:roomX0+roomW*0.45, mx2=front?roomX0+roomW-300:roomX0+roomW-150;
      el("line",{x1:X(mx1),y1:Y(my),x2:X(mx2),y2:Y(my),class:"mezz"});
      el("line",{x1:X(mx1),y1:Y(my-120),x2:X(mx2),y2:Y(my-120),class:"mezz2"});
      if(NAR) tx(X((mx1+mx2)/2),Y(my)-5,"Mezzanine",{class:"ct","text-anchor":"middle"});
      else callout(X(mx2-200),Y(my),X(W+200)+12,Y((h.e+h.r)/2)+6,"Mezzanine","internal floor · position agreed with you","start");
    }
    // dimensions
    var topH=S.roof==="flat"?2500:h.r;
    dimH(X(front?0:0),X(W),G+30,fmt(W)+" mm",G+4);
    dimV(x0-(S.roof==="pitched"?62:40),Y(0),Y(topH),(h.ok?"":"≈ ")+fmt(topH)+" mm"+(h.ok?"":" · approx."),x0-4);
    if(S.roof==="pitched") dimV(x0-26,Y(0),Y(h.e),(h.ok?"":"≈ ")+fmt(h.e),x0-4);
    figure(figX,G,s);
  }
  function plan(){
    var Dp=A.d+(S.veranda?1000:0), W=A.w, B=box(), pit=S.roof==="pitched", Dm=S.veranda?Dp:A.d+650;
    var mL=50, mR=pit?44:10, mT=8, mB=62, s=Math.min((B.w-mL-mR)/(W+(pit?200:0)),(B.h-mT-mB)/Dm);
    var x0=(B.w-(mL+W*s+mR+(pit?200*s:0)))/2+mL, y0=(B.h-(mT+Dm*s+mB))/2+mT, X=function(mm){return x0+mm*s}, Y=function(mm){return y0+mm*s};
    var fl=find(D.floor,S.floor), t=150;
    el("rect",{x:X(0),y:Y(0),width:W*s,height:A.d*s,fill:fl.hex,"fill-opacity":.28});
    // walls (double line)
    el("rect",{x:X(0),y:Y(0),width:W*s,height:A.d*s,class:"ol"});
    el("rect",{x:X(t),y:Y(t),width:(W-2*t)*s,height:(A.d-2*t)*s,class:"thin"});
    // front openings
    var it=layout(W), gap=(W-it.reduce(function(a,b){return a+b.w},0))/(it.length+1), acc=gap;
    it.forEach(function(o){ var ox=acc; acc+=o.w+gap;
      el("rect",{x:X(ox),y:Y(A.d-t),width:o.w*s,height:t*s,fill:CREAM,stroke:"none"});
      if(o.t==="door"){ var hx=o.w/2;
        el("path",{d:"M"+X(ox)+","+Y(A.d)+" L"+X(ox)+","+Y(A.d+hx)+" A"+(hx*s)+","+(hx*s)+" 0 0 0 "+X(ox+hx)+","+Y(A.d),class:"swing"});
        el("path",{d:"M"+X(ox+o.w)+","+Y(A.d)+" L"+X(ox+o.w)+","+Y(A.d+hx)+" A"+(hx*s)+","+(hx*s)+" 0 0 1 "+X(ox+hx)+","+Y(A.d),class:"swing"});
      } else { [0.25,0.5,0.75].forEach(function(f){ el("line",{x1:X(ox),y1:Y(A.d-t*f),x2:X(ox+o.w),y2:Y(A.d-t*f),class:"thin"}) }) }
    });
    // side windows, 479 mm from the front corner (centre)
    [[0,1],[W-t,1]].forEach(function(p){ el("rect",{x:X(p[0]),y:Y(A.d-479-300),width:t*s,height:600*s,fill:CREAM,stroke:"none"}); [0.25,0.5,0.75].forEach(function(f){ el("line",{x1:X(p[0]+t*f),y1:Y(A.d-779),x2:X(p[0]+t*f),y2:Y(A.d-179),class:"thin"}) }) });
    if(S.veranda){ el("rect",{x:X(0),y:Y(A.d),width:W*s,height:1000*s,class:"deck"}); boards(X(0),Y(A.d),W*s,1000*s,"#6b5a45",140,s,true); el("rect",{x:X(0),y:Y(A.d),width:W*s,height:1000*s,class:"thin",fill:"none"}); [210,W-310].forEach(function(px){ el("rect",{x:X(px),y:Y(A.d+1000-160),width:100*s,height:100*s,class:"ol",fill:"#fff"}) }); tx(X(W/2),Y(A.d+620),"Veranda · timber decking",{class:"fl","text-anchor":"middle"}) }
    if(S.roof==="pitched"){ el("rect",{x:X(W/2-490),y:Y(400),width:980*s,height:1200*s,class:"dash"}); tx(X(W/2),Y(400)-6,"Rooflight (rear slope)",{class:"fl","text-anchor":"middle"}); el("line",{x1:X(-200),y1:Y(A.d/2),x2:X(W+200),y2:Y(A.d/2),class:"ridge"}); tx(X(W+200)+4,Y(A.d/2)+4,"ridge",{class:"fl"}) }
    if(S.mezz&&S.roof==="pitched"){ el("rect",{x:X(t),y:Y(t),width:(W-2*t)*s,height:(A.d*0.42)*s,class:"mezzA"}); tx(X(W/2),Y(t+A.d*0.21)+20,"Mezzanine above (size agreed with you)",{class:"ct","text-anchor":"middle"}) }
    tx(X(W/2),Y(A.d*0.62),"Floor: "+fl.n,{class:"cs","text-anchor":"middle"});
    var yb=Y(S.veranda?Dp:A.d+650); dimH(X(0),X(W),yb+24,fmt(W)+" mm",yb+2);
    dimV(x0-30,Y(0),Y(A.d),fmt(A.d)+" mm",x0-4);
    tx(X(W/2),yb+58,"Front",{class:"fl","text-anchor":"middle"});
  }
  /* ---------- text ---------- */
  function roofName(){return S.roof==="flat"?"Flat roof (EPDM)":"Pitched roof · "+find(D.roofFinish,S.rf).n+(S.dormer?" · gable dormer":"")}
  function dwText(){var t="French doors ×1 · fixed windows ×"+nWin(S.w)+" (front) · opening window ×1 each side"; if(S.roof==="pitched") t+=" · gable skylight ×1 each side · rooflight ×1"; return t}
  function title(){return ({front:"Front elevation",side:"Side elevation",plan:"Plan"})[S.view]+" · "+m(S.w)+" m × "+m(S.d)+" m · "+(S.roof==="flat"?"Flat roof":"Pitched roof")+" · "+profName()+" · "+find(D.clad,S.clad).n}
  function setOut(k,v,html){var e=$('[data-out="'+k+'"]'); if(e){ if(html) e.innerHTML=v; else e.textContent=v }}
  function setS(k,v,html){var e=$('[data-s="'+k+'"]'); if(e){ if(html) e.innerHTML=v; else e.textContent=v }}
  function texts(){
    var area=(S.w*S.d/1e6), P=price(), sz=m(S.w)+" m × "+m(S.d)+" m";
    setOut("sizeline",sz+" · "+area.toFixed(area%1?2:0).replace(/\.?0+$/,"")+" m² floor area");
    setOut("pflat","From "+gbp(base("flat"))+" at this size"); setOut("ppitched","From "+gbp(base("pitched"))+" at this size");
    var c=opt("cedar"); setOut("rfnote",S.rf==="cedar"?(c!==null?"Cedar shingles: +"+gbp(c)+" at this size.":"Cedar shingles: priced on your quote at this size."):"Asphalt shingles in black or brown are the same price.");
    var mz=$("[data-mezz]"); mz.disabled=S.roof!=="pitched"; if(mz.disabled) mz.checked=false;
    var z=opt("mezz");
    setOut("mezznote",S.roof!=="pitched"?"Available with the pitched roof. Choose the pitched roof to add one.":(z!==null?"+"+gbp(z)+" at this size. We confirm the final layout with you.":"Available with the pitched roof. Price and availability at this size are confirmed on your quote."));
    var v=opt("veranda"); setOut("vernote",v!==null?"(+"+gbp(v)+" at this size)":"(priced on your quote at this size)");
    var f=opt("floor",S.floor); setOut("flnote",S.floor==="plywood"?"Plywood flooring is standard; SPC flooring in Walnut, Grey Oak or Natural Oak is an option.":(f!==null?find(D.floor,S.floor).n+": +"+gbp(f)+" at this size.":find(D.floor,S.floor).n+": priced on your quote."));
    setOut("dw",dwText());
    setOut("title",title());
    var h=heights(S.d,S.roof,S.veranda); setOut("hnote","Height: "+h.src+".");
    setS("size",sz); setS("area",(+area.toFixed(2))+" m²"); setS("roof",roofName());
    setS("mezz",S.roof==="pitched"&&S.mezz?"Yes":"None"); setS("ver",S.veranda?"Yes, up to 1,000 mm":"None");
    setS("clad",profName()+" · "+find(D.clad,S.clad).n); setS("int","V-groove matchboard · "+find(D.floor,S.floor).n+" floor"); setS("dw","French doors ×1 · "+(nWin(S.w)+2)+" windows");
    setS("price",gbp(P.total)+(P.tbc.length?" + options priced on your quote":""));
    setS("pnote",(P.parts.length?"Size & roof "+gbp(P.base)+" · "+P.parts.join(" · "):"Live price for this size and roof")+(P.tbc.length?" · priced on your quote: "+P.tbc.join(", "):"")+" · Cladding profile priced on your quote");
    $$("[data-pitched-only]").forEach(function(e){e.hidden=S.roof!=="pitched"});
    svg.setAttribute("aria-label",title()+". "+dwText()+".");
  }
  /* ---------- animation ---------- */
  var anim=null;
  function go(){
    texts();
    if(reduce||(A.w===S.w&&A.d===S.d)){A.w=S.w;A.d=S.d;draw();return}
    var fw=A.w, fd=A.d, t0=null; if(anim) cancelAnimationFrame(anim);
    function step(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/300), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      A.w=fw+(S.w-fw)*e; A.d=fd+(S.d-fd)*e; draw(); if(p<1) anim=requestAnimationFrame(step); else {A.w=S.w;A.d=S.d;anim=null;draw()} }
    anim=requestAnimationFrame(step);
  }
  /* ---------- controls ---------- */
  function radios(attr,cb){
    var bs=$$("[data-"+attr+"]").filter(function(b){return b.getAttribute("role")==="radio"});
    function sync(){ bs.forEach(function(b){ var on=String(S[attr])===b.getAttribute("data-"+attr); b.setAttribute("aria-checked",on?"true":"false"); b.tabIndex=on?0:-1 }) }
    bs.forEach(function(b,i){
      b.addEventListener("click",function(){ var v=b.getAttribute("data-"+attr); S[attr]=/^\d+$/.test(v)?+v:v; sync(); if(cb) cb(); go() });
      b.addEventListener("keydown",function(e){ var k=e.key, n=null; if(k==="ArrowRight"||k==="ArrowDown") n=bs[(i+1)%bs.length]; if(k==="ArrowLeft"||k==="ArrowUp") n=bs[(i-1+bs.length)%bs.length]; if(n){e.preventDefault(); n.focus(); n.click()} });
    });
    sync();
  }
  radios("w"); radios("d"); radios("roof"); radios("rf"); radios("clad"); radios("prof"); radios("floor");
  $("[data-dormer]").addEventListener("change",function(e){S.dormer=e.target.checked; go()});
  $("[data-mezz]").addEventListener("change",function(e){S.mezz=e.target.checked; go()});
  $("[data-veranda]").addEventListener("change",function(e){S.veranda=e.target.checked; go()});
  var vt=$$("[data-view]");
  vt.forEach(function(b,i){
    b.addEventListener("click",function(){ S.view=b.getAttribute("data-view"); vt.forEach(function(x){ var on=x===b; x.setAttribute("aria-selected",on?"true":"false"); x.tabIndex=on?0:-1 }); $(".svgw").setAttribute("aria-labelledby",b.id); draw(); texts() });
    b.addEventListener("keydown",function(e){ var n=null; if(e.key==="ArrowRight") n=vt[(i+1)%vt.length]; if(e.key==="ArrowLeft") n=vt[(i-1+vt.length)%vt.length]; if(n){e.preventDefault(); n.focus(); n.click()} });
  });
  // "Send me this design" (pick 2 B): opens the inline send panel (site.js) and fills it with this spec. Nothing is sent in the prototype.
  function spec(){var P=price(); return "Heritage · "+m(S.w)+" m × "+m(S.d)+" m · "+roofName()+" · mezzanine: "+(S.roof==="pitched"&&S.mezz?"yes":"no")+" · veranda: "+(S.veranda?"yes":"no")+" · cladding: "+profName()+", "+find(D.clad,S.clad).n+" (profile priced on your quote) · floor: "+find(D.floor,S.floor).n+" · "+dwText()+" · from "+gbp(P.total)+(P.tbc.length?" + options priced on your quote":"")}
  var sd=$("[data-send-design]");
  if(sd) sd.addEventListener("click",function(){
    var t=document.getElementById("hgsend-spec"); if(t) t.value=spec();
  });
  // expose state for tests
  /* v6: redraw to the panel's new size (window resize, the right-hand panel changing height between tabs) */
  if(window.ResizeObserver){ new ResizeObserver(function(){ var b=box(), k=b.w+"x"+b.h; if(k===lastSz) return; lastSz=k; if(!anim) draw() }).observe(svg.parentNode) }
  window.__hgen={state:S,price:price,heights:heights,spec:spec,draw:draw};
  go();
})();
