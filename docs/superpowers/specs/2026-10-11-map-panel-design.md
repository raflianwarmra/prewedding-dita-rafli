# Map panel and Apple-style upgrade

Status: approved by Rafli, 11 October 2026 ("panel version"). Follows the design and motion audits of October 2026.

## Goal

Keep the maquette as the exhibition. Replace the three competing selection surfaces on phones (card, popup, room list) with one bottom panel that behaves like the place panel in Apple Maps, and bring motion and materials in line with Apple's fluid-interface guidance.

## The panel (phones and tablets, under 1024 px)

- One `section.sheet` fixed to the bottom of the map view. It holds a grab handle, the selected room (wing, number and name with ‹ › arrows, subtitle, one-line description, three photos, Enter button) and the full room list under a "Semua ruang" heading.
- Detents:
  - Rest: handle plus a one-line header ("Semua ruang" button and visit progress). Shown before any room is chosen.
  - Room: the selected room block. Tapping a room on the model (or ‹ ›) moves the panel here.
  - List: about 88% of the screen, scrollable, showing all rooms.
- Gestures: the panel follows the finger 1:1 from where it was grabbed. Release uses velocity: a flick or a drag past a third of the screen up from Room enters the room; down from Room returns to Rest and clears the selection; up from Rest opens the List. Past the top it resists (rubber band).
- Motion: a critically damped spring (response about 0.35 s) that starts from the panel's current position and the release velocity, so any drag interrupts it. Reduced motion: no spring, a short fade.
- Desktop: the same panel sits still in the left column (room block over the list); no dragging.

## Room entry and exit

- Any input interrupts: Close, Back and Prev/Next work during the camera flight and the curtain. Back during the flight cancels the entry; nothing opens afterwards.
- A tap during the curtain skips to the room.
- The first room of a visit keeps the full cinematic entry. Later entries use a shorter flight and curtain (about 1.3 s in total).

## Materials, feedback, type

- The main bar and the room bar are translucent with a backdrop blur; the room bar takes its room's own colour. Solid under `prefers-reduced-transparency`.
- Every button scales to 0.97 on press; rooms on the model light up on pointer-down.
- Hover styles apply only to fine pointers.
- Room pages on phones lead with photographs: the illustrated house banner and the duplicate "Ruang 0X" labels are dropped there.
- Painted model labels never render below about 9.5 px; lanterns stay in the side margins.

## Verification

- Phone 390 px (Chromium, WebKit), tablet 820 px, desktop 1440 px; light and dark; Indonesian and English.
- Panel: tap, ‹ ›, drag up to enter, drag down to rest, list open and pick, rubber band, interrupting a settle.
- Back and Close during flight and curtain; Prev/Next during the curtain; deep links.
