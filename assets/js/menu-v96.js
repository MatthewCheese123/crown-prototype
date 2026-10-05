/* v9.6.0 menus: phone menu tabs (Gazebos | Garden rooms) + compare strip helper hooks */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.v96tabs [role=tab]'));
  function pick(t,focus){
    tabs.forEach(function(b){ var on=b===t, p=document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-selected',on?'true':'false'); b.tabIndex=on?0:-1; if(p) p.hidden=!on; });
    if(focus) t.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){ pick(t) });
    t.addEventListener('keydown',function(e){
      var k=e.key, n=k==='ArrowRight'?i+1:k==='ArrowLeft'?i-1:k==='Home'?0:k==='End'?tabs.length-1:null;
      if(n===null) return; e.preventDefault(); pick(tabs[(n+tabs.length)%tabs.length],true);
    });
  });
  /* header Gazebos / Garden rooms on phone open the menu on the matching tab */
  document.addEventListener('click',function(e){
    var h=e.target.closest&&e.target.closest('.htab[data-mm]'); if(!h) return;
    var t=document.getElementById(h.getAttribute('data-mm')==='mm-gr'?'v96t-gr':'v96t-gz'); if(t) pick(t);
  },true);
  /* open on the current section's tab */
  if(/\/garden-rooms\//.test(location.pathname)){ var g=document.getElementById('v96t-gr'); if(g) pick(g); }
})();

/* v9.7.0: phone Signature row expands to the three buildings; menu photos load before a panel opens */
(function(){
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.v97sgb'); if(!b) return;
    var p=document.getElementById(b.getAttribute('aria-controls')), on=b.getAttribute('aria-expanded')!=='true';
    b.setAttribute('aria-expanded',on?'true':'false'); if(p) p.hidden=!on;
  });
  var warmed=false;
  function warm(){ if(warmed) return; warmed=true;
    [].forEach.call(document.querySelectorAll('.mmD img[loading=lazy],.fsmenu img[loading=lazy]'),function(i){ i.loading='eager'; }); }
  [].forEach.call(document.querySelectorAll('.site-h .htab,.site-h .hmenu'),function(t){
    ['pointerenter','focus','touchstart'].forEach(function(ev){ t.addEventListener(ev,warm,{passive:true,once:true}); }); });
  if('requestIdleCallback' in window) requestIdleCallback(warm,{timeout:4000}); else setTimeout(warm,3000);
})();

/* v9.7.0: links to a section inside a closed details panel open it */
(function(){
  function openFor(id){ if(!id) return; var t=document.getElementById(id); if(!t) return;
    var d=t.closest&&t.closest('details'); while(d){ d.open=true; d=d.parentElement&&d.parentElement.closest('details'); } }
  document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a[href*="#"]'); if(!a) return;
    var u=new URL(a.href,location.href); if(u.pathname===location.pathname&&u.hash) openFor(decodeURIComponent(u.hash.slice(1))); },true);
  window.addEventListener('hashchange',function(){ openFor(location.hash.slice(1)); });
  if(location.hash) openFor(location.hash.slice(1));
})();

/* v9.7.0 5B: compare switch (collections | the 3 Signature buildings) */
(function(){
  [].forEach.call(document.querySelectorAll('.v97sw'),function(w){
    var tabs=[].slice.call(w.querySelectorAll('[role=tab]'));
    function pick(t,focus){ tabs.forEach(function(b){ var on=b===t; b.setAttribute('aria-selected',on?'true':'false'); b.tabIndex=on?0:-1;
      var p=document.getElementById(b.getAttribute('aria-controls')); if(p) p.hidden=!on; }); if(focus) t.focus(); }
    tabs.forEach(function(t,i){ t.addEventListener('click',function(){ pick(t); });
      t.addEventListener('keydown',function(e){ var k=e.key,n=k==='ArrowRight'?i+1:k==='ArrowLeft'?i-1:k==='Home'?0:k==='End'?tabs.length-1:null;
        if(n===null) return; e.preventDefault(); pick(tabs[(n+tabs.length)%tabs.length],true); }); });
    if(/[#&]compare-signature/.test(location.hash)) pick(tabs[1]);
  });
})();

/* v9.7.0 10A: the gazebo finder marks "All" so phones show a heading per range */
(function(){
  var ml=document.getElementById('mlist'), all=document.querySelector('.chip[data-key=range][data-f=all]'); if(!ml||!all) return;
  function upd(){ if(all.getAttribute('aria-pressed')==='true') ml.setAttribute('data-v97all',''); else ml.removeAttribute('data-v97all'); }
  new MutationObserver(upd).observe(all,{attributes:true,attributeFilter:['aria-pressed']}); upd();
})();
