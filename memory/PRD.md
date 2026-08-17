# PRD — Kai Voss: 3D Game Artist Portfolio

## Original Problem Statement
"I am a 3d game artist i want a website portfolio to showcase my artwork" — with a target of Awwwards-level design: kinetic masked hero reveal, clipped artwork frames, numbered manifesto chapters, editorial marquee, framer-motion + lenis, subtle parallax/3D hero.

## User Choices
- Artwork gallery showcase (no login, no admin)
- Categories: Characters, Environments, Props — filterable on one gallery
- Style: dark cinematic game-studio look + bold neon/cyberpunk
- Contact: email/social links only, no form

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis (smooth scroll). Single-page app, components in /app/frontend/src/components/portfolio/ (Nav, Hero, Marquee, Gallery, Manifesto, About, Footer)
- Backend: FastAPI, /api/artworks + /api/artworks/{slug}, seeded idempotently on startup from ARTWORKS list
- DB: MongoDB via MONGO_URL/DB_NAME, collection `artworks` (slug-keyed, no raw ObjectId returned)

## User Personas
- Art director / recruiter browsing portfolio quickly
- Fellow artists exploring process detail (software, polycount)

## Implemented (2026-08-17, update 12)
- Vertical story layout per artwork (stack flag, admin toggle): images stack seamlessly ArtStation-style; Bloody Bat enabled with Barrel/Body/Grip order. Scroll fix via data-lenis-prevent, per-image click-to-zoom in stack mode, enlarged info panel, flex shrink-0 fix
- Marmoset watermark inpainted out of all 3 Bloody Bat renders (OpenCV corner inpaint, same storage paths) — script at /app/scripts/remove_watermark.py

## Implemented (2026-08-17, update 11)
- First real artwork published: BLOODY BAT (props, 2025) with 3 user renders — hero + "Barbed Wire Detail" + "Grip Detail", graded and served from object storage

## Implemented (2026-08-17, update 10)
- Film-grain noise overlay removed entirely (main site + admin pages) for a clean look

## Implemented (2026-08-17, update 9)
- Zoom bug fix: transform-origin no longer chases cursor (image used to fly out of frame). New anchored pan — zoom centers on clicked point, mouse movement glides across the image with clamped edges so it can never leave the frame

## Implemented (2026-08-17, update 8)
- Click-to-zoom in artwork viewer: 2.2x zoom following the cursor (transform-origin tracks mouse), click again to zoom out; resets when switching media/artwork
- Upload grade sharpness increased 1.12 → 1.35

## Implemented (2026-08-17, update 7)
- Square/1:1 images no longer squeezed: modal aspect detection widened (ratio > 0.85 = stacked layout); stacked images render object-contain over a blurred self-backdrop
- Default premium grade (LUT-style) baked into every uploaded image server-side via Pillow: contrast 1.06, color 1.08, sharpness 1.12, brightness 1.02; GIFs skipped to preserve animation

## Implemented (2026-08-17, update 6)
- New "low-poly" (Stylized Low Poly) category end-to-end: backend model, gallery filter with neon active state, labeled cards/modal, admin form option, styled empty state until real pieces are added
- About aligned to 3D-only; hero third stat restored as "3D / Only discipline"

## Implemented (2026-08-17, update 5)
- Full rebrand to real identity: Aman Deep, "AD." logo, 3D/2D Game Artist at Supranic Games, stats 03+ years / 50+ assets / 2D×3D
- Real links: ArtStation artstation.com/ad0021, Instagram ad_mehta21, email deep.escape21@gmail.com (footer + Hire Me)
- Admin login email changed to deep.escape21@gmail.com (password unchanged)
- Tab title/description updated; artwork images and descriptions remain placeholder stock content

## Implemented (2026-08-17, update 4)
- Adaptive artwork detail layout: landscape renders (>1.15 aspect), videos and 3D scenes open stacked full-width (media top, info below); portrait images keep the side-by-side split. Orientation detected from image natural dimensions.

## Implemented (2026-08-17, update 3)
- Marmoset Viewer support: .mview uploads (150MB cap), media type "model", interactive 3D viewer embedded in the artwork detail modal via official marmoset.js (viewer.marmoset.co)
- Admin form accepts .mview per media row, shows "3D" chip; public modal shows "3D" thumbnail chip and mounts WebViewer
- Note: mview preview thumbnails ideally need Accept-Ranges; our file endpoint sends Content-Length (full download) — core viewing works

## Implemented (2026-08-17, update 2)
- Multi-media per artwork: media[] array (type image|video, url, label) on the artwork model
- Admin form "Extra Media" section: add/remove rows, per-row upload or URL paste, labels (Wireframe, UV Map, Turntable...), video detection by extension
- Upload endpoint accepts videos (mp4/webm/mov, 150MB) in addition to images (15MB), returns kind
- Public detail modal: thumbnail strip over the main view, label chip (e.g. WIREFRAME), videos play inline with controls
- Demo media added to NEON ORACLE using MOCKED placeholder stock images/dummy video

## Implemented (2026-08-17, update)
- Admin panel: JWT cookie auth (12h token, bcrypt, brute-force lockout 5 tries/15 min), routes /admin/login and /admin
- Admin CRUD: create/edit/delete artworks with form (title, category, year, software, polycount, description)
- Image uploads via Emergent object storage: POST /api/upload (protected), public serving at /api/files/{path}, file records in Mongo with soft-delete
- Seed switched to $setOnInsert so admin edits survive restarts

## Implemented (2026-08-17)
- Kinetic masked line-by-line hero reveal ("WORLDS / BUILT FROM / POLYGONS"), ember particles, mouse + scroll parallax clipped artwork frame, stats bar
- Slow editorial outline-text marquee
- Filterable Tetris-grid gallery (7 seeded artworks), shared-layout detail modal with software/polycount
- Numbered manifesto chapters (01–03), About with sticky portrait + toolbox grid
- Giant "LET'S TALK" footer with email + socials (hello@kaivoss.art placeholder)
- Noise overlay, neon cyan/red accents, Unbounded + JetBrains Mono + Manrope type

## Persona Data Note
Artist identity "Kai Voss", stats, bio and artwork descriptions are PLACEHOLDER copy using stock imagery — user should supply real name, renders, links.

## Backlog
- P0: Replace placeholder artworks/copy with user's real renders (now possible via /admin)
- P1: Video/turntable embeds per artwork
- P2: Blog/wip section, case-study pages per artwork, OG meta + favicon, artwork ordering (drag to reorder)

## Test Credentials
No auth — public site. See /app/memory/test_credentials.md.
