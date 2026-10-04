/* v8.9: Eden / Orangery version switch (option A + Clara's fixes). Vanilla JS, no network calls. */
(function(){
  "use strict";
  var hero=document.querySelector("#hero[data-v9fam]"), dj=document.getElementById("v9-versions");
  if(!hero||!dj) return;
  var data; try{ data=JSON.parse(dj.textContent); }catch(e){ return; }
  var by={}; data.forEach(function(d){ by[d.v]=d; });
  var me=hero.getAttribute("data-v9me"), sw=hero.querySelector(".v9sw"); if(!sw||!by[me]) return;
  var q=function(s){ return hero.querySelector(s); };
  var price=q(".hpv-price"), fur=q("[data-v9fur]"), sub=q(".hpv-sub"), f4=q(".f4"), story=q(".story"),
      crumb=document.querySelector("[data-v9crumb]"), crumbM=document.querySelector("[data-v9crumbm]"), vn=q("[data-v9vn]"), go=q(".hpv-go");
  var bv=document.querySelectorAll(".v9bvo"), bh=document.querySelector("[data-v9bh]"), cfg=document.querySelector("#design .ccfg[data-hpcfg]");
  var orig={go:go&&go.getAttribute("href"),goT:go&&go.textContent};
  /* the other version's photo sits over the gallery (desktop main image and the mobile swipe strip alike) and cross-fades in 200ms */
  var gm=q(".gmain"), ov=document.createElement("img"); ov.className="v9ai"; ov.alt=""; ov.setAttribute("aria-hidden","true"); ov.decoding="async"; if(gm) gm.appendChild(ov);
  var books=[].slice.call(document.querySelectorAll("main a[href*='visit-us/index.html?model='], .stk a[href*='visit-us/index.html?model=']"));
  books.forEach(function(a){ a.setAttribute("data-v9o",a.getAttribute("href")); });
  var live=document.createElement("p"); live.className="sr"; live.setAttribute("aria-live","polite"); sw.after(live);
  var curV=me;
  function setPrice(d){
    if(!price) return; var n=price.firstChild;
    if(n&&n.nodeType===3&&/From £[\d,]+ inc\. VAT/.test(n.nodeValue)) n.nodeValue=n.nodeValue.replace(/From £[\d,]+ inc\. VAT/,d.price);
    else { var w=document.createTreeWalker(price,NodeFilter.SHOW_TEXT,null), t; while((t=w.nextNode())){ if(/From £[\d,]+ inc\. VAT/.test(t.nodeValue)){ t.nodeValue=t.nodeValue.replace(/From £[\d,]+ inc\. VAT/,d.price); break; } } }
  }
  function apply(v,anim,user){
    var d=by[v]; if(!d) return; curV=v;
    var mine=(v===me);
    [].forEach.call(document.querySelectorAll(".v9sw"),function(g){ [].forEach.call(g.querySelectorAll(".v9seg"),function(b){ var on=b.getAttribute("data-v")===v; b.setAttribute("aria-checked",on?"true":"false"); b.tabIndex=on?0:-1; }); });
    hero.classList.toggle("v9-alt",!mine);
    if(gm){ if(mine){ ov.classList.remove("on"); ov.setAttribute("aria-hidden","true"); }
      else if(ov.getAttribute("src")!==d.img){ var sw2=function(){ ov.src=d.img; ov.alt=d.alt; ov.removeAttribute("aria-hidden"); ov.classList.add("on"); };
        if(anim&&ov.classList.contains("on")){ ov.classList.remove("on"); setTimeout(sw2,200); } else sw2(); }
      else { ov.classList.add("on"); ov.removeAttribute("aria-hidden"); } }
    setPrice(d);
    if(fur){ fur.textContent=d.fur; fur.hidden=!d.fur; }
    if(sub) sub.innerHTML=d.sub; if(f4) f4.innerHTML=d.f4; if(story&&d.story) story.innerHTML=d.story;
    if(crumb){ crumb.textContent=d.range; crumb.setAttribute("href",crumb.getAttribute("href").replace(/#range-\w+/,"#range-"+d.rk)); }
    if(crumbM) crumbM.textContent=d.name;
    if(vn) vn.textContent=d.name.replace(/^Crown \S+/,"");
    if(go){ go.setAttribute("href",mine?orig.go:d.url+"?v="+v+"#design"); go.textContent="Design your "+d.name.replace(/^Crown /,""); }
    books.forEach(function(a){ a.setAttribute("href",a.getAttribute("data-v9o").replace(/model=[^&#]*/,"model="+encodeURIComponent(d.name))); });
    [].forEach.call(bv,function(a){ if(a.getAttribute("data-v")===v) a.setAttribute("aria-current","true"); else a.removeAttribute("aria-current"); });
    if(bh&&cfg){ bh.hidden=mine; cfg.hidden=!mine;
      var n=bh.querySelector("[data-v9bhn]"), ba=bh.querySelector("[data-v9bha]"); if(n) n.textContent="The "+d.name; if(ba){ ba.setAttribute("href",d.url+"?v="+v+"#design"); ba.textContent="Design the "+d.name.replace(/^Crown /,""); } }
    document.title=document.title.replace(/^Crown \S+( Glazed| Insulated)?/,d.name);
    if(user){ live.textContent=d.name+", "+d.price+(d.fur?", "+d.fur:"");
      try{ var u=new URL(location.href); u.searchParams.set("v",v); history.replaceState(history.state,"",u.pathname+u.search+u.hash); }catch(e){} }
  }
  function bind(g){
    g.addEventListener("click",function(e){ var b=e.target.closest(".v9seg"); if(b) apply(b.getAttribute("data-v"),true,true); });
    g.addEventListener("keydown",function(e){
      var k=e.key; if(["ArrowRight","ArrowLeft","ArrowDown","ArrowUp","Home","End"].indexOf(k)<0) return; e.preventDefault();
      var bs=[].slice.call(g.querySelectorAll(".v9seg")), i=bs.findIndex(function(b){ return b.getAttribute("data-v")===curV; });
      i=k==="Home"?0:k==="End"?bs.length-1:(i+((k==="ArrowRight"||k==="ArrowDown")?1:-1)+bs.length)%bs.length;
      apply(bs[i].getAttribute("data-v"),true,true); bs[i].focus();
    });
  }
  bind(sw);
  /* mobile: the switch stays pinned under the header once its own row scrolls away */
  var pin=document.createElement("div"); pin.className="v9swf"; pin.setAttribute("aria-hidden","true");
  var cl=sw.cloneNode(true); cl.removeAttribute("aria-label"); [].forEach.call(cl.querySelectorAll(".v9seg"),function(b){ b.tabIndex=-1; });
  pin.appendChild(cl); document.body.appendChild(pin);
  cl.addEventListener("click",function(e){ var b=e.target.closest(".v9seg"); if(b) apply(b.getAttribute("data-v"),true,true); });
  var hdr=document.querySelector(".site-h"), mq=window.matchMedia("(max-width:899px)");
  function onScroll(){
    if(!mq.matches){ pin.classList.remove("on"); return; }
    var hb=hdr?Math.max(0,hdr.getBoundingClientRect().bottom):0, r=sw.getBoundingClientRect();
    document.documentElement.style.setProperty("--v9top",Math.round(hb)+"px");
    pin.classList.toggle("on",r.bottom<hb+4 && hero.getBoundingClientRect().bottom>-2000);
  }
  window.addEventListener("scroll",onScroll,{passive:true}); window.addEventListener("resize",onScroll);
  /* ?v=glazed (or #glazed / #insulated / #open) opens that version in place */
  var p=new URLSearchParams(location.search).get("v"), h=(location.hash||"").slice(1);
  var start=by[p]?p:(by[h]?h:me);
  apply(start,false,false);
  onScroll();
})();
