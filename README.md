# SR Boutique — E-commerce Website

Responsive online store for **SR Boutique** with customer shopping, COD checkout, WhatsApp order confirmation, and admin panel.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Auth, PostgreSQL database, image storage
- **Vercel** — Free hosting

## Features

### Customer
- Home page with hero, categories, product grids
- Shop with filters (category, price, size, color) and sort
- Product detail with size/color selection and reviews
- Cart and COD checkout
- WhatsApp order confirmation link
- Account and order history

### Admin
- Dashboard with stats
- Product CRUD with multi-image upload
- Order management and status updates
- Customer list with order counts
- Review moderation (approve/hide/delete)

---

## Setup (Local Development)

### 1. Install dependencies

```bash
cd sr-clothings
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and run:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage.sql`
3. In **Storage**, verify bucket `product-images` exists (public)
4. Copy **Project URL** and **anon key** from Settings → API

### 3. Environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_WHATSAPP_NUMBER=919500943141
```

Default WhatsApp: **+91 9500943141** (SR Boutique business number).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create admin account

1. Register at `/register` with your email
2. In Supabase **Table Editor** → `profiles` → find your row
3. Change `role` from `customer` to `admin`
4. Visit `/admin`

---

## Deploy for Free (Vercel)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial SR Boutique e-commerce site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sr-clothings.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → import `sr-clothings`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
4. Click **Deploy**

Your site will be live at `https://sr-clothings.vercel.app` (or similar).

### Step 3: Supabase auth redirect (optional)

In Supabase **Authentication** → **URL Configuration**, add:
- Site URL: your Vercel URL
- Redirect URLs: `https://your-site.vercel.app/auth/callback`

---

## Adding Products (Admin)

1. Login as admin → `/admin`
2. Go to **Products** → **Add Product**
3. Fill name, price, category, sizes, colors, stock
4. Upload product images (stored in Supabase Storage)
5. Save — product appears on the store

---

## Order Flow

1. Customer adds items to cart
2. Checkout with delivery address (COD)
3. Order saved with status `pending`
4. Success page shows **Confirm on WhatsApp** button
5. Admin updates order status in `/admin/orders`

---

## Project Structure

```
app/
  (shop)/          Customer pages (home, shop, cart, checkout)
  admin/           Admin panel
  login/           Auth pages
lib/
  supabase/        Supabase clients
  queries.ts       Data fetching
components/
  shop/            Store UI components
  admin/           Admin UI components
supabase/
  migrations/      Database SQL
```

---

## Free Tier Limits

| Service  | Free Limit                          |
|----------|-------------------------------------|
| Vercel   | 100GB bandwidth/month               |
| Supabase | 500MB DB, 1GB storage, 50K MAU      |

Sufficient for a small boutique business.

---

## Support

For issues, check Supabase logs and Vercel deployment logs. Ensure RLS policies and storage bucket are configured correctly.
