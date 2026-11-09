/* fx:curtain. As the About band finishes, the page lifts like a stage curtain and reveals the dark
   #contact + footer anchored underneath; the "Let's talk." heading grows 0.85 -> 1 as it emerges.

   Mechanism (CSS in fx/curtain.css): contact and footer are `position: sticky` to the viewport
   bottom and painted beneath the sections above, so the document height never changes.

   Why the extra plumbing: sticky moves the element's *rect* (not its layout position), and both
   ScrollTrigger (main.js' nav highlight) and Lenis (anchor clicks) read rects.
     - ScrollTrigger: the class is dropped on `refreshInit` and restored on `refresh`, so every
       trigger on the page measures the natural layout.
     - Lenis: a capture-phase click handler takes over `#contact` anchors (the target is the end
       of the page, where the layer is fully revealed).
     - Keyboard: focus landing in the covered layer scrolls to the end so it is never hidden. */
(function () {
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  var root = document.documentElement;
  var contact = document.getElementById('contact');
  var foot = document.querySelector('.foot');
  var title = document.querySelector('.contact__title');
  if (!contact || !foot || !title) return;

  gsap.registerPlugin(ScrollTrigger);

  // Dark contact for everyone who runs JS, including reduced-motion users (static, no curtain).
  root.classList.add('fx-curtain-skin');

  var mm = gsap.matchMedia();

  // >= 720px only: on phones the collapsing browser toolbar changes the viewport height without a
  // refresh, which would leave the heading under the header. They keep the static dark contact.
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 720px)', function () {
    var H = 0;           // contact height
    var F = 0;           // footer height
    var titleBottom = 0; // title bottom edge, measured from contact's top
    var titleTop = 0;    // title top edge at full size, measured from contact's top
    var live = false;
    var barH = 64;       // fixed header, same as --bar
    var scrollTween = null;

    function measure() {
      H = contact.offsetHeight;
      F = foot.offsetHeight;
      // Measure the heading at full size: the 0.85 scale moves its rect, and its origin depends
      // on whether the reveal class is on. Both rects shift together under sticky, so the
      // difference to contact's top is stable.
      var inline = title.style.transform;
      title.style.transform = 'none';
      titleBottom = title.getBoundingClientRect().bottom - contact.getBoundingClientRect().top;
      titleTop = titleBottom - title.offsetHeight;
      title.style.transform = inline;
      var bar = parseFloat(getComputedStyle(root).getPropertyValue('--bar'));
      if (bar) barH = bar;
    }

    // The curtain only works if the heading clears the fixed header once the layer is fully
    // revealed (contact's own top padding may slide under it). Shorter screens fall back to the
    // static dark contact, and this is re-evaluated on every refresh (resize, font load...).
    function fits() { return window.innerHeight - F - H + titleTop >= barH + 4; }

    function natural() {
      live = false;
      root.classList.remove('fx-curtain');
    }
    function apply() {
      measure();
      live = fits();
      root.style.setProperty('--curtain-foot', F + 'px');
      root.classList.toggle('fx-curtain', live);
    }

    ScrollTrigger.addEventListener('refreshInit', natural);
    ScrollTrigger.addEventListener('refresh', apply);

    // Heading: 0.85 -> 1 over the stretch where the curtain edge uncovers it, ending exactly when
    // the layer is fully revealed (contact's top at viewport height - footer - contact).
    measure();
    var grow = gsap.fromTo(title,
      { scale: 0.85 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: contact,
          start: function () { return 'top ' + Math.round(window.innerHeight - F - H + titleBottom); },
          end: function () { return 'top ' + Math.round(window.innerHeight - F - H); },
          scrub: true,
          invalidateOnRefresh: true
        }
      });

    // ---- anchors -----------------------------------------------------------------------------
    function stopTween() {
      if (!scrollTween) return;
      scrollTween.kill();
      scrollTween = null;
      window.removeEventListener('wheel', stopTween);
      window.removeEventListener('touchstart', stopTween);
      window.removeEventListener('keydown', stopTween);
    }
    function glideToEnd() {
      stopTween();
      var proxy = { y: window.scrollY };
      var dist = Math.abs(ScrollTrigger.maxScroll(window) - proxy.y);
      scrollTween = gsap.to(proxy, {
        y: function () { return ScrollTrigger.maxScroll(window); },
        duration: Math.min(1.8, Math.max(0.6, dist / 2200)),
        ease: 'power3.inOut',
        onUpdate: function () { window.scrollTo(0, proxy.y); },
        onComplete: stopTween
      });
      // The user taking over cancels the glide.
      window.addEventListener('wheel', stopTween, { passive: true });
      window.addEventListener('touchstart', stopTween, { passive: true });
      window.addEventListener('keydown', stopTween);
    }
    // Capture phase on window runs before Lenis' own click listener (bubble phase, same target).
    function onClick(e) {
      if (!live || e.defaultPrevented || e.button) return;
      var a = e.target.closest ? e.target.closest('a[href="#contact"]') : null;
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      glideToEnd();
      if (window.history && history.pushState) history.pushState(null, '', '#contact');
    }
    window.addEventListener('click', onClick, true);

    // ---- keyboard ----------------------------------------------------------------------------
    // Focus moving into the layer while it is still covered would be invisible: browsers only
    // scroll a focused element into view if it is off screen, and sticky keeps it "on screen".
    function onFocusIn(e) {
      if (!live) return;
      if (!contact.contains(e.target) && !foot.contains(e.target)) return;
      var max = ScrollTrigger.maxScroll(window);
      if (max - window.scrollY > 2) {
        stopTween();
        window.scrollTo(0, max);
      }
    }
    document.addEventListener('focusin', onFocusIn);

    // First pass: let the whole page re-measure with the reveal class applied afterwards.
    ScrollTrigger.refresh();

    return function () {
      stopTween();
      window.removeEventListener('click', onClick, true);
      document.removeEventListener('focusin', onFocusIn);
      ScrollTrigger.removeEventListener('refreshInit', natural);
      ScrollTrigger.removeEventListener('refresh', apply);
      if (grow.scrollTrigger) grow.scrollTrigger.kill();
      gsap.set(title, { clearProps: 'transform' });
      root.classList.remove('fx-curtain');
      root.style.removeProperty('--curtain-foot');
    };
  });
})();
