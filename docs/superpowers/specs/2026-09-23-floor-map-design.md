# Floor Map View

Status: approved by Rafli, 23 September 2026
Builds on `2026-09-23-exhibition-rebuild-design.md`. The scrolling exhibition becomes the "Scroll" view and stays as is.

## Goal

A second way to visit the exhibition on the same URL: a museum floor plan with two wings. Tapping a room opens it as a full-screen room page with its story, highlight photos and the full-collection button.

## Views and URLs

- Default view is the map. `?view=scroll` opens the scroll view. A segmented control in the top bar (`Map | Scroll`) switches views and updates the URL with `history.replaceState`.
- In scroll view the wayfinding label moves to a thin strip under the top bar; nothing else changes.
- Rooms are deep-linkable: `#bugis` etc. In map view the hash opens that room. Opening a room pushes a history entry, so the phone Back button closes it.

## Architecture

- Same `index.html`. `html[data-view]` decides which view is displayed.
- Room pages reuse the existing room `<article>` elements (and the epilogue section for the cinema) by cloning them into one `<dialog>`. Content lives in one place.
- New files: `map.css` (plan and room page), `map.js` (plan, dialog, history, delight). Shared behaviour stays in `main.js`; the Palembang print toggle becomes delegated so clones work.

## The plan

- Museum printed-plan style: paper background, maroon walls (gold in dark mode), door gaps with swing arcs, compass, legend.
- Built as a CSS grid of real `<button>` elements (not an image), portrait, fits a 390 x 844 phone without zoom.

```
"palembang  cinema    ooc"
"palembang  corridor  ooc"
"palembang  corridor  bappenas"
"jawa       corridor  bappenas"
"jawa       corridor  peranakan"
"bugis      corridor  projection"
"bugis      lobby     woven"
                entrance
```

- Left column is Wing I Adat, right column is Wing II Non-Adat, labelled above the plan. Each room floor carries its theme: plaid band, jasmine dots, gold songket lines, textile stripes, dark with glyphs, Peranakan tiles, pavement with Halte sign, amber night, cinema seat rows.
- Desktop: header and legend on the left, plan on the right sized to the viewport height.

## Room page

- Full-screen `<dialog>` with a fixed header (`← Map`, room number) and a footer with previous and next rooms in walking order: Bugis, Jawa, Palembang, Woven, Projection, Peranakan, Bappenas, Out of Character, Cinema.
- Opens with a View Transition morphing the tapped room into the page; fallback is a fade and rise. Reduced motion: plain fade.
- Esc and Back close it; focus returns to the room on the plan.

## Delight

- "You are here" dot starts at the entrance and walks to the tapped room's door (under 600 ms) before the room opens; it stays at the last visited room.
- Visited rooms get a small gold monogram stamp. The lobby shows `n of 8 rooms visited`; at 8 it reads `You have visited every room. Thank you for coming.` Stored in `localStorage`.
- Dark mode: rooms rest dim and warm up on hover, focus and once visited.

## Verification

- Phone (WebKit 390 px), tablet 820 px, desktop 1440 px, light and dark.
- Open, next, previous, Back, Esc, deep link `#jawa`, view switch both ways.
- Scroll view screenshots unchanged apart from the strip.
