# Parivahan Sathi

Voice-first AI assistant for Indian RTO services — DL renewal, vehicle ownership transfer, and address changes. Built for the OpenAI Open Trial hackathon.

**Demo prototype with synthetic mock data. Not affiliated with Parivahan Sewa, MoRTH, or Government of India.**

## Who / what / why

| Question | Answer |
|---|---|
| Who faces the problem? | ~30 crore DL holders navigating confusing RTO forms |
| What is hard today? | Form numbers, NOC rules, average ~4 RTO visits |
| What we changed | One open conversation (Hindi / English / Hinglish), any DL number |
| Why better | No portal maze; catches eligibility issues before filing |
| Works today | Full citizen journey with **mock** profiles, slots, filing, live tracker |
| Still mocked | Citizen records (SCE), filing, slots, fees — no live gov systems |
| Scale plan | Vahan/Sarathi APIs, DigiLocker, UPI, Aadhaar OTP, WhatsApp |

## Complete citizen journey

1. Landing → type or speak any problem (any DL)
2. Chat agent looks up **Synthetic Citizen Engine** profile (deterministic)
3. Eligibility analyst applies CMV-style rules (medical / NOC / retest)
4. Fix docs → pick slot → confirm → file
5. Open **live tracker** (`/track/PS…`) — steps advance without a database

## Quick start (local)

```bash
npm install
cp .env.example .env.local
# Put OPENAI_API_KEY in .env.local
# Optional: OPENAI_PRIMARY_MODEL=… for your free daily quota model
npm run dev
```

Open http://localhost:3000

### Model spend strategy

1. **Primary** (`OPENAI_PRIMARY_MODEL`, default `gpt-5.6-luna`) — use free/advanced daily quota first  
2. **Secondary** (optional `OPENAI_SECONDARY_MODEL`)  
3. **Fallback** (`gpt-4o-mini`) — protect your paid $5 wallet  
4. Voice uses **browser speech** — no Whisper API cost  

### Smoke test (no API key)

```bash
npx tsx scripts/smoke-sce.ts
```

## Stack

Next.js 14 · Tailwind · Vercel AI SDK · OpenAI models · Framer Motion · Web Speech API  

See [CREDITS.md](CREDITS.md) and [BUILD_LOG.md](BUILD_LOG.md).

## Judges: how to try it

- Type any DL (e.g. `MH14-99887766`) and say your license expired  
- Switch to Hindi and try again with a different made-up DL  
- Type garbage DL text — it still generates a consistent mock profile  
- Ask for something out of scope (international permit) — honest roadmap reply  
