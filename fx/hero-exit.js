/* fx:hero-exit
   Scrubbed hero exit. As the hero scrolls away the two name lines separate in depth
   (PANSHUL drifts up faster and comes forward, SHARMA drifts slower and recedes) while the bio,
   role and facts fade out with a soft blur.

   Writes only to properties the entrance (main.js buildKineticName + the hero [data-in] timeline)
   never touches: transforms on the .kh-row lines (the entrance animates the letters inside them),
   opacity on the .hero__grid wrapper (the entrance fades its children), and filter on the copy
   blocks. Progress 0 is the identity for all of them, so scroll 0 is pixel-identical to before. */
(function () {
  'use strict';
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  var root = document.documentElement;
  var CLS = 'fx-hero-exit';
  var hero = document.querySelector('.hero');
  var name = document.querySelector('.hero [data-kinetic]');
  var grid = document.querySelector('.hero__grid');
  if (!hero || !name || !grid) return;

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    root.classList.add(CLS);

    var tl = null;
    var observer = null;

    // Lines are .kh-row once the kinetic entrance has built them (after fonts load), or the
    // original <span> lines if it never does. Looked up fresh each build, so a rebuild by
    // main.js (its own matchMedia re-run restores the h1 and builds new rows) is picked up.
    function lines() {
      var rows = name.querySelectorAll(':scope > .kh-row');
      return rows.length ? rows : name.querySelectorAll(':scope > span');
    }

    function teardown() {
      if (tl) {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
        tl = null;
      }
      gsap.set(name.querySelectorAll(':scope > *'), { clearProps: 'transform,transformPerspective,willChange' });
      gsap.set([grid, '.hero__role', '.hero__bio', '.facts'], { clearProps: 'opacity,filter,willChange' });
    }

    function build() {
      teardown();
      var l = lines();
      if (l.length < 2) return;
      var first = l[0];
      var second = l[1];

      tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });

      // Name: separation in depth. yPercent is relative to each line's own height.
      tl.to(first, {
        yPercent: -40,
        z: 40,
        rotationX: 6,
        transformPerspective: 900,
        transformOrigin: '50% 100%'
      }, 0)
        .to(second, {
          yPercent: -20,
          z: -40,
          rotationX: -4,
          transformPerspective: 900,
          transformOrigin: '50% 0%'
        }, 0);

      // Copy: holds for the first third of the exit, then fades and blurs out. The wrapper carries
      // opacity (the entrance owns opacity on its children); the small blocks carry the blur.
      tl.to(grid, { opacity: 0, duration: 0.55 }, 0.3)
        .to(['.hero__role', '.hero__bio', '.facts'], { filter: 'blur(8px)', duration: 0.55 }, 0.3);
    }

    build();

    // main.js rebuilds the h1 (restore, then new rows) when its own motion query re-runs.
    if (window.MutationObserver) {
      observer = new MutationObserver(function () {
        var rows = name.querySelectorAll(':scope > .kh-row');
        // Rebuild only when the set of lines actually changed under us.
        if (!tl || !rows.length || tl.__first !== rows[0]) {
          build();
          if (tl) tl.__first = lines()[0];
        }
      });
      observer.observe(name, { childList: true });
    }
    if (tl) tl.__first = lines()[0];

    return function () {
      if (observer) observer.disconnect();
      teardown();
      root.classList.remove(CLS);
    };
  });
})();
