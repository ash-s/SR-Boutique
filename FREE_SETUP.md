# Free Setup for SR Boutique (No Payment Required)

Everything below is **₹0/month** for a small-to-medium clothing store.

## What we use (all free tiers)

| Service | Free limit | Good for |
|---------|------------|----------|
| **Vercel** | 100 GB bandwidth/month | Thousands of visitors |
| **Supabase** | 50,000 users/month, 500 MB DB, 1 GB images | Many customers & products |
| **WhatsApp** | Manual order confirm | Your existing business flow |

**Total monthly cost: ₹0** until you outgrow free limits (usually thousands of orders/month).

---

## Auth — 100% free (no Google Cloud)

We **do not use Google login** because Google Cloud asks for a billing card even for OAuth.

### Customer login (free)
- **Email + password** — unlimited, free
- **Phone number** — saved on profile for delivery & WhatsApp (not SMS OTP)
- **Guest checkout** — shop without account, enter phone at checkout

### Supabase auth settings
1. **Authentication → Providers → Email** → Enable, turn **OFF** “Confirm email”
2. **Do NOT enable Google** (needs paid Google Cloud)
3. **Phone OTP** — skip (SMS costs money at scale)

---

## Deploy free (Vercel)

1. Push code to GitHub (free)
2. [vercel.com](https://vercel.com) → Import repo
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER=919500943141`
4. Deploy → share link with customers

---

## When you might pay later (optional)

| Feature | Cost | When |
|---------|------|------|
| Custom domain (.in) | ~₹500–800/year | When you want `srboutique.in` |
| Google login | Google Cloud billing | Optional — not needed |
| SMS OTP login | Twilio ~₹0.50/SMS | Optional — email login is free |
| More Supabase storage | ~$25/mo | 1000+ product photos |

For most WhatsApp boutiques starting online, **free tier is enough for many customers**.

---

## Scale estimate (free tier)

- **~500–2000 orders/month** — fine on free Supabase + Vercel
- **~100 product photos** — within 1 GB storage
- **Many concurrent shoppers** — Vercel handles traffic automatically

When you grow, upgrade Supabase/Vercel only if dashboards show limits hit.
