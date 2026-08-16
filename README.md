# AutoParts Hub — car accessories ecommerce

A Next.js (App Router, TypeScript) storefront + admin back office for selling car accessories,
organized by brand → model. Customers pick their car's brand and model to see only the
accessories that fit; checkout is cash-on-delivery (no payment gateway required). Admins manage
brands, models, accessories (quantity, storage location, buy/sell price, profit), and orders
(submitted → confirmed → processing → shipped → delivered, or canceled).

## Stack

- Next.js 15 (App Router, Server Actions, TypeScript, Tailwind CSS v4)
- PostgreSQL + Prisma ORM
- Cookie-based admin session (JWT via `jose`, password hashed with `bcryptjs`)
- No external payment provider — checkout is cash on delivery

## Project structure

- `src/app/(site)/...` — public storefront (brand grid → model grid → accessories → product →
  cart → checkout → order confirmation)
- `src/app/admin/...` — admin back office, protected by `src/middleware.ts`
  - `src/app/admin/login` — sign-in page
  - `src/app/admin/(dashboard)` — dashboard, brands & models, accessories & stock, orders
- `prisma/schema.prisma` — data model (Brand, Model, Accessory, Order, OrderItem, Admin)
- `prisma/seed.ts` — seeds a starter catalog (Toyota, Honda, Ford, BMW with a few models and
  accessories each) plus the first admin account

## Running locally

You'll need Node.js 20+ and a PostgreSQL database (a free one from Railway, Neon, or Supabase
works fine, or run Postgres locally / via Docker).

```bash
npm install
cp .env.example .env   # then edit .env with your real DATABASE_URL and SESSION_SECRET
npx prisma db push     # creates the tables
npm run db:seed        # loads the sample brands/models/accessories + admin user
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the
admin panel. The seed script creates the admin account from `ADMIN_USERNAME` /
`ADMIN_PASSWORD` in `.env` (defaults to `admin` / `ChangeMe123!` — change this immediately).

Generate a `SESSION_SECRET` with:

```bash
openssl rand -base64 32
```

## Deploying to Railway

1. Push this folder to a GitHub repository (see below).
2. In Railway: **New Project → Deploy from GitHub repo**, pick this repo.
3. Add a **PostgreSQL** database to the same project (New → Database → PostgreSQL).
4. On the app service, set these variables (Settings → Variables):
   - `DATABASE_URL` → `${{Postgres.DATABASE_URL}}` (references the Postgres plugin)
   - `SESSION_SECRET` → a long random string (see command above)
   - `ADMIN_USERNAME` → your chosen admin username
   - `ADMIN_PASSWORD` → your chosen admin password
5. Railway builds automatically via `npm run build`. On every start, `npm run start` also runs
   `prisma db push` (creates/updates tables) and the seed script (idempotent — only creates
   what's missing) before starting the server, so the database is ready with no manual step.
6. Generate a public domain for the service (Settings → Networking → Generate Domain).
7. **Change the admin password** after your first login — the seed script only sets it once.

## Pushing this folder to GitHub

From inside this folder:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(The repository already has an initial commit and its default branch is `main`.)

## Admin features

- **Dashboard** — orders by status, low-stock alerts, inventory value, potential profit.
- **Brands & models** — add/edit/hide brands, add/edit/hide models with model-year ranges.
- **Accessories & stock** — per-accessory quantity, storage location, buy price, sell price
  (profit per unit is computed automatically), category, description, image URL, and
  visibility toggle. Filterable by brand/model/name.
- **Orders** — filter by status (Submitted, Confirmed, Processing, Shipped, Delivered,
  Canceled), search by order number/name/phone, view full order detail, and change status.
  Canceling an order automatically restocks its items; reactivating a canceled order deducts
  them again.

## Notes on the sample catalog

`prisma/seed.ts` includes placeholder brands/models/accessories with illustrative USD prices —
edit or replace them freely from the admin panel, or edit the seed file and re-run
`npm run db:seed` (it's idempotent — it won't duplicate existing brands/models/SKUs).
