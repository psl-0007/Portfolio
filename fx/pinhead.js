/* fx:pinhead. Turns on the pinned-header layout for #work (see fx/pinhead.css).
   The pinning itself is CSS position: sticky, so this module only decides *when* the layout is
   active (>= 900px wide, motion allowed) and re-measures ScrollTrigger after the layout changes. */
(function () {
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  var root = document.documentElement;
  var mm = gsap.matchMedia();

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
    if (!document.querySelector('#work > .wrap > .sec-head')) return;

    root.classList.add('fx-pinhead');
    // The class moves everything inside and below #work, so every trigger needs new positions.
    var raf = requestAnimationFrame(function () { ScrollTrigger.refresh(); });

    return function () {
      cancelAnimationFrame(raf);
      root.classList.remove('fx-pinhead');
      requestAnimationFrame(function () { ScrollTrigger.refresh(); });
    };
  });
})();
