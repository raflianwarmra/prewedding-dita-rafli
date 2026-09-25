# Entrance Trailer

Status: approved by Rafli, 25 September 2026
Builds on `2026-09-23-floor-map-design.md`. The panduan (landing) now opens on every visit, so its welcome step is the entrance.

## Goal

Show the 22-second launch trailer (made with /brag) at the entrance of the exhibition. It plays only when tapped, and plays on the page itself: the frame grows to fill the screen, with no native full-screen player and no pop-up.

## Decisions

- Placement: panduan step 0 (welcome). No new step, no change to the other six steps.
- Start: tap to play, with sound. No autoplay (the product brief bans it).
- Size while playing: the frame grows to fill the page, drawn by the site.
- Format: a vertical 9:16 cut for portrait screens, the existing 16:9 cut for everything else.
- Language: one Indonesian trailer for everyone. Only the player's labels are translated.
- Approach: plain `<video>` with the site's own expansion animation and controls. View Transitions was rejected (no animation before iOS 18, frozen video frame during the transition). YouTube or Vimeo was rejected (their player chrome, branding and cookies).

## Welcome step layout

- The poster takes the place of the large monogram in `.intro__hero`.
- The monogram stays in the opening viewport as a small mark above the kicker "Pameran foto digital".
- Frame treatment reuses the `.window` look: gold hairline ring, gap, second ring. Portrait screens get the arched top (`999px 999px 6px 6px`). Landscape screens get a 16:9 frame with the same rings and 6px corners.
- Poster image: the "Bukan link. Museum." frame of each cut.
- One button over the lower part of the frame: "▶ Putar cuplikan · 0:22". It is the only control on the poster. Minimum tap target 44×44px.
- Desktop (the intro's two-column layout from 900px): the landscape frame sits in the left visual column, text and buttons stay in the right column.

## Playback

- Tap the button (or the poster): call `video.play()` inside the tap handler, with sound, so iOS allows it.
- At the same moment a fixed player layer covers the viewport and the frame animates from the poster's rectangle to full screen: transform only, about 650 ms, ease-out-quart. The arched corners animate to square with `clip-path`.
- Backdrop: always dark (deep ink), whatever the site theme is.
- The video is shown whole (`object-fit: contain`), never cropped. On tall phones this leaves bands above and below the picture, and the controls sit there:
  - top: "✕ Tutup";
  - bottom: pause or play, sound on or off, and a thin gold progress line (display only, no scrubbing).
- Controls fade out 2 s after playback starts, and come back on any tap or pointer movement.
- Tapping the picture toggles pause.
- Closing: the Tutup button, Esc, or the phone's Back button (opening the player pushes a history entry, like opening a room does).
- On the video's end, or on close: pause, the frame shrinks back into the welcome step (reverse animation), the button becomes "↻ Putar lagi", and focus moves to the Mulai button.
- A second play starts from the beginning.

## Choosing the file

- Chosen at tap time: portrait viewport (height greater than width) gets the 9:16 file, otherwise the 16:9 file.
- The poster follows the same rule and updates on orientation change while the player is closed.

## Files

| File | Size | Encoding |
|---|---|---|
| `assets/video/trailer-9x16.mp4` | 720×1280, about 4 MB | H.264 High, AAC 128k, faststart |
| `assets/video/trailer-16x9.mp4` | 1920×1080, about 7 MB | H.264 High, AAC 128k, faststart |
| `assets/video/trailer-9x16.webp` | 720×1280, about 80 KB | poster |
| `assets/video/trailer-16x9.webp` | 1280×720, about 80 KB | poster |

- `preload="none"`: nothing but the poster downloads until the tap.
- The vertical cut is a new 1080×1920 layout of the same captured footage and the same 22.4 s soundtrack. It is rendered with the /brag pipeline in `brag-output/`, which stays out of the repository. Only the four files above are committed.
- A 1080×1920 master of the vertical cut is also delivered in `brag-output/` for WhatsApp Status. It is not used by the site.

## States

- Idle: poster and "▶ Putar cuplikan · 0:22".
- Starting: if the video is not playing 300 ms after the tap, a thin gold ring turns around the play icon until it is.
- Playing, paused: as above.
- Ended: back in the frame, "↻ Putar lagi".
- Error (the `error` event, or no playback after 15 s): the player shows "Cuplikan tidak bisa diputar." with Tutup. The panduan works as normal.

## Accessibility

- The play button has a label naming what it plays ("Putar cuplikan pameran, 22 detik"). Every icon button has a label.
- While the player is open, focus stays inside it and the panduan's keyboard shortcuts (arrows, Esc to finish the panduan) are ignored. Space toggles pause.
- The trailer has no speech, so it needs no captions.
- Reduced motion: no expansion. The player fades in and out (150 ms). Playback still starts only on tap.

## Text

New `I18N` keys (Indonesian / English):

| Key | ID | EN |
|---|---|---|
| `trailer.play` | Putar cuplikan | Play trailer |
| `trailer.replay` | Putar lagi | Play again |
| `trailer.label` | Putar cuplikan pameran, 22 detik | Play the exhibition trailer, 22 seconds |
| `trailer.close` | Tutup | Close |
| `trailer.pause` | Jeda | Pause |
| `trailer.resume` | Putar | Play |
| `trailer.mute` | Matikan suara | Mute |
| `trailer.unmute` | Nyalakan suara | Unmute |
| `trailer.error` | Cuplikan tidak bisa diputar. | The trailer can't be played. |

## Code

- New files: `trailer.css` (poster frame and player) and `trailer.js` (file choice, expansion, controls, history, focus).
- `index.html`: the poster frame markup in `.intro__hero`, the small monogram in step 0, and the two new file links.
- `intro.js`: a hook so its keydown handler ignores keys while the player is open.
- `i18n.js`: the keys above.

## Verification

- Chromium and WebKit (iPhone emulation) at 390×844 and 1440×900, light and dark, Indonesian and English.
- No request for either `.mp4` before the tap.
- After the tap: the player covers the viewport, the video is playing with sound, and neither `document.fullscreenElement` nor WebKit's native full screen is active.
- The end, Tutup, Esc and Back each close the player and put focus on Mulai.
- Reduced motion: fade instead of expansion.
- Room links (`#jawa`) and the scroll view are unchanged (they skip the panduan and so the trailer).
