/* v9.6.0 (13A): compare bar as one row: thumbs with ×, empty + slots, "Compare (n)" */
(function(){
  var tray=document.querySelector("[data-cmptray]"); if(!tray) return;
  var th=tray.querySelector("[data-cmpthumbs]"), go=tray.querySelector("[data-cmpgo]");
  function build(){
    var cks=[].slice.call(document.querySelectorAll("input[data-cmp]")).filter(function(x){return x.checked});
    th.textContent="";
    cks.forEach(function(x){
      var b=document.createElement("button"); b.type="button"; b.className="v96th";
      b.setAttribute("aria-label","Remove "+x.getAttribute("data-name")+" from compare");
      var im=document.createElement("img"); im.src=x.getAttribute("data-img"); im.alt=""; b.appendChild(im);
      var xx=document.createElement("span"); xx.className="v96x"; xx.setAttribute("aria-hidden","true"); xx.textContent="×"; b.appendChild(xx);
      b.addEventListener("click",function(){ x.checked=false; x.dispatchEvent(new Event("change",{bubbles:true})); var n=th.querySelector(".v96th")||go; if(n&&!n.disabled) n.focus(); else x.focus() });
      th.appendChild(b) });
    for(var i=cks.length;i<3;i++){ var e=document.createElement("span"); e.className="v96empty"; e.setAttribute("aria-hidden","true"); e.textContent="+"; th.appendChild(e) }
    go.textContent="Compare ("+cks.length+")";
  }
  document.addEventListener("change",function(e){ if(e.target.matches&&e.target.matches("input[data-cmp]")) build() });
  var cl=tray.querySelector("[data-cmpclear]"); if(cl) cl.addEventListener("click",build);
  build();
})();
