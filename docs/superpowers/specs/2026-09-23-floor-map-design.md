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

## The maquette (revised 23 September 2026)

The flat grid plan was rejected as ugly (spreadsheet-like, clashing patterns, no photos). Replaced by an architectural paper maquette in CSS 3D.

- Roofless cream paper building in an orthographic axonometric view (`rotateX` tilt, `rotateZ` spin), no perspective. Lobby and entrance at the front, Wing I Adat (01 to 03) on the left, Wing II Non-Adat (04 to 08) on the right, cinema at the back of the central hall.
- Photos are the only strong colour: each room's back wall carries two framed thumbnails and its right wall one. Floors carry a faint theme tint. Projection (dark, glowing script), Out of Character (amber lamp light) and the cinema (lit screen) are the dark rooms.
- Labels are screen-facing tags pinned above each room with a leader line, so text stays crisp.
- Unit size is computed from the container so the whole building fits the phone width; labels keep fixed pixel sizes.
- Tapping a room flies the camera into it (2D zoom on a camera wrapper plus a flatter tilt, about 650 ms), then the room page fades in. Closing flies back out. Desktop: the model tilts slightly with the pointer.
- A plain two-wing room list sits under the model for anyone who prefers text, screen readers and old browsers.
- Wall photos use 360 px thumbnails.

## Room page

- Full-screen `<dialog>` with a fixed header (`← Map`, room number) and a footer with previous and next rooms in walking order: Bugis, Jawa, Palembang, Woven, Projection, Peranakan, Bappenas, Out of Character, Cinema.
- Opens after the camera flight with a fade and rise. Reduced motion: no flight, plain fade.
- Esc and Back close it; focus returns to the room on the plan.

## Delight

- "You are here" dot starts at the entrance and walks to the tapped room's door (under 600 ms) before the room opens; it stays at the last visited room.
- Visited rooms get a small gold monogram stamp. The lobby shows `n of 8 rooms visited`; at 8 it reads `You have visited every room. Thank you for coming.` Stored in `localStorage`.
- Dark mode: rooms rest dim and warm up on hover, focus and once visited.

## Verification

- Phone (WebKit 390 px), tablet 820 px, desktop 1440 px, light and dark.
- Open, next, previous, Back, Esc, deep link `#jawa`, view switch both ways.
- Scroll view screenshots unchanged apart from the strip.

## Revision: wings, labels and palette (approved 23 September 2026)

- Wing II is renamed "Kontemporer & Eksploratif" (EN "Contemporary & Exploratory") everywhere; short form "Kontemporer" / "Contemporary".
- Each wing stands on its own coloured plinth: Adat on terracotta, Kontemporer & Eksploratif on sage. The wing name is painted along the plinth's outer edge.
- Room numbers move off the floors onto the plinth outside each room's outer wall, with a short tick to the wall. The cinema keeps its play mark.
- "Pintu Masuk / Entrance" is painted on the ground in front of the lobby, in the model's plane.
- Light palette follows the invitation's watercolour: faded sky to sand background, ivory walls, Adat floors on sand with terracotta and gold motifs, Kontemporer floors on mist with sage and blue motifs. Dark rooms (Projection, Out of Character, cinema) stay dark.
- Landing grows to seven steps: welcome, the two kinds of prewedding, Wing I Adat, Wing II Kontemporer & Eksploratif, tap once, tap again, inside a room.
