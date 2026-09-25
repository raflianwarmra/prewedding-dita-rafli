# Room Living Photos

Status: approved by Rafli, 26 September 2026
Builds on `2026-09-23-floor-map-design.md` (room pages) and `2026-09-25-entrance-trailer-design.md` (video handling).

## Goal

Give each of the eight rooms one "living photo": a 3 to 5 second silent clip from the photographers' films that loops seamlessly, like a photograph that moves. It takes the place of the room's lead photo.

## Decisions

- Meaning: a living photo, not a video to watch. No sound, no controls, same frame as the photos around it.
- Placement: replaces the lead photo of each room, in the same position, shape and frame. Each room keeps its own layout.
- Rooms: the eight rooms. The cinema (In Motion) is unchanged; it already stands for the full film.
- Moments: for each room, a shortlist of 2 to 3 moments is rendered as real looping previews. Built end to end on 26 September with Claude's pick per room; the alternatives stay in `brag-output/rooms/` so any room can be swapped.
- Approach: a muted, looping, inline `<video>` with a poster. Animated WebP or AVIF was rejected (3 to 5 times larger files; older iPhones do not animate AVIF).

## Sources

| Room | Film | Lead photo it replaces | Shape |
|---|---|---|---|
| 01 Bugis-Makassar | Fikri Pratama, `DITA RAFLI FULL rev.mp4` (192 s, 1080p, 23.976 fps) | `bugis-1` | 2:3 |
| 02 Jawa | Azhar, `LOGO DR Prewedding Dita & Rafli Full Videos.mp4` (135 s, 1080p, 25 fps) | `jawa-1` (arched centre photo) | 2:3 |
| 03 Palembang | Jatidiriono, `Rafli & Dita Logo depan.mp4` (107 s, 1080p, 29.97 fps); `Vertical Rafli & Dita.mp4` may give better portrait framing | `palembang-1` | 2:3 |
| 04 Woven Together | Jatidiriono | `woven-1` | 3:2 |
| 05 Projection of Our Roots | Jatidiriono | `projection-1` | 3:2 |
| 06 Peranakan | Azhar | `peranakan-1` | 2:3 |
| 07 Bappenas, Menteng | Fikri Pratama | `bappenas-1` | 2:3 |
| 08 Out of Character | Azhar | `ooc-1` | 2:3 |

All films live in the couple's OneDrive under `Wedding Planner/00 Foto/`. They are sources only; nothing from them is committed except the finished clips.

## Choosing moments

- A usable moment has no burned-in subtitles (common in the Fikri film), no names, lyrics, chapter cards or DR logo overlays (in the Jatidiriono and Azhar films), and keeps the couple inside the crop for the whole clip.
- Portrait rooms take a centred 2:3 slice (720×1080) of the 1920×1080 frame, so the subject must stay near the middle; the crop's horizontal position may be set per clip.
- Moments with gentle, continuous motion (fabric, light, a small gesture, a slow camera move) loop better than hard cuts or big movements. A clip never spans a cut in the source film.
- The shortlist is rendered as looping previews in the room's real frame, and Rafli chooses one per room.

## Clip format

- Length 3 to 5 s. The films cut fast (most shots are 1 to 3 s), so two loop types are used:
  - shots of 3.4 s or more: a straight loop, with the last 0.5 s cross-dissolved into the first 0.5 s;
  - shorter shots: a bounce loop (forward, then backward to the first frame), which is seamless by construction and suits gentle motion.
- Seams are checked by comparing the last and first frames against an ordinary frame step (PSNR); every chosen clip's seam is as smooth as a normal frame step.
- Portrait: 720×1080. Landscape: 1080×720.
- H.264 High, no audio track, `+faststart`, source frame rate kept, target about 0.6 to 1 MB each (about 5 to 8 MB for all eight, loaded one room at a time).
- Poster: the clip's first frame as WebP, same size as the frame, shown until the clip plays and whenever it does not play.
- Colour: no regrading. The clip matches the photographer's film.
- Files: `assets/video/rooms/<room>.mp4` and `assets/video/rooms/<room>.webp`, where `<room>` is the room id (`bugis`, `jawa`, `palembang`, `woven`, `projection`, `peranakan`, `bappenas`, `out-of-character`).

