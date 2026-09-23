# Product Brief: Prewedding of Dita dan Rafli

## 1. Product summary

**Product:** A single-page digital photo exhibition for Dita and Rafli's prewedding collections.

**Live site:** https://prewedding-dita-rafli.raflianwar16.chatgpt.site

**Primary source file:** `dist/index.html`

**Static assets:** `dist/assets/`

The product is intentionally closer to an editorial museum exhibition than a Linktree. Visitors move through eight curated visual stories, read a short narrative for each theme, and can open the corresponding full-resolution OneDrive album. A prewedding film closes the exhibition as an epilogue.

The site is public and intended to be shared with family through WhatsApp. It must remain easy to use on mobile devices and must not require an account or sign-in to view the landing page.

## 2. Product objective

Create a polished, emotionally coherent entry point to the couple's prewedding photographs.

The experience should:

1. Present the collections as connected chapters in one story.
2. Explain the personal meaning behind every concept.
3. Make each full album easy to open.
4. Preserve the Dita and Rafli wedding identity through its monogram, maroon, gold, and ivory palette.
5. Feel personal and curated, not like a generic list of links.

## 3. Audience

### Primary audience

Family members receiving the link through WhatsApp, primarily on mobile phones.

### Secondary audience

Friends, wedding guests, photographers, and people who want to revisit the visual story after the wedding.

### Audience assumptions

- Visitors may not be highly technical.
- They should immediately understand that every collection has a full album.
- Many visitors will use a slower mobile connection.
- The writing can be in English, but it should remain plain, warm, and easy to understand.

## 4. Core experience

### Primary journey

1. Visitor opens the public URL.
2. Visitor sees the D&R monogram and the exact title, **Prewedding of Dita dan Rafli**.
3. Visitor scrolls through three narrative chapters.
4. Each exhibit contains one cover image, a title, a curatorial description, and a **View collection** link.
5. The selected album opens in a new tab on OneDrive.
6. The exhibition concludes with the prewedding film.

### Experience principles

- Story before utility, but utility must remain obvious.
- One strong photograph per exhibit.
- Calm editorial pacing with generous whitespace.
- No menus, filters, carousels, forms, or unnecessary controls.
- Use motion only to support the feeling of entering an exhibition.

## 5. Information architecture

### Opening

- D&R monogram
- Label: `A digital photo exhibition`
- Main title: `Prewedding of Dita dan Rafli`
- Short exhibition introduction
- Scroll prompt: `Enter exhibition`

### Curatorial introduction

- Heading: `Our story, in eight rooms.`
- Explanation that each collection represents a different part of the couple's story

### Chapter I: Heritage

Theme: **The roots we carry.**

1. Bugis-Makassar: Rafli's family roots
2. Jawa: Dita's roots from her mother's side
3. Palembang: Dita's roots from her father's side

### Chapter II: Interpretation

Theme: **Tradition, seen through our eyes.**

4. Woven Together
5. Projection of Our Roots
6. Peranakan

### Chapter III: Us

Theme: **Where we began, and where we played.**

7. Bappenas, Menteng: where Dita and Rafli first knew each other as coworkers
8. Out of Character: their mid-century creative experiment

### Epilogue

- Heading: `In Motion`
- Link to the prewedding film

## 6. Content inventory

