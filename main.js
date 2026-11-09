(function () {
  var root = document.documentElement;

  if (!(window.gsap && window.ScrollTrigger && window.SplitText)) {
    root.classList.add('js-fallback');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Current-section marker in the nav (state, not motion: runs for everyone).
  var navLinks = document.querySelectorAll('[data-nav]');
  ['work', 'about', 'contact'].forEach(function (id) {
    ScrollTrigger.create({
      trigger: '#' + id,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: function (self) {
        navLinks.forEach(function (a) {
          if (a.dataset.nav !== id) return;
          if (self.isActive) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    });
  });

  var mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      fine: '(hover: hover) and (pointer: fine)'
    },
    function (context) {
      if (!context.conditions.motion) return;

      var cleanups = [];

      // Scroll progress (transform only).
      gsap.to('.progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 0, end: 'max', scrub: 0.2 }
      });

      // Work blocks: rule draws, numeral and copy rise, title wipes, chips pop. Plays once.
      gsap.utils.toArray('.work').forEach(function (el) {
        var tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 78%', once: true }
        });
        tl.from(el.querySelector('.work__rule'), { scaleX: 0, duration: 0.9, ease: 'expo.out' })
          .from(el.querySelector('.work__num'), { yPercent: 25, opacity: 0, duration: 0.7, ease: 'expo.out' }, 0.1)
          .from(el.querySelector('[data-wipe]'), {
            clipPath: 'inset(0% 100% 0% 0%)',
            duration: 0.8,
            ease: 'expo.out',
            clearProps: 'clipPath'
          }, 0.15)
          .from(el.querySelectorAll('[data-reveal]'), {
            y: 24,
            opacity: 0,
            duration: 0.6,
            stagger: 0.07,
            ease: 'power3.out'
          }, 0.25)
          .from(el.querySelectorAll('.chip'), {
            scale: 0.9,
            opacity: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: 'back.out(1.4)'
          }, '-=0.35');
      });

      // Contact: batched rise as each group enters.
      ScrollTrigger.batch('.contact [data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: function (batch) {
          gsap.from(batch, { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
        }
      });

      // Magnetic CTA: fine pointers only, one focal element, pulls at most ~30% of the offset.
      if (context.conditions.fine) {
        var zone = document.querySelector('.mag-zone');
        var mag = document.querySelector('.mag');
        if (zone && mag) {
          var xTo = gsap.quickTo(mag, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
          var yTo = gsap.quickTo(mag, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
          var onMove = function (e) {
            var r = zone.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.3);
            yTo((e.clientY - r.top - r.height / 2) * 0.3);
          };
          var onLeave = function () { xTo(0); yTo(0); };
          zone.addEventListener('pointermove', onMove);
          zone.addEventListener('pointerleave', onLeave);
          cleanups.push(function () {
            zone.removeEventListener('pointermove', onMove);
            zone.removeEventListener('pointerleave', onLeave);
            gsap.set(mag, { clearProps: 'x,y' });
          });
        }
      }

      // Hero + about need final font metrics, so wait for fonts (capped) before splitting.
      // fonts.ready can resolve before any font has started loading, so request the faces explicitly.
      var fontsReady = document.fonts && document.fonts.load
        ? Promise.race([
            Promise.all([
              document.fonts.load('900 100px Archivo', 'PANSHUL'),
              document.fonts.load('400 16px "Space Grotesk"', 'Aa')
            ]).then(function () { return document.fonts.ready; }).catch(function () {}),
            new Promise(function (r) { setTimeout(r, 1500); })
          ])
        : Promise.resolve();

      fontsReady.then(function () {
        context.add(function () {
          var heroSplit = SplitText.create('[data-split]', { type: 'chars', mask: 'chars' });

          gsap.set('[data-split], .hero [data-in], .hero__rule', { visibility: 'visible' });

          gsap.timeline({ defaults: { ease: 'expo.out' } })
            .from('.hero__rule', { scaleX: 0, duration: 0.9 })
            .from(heroSplit.chars, { yPercent: 115, duration: 0.9, stagger: 0.025 }, 0.1)
            .from('.hero [data-in]', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, '-=0.55');

          // About: words light up as you read, scrubbed to scroll. Final state is full ink.
          var aboutText = document.querySelector('.about__text');
          if (aboutText) {
            // aria:'none' keeps the real text in the accessibility tree. The default 'auto' puts
            // aria-label on the <p> (not a valid target) and aria-hidden on every word, which
            // leaves screen readers with an empty paragraph. Spans keep the markup valid inside <p>.
            var words = SplitText.create(aboutText, { type: 'words', tag: 'span', aria: 'none' });
            gsap.fromTo(words.words, { opacity: 0.25 }, {
              opacity: 1,
              ease: 'none',
              stagger: 0.12,
              scrollTrigger: { trigger: aboutText, start: 'top 80%', end: 'bottom 80%', scrub: 0.4 }
            });
          }

          ScrollTrigger.refresh();
        });
      });

      return function () {
        cleanups.forEach(function (fn) { fn(); });
      };
    }
  );
})();
