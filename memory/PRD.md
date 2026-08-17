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
- P0: Replace placeholder artworks/copy with user's real renders (needs upload mechanism or CMS)
- P1: Admin panel to add/edit artworks
- P1: Video/turntable embeds per artwork
- P2: Blog/wip section, case-study pages per artwork, OG meta + favicon

## Test Credentials
No auth — public site. See /app/memory/test_credentials.md.