| No. | Exhibit | Display title | Cover asset | Full collection |
| --- | --- | --- | --- | --- |
| 01 | Bugis-Makassar | Rafli's Roots | `dist/assets/bugis.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgDd1_KJTqcHTJS6udsKtA0hASVXK0JJr3grCJVy9A4Nn1Y?e=4aBprS |
| 02 | Jawa | From Her Mother | `dist/assets/jawa.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgChawxCVLXoRJNTb3Hc2v_JAbyWfv0ssYr9_r9GdQLKFGA?e=yiXMC1 |
| 03 | Palembang | From Her Father | `dist/assets/palembang.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgA6XKFXWqUBQIsKHjMyckVDAcH4ePiMx-l0IgbpabRVYts?e=27UhpN |
| 04 | Traditional Contemporary I | Woven Together | `dist/assets/woven.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgBd8dxQgKl5Srn4SjsSvvbEAW8VmqZcald88VOVsgvAP_Q?e=J2WYXr |
| 05 | Traditional Contemporary II | Projection of Our Roots | `dist/assets/roots.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgDPHmUImkzYQbTYRf-XvKZjAbUVJNJdDTEeOwomKiT4rbg?e=N1Y1Yh |
| 06 | Peranakan | A Shared Appreciation | `dist/assets/peranakan.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgBtOvFoVzydSbFM6q9kkTFxARMrHGZUVGZ2VUVtxMQvdoo?e=BCGsHI |
| 07 | Bappenas, Menteng | Where It Began | `dist/assets/office.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgBlGMB8CISOQaxVgBdttEFlAXq79kUHFcA7XfrtlJDH6nE?e=lmfNEu |
| 08 | Mid-Century | Out of Character | `dist/assets/midcentury.jpg` | https://1drv.ms/a/c/22beffb20649113e/IgDtcc7u4t8lQI6hPx7mCob8AWHVm1dGVN_BELtdTV0W510?e=gmKwUw |

### Film

https://1drv.ms/a/c/22beffb20649113e/IgCZ57MmwmzLS5rkImKph78EAV7Hts1eOPCqsnLNks5LZL4?e=oogzSY

### Logo

The page uses the D&R monogram from the supplied Google Drive logo collection.

Current public image endpoint:

`https://lh3.googleusercontent.com/d/1oU00qLnMYi6Vakx9DOzMJk2Rez5v38Ek=w1000`

The original logo folder is:

https://drive.google.com/drive/folders/1r-pnA3rn1k5Kv5ShPnQ1i2cFb-ivPybe

## 7. Narrative and editorial rules

### Heritage narratives

- Bugis-Makassar must be described as Rafli's roots.
- Jawa must be described as Dita's roots from her mother's side.
- Palembang must be described as Dita's roots from her father's side.

These relationships are essential facts and must not be swapped or generalized.

### Supporting narratives

- **Woven Together:** contrasts Bugis and Palembang textiles while showing how different traditions can sit together and become richer.
- **Projection of Our Roots:** uses Lontara and Javanese scripts as projected expressions of culture, memory, and identity.
- **Peranakan:** reflects the couple's appreciation of Peranakan colours, kebaya, decorative details, and food. The palette also references Taylor Swift's *Lover*. The couple's families first met at a Peranakan restaurant.
- **Bappenas, Menteng:** Dita and Rafli first knew each other as coworkers at Bappenas. Menteng and the office surroundings represent the ordinary beginning of their relationship.
- **Out of Character:** a playful mid-century experiment that intentionally shows a side of the couple people would not normally expect.

### Photography credits

- Bappenas, Menteng: `@fikriipra`
- Woven Together: `@byjatidiriono`
- Projection of Our Roots: `@byjatidiriono`
- Peranakan: `@azharbaizan`
- Out of Character: `@azharbaizan`

Do not invent credits for the heritage collections unless the owner provides them.

## 8. Visual system

### Visual thesis

An intimate museum exhibition with editorial typography, quiet spacing, and ceremonial wedding colours.

### Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| Maroon | `#5d1225` | Primary identity, exhibition interludes |
| Deep maroon | `#380b17` | Hero depth, footer |
| Gold | `#b58a4f` | Labels, links, small accents |
| Light gold | `#d7b47b` | Hero accents, focus treatment |
| Ivory | `#f5efe5` | Text on dark backgrounds |
| Paper | `#fbf8f2` | Main background |
| Ink | `#241c1b` | Main text |
| Muted text | `#746968` | Body copy |

### Typography

- Display: `Italiana`, fallback `Georgia, serif`
- Interface and body: `DM Sans`, fallback `Arial, sans-serif`
- Main body text must remain at least 16 px.
- Small uppercase labels may use 12 to 13 px with increased letter spacing.

### Layout

- Desktop exhibit rows use a two-column image and text layout.
- Alternate the image and text positions between exhibits.
- Mobile exhibit rows stack image first and text second.
- Cover images use a consistent 4:5 aspect ratio.
- Use generous whitespace between chapters and exhibits.

### Image treatment

- Do not add generic stock imagery.
- Keep the eight curated cover photographs.
- Use `object-fit: cover` for consistent framing.
- Preserve the subtle inset border and restrained hover scale.

