# Shop Point Management System

A shop management system built for a combined **Aata Chakki (flour mill) +
Karyana (grocery) store** — billing/POS, inventory, a wheat-grinding service
ledger, customer credit (Udhaar) tracking, supplier purchases, expenses, and
sales reports. Built with the MERN stack (MongoDB, Express, React, Node).

## Features

- **Billing (POS)** — cart-based billing with custom per-item pricing,
  cash/credit sales, printable invoices, and automatic stock deduction
- **Inventory** — products with stock levels, low-stock alerts, and a
  dedicated stock-adjustment flow
- **Grinding Service** — a separate ledger for wheat-grinding charges that
  doesn't touch inventory, with its own cash/credit support
- **Customers (Udhaar)** — a running credit ledger per customer, with full
  transaction history, partial payments, and payment history
- **Suppliers & Purchases** — track stock received and what's owed to
  suppliers
- **Expenses** — categorized expense tracking
- **Sales History** — a filterable, date-ranged view across sales and
  grinding records
- **Reports & Dashboard** — daily sales charts, top products, profit & loss,
  low-stock summary
- **Role-based access** — an `owner` role with full access, and a `staff`
  role limited to billing/inventory (no cost prices, no profit/expense data)
- **Dark / light theme** — toggle in the sidebar, persisted per browser

## Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS v4, React Router, Recharts,
  lucide-react
- **Backend**: Node.js + Express 5, MongoDB + Mongoose, JWT auth, bcrypt
- **Currency**: PKR (Rs.)

## Project Structure

```
.
├── client/          React frontend (Vite)
├── server/          Express API + MongoDB models
└── saas-roadmap/    Standalone planning notes for a possible future
                      multi-tenant SaaS version (not part of the running app)
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either [MongoDB Atlas](https://www.mongodb.com/atlas)
  (cloud, free tier available) or a local MongoDB install / MongoDB Compass
  local deployment

## Setup

Clone the repo, then set up each half:

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your own values:

```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/shop_manager
JWT_SECRET=a-long-random-secret
```

Seed the initial owner account (username `owner`, password `owner123` —
**change this password after your first login**):

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The client runs on Vite's default dev port (5173, or the next free port if
that's taken) and proxies `/api` requests to the backend on port 5001 — see
`client/vite.config.js` if you change the backend port.

### 3. Log in

Open the client in your browser and log in with the seeded owner account.
From there, use **Staff Accounts** to create logins for cashiers/staff.

## `saas-roadmap/`

A folder of planning notes on what it would take to turn this from a
single-shop tool into a multi-tenant product other shop owners could sign up
for — multi-tenancy, billing, security, legal, etc. It's reference material
for a possible future direction, not part of the running application, and
has no effect on `client/` or `server/`.

## License

Private project — no license specified.
