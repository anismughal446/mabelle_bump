# Mabelle Bump — Maternity & Clothing Platform

A full-stack maternity clothing store built with **Next.js (App Router — React)**, **PostgreSQL**, and **Drizzle ORM**.

## Differentiators
- 🤰 **Trimester-based shopping** — filter by 1st/2nd/3rd trimester & postpartum
- 📸 **Bump Growth Tracker** — upload weekly photos and build a timeline
- ✨ **Find My Style quiz** — a short quiz generates a personalized capsule wardrobe
- 🔁 **Rent Clothes** — subscription rental plans for rentable pieces
- 🏷️ **Wear-it-3-ways & nursing-friendly** tagging

## Features
- **Customer:** shop with filters, product detail + reviews, cart, wishlist, checkout with coupons, order tracking, account & addresses, bump tracker, style quiz
- **Vendor:** dashboard with product CRUD and order visibility
- **Admin:** dashboard with sales analytics, product/order/user/coupon management, and blog CMS
- **Auth:** JWT (httpOnly cookie) + bcrypt password hashing, role-based access
- **User friendly:** simple, clear navigation labels so any user can shop easily; product names shown clearly under each image

## Tech stack
- Next.js 16 (App Router, React, Route Handlers) — frontend + backend in one project
- PostgreSQL + Drizzle ORM
- Tailwind CSS v4
- bcryptjs + jsonwebtoken

## Getting started
```bash
npm install
# ensure DATABASE_URL is set in .env (see .env.example)
npx drizzle-kit push        # create tables
npx tsx src/db/seed.ts      # seed demo data
npm run dev
```

## Demo account emails
| Role     | Email                     |
|----------|---------------------------|
| Admin    | admin@mabellebump.com     |
| Vendor   | vendor@mabellebump.com    |
| Customer | customer@mabellebump.com  |

## Coupons
- `BUMP15` — 15% off
- `WELCOME10` — $10 off