### Motion

- Sections reveal with a small vertical movement and fade.
- Motion must respect `prefers-reduced-motion`.
- Avoid parallax, aggressive scroll effects, autoplay, and continuous animation.

## 9. Interaction requirements

- Every collection link must open in a new tab.
- External links must use `rel="noopener noreferrer"`.
- The full card should not be clickable. The explicit link is the interaction target.
- Links must have a visible keyboard focus state.
- The film link must remain visually distinct as the exhibition epilogue.
- No sign-in or account flow is required on the exhibition page.

## 10. Responsive behavior

### Desktop and tablet

- Maximum main content width: approximately 1160 px.
- Maintain alternating exhibit layouts.
- Use fluid display typography through `clamp()`.

### Mobile

- Main breakpoint: 800 px.
- Stack every exhibit into one column.
- Keep image first, caption second.
- Remove nonessential fixed header copy when space is limited.
- Keep tap targets clear and body text readable.
- Prevent horizontal overflow at all viewport widths.

## 11. Accessibility requirements

- Use semantic `section`, `article`, `header`, `figure`, and heading elements.
- Preserve descriptive alternative text for all cover images.
- Maintain sufficient contrast for text and controls.
- Keep a logical heading hierarchy.
- Ensure keyboard users can reach every collection link.
- Respect reduced-motion preferences.
- The site must remain usable at 200 percent text zoom.

## 12. Technical implementation

### Current architecture

- Plain static HTML, CSS, and JavaScript
- No package manager
- No build process
- No backend
- No analytics
- No persistent state
- Static hosting directory: `dist`

### Repository structure

```text
.
├── .openai/
│   └── hosting.json
├── Product.md
└── dist/
    ├── index.html
    └── assets/
        ├── bugis.jpg
        ├── jawa.jpg
        ├── midcentury.jpg
        ├── office.jpg
        ├── palembang.jpg
        ├── peranakan.jpg
        ├── roots.jpg
        └── woven.jpg
```

### External dependencies

- Google Fonts for `Italiana` and `DM Sans`
- Google-hosted D&R monogram
- OneDrive for the full album and film links

### Source of truth

`dist/index.html` is both the production implementation and the HTML handoff file. Avoid maintaining a second copy because duplicated HTML will drift.

## 13. Product constraints

- Keep the exact page title: `Prewedding of Dita dan Rafli`.
- The product must continue to feel like a digital photo exhibition, not a link-in-bio page.
- Do not turn the page into a dashboard, grid of generic cards, or wedding invitation.
- Do not change the family-root relationships.
- Do not replace the supplied logo or photographs without approval.
- Do not invent dates, cultural interpretations, captions, or photographer credits.
- Do not embed or rehost the full photo albums without approval.
- Do not add forms, comments, guest books, downloads, or social sharing controls unless requested.

## 14. Acceptance criteria

The handoff is successful when:

1. The title and D&R monogram are visible in the opening viewport.
2. All eight exhibits appear in the correct chapter and order.
3. Every exhibit uses the correct cover asset, narrative, and OneDrive URL.
4. Bugis-Makassar, Jawa, and Palembang accurately describe the couple's respective family roots.
5. All eight collection links and the film link open correctly in a new tab.
6. The layout works without horizontal scrolling on common mobile and desktop widths.
7. Keyboard focus is visible on every actionable link.
8. Reduced-motion users receive a motion-free version.
9. The page remains a lightweight static site with no required build step.
10. The deployed page remains publicly accessible through the existing site URL.

## 15. Instructions for Claude Code

1. Read this file before changing the product.
2. Treat `dist/index.html` as the production source of truth.
3. Preserve `.openai/hosting.json` and the existing `project_id`.
4. Reuse the images in `dist/assets/`.
5. Make focused changes inside the requested scope.
6. Validate all local image paths and all nine OneDrive links after editing.
7. Check desktop and mobile layout before handoff.
8. Do not create a framework migration unless the owner explicitly requests one.

## 16. Known implementation note

The D&R monogram currently loads from a public Google-hosted image endpoint. If long-term independence from that endpoint becomes important, export the approved monogram to a local web image and update the HTML to reference that file. Do not substitute a recreated logo.
