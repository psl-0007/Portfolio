# Panshul Sharma | Portfolio

Personal portfolio of Panshul Sharma, a Computer Science & AI student and aspiring AI engineer.
A single-page static site: no build step, no framework, no third-party requests at runtime.

## Selected work

| Project | What it is | Built with | Links |
| --- | --- | --- | --- |
| **MOTRIX** | A cinematic BMW M-Series showcase website with immersive animations, interactive car cards, smooth scrolling and dynamic visual storytelling. | React, Vite, JavaScript, GSAP, ScrollTrigger, CSS3 | [GitHub](https://github.com/psl-0007/MOTRIX) |
| **TrustPack** | Published package vs source code integrity analyzer. Verifies whether published npm and PyPI packages match their GitHub source, flags suspicious modifications, verifies provenance and gives evidence-based risk assessments. | Python, FastAPI, React, JavaScript | [Live demo](https://trustpack.dpdns.org/new), [GitHub](https://github.com/mr-peppermint/TrustPack) |
| **CalcHub** | A client-side calculator suite with 18 tools, from scientific and unit conversion to BMI, loan EMI and date maths, powered by a custom eval-free expression parser. | React 18, TypeScript (strict), Vite, Tailwind CSS, React Router | [GitHub](https://github.com/psl-0007/calchub) |

## Contact

- Email: [panshulsharma111@gmail.com](mailto:panshulsharma111@gmail.com)
- GitHub: [psl-0007](https://github.com/psl-0007)
- LinkedIn: [Panshul Sharma](https://www.linkedin.com/in/panshul-sharma-0b4011401/)

## Design

- Brutalist visual system: sharp corners, 2px borders, hard shadows, expanded black display type.
- Light and dark themes that follow the system setting.
- Fonts: Archivo and Space Grotesk (SIL OFL), embedded in `fonts.css` so the page looks the same over `file://`, on any host, or offline.

## Motion (GSAP 3.13.0)

- Hero name is a kinetic reveal: every letter has its own entrance (flip, spin, drop, slide, squash, tumble) with a pinwheel, star burst and ring behind A, H and M.
- Project blocks reveal on scroll: rule draws, title wipes, copy and chips rise.
- Project descriptions rise line by line out of a mask (SplitText `mask: 'lines'`, `autoSplit`, `aria: 'none'`).
- About text plays once on scroll: letter flip, letter pop-in with a drawn flower (stem, bloom, shapes), and a slide-up fade.
- Contact rows scramble to their value on hover or keyboard focus, fine pointers only (ScrambleTextPlugin). Each link carries a fixed `aria-label` so assistive tech never reads the mid-scramble text.
- Smooth scrolling with Lenis 1.3.27 (MIT), synced to GSAP's ticker so ScrollTrigger stays in step; anchor links glide too. Skipped under `prefers-reduced-motion`.
- Scroll effects live in `fx/` (one module + one stylesheet each, all scoped under `html.fx-<name>` so reduced motion, touch and no-JS fall back to the plain page):
  - `stack` pins the project cards as an overlapping deck; the card behind scales to 0.94 and dims. Desktop only, and only when every pinned card fits the window (re-checked as layout settles). Moving keyboard focus into a covered card scrolls back to where it is visible.
  - `pinhead` keeps "Selected work" pinned on the left (CSS sticky) while the cards scroll on the right, at 900px and up.
  - `shots` is a dark glass placeholder frame per project that tilts in (rotateX 15, rotateY -8) and eases flat on scroll. It is decorative (`aria-hidden`); swap in a real screenshot by following the comment above the first `<figure class="shot">` in `index.html`.
  - `hero-exit` splits the name on exit (PANSHUL -40%, SHARMA -20%) while the bio and facts fade and blur.
  - `marquee` is a low-opacity strip between Work and About that drifts on its own and speeds up with scroll velocity (decorative, hidden under reduced motion).
  - `curtain` makes Contact a dark layer revealed underneath as the page lifts; "Let's talk." scales 0.85 to 1.
- Magnetic "Email" block on pointer devices, scroll progress bar, current-section marker in the nav.
- All of it is skipped under `prefers-reduced-motion`, and the page is fully readable if JavaScript or GSAP fails to load.

## Run locally

No install needed. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html     markup and content
styles.css     tokens, layout, components, dark theme
main.js        GSAP animations
fonts.css      embedded Archivo and Space Grotesk (Latin subset)
vendor/        GSAP, ScrollTrigger, SplitText and ScrambleTextPlugin 3.13.0 (vendored, no CDN)
fx/            scroll effects, one module + stylesheet each (see Motion)
favicon.svg
```

## Third-party

GSAP is used under the [GSAP Standard License](https://gsap.com/standard-license). Fonts are licensed under the SIL Open Font License 1.1.
