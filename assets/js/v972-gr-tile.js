/* v972: homepage Garden rooms tile carousel — dots + keyboard. CSS scroll-snap does the swiping.
   Opt out of global scrollcue (soft white edge masks + floating chevrons) so photos stay full-bleed. */
(function () {
  "use strict";
  var root = document.querySelector(".v972gr");
  if (!root) return;
  var sw = root.querySelector(".v972sw");
  var dots = root.querySelectorAll(".v972dots button");
  if (!sw || dots.length < 2) return;

  // Ensure scrollcue never (re)claims this full-bleed tile carousel.
  sw.__scq = 1;
  sw.classList.remove("scq-row", "scq-ml", "scq-mr", "scq-solid");
  var sid = sw.getAttribute("data-scq");
  if (sid) {
    var stale = document.querySelectorAll('.scq[data-scq-for="' + sid + '"]');
    for (var s = 0; s < stale.length; s++) stale[s].remove();
    sw.removeAttribute("data-scq");
  }

  var cur = 0, raf = 0;
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  function go(i) {
    i = Math.max(0, Math.min(dots.length - 1, i));
    sw.scrollTo({ left: i * sw.clientWidth, behavior: reduce ? "auto" : "smooth" });
    setCur(i);
  }
  function setCur(i) {
    cur = i;
    for (var k = 0; k < dots.length; k++) {
      if (k === i) dots[k].setAttribute("aria-current", "true");
      else dots[k].removeAttribute("aria-current");
    }
  }
  for (var i = 0; i < dots.length; i++) {
    (function (n) {
      dots[n].addEventListener("click", function () { go(n); });
    })(i);
  }
  sw.addEventListener("scroll", function () {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var i = Math.round(sw.scrollLeft / Math.max(1, sw.clientWidth));
      if (i !== cur) setCur(i);
    });
  }, { passive: true });
  sw.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    go(cur + (e.key === "ArrowRight" ? 1 : -1));
  });
})();
