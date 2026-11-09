/* fx:marquee. A giant, low-opacity text strip between #work and #about.
   It drifts on its own at BASE px/s and its speed follows scroll velocity:
     timeScale = 1 + velocity / PER_VELOCITY      (clamped to +/- MAX)
   so scrolling down speeds it up, scrolling up slows it, reverses it past 1x, and it eases back to
   the base drift when scrolling stops. Off-screen it is paused and the ticker is detached. */
(function () {
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  var strip = document.querySelector('.strip');
  if (!strip) return;
  var track = strip.querySelector('.strip__track');
  var source = track && track.querySelector('.strip__item');
  if (!source) return;

  var BASE = 60;          // px/s at rest
  var PER_VELOCITY = 300; // each 300 px/s of scroll adds 1x to the speed
  var MAX = 12;           // cap on |timeScale|
  var EASE = 0.12;        // per-frame (at 60fps) share of the gap closed toward the target speed

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var root = document.documentElement;
    var loop = null;       // the repeating x tween
    var st = null;         // the visibility / velocity ScrollTrigger
    var active = false;
    var ro = null;
    var rebuildTimer = null;
    var lastKey = '';

    // One copy of the phrase is in the markup; fill the track with 2 halves of N copies each, N large
    // enough that a half is at least one viewport wide. Sliding by exactly one half is then seamless.
    function build() {
      var progress = loop ? loop.progress() : 0;
      var ts = loop ? loop.timeScale() : 1;
      if (loop) loop.kill();
      gsap.set(track, { clearProps: 'transform' });

      while (track.children.length > 1) track.removeChild(track.lastChild);
      var itemW = source.getBoundingClientRect().width;
      if (!itemW) return;
      var per = Math.max(1, Math.ceil(window.innerWidth / itemW));
      for (var i = 1; i < per * 2; i++) {
        var c = source.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      }
      var halfW = itemW * per;
      loop = gsap.to(track, {
        xPercent: -50,
        duration: halfW / BASE,
        ease: 'none',
        repeat: -1,
        paused: !active
      });
      loop.progress(progress).timeScale(ts);
      lastKey = Math.round(itemW) + 'x' + window.innerWidth;
    }

    // Rebuild when the viewport or the item width changes (the display font loads after first paint).
    function scheduleRebuild() {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(function () {
        var key = Math.round(source.getBoundingClientRect().width) + 'x' + window.innerWidth;
        if (key !== lastKey) build();
      }, 120);
    }

    function tick(time, deltaTime) {
      if (!loop) return;
      var v = st ? st.getVelocity() : 0;
      var target = gsap.utils.clamp(-MAX, MAX, 1 + v / PER_VELOCITY);
      var k = 1 - Math.pow(1 - EASE, (deltaTime || 16.7) / 16.7);
      loop.timeScale(loop.timeScale() + (target - loop.timeScale()) * k);
    }

    strip.hidden = false;
    root.classList.add('fx-marquee');
    build();

    st = ScrollTrigger.create({
      trigger: strip,
      start: 'top bottom',
      end: 'bottom top',
      invalidateOnRefresh: true,
      onToggle: function (self) {
        active = self.isActive;
        if (!loop) return;
        if (active) {
          loop.paused(false);
          gsap.ticker.add(tick);
        } else {
          loop.paused(true);
          gsap.ticker.remove(tick);
          loop.timeScale(1);
        }
      }
    });
    active = st.isActive;
    if (active) {
      loop.paused(false);
      gsap.ticker.add(tick);
    }

    if (window.ResizeObserver) {
      ro = new ResizeObserver(scheduleRebuild);
      ro.observe(source);
      ro.observe(strip);
    } else {
      window.addEventListener('resize', scheduleRebuild);
    }

    // The strip is now in the flow, so everything below it has moved. Let ScrollTrigger remeasure.
    ScrollTrigger.refresh();

    return function () {
      clearTimeout(rebuildTimer);
      gsap.ticker.remove(tick);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', scheduleRebuild);
      if (st) st.kill();
      if (loop) loop.kill();
      while (track.children.length > 1) track.removeChild(track.lastChild);
      gsap.set(track, { clearProps: 'transform' });
      strip.hidden = true;
      root.classList.remove('fx-marquee');
      ScrollTrigger.refresh();
    };
  });
})();
