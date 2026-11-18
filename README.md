# Agrumea Farm — Next.js + React + Three.js + GSAP + Matter.js

Scalable component-based architecture for the **Agrumea Farm** (*Dispensa Siciliana*) website inside `/Users/tamajitghosh/Desktop/Frontend`.

## Tech Stack & Component Architecture

- **Next.js (App Router) & React 18**:
  - `src/app/layout.jsx` — Root layout & metadata.
  - `src/app/page.jsx` — Main application state, GSAP cursor follower (`gsap.quickTo`), and GSAP burgundy curtain page transitions.
  - `src/app/dispensa/[slug]/page.jsx` — Dynamic product route for `/dispensa/gelsi-neri`, `/dispensa/fragole-bacche`, `/dispensa/pere-cannella`, etc.
  - `src/app/globals.css` — Global design tokens and layout styles.
- **Three.js (`src/components/ThreeJarCanvas.jsx`)**:
  - Real WebGL 3D cylindrical glass jar mesh hierarchy (`THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`, inner preserve core, `THREE.MeshPhysicalMaterial` clearcoated glass cylinder, 360° wraparound `THREE.CanvasTexture` label mesh showing both front brand artwork and back `240g` nutritional facts, and brushed metallic silver lid) animated with GSAP.
- **Matter.js + GSAP (`src/components/PhysicsPreloader.jsx`)**:
  - 2D rigid-body physics engine (`Matter.Engine`, `Matter.World`, `Matter.Bodies`) simulating falling Sicilian fruit & vegetable silhouettes while a GSAP timeline drives the `0%`–`100%` counter and orange curtain reveal.
- **GSAP Motion & Interactive Views**:
  - `src/components/OrbitalCarousel.jsx` — Orbital 3D jar showcase above the rotating decagonal burgundy wheel (`WE PRESERVE ◆ WE GROW`).
  - `src/components/ProductDetail.jsx` — Clipped title reveal, scroll-linked floating/tilting 3D jar, 3-column specifications bar, GSAP momentum-draggable gallery, and 4-card *The Other Products* grid.
  - `src/components/Header.jsx` & `src/components/Footer.jsx` — Bilingual (`IT` / `EN`) navigation bar, full-screen drawer, and editorial burgundy footer.
  - `src/data/products.js` & `src/utils/jarTextureGenerator.js` — Bilingual catalog and procedural texture generator.

## Getting Started

1. **Next.js Development Server**:
   ```bash
   cd /Users/tamajitghosh/Desktop/Frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`.

2. **Instant Zero-Install Preview**:
   `index.html` is also preserved in the root folder so you can preview the site immediately without waiting for `npm install`.