## Behaviour

- Markup: the lead `<figure>` carries `data-living="<room>"` and keeps its `<img>` and alt text. `rooms.js` adds a `<video muted loop playsinline preload="none" aria-hidden="true">` laid exactly over the image (its box and corners, not a caption), so visitors without script, with reduced motion or with Data Saver never get a video element at all. The still (first frame) is set together with the source, so nothing downloads before the room is near.
- Loading: nothing downloads before a visitor enters the room. On room pages, the clip loads when the room page opens. In the scroll view it loads when the room comes within one screen of the viewport.
- Playback: plays only while at least a third of it is on screen (IntersectionObserver), pauses otherwise, and pauses when the room page closes or the tab is hidden.
- Reduced motion (`prefers-reduced-motion: reduce`) and Data Saver (`navigator.connection.saveData`): the video is not loaded; the still shows, so the room looks exactly as it does today.
- If the video fails to load or play, the still stays visible.
- Palembang's colour/sepia toggle also applies to the living photo (the same sepia treatment as the print).
- The existing reveal animation (pieces rising in after the curtain) applies to the figure as before.

## Product brief exception

`PRODUCT.md` section 8 (Motion) bans autoplay and continuous animation. Add a recorded exception: muted living photos in rooms, playing only while on screen, never for reduced motion or Data Saver.

## Code

- `index.html`: `data-living` on each of the eight lead figures, and the `rooms.js` script tag.
- New `rooms.js`: loading, visibility-based play and pause, reduced-motion and Data Saver handling, error fallback. It works for both the room page (cloned articles) and the scroll view.
- `styles.css`: the video fills its figure exactly like the image (`object-fit: cover`, same radius), and the sepia state covers it.
- `PRODUCT.md`: the exception above.

## Verification

- Chromium and WebKit (iPhone emulation), 390×844 and 1440×900.
- No room clip requested on the landing, the map, or before a room opens.
- Opening a room loads and plays only that room's clip; scrolling it off screen pauses it; closing the room pauses it.
- Scroll view: clips load near the viewport and play only while visible.
- Reduced motion and Data Saver: no clip requested, the still shows.
- The sepia toggle covers the living photo.
- Loop seam: frame-by-frame check of the last and first frames.
- The overlap scan and the frame-timing measurement from the 25 September audit still pass.

## Chosen clips (26 September 2026)

| Room | Moment | Source | Loop | Size |
|---|---|---|---|---|
| Bugis-Makassar | the twirl in the colonial hall | Fikri 8.18–10.88 s | bounce | 0.71 MB |
| Jawa | Dita raising jasmine strands to her face | Azhar 23.15–24.82 s | bounce | 0.39 MB |
| Palembang | Rafli's crown in the foreground, Dita smiling | Jatidiriono vertical 8.40–10.30 s | bounce | 0.75 MB |
| Woven Together | holding hands before the hung textiles | Jatidiriono 57.45–60.05 s | bounce | 0.89 MB |
| Projection of Our Roots | the kiss in the spotlight, script on the curtain | Jatidiriono 98.95–101.55 s | bounce | 0.42 MB |
| Peranakan | the restaurant with the red fans | Azhar 65.50–69.90 s | straight | 0.47 MB |
| Bappenas, Menteng | the train passing behind them | Fikri 176.0–180.4 s | straight | 1.04 MB |
| Out of Character | laughing together on the bed | Azhar 108.84–111.30 s | bounce | 0.53 MB |

Cut list and cutter: `brag-output/work/films/cuts.json` and `cut.py`.
