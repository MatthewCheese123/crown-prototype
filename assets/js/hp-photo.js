/* v8.7.2 (Hampton and gazebo model pages): the extras and foundation steps no longer show small thumbnails.
   A quiet "See photo" link opens the existing full-size photo in a single-photo lightbox (native modal dialog:
   focus is kept inside, Escape or the close button closes it, focus returns to the link). */
(function(){
"use strict";
var links=document.querySelectorAll(".hpsee[data-hpphoto]"); if(!links.length) return;
var dlg=null,img,cap,back=null;
function build(){
  dlg=document.createElement("dialog");dlg.className="hpph";dlg.setAttribute("aria-labelledby","hpph-cap");
  dlg.innerHTML='<div class="hpph-i"><button type="button" class="hpph-x" aria-label="Close photo">✕</button><figure><img alt=""><figcaption id="hpph-cap"></figcaption></figure></div>';
  document.body.appendChild(dlg);img=dlg.querySelector("img");cap=dlg.querySelector("figcaption");
  dlg.querySelector(".hpph-x").addEventListener("click",function(){dlg.close()});
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
  dlg.addEventListener("close",function(){document.documentElement.classList.remove("hpph-open");if(back&&back.isConnected)back.focus()});
}
[].forEach.call(links,function(a){a.addEventListener("click",function(e){
  e.preventDefault();e.stopPropagation();if(!dlg)build();back=a;
  img.src=a.getAttribute("data-hpphoto");img.alt=a.getAttribute("data-hpphoto-cap")||"";cap.textContent=a.getAttribute("data-hpphoto-cap")||"";
  document.documentElement.classList.add("hpph-open");dlg.showModal();dlg.querySelector(".hpph-x").focus()})});
})();
