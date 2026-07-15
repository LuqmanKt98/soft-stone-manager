# Soft Stone Manager

A modern, installable **Progressive Web App (PWA)** for managing a soft‑stone supply business — truck trips, transportation savings, payments, outstanding balances, reports and analytics. Built to be fast, responsive, and scalable.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00e599?logo=postgresql)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-c5f74f)

---

## ✨ Features

- **Dashboard** — Today / weekly / monthly sales, net profit, outstanding balance, payments received, tons delivered, truck trips, transport savings, purchase & selling totals, with interactive charts.
- **Truck Management** — Full CRUD for every truck trip with **automatic** profit calculations and a live preview panel.
- **Payment Management** — Record partial & multiple payments, track invoices, outstanding receivables and a collection‑progress meter.
- **Tracking** — Daily, weekly and monthly performance breakdowns.
- **Analytics** — Revenue growth, profit & expense trends, transportation savings, outstanding payment trend, weekly/monthly comparison, and material & truck performance.
- **Reports** — Professional **PDF** and **Excel** exports for any date range (presets + custom).
- **PWA** — Installable on Android, iPhone, Windows & macOS, with a service worker for offline support, app manifest, icons and splash screens.
- **Dark mode**, fully responsive, keyboard‑accessible, colour‑blind‑safe chart palette.

## 🧮 Financial model

All money figures come from one calculation engine (`lib/calculations.ts`):

```
purchaseCost      = tons × purchaseRate
salesRevenue      = tons × sellingRate
grossProfit       = salesRevenue − purchaseCost
transportCost     = tons × companyRentalRate     (official rate)
transportPaid     = tons × actualRentalRate      (negotiated rate)
transportSavings  = tons × (companyRentalRate − actualRentalRate)
netProfit         = grossProfit + transportSavings − loading − boarding − other
```

Transport is billed at the company rate, so the negotiated saving is real income.
Default rates are configurable in **Settings** and can be overridden per trip.

## 🛠 Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM + drizzle‑kit |
| Styling | Tailwind CSS v4 + custom shadcn‑style components |
| Charts | Recharts |
| Exports | jsPDF + jspdf‑autotable, ExcelJS |
| Icons | lucide‑react |

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    → set DATABASE_URL to your Neon connection string

# 3. Push the schema to your database
npm run db:push

# 4. Seed defaults (settings + default customer)
npm run db:seed
#    …or seed with sample data for a quick demo:
npm run db:seed -- --demo

# 5. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run db:push` | Sync the Drizzle schema to Neon |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed settings + default customer (`-- --demo` for sample data) |

## 🗄 Database schema

Normalized and designed for growth:

- **customers** — buyers (multi‑customer ready)
- **trucks** — one row per trip (the core operational + financial record)
- **payments** — receipts against the receivables ledger
- **settings** — business profile & default rates

## 📁 Project structure

```
app/                 App Router pages
  (app)/             App shell (dashboard, trucks, payments, …)
  offline/           PWA offline fallback
components/
  ui/                Reusable UI primitives (button, card, table, dialog…)
  charts/            Recharts wrappers (validated palette)
  dashboard/ trucks/ payments/ tracking/ analytics/ reports/ settings/
db/                  Drizzle schema + client
lib/                 calculations, aggregations, metrics, actions, exports
public/              manifest, service worker, icons
scripts/             seed + icon generation
```

## 📱 Installing as an app

Open the site in Chrome/Edge (desktop or Android) and use **Install** in the
address bar or the in‑app **Install** button. On iOS Safari, use **Share →
Add to Home Screen**.

## ☁️ Deployment

Ready for **Vercel**. Set the `DATABASE_URL` environment variable in the project
settings, then deploy. `npm run build` must pass (it does).

> **Security note:** this build ships without a login. If you deploy it to a
> public URL, add authentication (or Vercel Deployment Protection) before putting
> real financial data behind it.

---

Built with care for a growing stone‑supply business.
