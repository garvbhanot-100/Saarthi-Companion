# Saarthi AI

A mobile-first guide for finding Indian government services and understanding official requirements in simple language.

This build includes the welcome experience, five-section navigation, official-source search and detail pages, AI chat with loading/error/new/clear/follow-up states, saved services, chat history, local profile flow, and AsyncStorage persistence.

The assistant uses the reviewed local government-services catalog as context and Groq's OpenAI-compatible chat completions API (`https://api.groq.com/openai/v1/chat/completions`) on the server to answer user questions. The model comes from `GROQ_MODEL` (default `openai/gpt-oss-20b`). Because Groq's free tier allows only 8,000 tokens per minute, the server forwards only the catalog rows relevant to each question. It does not submit applications, make eligibility decisions, or replace official portals.

Set `GROQ_API_KEY` and `GROQ_MODEL` in `server/.env` for local development (see `server/.env.example`); the key is read only by the backend and must never be added to an Expo `EXPO_PUBLIC_` variable. The `.env` file is optional when hosting: set `GROQ_API_KEY` and `GROQ_MODEL` as Render environment variables. The server listens on `0.0.0.0` and uses `PORT` (default `3000`). `GET /health` reports server health without checking Groq availability. The assistant endpoint has a 120-request per-IP per-minute limit; optional `ALLOWED_ORIGINS` is a comma-separated CORS allowlist for web clients.

From the repository root, start the backend with `pnpm --filter @workspace/saarthi-ai run serve` and start Expo in a separate terminal with `pnpm --filter @workspace/saarthi-ai run dev`. The server's entry point is `server/serve.js`. Run backend tests with `pnpm --filter @workspace/saarthi-ai run test` and typecheck with `pnpm --filter @workspace/saarthi-ai run typecheck`.

## Render backend

- **Root directory:** repository root (`.`), so Render can access `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
- **Build command:** `pnpm install --frozen-lockfile`
- **Start command:** `pnpm --filter @workspace/saarthi-ai run serve`
- **Environment:** configure `GROQ_API_KEY` and `GROQ_MODEL` in Render (and remove the old `GEMINI_API_KEY`); optionally configure `ALLOWED_ORIGINS` for Expo Web or other browser clients. Render supplies `PORT`.

For an Expo production build, set `EXPO_PUBLIC_API_URL` to the actual Render HTTPS origin (for example, `https://<your-render-service>.onrender.com`) in the Expo/EAS build environment. This is a public backend URL, not a credential. Rebuild the app after changing it. Expo Go development continues to derive the LAN backend URL unless this variable is explicitly set.
