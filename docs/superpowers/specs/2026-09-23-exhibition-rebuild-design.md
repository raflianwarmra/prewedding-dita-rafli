# Prewedding of Dita dan Rafli: Exhibition Rebuild

Status: approved by Rafli, 23 September 2026
Supersedes the layout in `Product.md` (content facts, family-root rules and OneDrive links in `Product.md` still apply).

## Goal

A public, mobile-first digital photo exhibition with two wings, Adat and Non-Adat. Each of the eight rooms has its own visual character. Works seamlessly on phone, tablet and desktop, in light and dark mode.

## Stack and hosting

- Static HTML + CSS + vanilla JS. No framework, no build step for the site itself.
- `scripts/build_images.py` (Python + Pillow) converts OneDrive originals to WebP at 800 w and 1600 w into `assets/photos/`, and illustrator PNGs into `assets/art/`. Output is committed.
- Public repo `raflianwarmra/prewedding-dita-rafli`, GitHub Pages from `main` root.

## Structure

1. **Foyer**: inline gold quatrefoil monogram (`LOGO/SVG/WEDDING D&R_Logo ALL-01.svg`, recoloured via `currentColor`), illustrated lantern sky, title `Prewedding of Dita dan Rafli`, and a directory board linking to every room grouped by wing.
2. **Adat wing: "Where we come from."** Entered through the illustrator's adat arch (`Frame adat.png`), which scales open with scroll.
3. **Interlude** with the illustrator's pattern band.
4. **Non-Adat wing: "Where we wander."** Entered through a plain rectangular doorway.
5. **Epilogue: In Motion**, film link.
6. **Footer**: photographer credits, monogram.

A fixed top bar shows the current wing and room (`Adat · 02 / 03 · Jawa`) and the light switch.

## Rooms (3 to 4 photos each)

| # | Wing | Room | Photos (source) | Character | Signature |
|---|---|---|---|---|---|
| 01 | Adat | Bugis-Makassar, Rafli's roots | Fikri Look 1: `Byfikriipra-3, -37, -67, -134` | Magenta and plaid, tall hall compositions | Lipa' sabbe plaid rule; name in Lontara |
| 02 | Adat | Jawa, Dita's mother's side | Azhar: `5802, 5908, 5860, 6158` | Deep green, jasmine white, symmetrical | Hanging jasmine strand; name in Javanese script |
| 03 | Adat | Palembang, Dita's father's side | Jatidiriono Look 1A/1B: `0118, 0441, 0290, 0178` | Gold on cream, gilded frame | Tap to switch colour (1A) and sepia (1B) prints |
| 04 | Non-Adat | Woven Together | Jatidiriono Look 2A: `0079, 0074, 0322, 0226` | Bright white room, colourful textiles | Photos hung at slight angles like the fabric line |
| 05 | Non-Adat | Projection of Our Roots | Jatidiriono Look 2A: `0005, 0214, 0228, 0284` | Always dark | Lontara and Javanese glyphs glow as projected light |
| 06 | Non-Adat | Peranakan | Azhar: `6414, 6700, 6566, 6917` | Lover palette: pink, blue, lilac | Peranakan tile pattern floor |
| 07 | Non-Adat | Bappenas, Menteng | Fikri Look 2: `Byfikriipra-269, -199, -293, -248` | Daylight, documentary contact strip | Halte-style green signage label |
| 08 | Non-Adat | Out of Character | Azhar: `7029, 7280, 7545, 7650` | Tungsten hotel night | Film grain, mid-century display face for the title only |

Epilogue backdrop: Azhar `7010`.

Room copy is carried over verbatim from the previous site, including the family-root facts. Credits: Bugis and Bappenas `@fikriipra`; Jawa, Peranakan, Out of Character `@azharbaizan`; Palembang, Woven Together, Projection `@byjatidiriono` (heritage credits confirmed by Rafli, derived from the source folders).

## Visual system

- Type: EB Garamond (Google Fonts) for everything. Noto Sans Buginese and Noto Sans Javanese for script glyphs only. Overpass for the Bappenas signage label only. Limelight for the Out of Character title only.
- Base palette from the invitation: maroon `#540922`, gold `#B29474`, cream. Expressed as OKLCH tokens, neutrals tinted toward maroon, no pure black or white.
- Light theme: gallery by day (cream walls, maroon ink). Dark theme: after hours (maroon-black, ivory ink, gold detail). Default follows `prefers-color-scheme`; the light switch overrides and persists in `localStorage`. Rooms keep their identity in both themes; Projection is dark in both.

## Motion

- Doorway transitions use CSS scroll-driven animations (`animation-timeline: view()`) inside `@supports`; without support, rooms fade in via IntersectionObserver.
- Foyer lanterns drift slowly (transform only).
- `prefers-reduced-motion: reduce` removes all motion; doorways render open.

## Accessibility and quality bar

- Semantic sections per wing, `article` per room, headings in order, descriptive alt text.
- Tap targets at least 44 px, visible focus, no horizontal overflow from 320 px to 1920 px.
- Photos lazy-load with explicit width and height; hero assets load eagerly.
- All nine OneDrive links open in a new tab with `rel="noopener noreferrer"`.

## Verification

- Screenshots at 390, 820 and 1440 px, light and dark, plus reduced motion.
- Script check that every referenced local asset exists and every OneDrive link responds.
- Live GitHub Pages URL loads over HTTPS.

## Out of scope

Lightbox, carousels, embedded albums, comments, analytics, forms.
