/* fx:shots — preview frames inside each .work__main.
   - Entrance: the frame slides in from a 3D tilt (rotateX 15deg, rotateY -8deg) once its card enters.
   - Scrub (>=900px): the inner body keeps tilting while you scroll past (scrub: 1).
   Perspective is set on the element itself (transformPerspective) rather than on .work__main: the
   frame sits in the numeral column, so the parent's centre would put the vanishing point far away.
   Reduced motion: the frame is shown flat and static. No JS: the figure keeps its `hidden` attribute. */
(function () {
  if (!(window.gsap && window.ScrollTrigger)) return;
  var shots = document.querySelectorAll('.shot');
  if (!shots.length) return;
  gsap.registerPlugin(ScrollTrigger);

  var root = document.documentElement;
  var mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      wide: '(min-width: 900px)'
    },
    function (context) {
      var motion = context.conditions.motion;
      var wide = context.conditions.wide;

      // Visible in every mode once JS is running; only the tilt below depends on motion.
      root.classList.add('fx-shots');
      shots.forEach(function (s) { s.removeAttribute('hidden'); });

      if (motion) root.classList.add('fx-shots-motion');

      // Fit each frame to the numeral column it actually lives in. Other effects (the two-column
      // pinned-header layout, for one) change that column, so nothing here assumes a formula.
      // offset* values ignore transforms, so a scaled or pinned card cannot skew the numbers.
      function fit() {
        shots.forEach(function (fig) {
          var main = fig.closest('.work__main');
          var num = main && main.parentNode.querySelector('.work__num');
          if (!main || !num) return;
          if (!wide) {
            ['--shot-col', '--shot-gap', '--shot-num-h'].forEach(function (p) { fig.style.removeProperty(p); });
            return;
          }
          var cs = getComputedStyle(num);
          var lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 0.85;
          fig.style.setProperty('--shot-col', num.offsetWidth + 'px');
          fig.style.setProperty('--shot-gap', Math.max(0, main.offsetLeft - (num.offsetLeft + num.offsetWidth)) + 'px');
          fig.style.setProperty('--shot-num-h', lh + 'px');
        });
      }
      fit();
      ScrollTrigger.addEventListener('refresh', fit);

      if (motion) {
        shots.forEach(function (fig) {
          var card = fig.closest('.work');
          var body = fig.querySelector('.shot__body');
          if (!card || !body) return;

          // Entrance: plays once when the card comes in.
          gsap.from(fig, {
            opacity: 0,
            y: 48,
            rotateX: 15,
            rotateY: -8,
            transformPerspective: 900,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 80%', once: true }
          });

          // Scrub: only on wide screens, never on touch-sized layouts.
          if (wide) {
            gsap.set(body, { transformPerspective: 900, transformOrigin: '50% 50%' });
            gsap.fromTo(body,
              { rotateX: 10, rotateY: -8 },
              {
                rotateX: -10,
                rotateY: 5,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                  invalidateOnRefresh: true,
                  // will-change only while the card is on screen
                  onToggle: function (self) { fig.classList.toggle('is-live', self.isActive); }
                }
              });
          }
        });
      }

      return function () {
        ScrollTrigger.removeEventListener('refresh', fit);
        root.classList.remove('fx-shots', 'fx-shots-motion');
        shots.forEach(function (s) {
          s.setAttribute('hidden', '');
          s.classList.remove('is-live');
          ['--shot-col', '--shot-gap', '--shot-num-h'].forEach(function (p) { s.style.removeProperty(p); });
        });
      };
    }
  );
})();
