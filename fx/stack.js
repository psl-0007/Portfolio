/* fx:stack — pinned card stacking ("overlapping deck") for #work.
   Each project card pins just under the fixed bar (successive cards sit a few px lower so the
   edges of the stack peek out). As the next card scrolls up over it, the card behind scales to
   0.94 and its content dims. The last card is not pinned; once it arrives the whole deck leaves
   together. Only runs on desktop widths with a fine pointer and motion allowed; a card that is
   too tall to fit the viewport is simply left in normal flow. */
(function () {
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  var SCALE = 0.94;
  var DIM = 0.45;
  var STEP = 14;                          // px each deck position sits below the previous one
  var QUERY = '(prefers-reduced-motion: no-preference) and (min-width: 900px) and (hover: hover) and (pointer: fine)';
  var root = document.documentElement;
  var mm = null;

  function setup() {
    mm = gsap.matchMedia();
    mm.add(QUERY, function () {
      var cards = gsap.utils.toArray('#work .work');
      if (cards.length < 2) return;
      var count = cards.length;
      var last = cards[count - 1];

      var bar = parseFloat(getComputedStyle(root).getPropertyValue('--bar')) || 64;
      var offsets = cards.map(function (_, i) { return bar + 24 + i * STEP; });

      // A pinned card must fit under the bar with some air (offsetHeight ignores transforms, so
      // this is the unscaled height). The last card never pins, it just arrives, so it may be any
      // height. The deck is all-or-nothing: with one card left in flow the stack would look broken,
      // so if any pinned card is too tall the whole section stays in normal flow.
      // Measure WITH the stack styling on (its card padding makes the cards taller), by switching the
      // class on for the measurement only, so the decision matches what the user would actually see.
      var fits = function (card, i) { return card.offsetHeight + offsets[i] <= window.innerHeight - 16; };
      var signature = function () {
        var had = root.classList.contains('fx-stack');
        if (!had) root.classList.add('fx-stack');
        var sig = cards.slice(0, -1).map(function (c, i) { return fits(c, i) ? 1 : 0; }).join('');
        if (!had) root.classList.remove('fx-stack');
        return sig;
      };
      var built = signature();
      var active = built.indexOf('0') === -1;

      // Layout settles after first paint (fonts, the SplitText line split, other effects' layout), so
      // a single measurement at load is not trustworthy. Re-check on every ScrollTrigger refresh,
      // resize, load, fonts-ready and once more shortly after; rebuild only if the answer changed.
      var timer;
      var recheck = function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (signature() === built) return;
          mm.revert();
          setup();
          ScrollTrigger.refresh();
        }, 200);
      };
      var late = setTimeout(recheck, 2000);
      window.addEventListener('resize', recheck);
      window.addEventListener('load', recheck);
      ScrollTrigger.addEventListener('refresh', recheck);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(recheck);
      var cleanupListeners = function () {
        clearTimeout(timer);
        clearTimeout(late);
        window.removeEventListener('resize', recheck);
        window.removeEventListener('load', recheck);
        ScrollTrigger.removeEventListener('refresh', recheck);
      };
      if (!active) return cleanupListeners;

      var focusCleanups = [];
      root.classList.add('fx-stack');
      cards.forEach(function (c, i) { c.style.zIndex = String(i + 1); });

      cards.forEach(function (card, i) {
        if (i === count - 1) return;
        var next = cards[i + 1];
        var coverStart = function () { return 'top top+=' + (offsets[i] + card.offsetHeight); };
        var coverEnd = function () { return 'top top+=' + offsets[i + 1]; };

        // Pin until the last card reaches its own deck position, then the deck leaves as one.
        ScrollTrigger.create({
          trigger: card,
          start: function () { return 'top top+=' + offsets[i]; },
          endTrigger: last,
          end: function () { return 'top top+=' + offsets[count - 1]; },
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true
        });

        // Scale the card and dim its content while the next card covers it. Opacity goes on the
        // content, not the surface, so an earlier card never ghosts through a later one.
        var cover = { trigger: next, start: coverStart, end: coverEnd, scrub: true, invalidateOnRefresh: true };
        var coverTween = gsap.to(card, { scale: SCALE, ease: 'none', scrollTrigger: cover });
        gsap.to(card.children, { opacity: DIM, ease: 'none', scrollTrigger: cover });

        // Keyboard: Tab or Shift+Tab can land on a link in a card the next card has already covered
        // (WCAG 2.2 SC 2.4.11). Scroll back to where this card is still fully in view, which is the
        // scroll position at which the next card starts to cover it.
        var onFocusIn = function () {
          var y = coverTween.scrollTrigger.start;
          if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'instant' });
        };
        card.addEventListener('focusin', onFocusIn);
        focusCleanups.push(function () { card.removeEventListener('focusin', onFocusIn); });
      });

      return function () {
        cleanupListeners();
        focusCleanups.forEach(function (fn) { fn(); });
        root.classList.remove('fx-stack');
        cards.forEach(function (c) {
          c.style.zIndex = '';
          gsap.set(c, { clearProps: 'transform,scale' });
          gsap.set(c.children, { clearProps: 'opacity' });
        });
      };
    });
  }

  setup();
})();
