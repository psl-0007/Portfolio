(function () {
  var root = document.documentElement;

  if (!(window.gsap && window.ScrollTrigger && window.SplitText)) {
    root.classList.add('js-fallback');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Optional: the page works without it, it only adds the contact-row scramble.
  if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

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

  // ---- Kinetic hero name -------------------------------------------------------------------
  // Each letter gets its own entrance (flip, spin, drop, slide, squash, tumble...) and a few
  // letters get a decorative flair (pinwheel, star burst, ring) behind them.
  var KH = { green: '#0ae448', lilac: '#9d95ff', pink: '#ff8fd8', orange: '#ff9c4a' };
  var KH_WORDS = ['PANSHUL', 'SHARMA'];
  // "row-index" -> flair type: A pinwheel, H star burst (row 0), M ring (row 1).
  var KH_FLAIRS = { '0-1': 'pinwheel', '0-4': 'star', '1-4': 'ring' };

  function khStarPoints(n, outer, inner) {
    var pts = [];
    for (var k = 0; k < n * 2; k++) {
      var a = Math.PI * k / n - Math.PI / 2;
      var r = k % 2 ? inner : outer;
      pts.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  var KH_SVG = {
    pinwheel: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      [KH.green, KH.lilac, KH.pink, KH.orange].map(function (c, i) {
        return '<path d="M50 50 L50 4 L96 4 Z" fill="' + c + '" transform="rotate(' + i * 90 + ' 50 50)"/>';
      }).join('') + '</svg>',
    star: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<polygon points="' + khStarPoints(10, 49, 24) + '" fill="' + KH.orange + '"/>' +
      '<polygon points="' + khStarPoints(10, 32, 16) + '" fill="' + KH.pink + '" transform="rotate(18 50 50)"/></svg>',
    ring: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" fill="none">' +
      '<circle cx="50" cy="50" r="44" stroke="' + KH.green + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 15"/>' +
      '<circle cx="50" cy="50" r="33" stroke="' + KH.lilac + '" stroke-width="3"/></svg>'
  };

  // Swaps the heading's text for rows of letter boxes and returns the paused-at-start timeline.
  // The accessible name moves to aria-label because the visible letters are aria-hidden.
  function buildKineticName(h1) {
    var original = h1.innerHTML;
    h1.setAttribute('aria-label', 'Panshul Sharma');
    h1.textContent = '';

    var rows = KH_WORDS.map(function (word, r) {
      var row = document.createElement('div');
      row.className = 'kh-row';
      row.setAttribute('aria-hidden', 'true');
      var letters = word.split('').map(function (ch, i) {
        var box = document.createElement('span');
        box.className = 'kh-box';
        var type = KH_FLAIRS[r + '-' + i];
        var flair = null;
        if (type) {
          flair = document.createElement('span');
          flair.className = 'kh-flair';
          flair.innerHTML = KH_SVG[type];
          box.appendChild(flair);
        }
        var mask = document.createElement('span');
        mask.className = 'kh-mask';
        var inner = document.createElement('span');
        inner.className = 'kh-char';
        inner.textContent = ch;
        mask.appendChild(inner);
        box.appendChild(mask);
        row.appendChild(box);
        return { inner: inner, flair: flair };
      });
      h1.appendChild(row);
      return letters;
    });

    // The mask flattens the parent's perspective, so 3D tumbles get it on the letter itself.
    rows.forEach(function (letters) {
      letters.forEach(function (l) {
        gsap.set(l.inner, { transformPerspective: 700 });
        // Flairs keep turning slowly on the inner <svg>; the timeline animates the wrapper.
        if (l.flair) gsap.to(l.flair.firstChild, { rotation: 360, duration: 14, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      });
    });

    var p = rows[0], s = rows[1];
    var tl = gsap.timeline({ defaults: { duration: 1 } });

    // PANSHUL
    tl.from(p[0].inner, { rotationX: -110, yPercent: 100, opacity: 0, transformOrigin: '50% 100%', ease: 'back.out(1.8)' }, 0)               // P: 3D flip-up
      .from(p[1].flair, { scale: 0, rotation: -360, opacity: 0, duration: 1.3, ease: 'back.out(1.6)' }, 0.12)                                 // A: pinwheel burst
      .from(p[1].inner, { rotationY: 180, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.12)                                              //    + Y-axis spin
      .from(p[2].inner, { yPercent: -140, ease: 'elastic.out(1, 0.45)', duration: 1.4 }, 0.24)                                                // N: elastic drop
      .from(p[3].inner, { xPercent: -140, ease: 'power4.out', duration: 0.9 }, 0.36)                                                           // S: slide in from left
      .from(p[4].flair, { scale: 0, rotation: -180, opacity: 0, duration: 1.1, ease: 'back.out(2.5)' }, 0.48)                                 // H: star pop
      .from(p[4].inner, { yPercent: 110, ease: 'power4.out', duration: 0.9 }, 0.48)                                                            //    + slide up
      .from(p[5].inner, { yPercent: -150, scaleY: 1.7, scaleX: 0.6, transformOrigin: '50% 100%', ease: 'elastic.out(1, 0.35)', duration: 1.5 }, 0.6) // U: squash and stretch
      .from(p[6].inner, { yPercent: 140, ease: 'back.out(3)', duration: 1 }, 0.72);                                                           // L: overshoot slide-up

    // SHARMA: scale pops, 3D tumbles and an accent colour flash that settles to the text colour.
    var t = 1.15;
    tl.from(s[0].inner, { scale: 0, color: KH.green, ease: 'back.out(3)', duration: 0.8 }, t)
      .from(s[1].inner, { rotationX: 360, opacity: 0, color: KH.lilac, ease: 'power3.out', duration: 1.1 }, t + 0.1)
      .from(s[2].inner, { rotationY: -360, scale: 0.3, opacity: 0, color: KH.pink, ease: 'back.out(1.7)', duration: 1.1 }, t + 0.2)
      .from(s[3].inner, { rotation: -180, scale: 0, yPercent: 80, color: KH.orange, ease: 'back.out(2)', duration: 1 }, t + 0.3)
      .from(s[4].flair, { scale: 0, rotation: 180, opacity: 0, duration: 1.1, ease: 'back.out(2)' }, t + 0.4)                                 // M: ring appears
      .from(s[4].inner, { scale: 2.4, opacity: 0, yPercent: -60, color: KH.green, ease: 'elastic.out(1, 0.5)', duration: 1.4 }, t + 0.4)
      .from(s[5].inner, { rotationX: 540, yPercent: -100, opacity: 0, color: KH.pink, ease: 'power3.out', duration: 1.2 }, t + 0.5);

    return { tl: tl, restore: function () { h1.innerHTML = original; } };
  }

  var mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      fine: '(hover: hover) and (pointer: fine)'
    },
    function (context) {
      if (!context.conditions.motion) return;

      var cleanups = [];

      // Smooth scroll (Lenis), driven by GSAP's ticker so ScrollTrigger and Lenis share one clock.
      // Only runs inside this motion block, so reduced-motion users keep native scrolling. Touch
      // stays native (Lenis default). anchors:true smooth-scrolls #links and honours the
      // scroll-padding-top that clears the fixed header.
      if (window.Lenis) {
        var lenis = new Lenis({ anchors: true });
        lenis.on('scroll', ScrollTrigger.update);
        var lenisTick = function (time) { lenis.raf(time * 1000); };
        gsap.ticker.add(lenisTick);
        gsap.ticker.lagSmoothing(0);
        cleanups.push(function () {
          gsap.ticker.remove(lenisTick);
          gsap.ticker.lagSmoothing(500, 33); // GSAP's defaults
          lenis.destroy();
        });
      }

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
        // Contact rows: the value scrambles in on hover or keyboard focus. Each link gets a fixed
        // aria-label first, so assistive tech never reads the mid-scramble text.
        if (window.ScrambleTextPlugin) {
          document.querySelectorAll('.row').forEach(function (row) {
            var key = row.querySelector('.row__k');
            var val = row.querySelector('.row__v');
            if (!key || !val) return;
            var finalText = val.textContent;
            var tween;
            row.setAttribute('aria-label', key.textContent + ' ' + finalText);

            var play = function () {
              if (tween) tween.kill();
              tween = gsap.to(val, {
                duration: 0.7,
                ease: 'none',
                scrambleText: {
                  text: finalText,
                  chars: 'abcdefghijklmnopqrstuvwxyz0123456789',
                  speed: 0.8,
                  revealDelay: 0.1
                }
              });
            };
            // Killing a scramble mid-flight leaves junk in the node, so always restore the real text.
            var reset = function () {
              if (tween) tween.kill();
              val.textContent = finalText;
            };

            row.addEventListener('pointerenter', play);
            row.addEventListener('focus', play);
            row.addEventListener('pointerleave', reset);
            row.addEventListener('blur', reset);
            cleanups.push(function () {
              reset();
              row.removeEventListener('pointerenter', play);
              row.removeEventListener('focus', play);
              row.removeEventListener('pointerleave', reset);
              row.removeEventListener('blur', reset);
              row.removeAttribute('aria-label');
            });
          });
        }

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
          var heroName = document.querySelector('[data-kinetic]');
          var kinetic = buildKineticName(heroName);
          cleanups.push(kinetic.restore);

          gsap.set('[data-kinetic], .hero [data-in], .hero__rule', { visibility: 'visible' });

          // The name plays its own timeline; the rule and fade-ins run alongside it.
          gsap.timeline({ defaults: { ease: 'expo.out' } })
            .from('.hero__rule', { scaleX: 0, duration: 0.9 })
            .from('.hero [data-in]', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 1.2);

          // About: one timeline, played once when the paragraph scrolls into view.
          //   reveal -> letters pop in one by one, then the flower stem draws, the bloom pops,
          //             and the star/dot drop in
          //   flip   -> letters flip on the X axis
          //   slide  -> letters slide up and fade in
          // aria:'none' keeps the real text in the accessibility tree (the default 'auto' would
          // put aria-label on spans and aria-hidden on every letter). 'words' is split too so
          // lines still wrap between words instead of inside them.
          var aboutText = document.querySelector('.about__text');
          if (aboutText) {
            var splitFx = function (name) {
              return SplitText.create(aboutText.querySelectorAll('[data-fx="' + name + '"]'), {
                type: 'words,chars',
                tag: 'span',
                aria: 'none'
              }).chars;
            };
            var revealChars = splitFx('reveal');
            var flipChars = splitFx('flip');
            var slideChars = splitFx('slide');

            var stem = aboutText.querySelector('.flair__stem');
            var bloom = aboutText.querySelector('.flair__bloom');
            var shapes = aboutText.querySelectorAll('.flair__star, .flair__dot');

            // pathLength="1" on the stem makes dash values 0..1 regardless of its real length.
            gsap.set(stem, { strokeDasharray: 1, strokeDashoffset: 1 });

            gsap.timeline({
              defaults: { ease: 'power3.out' },
              scrollTrigger: { trigger: aboutText, start: 'top 80%', once: true }
            })
              .from(flipChars, { rotateX: 360, opacity: 0, transformPerspective: 600, duration: 1, stagger: 0.04 })
              .from(revealChars, { opacity: 0, scale: 0.6, duration: 0.4, stagger: 0.035, ease: 'back.out(2)' }, '-=0.5')
              .to(stem, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.1')
              // svgOrigin 123 62 is where the stem meets the bloom, so the bloom grows out of it.
              .from(bloom, { scale: 0, rotation: -90, svgOrigin: '123 62', duration: 0.6, ease: 'back.out(2)' }, '-=0.2')
              .from(shapes, { y: -30, opacity: 0, scale: 0.4, duration: 0.7, stagger: 0.12, ease: 'bounce.out' }, '-=0.3')
              .from(slideChars, { y: 20, opacity: 0, duration: 0.6, stagger: 0.03 }, '-=0.4');
          }

          // Project leads: lines rise out of a mask as each block scrolls in. aria:'none' keeps the
          // real text readable; autoSplit re-splits on font load or resize, and returning the tween
          // from onSplit lets SplitText clean it up and keep its progress across the re-split.
          gsap.utils.toArray('[data-lines]').forEach(function (el) {
            SplitText.create(el, {
              type: 'lines',
              mask: 'lines',
              aria: 'none',
              autoSplit: true,
              onSplit: function (self) {
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 0.9,
                  stagger: 0.08,
                  ease: 'expo.out',
                  scrollTrigger: { trigger: el, start: 'top 85%', once: true }
                });
              }
            });
          });

          ScrollTrigger.refresh();
        });
      });

      return function () {
        cleanups.forEach(function (fn) { fn(); });
      };
    }
  );
})();
