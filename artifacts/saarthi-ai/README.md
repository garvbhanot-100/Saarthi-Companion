# Saarthi AI

A mobile-first guide for finding Indian government services and understanding official requirements in simple language.

This build includes the welcome experience, five-section navigation, official-source search and detail pages, AI-style chat with loading/error/new/clear/follow-up states, saved services, chat history, local profile flow, and AsyncStorage persistence.

The first build deliberately uses a reviewed local catalog and deterministic assistant responses so it never invents government information. It does not submit applications, make eligibility decisions, or replace official portals.

Before production, connect a secure authentication provider such as Clerk, a server-side AI provider, a server-side official retrieval service, and database-backed authenticated API routes. Keep provider keys in Replit Secrets and never ship them in the Expo bundle. The service seam is services/assistant.ts.

Run with the configured Expo workflow. Typecheck with pnpm --filter @workspace/saarthi-ai run typecheck.
