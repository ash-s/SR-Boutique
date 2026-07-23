# Supabase Setup for SR Boutique

Follow these steps **in order**. Takes about 10 minutes.

---

## Step 1 — Create Supabase account & project

1. Open **[https://supabase.com](https://supabase.com)** and sign up (free).
2. Click **New project**.
3. Fill in:
   - **Name:** `sr-boutique`
   - **Database password:** choose a strong password (save it somewhere safe)
   - **Region:** `South Asia (Mumbai)` or closest to you
4. Click **Create new project** and wait ~2 minutes until the dashboard loads.

You now have a **PostgreSQL database** in the cloud — no need to install Postgres on your PC.

---

## Step 2 — Run the database SQL

1. In Supabase left menu → **SQL Editor**
2. Click **New query**
3. Open this file on your PC:
   ```
   C:\Users\LDS\sr-clothings\supabase\setup-all.sql
   ```
4. **Copy all** the SQL and paste into the Supabase SQL Editor
5. Click **Run** (or Ctrl+Enter)
6. You should see **Success** — this creates:
   - Tables: profiles, categories, products, orders, reviews, cart
   - 6 categories: Women, Men, Kids, Ethnic, Western, Sale
   - Security rules (RLS)
   - Image storage bucket `product-images`

**Verify:** Go to **Table Editor** → you should see `categories` with 6 rows.

---

## Step 3 — Copy API keys to your project

1. Supabase left menu → **Project Settings** (gear icon) → **API**
2. Copy these two values:

   | Setting | Example |
   |---------|---------|
   | **Project URL** | `https://abcdefgh.supabase.co` |
   | **anon public** key | long string starting with `eyJ...` |

3. Open `C:\Users\LDS\sr-clothings\.env.local` and paste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_WHATSAPP_NUMBER=919500943141
```

Replace with your real URL and anon key. **Do not** use the `service_role` key in this file.

---

## Step 4 — Configure Auth (important)

1. Supabase → **Authentication** → **Providers** → **Email**
2. Turn **OFF** “Confirm email” (easier for testing; customers can register instantly)
3. Save

4. Go to **Authentication** → **URL Configuration**
5. Set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add `http://localhost:3000/auth/callback`

(When you deploy to Vercel later, add your Vercel URL here too.)

---

## Step 5 — Test the connection

In terminal:

```powershell
cd C:\Users\LDS\sr-clothings
npm run test:db
```

Expected output:

```
✓ Categories table (6 categories): ...
✓ Products table: 0 products
✓ Storage bucket (product-images): Bucket accessible
✓ Auth service: Auth API reachable
✅ All checks passed!
```

If anything fails, re-check Step 2 (SQL) and Step 3 (`.env.local`).

---

## Step 6 — Start the website

```powershell
npm run dev
```

Open **http://localhost:3000**

---

## Step 7 — Create your admin account

1. Go to **http://localhost:3000/register**
2. Register with your email and password
3. In Supabase → **Table Editor** → **profiles**
4. Find your row → change **role** from `customer` to `admin` → Save
5. Open **http://localhost:3000/admin**
6. Add products with photos at **Products → Add Product**

---

## What connects to what

```
Your website (Next.js)
        │
        ├── NEXT_PUBLIC_SUPABASE_URL  ──► Supabase API
        ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
        │
        └── Uses automatically:
              • PostgreSQL (products, orders, users)
              • Auth (login/register)
              • Storage (product images)
```

You **never** connect PostgreSQL directly from code — Supabase handles it via the URL + anon key.

---

## Common issues

| Problem | Fix |
|---------|-----|
| `relation "categories" does not exist` | Run `setup-all.sql` in SQL Editor |
| Login works but admin blocked | Set `role = admin` in `profiles` table |
| Image upload fails | Re-run storage part of `setup-all.sql` |
| Email confirmation required | Disable “Confirm email” in Auth settings |
| `Invalid API key` | Copy anon key again, no extra spaces in `.env.local` |

---

## Optional — View database in Supabase

- **Table Editor** — browse/edit data like Excel
- **SQL Editor** — run custom queries
- **Storage** — see uploaded product images

Database password from Step 1 is only needed if you connect external tools (pgAdmin, etc.). The website uses the anon key only.

---

## Need help?

After Steps 1–3, paste your **Project URL** (not the secret key) here and run `npm run test:db` — share the output if something fails.
