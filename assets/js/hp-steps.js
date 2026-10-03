/* v8.7.2 (Hampton and model pages): the gold stepper on the configurator step tabs (styles in hp-steps.css) and
   "Next: <step> →" / "← Back" at the end of each step. Steps stay ordinary tabs, so any step can be opened at any time.
   A step counts as done once it has been visited and left (tick in its circle, ", done" for screen readers). */
(function(){
"use strict";
var root=document.querySelector("[data-hpcfg]"), tl=root&&root.querySelector(".btabs[role=tablist]"); if(!tl) return;
document.documentElement.classList.add("hpst");
var tabs=[].slice.call(tl.querySelectorAll("[role=tab]"));
var name=function(t){var b=t.querySelector("b");return b?b.textContent.trim():t.textContent.trim()};
tabs.forEach(function(t){var dn=document.createElement("span");dn.className="tb-dn";t.appendChild(dn)});
var last=null;
function mark(){var cur=tabs.filter(function(t){return t.getAttribute("aria-selected")==="true"})[0];
  if(last&&cur!==last&&!last.classList.contains("hpsum")){last.setAttribute("data-done","");last.querySelector(".tb-dn").textContent=", done"}
  last=cur}
mark(); new MutationObserver(mark).observe(tl,{attributes:true,subtree:true,attributeFilter:["aria-selected"]});
function px(v){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v))||0}
function go(i){var t=tabs[i]; if(!t) return; t.click();
  var pnl=root.querySelector(".bpanel")||document.getElementById(t.getAttribute("aria-controls"));
  requestAnimationFrame(function(){var top=pnl.getBoundingClientRect().top, want=px("--hdrvis")+(tl.offsetHeight||px("--btabsh"))+8;
    if(top<want||top>innerHeight*0.5){var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;scrollTo({top:Math.max(0,top+scrollY-want),behavior:rm?"auto":"smooth"})}
    t.focus({preventScroll:true})})}
tabs.forEach(function(t,i){
  var p=document.getElementById(t.getAttribute("aria-controls")); if(!p) return;
  var nav=document.createElement("div"); nav.className="hpnav"+(i===tabs.length-1?" hpnav-last":"");
  if(i<tabs.length-1){var n=document.createElement("button");n.type="button";n.className="hpnext";n.innerHTML="Next: "+name(tabs[i+1])+' <span aria-hidden="true">→</span>';
    n.addEventListener("click",function(){go(i+1)});nav.appendChild(n)}
  if(i>0){var b=document.createElement("button");b.type="button";b.className="hpback";b.innerHTML='<span aria-hidden="true">←&nbsp;</span>Back<span class="sr">: '+name(tabs[i-1])+'</span>';
    b.addEventListener("click",function(){go(i-1)});nav.appendChild(b)}
  if(!nav.children.length) return;
  /* the summary already ends with its primary CTA (Book a show-site visit): only Back is added, after it */
  p.appendChild(nav)});
})();
