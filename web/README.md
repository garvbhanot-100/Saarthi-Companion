# Saarthi Admin (`web/`)

Real-time admin panel: logged-in users, profile, saved services, and chats from the live API.

## Setup

1. Supabase project banao; copy `lib/db/.env.example` values into `artifacts/api-server/.env` (`DATABASE_URL`, `DIRECT_URL`, `SAARTHI_ADMIN_KEY`, `PORT=5000`).
2. Prisma schema Supabase par push: `pnpm --filter @workspace/db run push`
3. Optional (SSE live updates): run SQL in `lib/db/sql/saarthi_realtime_notify.sql` on your Postgres database.
4. Copy `web/.env.example` → `web/.env` (`VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY` — same Clerk app as mobile).
5. On Render, set **`CLERK_SECRET_KEY`** (Clerk Dashboard → API Keys) so Google admin tokens validate on the API.
5. In `artifacts/saarthi-ai/.env` set `EXPO_PUBLIC_API_URL=http://localhost:5000` (use your machine IP on a physical phone).

## Run

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/saarthi-admin-web run dev
pnpm --filter @workspace/saarthi-ai run dev
```

Use **pnpm** from the repo root (not `npm` in `web/` — workspace linking breaks otherwise).

Admin login: **aaniya1985@gmail.com** or **garvbhanot990@gmail.com**, plus password from `SAARTHI_ADMIN_PASSWORD` in `artifacts/api-server/.env`.

## Deploy on Vercel (admin panel)

The API stays on Render (`https://saarthi-companion.onrender.com`). Vercel serves only the Vite admin UI.

1. Import the GitHub repo in [Vercel](https://vercel.com/new) (root directory: repo root; `vercel.json` sets build/output).
2. Add environment variable **`VITE_API_URL`** = `https://saarthi-companion.onrender.com` (Production + Preview).
3. Deploy, or from the repo root:

```bash
vercel env add VITE_API_URL production   # paste Render API URL
vercel --prod
```

`pnpm install` and `pnpm --filter @workspace/saarthi-admin-web run build` run on Vercel automatically.
