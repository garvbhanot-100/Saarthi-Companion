# Saarthi AI

A mobile-first guide for finding Indian government services and understanding official requirements in simple language.

This build includes the welcome experience, five-section navigation, official-source search and detail pages, AI chat with loading/error/new/clear/follow-up states, saved services, chat history, local profile flow, and AsyncStorage persistence.

The assistant uses the reviewed local government-services catalog as context and Google's `@google/genai` SDK on the server to answer user questions. The backend uses the documented Gemini text-generation API with `gemini-3.6-flash` and a `gemini-3.5-flash-lite` fallback. It does not submit applications, make eligibility decisions, or replace official portals.

Set `GEMINI_API_KEY` in `server/.env` for local development; the key is read only by the backend and must never be added to an Expo `EXPO_PUBLIC_` variable. The `.env` file is optional when hosting: set `GEMINI_API_KEY` as a Render environment variable. The server listens on `0.0.0.0` and uses `PORT` (default `3000`). `GET /health` reports server health without checking Gemini availability. The assistant endpoint has a 120-request per-IP per-minute limit; optional `ALLOWED_ORIGINS` is a comma-separated CORS allowlist for web clients.

From the repository root, start the backend with `pnpm --filter @workspace/saarthi-ai run serve` and start Expo in a separate terminal with `pnpm --filter @workspace/saarthi-ai run dev`. The server's entry point is `server/serve.js`. Run backend tests with `pnpm --filter @workspace/saarthi-ai run test` and typecheck with `pnpm --filter @workspace/saarthi-ai run typecheck`.

## Render backend

- **Root directory:** repository root (`.`), so Render can access `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
- **Build command:** `pnpm install --frozen-lockfile`
- **Start command:** `pnpm --filter @workspace/saarthi-ai run serve`
- **Environment:** configure `GEMINI_API_KEY` in Render; optionally configure `ALLOWED_ORIGINS` for Expo Web or other browser clients. Render supplies `PORT`.

For an Expo production build, set `EXPO_PUBLIC_API_URL` to the actual Render HTTPS origin (for example, `https://<your-render-service>.onrender.com`) in the Expo/EAS build environment. This is a public backend URL, not a credential. Rebuild the app after changing it. Expo Go development continues to derive the LAN backend URL unless this variable is explicitly set.
