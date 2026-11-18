# Agrumea Farm — Backend API

Express + Prisma + PostgreSQL REST API powering the Agrumea Farm e-commerce frontend.

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** 14+ running locally (or a hosted instance)

---

## Setup

```bash
# 1. Enter the server directory
cd server

# 2. Install dependencies
npm install

# 3. Copy the example env file and configure your database
cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres connection string

# 4. Push the Prisma schema to your database (creates tables)
npm run db:push

# 5. Seed the product catalog
npm run db:seed

# 6. Start the development server (auto-restarts on save)
npm run dev
```

The API will be available at **http://localhost:4000**.

---

## Environment Variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/agrumea_db` | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret key for signing JWTs (**change in production**) |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register a new user. Body: `{ name, email, password }` |
| `POST` | `/api/auth/login` | — | Log in. Body: `{ email, password }`. Returns JWT + sets httpOnly cookie |
| `POST` | `/api/auth/logout` | — | Clear auth cookie |
| `GET` | `/api/auth/me` | ✅ | Return current user from token |

### Cart — `/api/cart`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/cart` | ✅ | Fetch all cart items for user |
| `POST` | `/api/cart/sync` | ✅ | Sync full cart. Body: `{ items: [{productId, weight, quantity}] }` |
| `POST` | `/api/cart/item` | ✅ | Add/upsert one item. Body: `{ productId, weight, quantity }` |
| `PUT` | `/api/cart/item/:id` | ✅ | Update item quantity. Body: `{ quantity }`. Quantity ≤ 0 deletes the item |
| `DELETE` | `/api/cart/item/:id` | ✅ | Remove one item by id |
| `DELETE` | `/api/cart/clear` | ✅ | Clear entire cart |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | ✅ | Create order. Body: `{ items, subtotal, discount, shipping, total, promoCode }`. Clears cart. |
| `GET` | `/api/orders` | ✅ | List all orders for the authenticated user (newest first) |

### Products — `/api/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | — | List all products |
| `GET` | `/api/products/:id` | — | Get single product by id |

### Misc

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ status: "ok" }` |

---

## Connecting from the Next.js Frontend

Add to your frontend's `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The `StoreContext.jsx` already reads this variable and falls back gracefully when no backend is running.

---

## Useful Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start without hot reload |
| `npm run db:push` | Push schema to DB without migrations |
| `npm run db:migrate` | Create a named migration |
| `npm run db:seed` | Seed product catalog |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run prisma:generate` | Regenerate Prisma client |

---

## Auth Flow

- **Register / Login** → returns `{ user, token }` JSON + sets an `agrumea_token` **httpOnly cookie** (7-day TTL).
- Subsequent requests can authenticate via either:
  - `Authorization: Bearer <token>` header, or
  - The `agrumea_token` cookie (sent automatically by the browser when `credentials: 'include'`).
- **Logout** clears the cookie server-side.
