/* v8.3 garden-room 3D preview renderer, loaded on the first "View in 3D" click (gr3d-btn.js).
   Same approach as the Hampton "View in 3D" (hp-refine.js): read-only SVG generated from the configurator's own state,
   so there is no WebGL or 3D library to fail. Orthographic projection, back-face culling, painter's sort, drag or buttons to turn.
   Adapters: Heritage (window.__hgen + page JSON), Contemporary (window.__ctcfg), Signature (window.__sgcfg). Units: metres. */
(function(){
  "use strict";
  var NS="http://www.w3.org/2000/svg", P=null, yaw=-32, PH=24*Math.PI/180, raf=0, last="", mo=null, ro=null, poll=0;
  function gbpN(x){ return (Math.round(x*100)/100).toString() }
  function shade(hex,k){ var n=parseInt(hex.slice(1),16), r=n>>16&255, g=n>>8&255, b=n&255;
    function c(v){ v=k<1?v*k:v+(255-v)*(k-1); return Math.max(0,Math.min(255,Math.round(v))) }
    return "#"+((1<<24)+(c(r)<<16)+(c(g)<<8)+c(b)).toString(16).slice(1) }

  /* ---------- adapters: configurator state -> model ---------- */
  function heritage(){
    var H=window.__hgen, S=H.state, D=JSON.parse(document.querySelector("[data-hgen-data]").textContent);
    function find(l,k){ for(var i=0;i<l.length;i++) if(l[i].k===k) return l[i]; return l[0] }
    var W=S.w/1000, Dd=S.d/1000, pit=S.roof==="pitched", h=H.heights(S.d,S.roof,S.veranda), cl=find(D.clad,S.clad), rf=find(D.roofFinish,S.rf);
    var n=S.w<=4000?1:(S.w<=5500?2:3), it=[], i; for(i=0;i<n;i++) it.push({t:"win",w:.6,h:1.8,b:.45}); it.push({t:"door",w:1.2,h:2.1,b:.15,leaves:2}); for(i=0;i<n;i++) it.push({t:"win",w:.6,h:1.8,b:.45});
    var gap=(W-it.reduce(function(a,o){return a+o.w},0))/(it.length+1), x=gap, fr=[], doorX=W/2;
    it.forEach(function(o){ fr.push({x:x,w:o.w,b:o.b,h:o.h,t:o.t,leaves:o.leaves||1}); if(o.t==="door") doorX=x+o.w/2; x+=o.w+gap });
    var side=[{z:.479,w:.6,b:.45,h:1.8,t:"win"}];
    var prof=S.prof==="tg"?"T&G":"Weatherboard";
    return {name:"Heritage",W:W,D:Dd,e:pit?h.e/1000:2.25,top:pit?h.r/1000:2.5,roof:pit?"gable":"flat",wall:cl.hex,roofc:pit?rf.hex:"#3b3d40",
      frame:"#f3efe6",glass:"#9db3bd",front:fr,sides:side,boards:S.prof==="tg"?.12:.17,shadow:S.prof!=="tg",
      veranda:S.veranda?1:0,dormer:pit&&S.dormer?{x:doorX,w:1.8}:null,gableSky:pit,approx:!h.ok,
      sum:"Heritage "+gbpN(W)+" m × "+gbpN(Dd)+" m, "+(pit?"pitched roof in "+rf.n+(S.dormer?" with a gable dormer":""):"flat EPDM roof")+", "+prof+" cladding in "+cl.n+
        (S.veranda?", 1 m veranda":"")+(S.mezz&&pit?", mezzanine inside (not shown)":"")+". French doors and "+(2*n)+" fixed windows on the front, an opening window each side"+(h.ok?"":"; pitched height drawn approximately")+"."};
  }
  function contemporary(){
    var C=window.__ctcfg, S=C.state, W=+S.w, Dd=+S.d, fr=[], dw=Math.min(2.4,W-1.2);
    fr.push({x:(W-dw)/2,w:dw,b:.1,h:2.1,t:"door",leaves:dw>2?3:2});
    if(W>=4.5){ fr.push({x:.5,w:Math.min(1.2,(W-dw)/2-.9),b:.6,h:1.6,t:"win"}); fr.push({x:W-.5-Math.min(1.2,(W-dw)/2-.9),w:Math.min(1.2,(W-dw)/2-.9),b:.6,h:1.6,t:"win"}) }
    var INT={melamine:"white melamine",maple:"maple veneer acoustic panelling",teak:"teak veneer acoustic panelling",whitewash:"white wash redwood"};
    return {name:"Contemporary",W:W,D:Dd,e:2.25,top:2.5,roof:"flat",wall:"#6f5a46",roofc:"#3b3d40",frame:"#3b4045",glass:"#8fa6b0",front:fr,sides:[],boards:.14,
      sum:"Contemporary "+gbpN(W)+" m × "+gbpN(Dd)+" m, flat roof, 2.5 m overall. Anthracite aluminium doors and windows; interior in "+(INT[S.int]||S.int)+
        ". Door and window positions and the cladding colour are illustrative (cladding is priced by your designer)."};
  }
  function signature(){
    var G=window.__sgcfg, S=G.state, D=G.data, W=+S.w, Dd=+S.d, st=G.stdDoor(S.w), dt=S.door||st.t, fr=[];
    var ow=dt==="french"?2:(dt==="bifold"?(st.t==="bifold"?st.n:3)*.9:Math.max(2.4,(st.t==="bifold"?st.n:2)*.9));
    var wx=D.win?.6:0, ox=D.win?Math.max(wx+D.win.w/1000+.6,(W-ow)/2):(W-ow)/2;
    if(D.win) fr.push({x:wx,w:D.win.w/1000,b:.1,h:2,t:"win"});
    fr.push({x:ox,w:ow,b:.1,h:dt==="french"?2:2.1,t:"door",leaves:dt==="french"?2:(dt==="bifold"?(st.t==="bifold"?st.n:3):2)});
    var pit=S.roof==="pitched", prem=S.pkg==="premium", e=pit?2.4:2.25, rise=Math.min(W,Dd)/2*Math.tan(22*Math.PI/180);
    var DOOR={french:"French doors",sliding:"sliding doors",bifold:"bi-fold doors"};
    return {name:D.name,W:W,D:Dd,e:e,top:pit?e+rise:2.5,roof:pit?"hip":"flat",wall:prem?"#7b5236":"#b98757",roofc:pit?"#a87a52":"#3b3d40",frame:"#2f3336",glass:"#93aab4",
      front:fr,sides:[],boards:.14,sky:S.sky?(W>5?2:1):0,
      sum:D.name+" "+gbpN(W)+" m × "+gbpN(Dd)+" m, "+(prem?"Premium (Thermowood cladding)":"Professional (redwood cladding)")+", "+(pit?"pitched cedar roof (shape illustrative)":"flat EPDM roof")+
        ", "+(DOOR[dt]||dt)+(dt==="bifold"?" ×"+(st.t==="bifold"?st.n:3):"")+" on the front"+(D.win?" with a fixed tall window":"")+(S.sky?", skylights (positions by your designer)":"")+
        (D.name==="Buckingham"?". The covered seating area isn't drawn":"")+"."};
  }
  function model(){ if(window.__hgen&&document.querySelector("[data-hgen-data]")) return heritage(); if(window.__sgcfg) return signature(); if(window.__ctcfg) return contemporary(); return null }

  /* ---------- geometry ---------- */
  function build(M){
    var F=[], W=M.W, D=M.D, e=M.e, top=M.top;
    function face(pts,fill,o){ o=o||{}; if(o.k==="wall"){ var nn=o.n||[0,0,-1]; fill=shade(fill,nn[2]<0?.97:(nn[2]>0?.8:(nn[0]<0?.82:.88))) } F.push({p:pts,fill:fill,n:o.n||normal(pts),k:o.k||"",kids:o.kids||[],stroke:o.stroke,bias:o.bias||0,lines:o.lines}); return F[F.length-1] }
    function box(x0,x1,y0,y1,z0,z1,c,k){
      face([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],shade(c,.92),{n:[0,0,-1],k:k});
      face([[x1,y0,z1],[x0,y0,z1],[x0,y1,z1],[x1,y1,z1]],shade(c,.8),{n:[0,0,1],k:k});
      face([[x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1]],shade(c,.78),{n:[-1,0,0],k:k});
      face([[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]],shade(c,.86),{n:[1,0,0],k:k});
      face([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],shade(c,1.08),{n:[0,1,0],k:k}) }
    /* plinth */
    box(-.05,W+.05,0,.15,-.05,D+.05,"#8c8577","plinth");
    /* walls: front/back to the eaves, sides to the ridge on a gable */
    var wallTop=e, ridgeZ=D/2;
    function openings(side){ var list=side==="front"?M.front:(side==="left"||side==="right"?M.sides:[]), K=[];
      list.forEach(function(o){ var q, ls=[];
        if(side==="front"){ q=[[o.x,o.b,-.01],[o.x+o.w,o.b,-.01],[o.x+o.w,o.b+o.h,-.01],[o.x,o.b+o.h,-.01]];
          for(var j=1;j<(o.leaves||1);j++){ var lx=o.x+o.w*j/o.leaves; ls.push([[lx,o.b,-.012],[lx,o.b+o.h,-.012]]) } }
        else { var X=side==="left"?-.01:W+.01, z0=o.z, z1=o.z+o.w; if(side==="right"){ z0=o.z; z1=o.z+o.w }
          q=[[X,o.b,z0],[X,o.b,z1],[X,o.b+o.h,z1],[X,o.b+o.h,z0]] }
        K.push({p:q,fill:M.glass,stroke:M.frame,lines:ls,glass:true}) });
      return K }
    function boards(x0,x1,ys,z,nrm,gab){ var L=[]; for(var y=.15+M.boards;y<ys-.02;y+=M.boards){ var a=x0,b=x1;
      if(gab&&y>wallTop){ var k=(y-wallTop)/(top-wallTop)*ridgeZ, lo=Math.min(x0,x1)+k, hi=Math.max(x0,x1)-k; if(hi-lo<.05) continue; a=x0<x1?lo:hi; b=x0<x1?hi:lo }
      L.push(nrm==="z"?[[a,y,z],[b,y,z]]:[[z,y,a],[z,y,b]]) } return L }
    face([[0,.15,0],[W,.15,0],[W,wallTop,0],[0,wallTop,0]],M.wall,{n:[0,0,-1],kids:openings("front"),lines:boards(0,W,wallTop,-.005,"z"),k:"wall"});
    face([[W,.15,D],[0,.15,D],[0,wallTop,D],[W,wallTop,D]],M.wall,{n:[0,0,1],lines:boards(W,0,wallTop,D+.005,"z"),k:"wall"});
    var gl=M.roof==="gable", lp=[[0,.15,D],[0,.15,0],[0,wallTop,0]], rp=[[W,.15,0],[W,.15,D],[W,wallTop,D]];
    if(gl){ lp.push([0,top,ridgeZ]); rp.push([W,top,ridgeZ]) } lp.push([0,wallTop,D]); rp.push([W,wallTop,0]);
    face(lp,M.wall,{n:[-1,0,0],kids:openings("left"),lines:boards(D,0,gl?top:wallTop,-.005,"x",gl),k:"wall"});
    face(rp,M.wall,{n:[1,0,0],kids:openings("right"),lines:boards(0,D,gl?top:wallTop,W+.005,"x",gl),k:"wall"});
    if(gl&&M.gableSky){ [[-.012,1],[W+.012,-1]].forEach(function(g){ var cy=(wallTop+top)/2+.05, cz=ridgeZ, r=.25;
      F[F.length-(g[1]>0?2:1)].kids.push({p:[[g[0],cy-r,cz],[g[0],cy,cz+r],[g[0],cy+r,cz],[g[0],cy,cz-r]],fill:M.glass,stroke:M.frame}) }) }
    /* roof */
    var ov=gl?.2:.15;
    if(M.roof==="flat"){ box(-ov,W+ov,wallTop,top,-ov-(M.veranda||0),D+ov,M.roofc,"roof");
      if(M.sky){ for(var i=0;i<M.sky;i++){ var cx=W*(i+1)/(M.sky+1); face([[cx-.4,top+.01,D/2-.6],[cx+.4,top+.01,D/2-.6],[cx+.4,top+.01,D/2+.6],[cx-.4,top+.01,D/2+.6]],"#a9c1cc",{n:[0,1,0],stroke:"#2f3336",bias:-2}) } } }
    else if(gl){ var zf=-ov-(M.veranda||0), sl=(top-wallTop)/ridgeZ, yf=wallTop-sl*(ov+(M.veranda||0)), yb=wallTop-sl*ov;
      face([[-ov,yf,zf],[W+ov,yf,zf],[W+ov,top,ridgeZ],[-ov,top,ridgeZ]],M.roofc,{n:[0,1,-sl],k:"roof",lines:roofLines(-ov,W+ov,yf,zf,top,ridgeZ)});
      face([[W+ov,yb,D+ov],[-ov,yb,D+ov],[-ov,top,ridgeZ],[W+ov,top,ridgeZ]],shade(M.roofc,.85),{n:[0,1,sl],k:"roof"});
      if(M.dormer){ var bw=M.dormer.w, dx=M.dormer.x, ap=Math.min(top-.15,wallTop+bw/2*Math.tan(38*Math.PI/180)), zb=(ap-wallTop)/sl;
        face([[dx-bw/2,wallTop,-.02],[dx+bw/2,wallTop,-.02],[dx,ap,-.02]],M.wall,{n:[0,0,-1],bias:-.3,k:"dormer"});
        face([[dx-bw/2-.1,wallTop-.05,-.12],[dx,ap+.04,-.12],[dx,ap+.04,zb],[dx-bw/2-.1,wallTop-.05,zb*.15]],shade(M.roofc,1.05),{n:[-.6,1,-.2],bias:-.32});
        face([[dx,ap+.04,-.12],[dx+bw/2+.1,wallTop-.05,-.12],[dx+bw/2+.1,wallTop-.05,zb*.15],[dx,ap+.04,zb]],shade(M.roofc,.95),{n:[.6,1,-.2],bias:-.32}) } }
    else { var hx=Math.min(W,D)/2, a=[-ov,e,-ov],b=[W+ov,e,-ov],c=[W+ov,e,D+ov],d=[-ov,e,D+ov], r1, r2;
      if(W>=D){ r1=[hx,top,D/2]; r2=[W-hx,top,D/2] } else { r1=[W/2,top,hx]; r2=[W/2,top,D-hx] }
      if(W>=D){ face([a,b,r2,r1],M.roofc,{n:[0,1,-1],k:"roof",lines:roofLines(-ov,W+ov,e,-ov,top,D/2,r1[0],r2[0])}); face([c,d,r1,r2],shade(M.roofc,.82),{n:[0,1,1],k:"roof"}); face([d,a,r1],shade(M.roofc,.9),{n:[-1,1,0],k:"roof"}); face([b,c,r2],shade(M.roofc,.95),{n:[1,1,0],k:"roof"}) }
      else { face([a,b,r1],M.roofc,{n:[0,1,-1],k:"roof"}); face([c,d,r2],shade(M.roofc,.82),{n:[0,1,1],k:"roof"}); face([d,a,r1,r2],shade(M.roofc,.9),{n:[-1,1,0],k:"roof"}); face([b,c,r2,r1],shade(M.roofc,.95),{n:[1,1,0],k:"roof"}) }
      if(M.sky){ var slp=(top-e)/(D/2+ov); for(var j=0;j<M.sky;j++){ var sx=W*(j+1)/(M.sky+1), z0=D*.12, z1=D*.12+Math.min(1.1,D*.3);
        face([[sx-.4,e+(z0+ov)*slp+.02,z0],[sx+.4,e+(z0+ov)*slp+.02,z0],[sx+.4,e+(z1+ov)*slp+.02,z1],[sx-.4,e+(z1+ov)*slp+.02,z1]],"#a9c1cc",{n:[0,1,-1],stroke:"#2f3336",bias:-2}) } } }
    function roofLines(x0,x1,y0,z0,y1,z1,rx0,rx1){ var L=[], n=Math.max(3,Math.round((y1-y0)/.12)); for(var i=1;i<n;i++){ var f=i/n, xa=x0, xb=x1;
      if(rx0!==undefined){ xa=x0+(rx0-x0)*f; xb=x1+(rx1-x1)*f } L.push([[xa,y0+(y1-y0)*f,z0+(z1-z0)*f],[xb,y0+(y1-y0)*f,z0+(z1-z0)*f]]) } return L }
    /* veranda: deck + two posts (Heritage) */
    if(M.veranda){ var V=M.veranda, ph=M.roof==="flat"?wallTop:wallTop-(top-wallTop)/ridgeZ*V*.9;
      box(0,W,0,.12,-V,0,"#b48a5e","deck");
      [.21,W-.31].forEach(function(px){ box(px,px+.1,.12,ph,-V+.05,-V+.15,M.wall,"post") }) }
    return F }
  function normal(p){ var a=p[0],b=p[1],c=p[2], u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
    return [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]] }

  /* ---------- projection + paint ---------- */
  function render(){
    raf=0; if(!P||P.hidden) return; var M=model(); if(!M) return;
    var host=P.querySelector("[data-g3dview]"), cw=Math.max(280,host.clientWidth||600), ch=Math.round(Math.min(Math.max(cw*.62,240),440));
    var key=JSON.stringify(M)+yaw+cw; if(key===last) return; last=key;
    var th=yaw*Math.PI/180, ct=Math.cos(th), st=Math.sin(th), cp=Math.cos(PH), sp=Math.sin(PH), cx=M.W/2, cz=M.D/2;
    function rot(q){ var x=q[0]-cx, z=q[2]-cz; return [x*ct+z*st, q[1], -x*st+z*ct] }
    function pr(q){ var r=rot(q); return [r[0], -(r[1]*cp+r[2]*sp), r[2]*cp-r[1]*sp] }     /* screen x, screen y (down), depth */
    function vis(n){ var x=n[0]*ct+n[2]*st, z=-n[0]*st+n[2]*ct; return z*cp-n[1]*sp<-1e-6 }
    var F=build(M).filter(function(f){ return vis(f.n) });
    F.forEach(function(f){ var s=0; f.pp=f.p.map(function(q){ var r=pr(q); s+=r[2]; return r }); f.dep=s/f.p.length+f.bias; if(f.k==="roof") f.dep-=.6; if(f.k==="plinth") f.dep+=5 });
    F.sort(function(a,b){ return b.dep-a.dep });
    /* figure 1.75 m: front right corner, 0.9 m out */
    var fx=M.W+.75, fz=-.9-(M.veranda||0), foot=pr([fx,0,fz]), head=pr([fx,1.75,fz]), fdep=foot[2];
    /* fit */
    var all=[]; F.forEach(function(f){ all=all.concat(f.pp) }); all.push(foot,head);
    var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9; all.forEach(function(q){ minx=Math.min(minx,q[0]); maxx=Math.max(maxx,q[0]); miny=Math.min(miny,q[1]); maxy=Math.max(maxy,q[1]) });
    var mxL=40, mxR=78, myT=22, myB=36, sc=Math.min((cw-mxL-mxR)/(maxx-minx),(ch-myT-myB)/(maxy-miny)), ox=mxL+((cw-mxL-mxR)-(maxx-minx)*sc)/2-minx*sc, oy=myT+((ch-myT-myB)-(maxy-miny)*sc)/2-miny*sc;
    function S2(q){ return [(q[0]*sc+ox).toFixed(1),(q[1]*sc+oy).toFixed(1)] }
    function poly(pts){ return pts.map(function(q){ return S2(q).join(",") }).join(" ") }
    var o=['<svg xmlns="'+NS+'" viewBox="0 0 '+cw+' '+ch+'" width="'+cw+'" height="'+ch+'" aria-hidden="true" focusable="false">'];
    /* lawn + soft shadow */
    var g=[[-1.5,0,-2.2-(M.veranda||0)],[M.W+2,0,-2.2-(M.veranda||0)],[M.W+2,0,M.D+1.4],[-1.5,0,M.D+1.4]].map(pr);
    o.push('<polygon points="'+poly(g)+'" fill="#e3e8d6"/>');
    var sh=[[-.2,0,-.2],[M.W+.5,0,-.2],[M.W+.5,0,M.D+.6],[-.2,0,M.D+.6]].map(pr); o.push('<polygon points="'+poly(sh)+'" fill="#c9cfb9"/>');
    function person(){ var a=S2(foot), b=S2(head), hgt=a[1]-b[1], x=+a[0], y=+a[1], u=hgt/1.75;
      return '<g fill="#3b4a42"><circle cx="'+x+'" cy="'+(y-hgt+.12*u)+'" r="'+(.12*u).toFixed(1)+'"/><path d="M'+(x-.2*u)+' '+(y-hgt+.28*u)+'h'+(.4*u)+'l'+(.06*u)+' '+(.62*u)+'h'+(-.1*u)+'l-'+(.04*u)+' '+(.85*u)+'h'+(-.12*u)+'l-'+(.02*u)+' -'+(.5*u)+'l-'+(.02*u)+' '+(.5*u)+'h'+(-.12*u)+'l-'+(.04*u)+' -'+(.85*u)+'h'+(-.1*u)+'z"/></g>'+
        '<line x1="'+(x+.36*u)+'" y1="'+y+'" x2="'+(x+.36*u)+'" y2="'+(y-hgt)+'" stroke="#3b4a42" stroke-width="1"/><text class="ts" x="'+(x+.44*u)+'" y="'+(y-hgt/2+4)+'">1.75 m</text>' }
    var bdep=F.length?F[Math.floor(F.length/2)].dep:0, figDone=false;
    F.forEach(function(f){
      if(!figDone&&fdep>f.dep&&f.k!=="plinth"){ o.push(person()); figDone=true }
      o.push('<polygon points="'+poly(f.pp)+'" fill="'+f.fill+'" stroke="'+(f.stroke||"#26302b")+'" stroke-width="'+(f.stroke?1.2:.8)+'" stroke-linejoin="round"/>');
      if(f.lines&&f.lines.length&&sc>18){ o.push('<g stroke="'+shade(f.fill,.72)+'" stroke-width="'+(f.k==="roof"?.6:(M.shadow?.9:.5))+'" opacity=".7">');
        var clip=f.pp; f.lines.forEach(function(l){ var a=pr(l[0]), b=pr(l[1]); o.push('<line x1="'+S2(a)[0]+'" y1="'+S2(a)[1]+'" x2="'+S2(b)[0]+'" y2="'+S2(b)[1]+'"/>') }); o.push('</g>') }
      f.kids.forEach(function(k){ var kp=k.p.map(pr); o.push('<polygon points="'+poly(kp)+'" fill="'+k.fill+'" stroke="'+k.stroke+'" stroke-width="2.2" stroke-linejoin="round"/>');
        (k.lines||[]).forEach(function(l){ var a=S2(pr(l[0])), b=S2(pr(l[1])); o.push('<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+k.stroke+'" stroke-width="2"/>') }) }) });
    if(!figDone) o.push(person());
    /* dimensions along the visible bottom edges */
    function clampX(x,txt,anchor){ var w=txt.length*7.4, l=anchor==="end"?x-w:(anchor==="middle"?x-w/2:x); if(l<4) x+=4-l; if(l+w>cw-4) x-=l+w-(cw-4); return x }
    function dim(p0,p1,label,off){ var a=pr(p0), b=pr(p1), A=S2(a), B=S2(b), mxp=(+A[0]+ +B[0])/2, myp=(+A[1]+ +B[1])/2+off;
      o.push('<text class="t" x="'+clampX(mxp,label,'middle').toFixed(1)+'" y="'+myp.toFixed(1)+'" text-anchor="middle">'+label+'</text>') }
    var fv=vis([0,0,-1]), lv=vis([-1,0,0]);
    dim([0,0,fv?-.3:M.D+.3],[M.W,0,fv?-.3:M.D+.3],gbpN(M.W)+" m",18);
    dim([lv?-.3:M.W+.3,0,0],[lv?-.3:M.W+.3,0,M.D],gbpN(M.D)+" m",18);
    var hc=S2(pr([lv?M.W:0,M.top,fv?0:M.D]));
    var htx=(M.approx?"≈ ":"")+gbpN(M.top)+" m high"; o.push('<text class="ts" x="'+clampX(+hc[0]+(lv?10:-10),htx,lv?"start":"end").toFixed(1)+'" y="'+Math.max(14,+hc[1]-6)+'" text-anchor="'+(lv?"start":"end")+'">'+htx+"</text>");
    o.push("</svg>");
    host.innerHTML=o.join("");
    host.setAttribute("role","img");
    host.setAttribute("aria-label","Illustrative 3D preview: "+M.sum+" Viewed from the "+facing()+", with a 1.75 m figure for scale.");
    P.querySelector("[data-g3dsum]").textContent=M.sum;
  }
  function facing(){ var a=((yaw%360)+540)%360-180; if(Math.abs(a)<20) return "front"; if(Math.abs(a)>160) return "back"; return (a<0?"front left":"front right").replace("front",Math.abs(a)>100?"back":"front") }
  function req(){ if(!raf) raf=requestAnimationFrame(render) }
  function start(p){
    P=p; last=""; p.querySelector("[data-g3dctl]").hidden=false; req();
    if(!p.__wired){ p.__wired=true;
      p.querySelectorAll("[data-g3drot]").forEach(function(b){ b.addEventListener("click",function(){ yaw+=30*(+b.getAttribute("data-g3drot")); req(); announce() }) });
      p.querySelector("[data-g3dfront]").addEventListener("click",function(){ yaw=-32; req(); announce() });
      var v=p.querySelector("[data-g3dview]"), drag=null;
      v.addEventListener("pointerdown",function(e){ if(e.pointerType==="touch") return; drag={x:e.clientX,y:yaw}; v.setPointerCapture(e.pointerId) });
      v.addEventListener("pointermove",function(e){ if(!drag) return; yaw=drag.y+(e.clientX-drag.x)*.5; req() });
      v.addEventListener("pointerup",function(){ drag=null }); v.addEventListener("pointercancel",function(){ drag=null });
      /* touch: horizontal swipe turns, vertical scroll still scrolls the page (touch-action:pan-y) */
      var t0=null; v.addEventListener("touchstart",function(e){ t0={x:e.touches[0].clientX,y:yaw} },{passive:true});
      v.addEventListener("touchmove",function(e){ if(!t0) return; yaw=t0.y+(e.touches[0].clientX-t0.x)*.6; req() },{passive:true});
      v.addEventListener("touchend",function(){ t0=null; announce() }) }
    /* live: any change in the configurator re-renders (choices are radios, aria-checked buttons and range inputs) */
    var root=p.closest(".ccfg")||document;
    ["click","change","input"].forEach(function(t){ root.addEventListener(t,req,true) });
    mo=new MutationObserver(req); mo.observe(root,{subtree:true,attributes:true,attributeFilter:["aria-checked","aria-pressed","checked","class"]});
    if("ResizeObserver" in window){ ro=new ResizeObserver(req); ro.observe(p) }
    poll=setInterval(req,700); /* state set programmatically (deep links, presets) */
  }
  function announce(){ var s=P&&P.querySelector("[data-g3dsum]"); if(s){ var m=model(); s.textContent=(m?m.sum:"")+" Viewed from the "+facing()+"." } }
  function stop(){ if(mo){ mo.disconnect(); mo=null } if(ro){ ro.disconnect(); ro=null } clearInterval(poll);
    var root=P&&(P.closest(".ccfg")||document); if(root) ["click","change","input"].forEach(function(t){ root.removeEventListener(t,req,true) }) }
  window.GR3D={start:start,stop:stop,model:model};
})();
