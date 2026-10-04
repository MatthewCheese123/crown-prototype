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
