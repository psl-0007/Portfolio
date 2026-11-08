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

- Hero name rises letter by letter (SplitText).
- Project blocks reveal on scroll: rule draws, title wipes, copy and chips rise.
- About text lights up word by word, scrubbed to scroll.
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
vendor/        GSAP, ScrollTrigger and SplitText 3.13.0 (vendored, no CDN)
favicon.svg
```

## Third-party

GSAP is used under the [GSAP Standard License](https://gsap.com/standard-license). Fonts are licensed under the SIL Open Font License 1.1.
