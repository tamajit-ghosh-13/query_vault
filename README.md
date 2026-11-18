# Agrumea Farm — Next.js 14 + React 18 + Express + PostgreSQL E-Commerce

Scalable full-stack e-commerce web application for **Agrumea Farm** (*Dispensa Siciliana*), featuring a modern Next.js 14 App Router frontend paired with an Express.js and Prisma ORM PostgreSQL backend.

## Tech Stack & Architecture

- **Frontend Core (Next.js 14 & React 18)**:
  - `src/app/layout.jsx` — Root layout, metadata management, and global `StoreProvider` context wrapping.
  - `src/app/page.jsx` — Editorial home showcase, interactive carousel, and view state coordination.
  - `src/app/dispensa/[slug]/page.jsx` — Dynamic product routes with server-side static parameter generation (`generateStaticParams`).
  - `src/app/shop/page.jsx` — Product catalog with client-side category filtering, sorting, and responsive grid layouts.
  - `src/app/cart/page.jsx` & `src/app/checkout/page.jsx` — Full checkout pipeline with multi-item cart management and promotional code calculations.
  - `src/app/login/page.jsx` — User authentication and registration interface.
- **State Management & Data Layer**:
  - `src/context/StoreContext.jsx` — Centralized React Context providing cart mutations, bilingual localization (`EN` / `IT`), and persistent synchronization to `localStorage` with offline resilience.
  - `src/data/products.js` — Structured catalog data with localized organoleptic profiles, ingredients, and shelf-life metadata.
- **Backend Architecture (`server/`)**:
  - **Runtime & API:** Node.js + Express.js REST API with modular controllers, input validation middleware, and global error handling.
  - **Database & ORM:** PostgreSQL managed via Prisma ORM with normalized relations (`User`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`).
  - **Security:** HTTP-only cookie-based JWT sessions, bcrypt password hashing, and configurable CORS policies.

## Getting Started

### 1. Frontend (Next.js)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend (Express & PostgreSQL)
```bash
cd server
npm install

# Push Prisma schema to PostgreSQL & seed catalog data
npm run db:push
npm run db:seed

# Start backend server
npm start
```
API runs on [http://localhost:4000](http://localhost:4000).

## Production Build

```bash
npm run build
npm run start
```
Verified for zero-configuration deployment on Vercel.
