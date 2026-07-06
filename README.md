# 🍒 Cherryflix

A private, invite-only anime & movie streaming site — Netflix-style — built with
**Next.js 16 (App Router)**, **Tailwind CSS**, **Auth.js (magic-link login via
Resend)**, and **Neon Postgres**. Deployed on **Vercel**.

- 🎬 Browse anime series (with episodes) and movies
- ▶️ Built-in video player (direct MP4 sources)
- ✉️ **Invite-only:** the owner invites people by email; they get a one-click
  sign-in link and can watch. No passwords.
- 📊 **Owner dashboard** (`/admin`, only your email): active members, pending
  invites, weekly-active count, and invite management.

---

## Content

All titles live in [`src/lib/content.ts`](src/lib/content.ts) — no CMS or database
for content. To add a show or movie, add an object to `CATALOG`. Swap the
`poster` / `backdrop` / `video` URLs for your own (videos must be direct `.mp4`
links).

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Create the free accounts

| Service    | What you need                                 | Where              |
| ---------- | --------------------------------------------- | ------------------ |
| **Neon**   | A Postgres connection string (`DATABASE_URL`) | https://neon.tech  |
| **Resend** | An API key (`RESEND_API_KEY`)                 | https://resend.com |
| **Vercel** | For deployment (connect your GitHub repo)     | https://vercel.com |

### 3. Environment variables

Copy `.env.example` → `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

- `DATABASE_URL` — from Neon → **Connect**
- `RESEND_API_KEY` — from Resend → **API Keys**
- `EMAIL_FROM` — `Cherryflix <onboarding@resend.dev>` works for testing; use your
  own verified domain to email anyone.
- `AUTH_SECRET` — generate with `npx auth secret`
- `AUTH_URL` — `http://localhost:3000` locally; your Vercel URL in production
- `ADMIN_EMAILS` — your email(s), comma-separated. These accounts see `/admin`.

### 4. Initialize the database (once)

```bash
node --env-file=.env.local scripts/init-db.mjs
```

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000. Because you're in `ADMIN_EMAILS`, sign in with your
email, then invite people from **Dashboard**.

---

## How the invite flow works

1. You open **/admin** and enter a friend's email → **Send invite**.
2. They receive a *"Sign in to Cherryflix"* email (via Resend).
3. They click the link → they're in and watching. That click is the "accept".
4. Their status flips to **Active** on your dashboard.

> **Resend note:** the sandbox sender `onboarding@resend.dev` can only email
> *your own* Resend account address. To invite anyone, verify a domain in Resend
> and set `EMAIL_FROM` to an address on that domain.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. On Vercel → **New Project** → import the repo.
3. Add the same env vars from `.env.local` in **Project Settings → Environment
   Variables** (set `AUTH_URL` to your Vercel URL).
4. Deploy. Run the DB init once (locally against the same `DATABASE_URL`, or via
   a Neon SQL editor using the SQL in `scripts/init-db.mjs`).

---

## Tech

- Next.js 16 · React 19 · Tailwind CSS v4
- Auth.js v5 (`next-auth@beta`) + `@auth/pg-adapter`
- Neon serverless Postgres
- Resend (transactional email / magic links)
