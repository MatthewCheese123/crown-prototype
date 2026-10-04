/* v8.5.4 · Hampton only · "Look closer" carousel. No autoplay; respects reduced motion. */
(function(){var r=document.getElementById('why-crown');if(!r)return;
var t=r.querySelector('.wcz-wtrk'),c=t?t.children:[],n=c.length;if(!n)return;
var bi=r.querySelector('.wcz-wbar i'),cn=r.querySelector('.wcz-wcnt'),pv=r.querySelector('[data-wc="prev"]'),nx=r.querySelector('[data-wc="next"]');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function step(){return n>1?c[1].offsetLeft-c[0].offsetLeft:t.clientWidth}
function p2(v){return(v<10?'0':'')+v}
function up(){var max=t.scrollWidth-t.clientWidth,x=t.scrollLeft,i=Math.min(n-1,Math.round(x/step()));if(max>0&&x>=max-4)i=n-1;
 var vis=Math.min(1,t.clientWidth/t.scrollWidth),f=max>0?x/max:0;
 if(bi){bi.style.width=(vis*100)+'%';bi.style.left=(f*(100-vis*100))+'%'}
 if(cn)cn.textContent=p2(i+1)+' / '+p2(n);
 if(pv)pv.disabled=x<4;if(nx)nx.disabled=x>max-4;}
function go(d){t.scrollBy({left:d*step(),behavior:rm?'auto':'smooth'})}
if(pv)pv.addEventListener('click',function(){go(-1)});if(nx)nx.addEventListener('click',function(){go(1)});
t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}});
t.addEventListener('scroll',up,{passive:true});window.addEventListener('resize',up);up();
function cue(){var id=t.getAttribute('data-scq');if(!id)return;var b=document.querySelectorAll('.scq[data-scq-for="'+id+'"]');for(var k=0;k<b.length;k++)b[k].classList.add('wcz-off')}
cue();window.addEventListener('load',function(){cue();setTimeout(cue,600)});})();
