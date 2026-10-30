# Erick Gómez — Freelance Portfolio

An interactive portfolio for Data Analyst, Automation, and E-commerce Analyst work. This repository contains the source of the current privately hosted portfolio.

## Features

- Overview, Projects, Process, and About tabs with URL-backed navigation.
- Project filtering by Data, Automation, and E-commerce, plus tool search.
- Five-stage project walkthroughs: Challenge, Inputs, Process, Output, and Evidence.
- Floating navigation, a decorative data sphere, connected process cards, and an endless text-only tools band.
- Motion controls, reduced-motion support, accessible native dialogs, and responsive layouts.
- A browser-local project-brief builder. It does not send messages or upload data.

## Run locally

No dependency installation or build step is required. From the repository root:

```sh
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`.

## Performance checks

The decorative sphere caches its grid geometry, batches canvas strokes by depth, and pauses outside the viewport or in a background tab. Decorative CSS animations pause under the same conditions. Process scrolling reads card positions together before updating styles and combines scroll and resize work into one animation frame.

Run the dependency-free JavaScript checks with Node.js:

```sh
node tests/motion.test.js
```

The checks cover the canvas drawing budget, animation lifecycle, reduced motion, resizing, browser API fallbacks, and process scrolling. They use browser API doubles; visual rendering still needs a browser check. Node.js is only needed for these checks, not for serving the portfolio.

## Files

| File | Purpose |
| --- | --- |
| `dist/index.html` | Page structure and content |
| `dist/styles.css` | Base layout and visual styles |
| `dist/refinements.css` | Typography, floating navigation, tools band, and footer refinements |
| `dist/projects-data.js` | Grounded project content and evidence placeholders |
| `dist/app.js` | Navigation, filters, walkthroughs, dialogs, motion, and brief generation |
| `dist/THIRD-PARTY-NOTICES.txt` | Component attribution and MIT notice |

## Content and evidence

Experience summaries and inspected Python notebooks are labeled separately. All dashboard and workflow previews are illustrative. Supporting screenshots, validated sample outputs, verified contact details, and measured outcomes remain placeholders where unavailable. No unverified client results or savings are claimed.

## Hosting and access

The live website is privately hosted on Sites. This repository is a source copy; pushing here does not automatically redeploy the site. Hosting credentials and internal deployment configuration are excluded. Public hosting or GitHub Pages has not been enabled.

## Component credits

The footer adapts the public MIT-licensed footer-01 structure by nevsky118 / shadcn-ui. Other process and motion effects are original native implementations inspired by the references listed in `dist/THIRD-PARTY-NOTICES.txt`.
