# Mirro

Expo-first web MVP for a theatrical AI oracle with three personas:

- `The Clerk`
- `The Black Cabinet`
- `The Last Terminal`

The product is positioned as AI-generated entertainment and self-reflection, not factual prediction.

## Local development

```bash
npm install
npm run web
```

## MVP shape

- Landing page with lore, pricing, FAQ, and explicit AI disclosure
- Persona picker leading to guided ritual-chat screens
- `18+` gate before first interaction
- Free teaser, paid reading packs, and membership UI
- Local archive/settings pages with privacy-oriented deletion flow
- Local oracle fallback generator for development
- Supabase edge-function stubs for production model orchestration and billing

## Environment

Client-side remote mode is optional. If these env vars are missing, the app uses the local oracle fallback:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Supabase edge functions expect:

```bash
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=
```

These are intentionally provider-agnostic for an OpenAI-compatible or similar chat-completions API.

## Production follow-ups

- Replace the local checkout modal with Paddle hosted checkout
- Wire Supabase Auth magic links for archive ownership
- Persist archive, credits, subscriptions, and consent records in Supabase
- Add real export/delete account flows
- Review checkout/refund language with counsel for launch countries
