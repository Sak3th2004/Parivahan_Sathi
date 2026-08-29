# Build log — Parivahan Sathi

Agile phases with GitHub commits to https://github.com/Sak3th2004/Parivahan_Sathi.git

## Phase 0 — Foundation git
- Init `main`, `.gitignore` (blocks `.env*`), README stub, master plan
- Remote: `origin` → Parivahan_Sathi

## Phase 1 — Foundation app
- Next.js 14 App Router, TypeScript, Tailwind, shadcn-style UI primitives
- Deps: AI SDK 4, OpenAI provider, Framer Motion, Lucide, Zod
- `.env.example` with primary → fallback model envs

## Phase 2 — Backend engine
- `lib/syntheticCitizenEngine.ts` — deterministic hash-seeded citizens
- `lib/applicationCodec.ts` — stateless PS-encoded application IDs + timeline
- `lib/aiClient.ts` — round-robin model fallback (free advanced → paid mini)
- `lib/agentTools.ts` — 6 tools + deterministic eligibility fallback if LLM fails
- `app/api/agent/route.ts` — orchestrator with full open-demo system prompt

## Phase 3 — Frontend UX
- Landing: open free-text entry, example chips, bilingual, disclaimer
- Chat: `useChat`, tool pills, `?q=` handoff, tracker deep-link button

## Phase 4 — Voice + tracker
- Browser speech recognition (zero API spend) + browser TTS
- Live tracker client recompute every 2s from encoded ID

## Phase 5 — Polish
- Docs: README, CREDITS, BUILD_LOG
- Error states, a11y labels, edge-case agent prompt

## Phase 6 — QA
- SCE determinism script + local break-it checklist

## Phase 7 — Deploy
- Deferred until local green and user requests Vercel
