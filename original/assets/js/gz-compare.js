/* Gazebos hub compare (v8.2): swipe dots, same behaviour as the garden-rooms compare */
(function(){var c=document.querySelector("[data-gzcards]"),d=document.querySelectorAll("[data-gzdots] i");if(!c||!d.length)return;
c.addEventListener("scroll",function(){var cs=c.querySelectorAll(".gz-col"),best=0,bd=1e9;cs.forEach(function(e,i){var x=Math.abs(e.getBoundingClientRect().left-c.getBoundingClientRect().left);if(x<bd){bd=x;best=i}});d.forEach(function(e,i){e.classList.toggle("on",i===best)})},{passive:true})})();
