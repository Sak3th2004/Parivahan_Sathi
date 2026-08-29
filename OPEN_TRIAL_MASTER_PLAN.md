# PARIVAHAN SATHI — OPEN TRIAL MASTER PLAN (v3)
### No scripted personas. Judges type anything. It just works.

**This replaces the persona-based approach entirely.** Same problem (RTO services), same tools pattern, same GPT-5 → GPT-4o-mini fallback — but the mock backend is now a **deterministic generator**, not a fixed lookup table. Any DL number a judge types produces a real, consistent, testable profile instantly.

---

## 0. What Changed And Why

**Old problem:** 3 hardcoded citizens, judges must type exact trigger phrases, breaks on anything else. Feels like a fake demo.

**New answer — Synthetic Citizen Engine (SCE):**
- Judge types ANY DL number (real-looking or garbage) → a deterministic hash-based generator produces a plausible Indian citizen profile: name, age, state, DL status, document statuses, sometimes a vehicle
- **Same input always produces the same output** (pure function of the string — no LLM call for data, no database, no server memory needed)
- Roughly half of generated profiles have a realistic issue baked in (missing medical cert, NOC, expired doc) so the agent's "catch it before filing" behavior is provable no matter what a judge types
- **Zero hallucination risk on the data layer** — GPT-5 is used only for understanding free text and applying rules, never for inventing citizen facts
- **Stateless and serverless-safe** — application tracking encodes its own data in the ID (base64), so it works correctly even across different edge function instances, with no database

This is a genuinely more advanced architecture than persona-based demos. It's also your strongest talking point in the video.

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│         USER (judge, real citizen, anyone) — free text       │
│      Any language. Any DL number. Any phrasing. No script.   │
└──────────────────────────┬───────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │  Orchestrator Agent      │
              │  GPT-5 → GPT-4o-mini     │  ← auto fallback
              │  (understands intent,    │
              │   any language, any way  │
              │   of phrasing the ask)   │
              └────────────┬────────────┘
                           │
        ┌──────────┬───────┼───────┬──────────┬──────────┐
        ▼          ▼       ▼       ▼          ▼          ▼
  get_or_generate check_svc fix_doc find_slot submit    track
   _citizen      _eligibility (mock) (mock)   _app      _app
       │              │
       ▼              ▼
  ┌─────────┐   ┌──────────────┐
  │Synthetic│   │RTO Eligibility│  ← GPT-5 sub-agent
  │Citizen  │   │Analyst        │     with CMV Rules
  │Engine   │   │(GPT-5→4o-mini)│
  │(pure fn,│   └──────────────┘
  │no LLM,  │
  │no DB,   │
  │instant, │
  │determin-│
  │istic)   │
  └─────────┘
```

**Key property:** No database, no fixed users, no server memory required for correctness. Everything is either a pure deterministic function (citizen generation, application encoding) or a stateless LLM call (understanding + rules).

---

## 2. Complete Code

### 2.1 `lib/syntheticCitizenEngine.ts` (NEW — the core innovation)

```typescript
// lib/syntheticCitizenEngine.ts
// Deterministic, hash-seeded mock citizen generator.
// Same input string ALWAYS produces the same output. No LLM. No DB. Instant.

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// mulberry32 seeded PRNG — deterministic, fast
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATE_CODE_MAP: Record<string, { state: string; names: string[] }> = {
  BR: { state: "Bihar", names: ["Ramesh Kumar", "Sunita Devi", "Manoj Yadav", "Kavita Singh"] },
  UP: { state: "Uttar Pradesh", names: ["Rajesh Verma", "Fatima Begum", "Anil Tiwari", "Zeenat Khan"] },
  KA: { state: "Karnataka", names: ["Priya Sharma", "Manjunath Rao", "Deepa Gowda", "Suresh Hegde"] },
  DL: { state: "Delhi", names: ["Suresh Nair", "Neha Kapoor", "Vikram Chawla", "Ayesha Ali"] },
  MH: { state: "Maharashtra", names: ["Rohan Deshmukh", "Sneha Patil", "Amit Joshi", "Pooja Shah"] },
  TN: { state: "Tamil Nadu", names: ["Karthik Raman", "Lakshmi Iyer", "Suresh Pillai", "Divya Krishnan"] },
  WB: { state: "West Bengal", names: ["Arjun Banerjee", "Ritu Das", "Sourav Ghosh", "Mou Sengupta"] },
  RJ: { state: "Rajasthan", names: ["Vikram Singh Rathore", "Meena Chouhan", "Devendra Shekhawat", "Anita Rajput"] },
  GJ: { state: "Gujarat", names: ["Kiran Patel", "Bhavesh Shah", "Nisha Trivedi", "Jignesh Mehta"] },
  PB: { state: "Punjab", names: ["Gurpreet Singh", "Simran Kaur", "Harjit Dhillon", "Manpreet Sidhu"] },
  KL: { state: "Kerala", names: ["Suresh Nair", "Anitha Menon", "Bijoy Thomas", "Reshma Pillai"] },
  TS: { state: "Telangana", names: ["Srinivas Reddy", "Padma Rao", "Naveen Kumar", "Sravani Goud"] },
};
const FALLBACK_NAMES = ["Arun Prakash", "Geeta Sharma", "Mohan Lal", "Sarita Devi"];

export type SyntheticCitizen = {
  dlNumber: string;
  name: string;
  age: number;
  occupation: string;
  state: string;
  rtoCode: string;
  dl: { issueDate: string; expiryDate: string; class: string[]; status: "valid" | "expired" | "expired_over_1yr" };
  vehicle: { rcNumber: string; model: string; sameStateAsOwner: boolean; interstateOriginState: string | null } | null;
  documents: { aadhaar: "verified" | "missing"; addressProof: "verified" | "missing"; medicalCert: "verified" | "missing"; noc: "verified" | "missing" };
  currentAddress: string;
};

const OCCUPATIONS = ["Taxi driver", "Tailor", "Software Engineer", "Bank Officer", "Farmer", "Shop owner", "Teacher", "Electrician", "Auto driver", "Government clerk"];
const CITIES = ["Sector 12", "MG Road area", "Old Town", "Civil Lines", "Gandhi Nagar", "Model Town", "Station Road"];

export function generateCitizen(rawInput: string): SyntheticCitizen {
  const input = rawInput.trim().toUpperCase();
  const seed = hashString(input);
  const rand = mulberry32(seed);

  // Try to extract a 2-letter state code from the input; default to a rotating fallback if none found
  const codeMatch = input.match(/[A-Z]{2}/);
  const code = codeMatch ? codeMatch[0] : Object.keys(STATE_CODE_MAP)[Math.floor(rand() * 12)];
  const stateInfo = STATE_CODE_MAP[code] || { state: "Unknown State (demo)", names: FALLBACK_NAMES };

  const age = 21 + Math.floor(rand() * 50); // 21–70
  const name = stateInfo.names[Math.floor(rand() * stateInfo.names.length)];
  const occupation = OCCUPATIONS[Math.floor(rand() * OCCUPATIONS.length)];

  // DL status distribution: 40% valid, 35% expired <1yr, 25% expired >1yr
  const statusRoll = rand();
  const dlStatus = statusRoll < 0.4 ? "valid" : statusRoll < 0.75 ? "expired" : "expired_over_1yr";
  const issueYear = 2026 - (age - 18 > 25 ? 25 : Math.max(1, age - 18));
  const expiryYear = dlStatus === "valid" ? 2027 + Math.floor(rand() * 8) : dlStatus === "expired" ? 2025 : 2022;

  // Document issues: weighted so ~50% of profiles have at least one real issue to demonstrate the agent's catch
  const medicalCertMissing = age >= 50 && rand() < 0.7;
  const addressProofMissing = rand() < 0.15;
  const hasVehicle = rand() < 0.55;
  let vehicle: SyntheticCitizen["vehicle"] = null;
  let nocMissing = false;

  if (hasVehicle) {
    const interstate = rand() < 0.4;
    const originCodes = Object.keys(STATE_CODE_MAP).filter(c => c !== code);
    const originCode = interstate ? originCodes[Math.floor(rand() * originCodes.length)] : code;
    nocMissing = interstate && rand() < 0.6;
    vehicle = {
      rcNumber: `${code}-${(10 + Math.floor(rand() * 89))}-${["CA","MG","AB","XY","PQ"][Math.floor(rand()*5)]}-${1000 + Math.floor(rand()*8999)}`,
      model: ["Maruti Swift", "Honda City", "Hyundai i20", "Tata Nexon", "Toyota Innova"][Math.floor(rand() * 5)] + " " + (2016 + Math.floor(rand() * 9)),
      sameStateAsOwner: !interstate,
      interstateOriginState: interstate ? (STATE_CODE_MAP[originCode]?.state || "Another State") : null
    };
  }

  return {
    dlNumber: input,
    name, age, occupation,
    state: stateInfo.state,
    rtoCode: code,
    dl: {
      issueDate: `${issueYear}-0${1 + Math.floor(rand()*8)}-1${Math.floor(rand()*9)}`,
      expiryDate: `${expiryYear}-0${1 + Math.floor(rand()*8)}-1${Math.floor(rand()*9)}`,
      class: ["LMV"],
      status: dlStatus
    },
    vehicle,
    documents: {
      aadhaar: "verified",
      addressProof: addressProofMissing ? "missing" : "verified",
      medicalCert: medicalCertMissing ? "missing" : "verified",
      noc: nocMissing ? "missing" : "verified"
    },
    currentAddress: `${CITIES[Math.floor(rand() * CITIES.length)]}, ${stateInfo.state}`
  };
}
```

### 2.2 `lib/applicationCodec.ts` (NEW — stateless application tracking)

```typescript
// lib/applicationCodec.ts
// Encodes application data directly into the ID (base64url). No database, no
// server memory required — works correctly across serverless/edge instances.

export type ApplicationData = {
  dlNumber: string;
  service: string;
  formType: string;
  fees: number;
  rtoCode: string;
  slotDate: string | null;
  filedAtMs: number;
  slotRequired: boolean;
};

const STEP_DELAYS_MS = [0, 8000, 16000, 24000]; // demo speed: steps "complete" at these offsets

export function encodeApplication(data: ApplicationData): string {
  const json = JSON.stringify(data);
  const b64 = Buffer.from(json).toString("base64url");
  return `PS${b64}`;
}

export function decodeApplication(id: string): ApplicationData | null {
  try {
    const b64 = id.startsWith("PS") ? id.slice(2) : id;
    const json = Buffer.from(b64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function computeTimeline(data: ApplicationData) {
  const elapsed = Date.now() - data.filedAtMs;
  const stepNames = [
    { en: "Application submitted", hi: "Application file ho gaya" },
    { en: "Document verification", hi: "Documents verify ho rahe hain" },
    { en: data.slotRequired ? "RTO visit & biometric" : "Officer approval", hi: data.slotRequired ? "RTO visit + biometric" : "Officer approval" },
    { en: "Certificate dispatched", hi: "Certificate ghar bhej diya" }
  ];
  return stepNames.map((step, i) => ({
    step: step.en,
    stepHi: step.hi,
    done: elapsed >= STEP_DELAYS_MS[i],
    timestamp: elapsed >= STEP_DELAYS_MS[i] ? new Date(data.filedAtMs + STEP_DELAYS_MS[i]).toISOString() : null
  }));
}
```

### 2.3 `lib/agentTools.ts` (UPDATED)

```typescript
// lib/agentTools.ts
import { tool } from "ai";
import { z } from "zod";
import { generateCitizen } from "./syntheticCitizenEngine";
import { encodeApplication } from "./applicationCodec";
import { generateWithFallback } from "./aiClient";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const agentTools = {
  get_citizen_profile: tool({
    description: "Fetch or generate the citizen's DL/RC profile for ANY DL number the user provides — this works for literally any input, generating a consistent demo profile. Call this first once you have a DL number.",
    parameters: z.object({ dlNumber: z.string().min(3).describe("Any DL number string the user gave, even informal") }),
    execute: async ({ dlNumber }) => {
      await delay(600);
      const c = generateCitizen(dlNumber);
      return c;
    }
  }),

  check_service_eligibility: tool({
    description: "MUST be called before submit_application. Runs the RTO Eligibility Analyst sub-agent applying Central Motor Vehicles Rules to the citizen's actual generated profile.",
    parameters: z.object({
      dlNumber: z.string(),
      service: z.enum(["dl_renewal", "dl_address_change", "vehicle_transfer", "rc_address_change", "combined_address_change"])
    }),
    execute: async ({ dlNumber, service }) => {
      await delay(1000);
      const c = generateCitizen(dlNumber); // pure function — always same result for same dlNumber

      const rules = `You are an RTO Eligibility Analyst. Apply Central Motor Vehicles Rules.

Citizen: ${JSON.stringify(c)}
Requested service: ${service}

RULES:
DL RENEWAL (Form 9):
- dl.status "expired_over_1yr" → fresh driving test required (issue: "retest_required")
- age >= 50 → medical certificate Form 1A mandatory (issue: "medical_cert_needed" if documents.medicalCert !== "verified")
- Fees: base 200 + 500 late fee if status !== "valid"

VEHICLE TRANSFER (Form 29+30):
- requires vehicle to be non-null. If vehicle is null, set eligible:false, issues:["no_vehicle_on_record"]
- if vehicle.sameStateAsOwner === false → interstate → NOC required (issue: "noc_needed" if documents.noc !== "verified")
- Fees: 500

RC ADDRESS CHANGE (Form 33): requires vehicle non-null. Fees 100. issue "address_proof_missing" if documents.addressProof !== "verified"
DL ADDRESS CHANGE (Form LLD): Fees 100. issue "address_proof_missing" if documents.addressProof !== "verified"
COMBINED (33+LLD): requires vehicle non-null. Fees 200, no slot if same RTO.

Return ONLY JSON:
{ "eligible": boolean, "issues": string[], "formType": "9"|"29+30"|"33"|"LLD"|"33+LLD", "fees": number, "slotRequired": boolean, "estimatedDays": number, "reasoning": "one short sentence" }`;

      const { text } = await generateWithFallback(rules);
      try {
        const m = text.match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : { error: "parse failed", raw: text };
      } catch {
        return { error: "invalid JSON", raw: text };
      }
    }
  }),

  fix_document_issue: tool({
    description: "Mark a flagged document issue as resolved after the user confirms they have it. This is a mock repair — always succeeds.",
    parameters: z.object({
      issue: z.enum(["medical_cert", "noc", "address_proof"]),
      referenceGiven: z.string().describe("Whatever reference/confirmation the user gave")
    }),
    execute: async ({ issue, referenceGiven }) => {
      await delay(1200);
      // Stateless design: the fix is acknowledged in conversation; eligibility
      // re-check in the SAME turn should treat this issue as resolved because
      // the agent tracks it in conversation context, not a mutable DB.
      return { success: true, issueResolved: issue, message: `${issue} marked verified (ref: ${referenceGiven})` };
    }
  }),

  find_available_slot: tool({
    description: "Find nearest available slot at citizen's RTO.",
    parameters: z.object({ rtoCode: z.string() }),
    execute: async ({ rtoCode }) => {
      await delay(700);
      const dayNames = ["Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar"];
      const slots = [1, 2, 3].map(i => {
        const d = new Date();
        d.setDate(d.getDate() + i * 2);
        return { date: d.toISOString().split("T")[0], dayHi: dayNames[i % 5], time: i % 2 ? "10:30" : "14:00", slotId: `${rtoCode}-${d.getTime()}` };
      });
      return { slots };
    }
  }),

  submit_application: tool({
    description: "File the application. ONLY call after eligibility passes with no unresolved issues. Uses a stateless encoded ID so tracking works reliably.",
    parameters: z.object({
      dlNumber: z.string(),
      service: z.string(),
      formType: z.string(),
      fees: z.number(),
      rtoCode: z.string(),
      slotDate: z.string().optional(),
      slotRequired: z.boolean()
    }),
    execute: async ({ dlNumber, service, formType, fees, rtoCode, slotDate, slotRequired }) => {
      await delay(1500);
      const id = encodeApplication({
        dlNumber, service, formType, fees, rtoCode,
        slotDate: slotDate ?? null,
        filedAtMs: Date.now(),
        slotRequired
      });
      return { applicationId: id, trackingUrl: `/track/${id}`, estimatedDays: 7 };
    }
  }),

  track_application: tool({
    description: "Get status of a filed application by its ID.",
    parameters: z.object({ applicationId: z.string() }),
    execute: async ({ applicationId }) => {
      const { decodeApplication, computeTimeline } = await import("./applicationCodec");
      const data = decodeApplication(applicationId);
      if (!data) return { error: "Invalid or unrecognized application ID" };
      return { status: "in_progress", timeline: computeTimeline(data), fees: data.fees };
    }
  })
};
```

**Important behavioral note for the agent (in the system prompt below):** because `fix_document_issue` doesn't mutate a database, the orchestrator must **remember within the conversation** that an issue was resolved and not call `check_service_eligibility` again expecting the underlying generated profile to have changed — instead, when re-confirming, it should just state the resolved issue and proceed to `submit_application` directly. The system prompt handles this explicitly (see 2.5).

### 2.4 `app/track/[applicationId]/page.tsx` — decode-based tracker

```typescript
// app/track/[applicationId]/page.tsx
import { decodeApplication, computeTimeline } from "@/lib/applicationCodec";
import TrackerClient from "./TrackerClient";

export default function TrackPage({ params }: { params: { applicationId: string } }) {
  const data = decodeApplication(params.applicationId);
  if (!data) {
    return <div className="p-8 text-center">Application not found. Check the link and try again.</div>;
  }
  const timeline = computeTimeline(data);
  return <TrackerClient data={data} initialTimeline={timeline} applicationId={params.applicationId} />;
}
```

*(Codex Prompt D below generates `TrackerClient.tsx` — a client component that polls `computeTimeline`-equivalent logic every 3s via a small `/api/timeline?id=` route, or simplest: just re-renders based on `Date.now()` client-side with a `setInterval`, no API call needed at all since the codec logic can run client-side too if you export it from a shared module.)*

### 2.5 `app/api/agent/route.ts` — UPDATED system prompt (handles ALL edge cases)

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { agentTools } from "@/lib/agentTools";
import { PRIMARY_MODEL, FALLBACK_MODEL } from "@/lib/aiClient";

export const runtime = "edge";
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Parivahan Sathi — an AI assistant for Indian RTO services (DL renewal, vehicle ownership transfer, address changes). This is an OPEN DEMO — the user may type absolutely anything, in any language, in any order. You must handle it gracefully, never break, never require a specific script.

CORE RULES:
1. Match the user's language exactly — Hindi (Devanagari), English, or Hinglish. Never force one language.
2. Reply in 2-3 short sentences MAX. Conversational, not an essay. No markdown, no bullet points, no headers.
3. Never ask for real Aadhaar, PAN, passwords, or OTPs — this is a mock demo.
4. ALWAYS call check_service_eligibility BEFORE submit_application.
5. get_citizen_profile works for ANY DL number string, even garbage input — it always returns a usable profile. Never tell the user their DL "doesn't exist."

SERVICES SUPPORTED (map free-form requests to these):
- dl_renewal — "renew my license", "DL expired", "license update"
- dl_address_change — "change address on my license"
- vehicle_transfer — "transfer ownership", "bought a used car", "change RC name"
- rc_address_change — "update address on RC/registration"
- combined_address_change — user wants both DL and RC address updated together

EDGE CASE HANDLING (must follow):
- No DL number given yet → ask for it naturally, don't demand a format.
- DL number looks unusual/garbage → proceed anyway using get_citizen_profile (it always works), don't reject the user.
- User's request is ambiguous ("I need help with my license") → ask ONE clarifying question: what do they need (renew, address change)?
- User mentions MULTIPLE needs in one message → handle the first clearly, complete it, then ask "Would you also like help with [the second thing]?" — don't try to do both in parallel.
- User asks about a service NOT in the supported list (duplicate DL, learner's license, international permit, fitness certificate) → be honest: "This demo currently supports DL renewal, address changes, and ownership transfer. [Requested service] isn't covered yet, but it's on the roadmap." Don't pretend to handle it.
- User changes their mind mid-flow ("actually cancel", "wait, different DL number") → drop the current thread cleanly and restart with new info, no confusion.
- User asks something totally unrelated (weather, jokes, general chat) → gently redirect: "I'm focused on RTO services — DL and vehicle paperwork. What can I help with there?"
- After fix_document_issue resolves an issue, do NOT call check_service_eligibility again — just acknowledge the fix and proceed straight to slot-finding (if needed) or submit_application. Re-checking would incorrectly re-flag the same issue since the underlying data is regenerated fresh each time.
- If check_service_eligibility returns eligible:false with issue "no_vehicle_on_record" (vehicle service requested but no vehicle exists on the generated profile), tell the user this DL has no vehicle on record for that service and ask them to double check or try a different DL number.
- If multiple issues come back at once, address them one at a time, don't dump a list.

STANDARD FLOW:
1. Understand what the user needs (may take 1 message or a few, depending on how much they said upfront)
2. Get DL number if not given → call get_citizen_profile
3. Confirm which service → call check_service_eligibility
4. If issues → explain plainly, one at a time → offer to fix → call fix_document_issue → proceed (do not re-check)
5. If slotRequired → call find_available_slot → offer nearest options
6. Preview: form + fees + slot + days, in ONE sentence → confirm
7. Call submit_application → give ID + tracker link

TONE:
Hindi: "Chacha, DL 6 mahine pehle expired hua tha. 65 saal ke hain to medical certificate bhi lagega."
English: "This looks like an interstate transfer. You'll need an NOC from the original state's RTO first — do you have it?"
Out of scope: "This demo covers DL renewal, address changes, and ownership transfer — [X] isn't built yet, but it's on our roadmap."

Never use markdown. Voice-first, conversational, robust to anything the user types.`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  try {
    const result = streamText({
      model: openai(PRIMARY_MODEL),
      system: SYSTEM_PROMPT,
      messages,
      tools: agentTools,
      maxSteps: 8,
      temperature: 0.3
    });
    return result.toDataStreamResponse();
  } catch (err) {
    console.warn("[agent] falling back:", err);
    const result = streamText({
      model: openai(FALLBACK_MODEL),
      system: SYSTEM_PROMPT,
      messages,
      tools: agentTools,
      maxSteps: 8,
      temperature: 0.3
    });
    return result.toDataStreamResponse();
  }
}
```

*(`lib/aiClient.ts` is unchanged from the earlier spec — GPT-5 primary, GPT-4o-mini fallback wrapper. Reuse it as-is.)*

---

## 3. Codex Prompts (updated — no personas anywhere)

### Prompt A — Landing (open entry, no persona cards)

> Build a Next.js 14 landing page for "Parivahan Sathi" — voice-first AI agent for Indian RTO services. Colors: primary `#0F766E` teal, accent `#F59E0B` amber, bg `#F0FDFA`. Fonts Inter + Noto Sans Devanagari.
>
> `app/page.tsx`:
> - Sticky yellow disclaimer: "Demo prototype with synthetic mock data generated per session. Not affiliated with Parivahan Sewa, MoRTH, or Government of India."
> - Hero: "License renew? RC transfer? बस बोलिए." + subhead "Type or speak your problem in any language — try any DL number, it just works."
> - 3 stat cards: "30cr DL holders", "45+ confusing forms", "Avg 4 RTO visits per service"
> - NO persona cards. Instead, a single prominent text input right on the landing page: placeholder "e.g. My DL expired 8 months ago, DL number MH12..." with a Send button that routes to /chat with the text as a query param and auto-sends it
> - Below the input, 3 small tappable EXAMPLE chips (not required, just inspiration): "My license expired", "I bought a used car", "Moved houses, need address change" — tapping fills the input, doesn't auto-submit, user can edit
> - Below that: "Or just try any DL number — try MH12AB1234, or make one up" as helper text
>
> Mobile-first, bilingual via LanguageContext, shadcn Button + Input, Framer Motion fade-in.

### Prompt B — Chat page (fully open, no persona routing)

> Create `app/chat/page.tsx` using Vercel AI SDK `useChat` against `/api/agent`.
> - Mobile-first chat, amber user bubbles (right), white/teal-border agent bubbles (left)
> - Sticky top bar: logo, language toggle, Reset icon (clears chat via `setMessages([])`)
> - Sticky bottom: text input + Mic button + Send button
> - Read `?q=` from searchParams — if present, auto-send it as the first message on mount (this is how landing page free-text hands off)
> - Loading state: 3 bouncing dots
> - Tool-call pill above incoming bubble, friendly labels:
>   - get_citizen_profile → "Looking up your profile"
>   - check_service_eligibility → "Checking eligibility"
>   - fix_document_issue → "Updating document"
>   - find_available_slot → "Finding a slot"
>   - submit_application → "Filing your application"
>   - track_application → "Fetching status"
> - If response text matches pattern `PS[A-Za-z0-9_-]{10,}` (the encoded application ID), render a button "View live tracker →" linking to `/track/{match}`
> - Framer Motion bubble entrance, shadcn Button/Input, lucide Mic/Send/RotateCcw
> - Plain text only, no markdown rendering
> - NO persona chips, NO pre-fill logic besides the `?q=` param

### Prompt C — Voice (same as before, unchanged)

*(Reuse Prompt C from FINAL_SPEC — VoiceInput.tsx + tts.ts. No changes needed, it was already general-purpose.)*

### Prompt D — Tracker client (stateless, decode-based)

> Create `app/track/[applicationId]/TrackerClient.tsx` — client component receiving `data` (ApplicationData) and `initialTimeline` as props.
> - Big teal card: application ID (truncated for display), service, form type, fees, status badge
> - Vertical timeline: 4 steps, lucide CheckCircle2 (green, done) / Circle (grey, pending), bilingual step name, timestamp if done
> - "Estimated completion" computed from `filedAtMs + 7 days`
> - "Nearest RTO: <rtoCode>" placeholder box
> - Big amber button "Ask Sathi something" → /chat
> - **Live re-render without any API call:** use `useEffect` + `setInterval` every 2 seconds to recompute the timeline client-side by re-running the same step-delay logic against `Date.now() - data.filedAtMs` (mirror the `computeTimeline` logic inline, or import it if it's safe to run client-side — it has no Node-only deps, so it's fine to import directly)
> - Framer Motion pop animation when a step flips to done
> - Mobile-first, shadcn Card + Badge

---

## 4. Video Script — Proves It's Genuinely Open (not scripted)

**Critical difference from before: film this LIVE, typing something you did NOT pre-plan the exact wording of, to prove it's not a script.**

**[0:00 – 0:15] Hook**
> "Every year, 30 crore Indians battle RTO paperwork for driving licences and vehicle transfers. Most demos you'll see today are scripted — type this exact phrase, get this exact result. Ours isn't. Watch."

*Visual: your landing page, empty text box visible*

**[0:15 – 0:40] Live, unscripted input**
> *(Actually type, on camera, something you haven't rehearsed word-for-word — e.g. make up a DL number on the spot, describe a problem in your own words)*
> "I'm typing a DL number I'm making up right now — MH-14-99887766 — and saying my license expired and I'm worried about the medical test."

*Visual: agent responds, fetches a generated profile, catches age-based medical cert if applicable, or the actual issue that profile has — whatever the deterministic engine returns for that exact string.*

**[0:40 – 1:00] Second live example, different language**
> *(Type in Hindi this time, again unscripted)* "Ab main dusra example dikhata hoon — bilkul different DL number, Hindi mein."

*Visual: same robustness shown in Hindi, different generated profile.*

**[1:00 – 1:15] Explain the engine**
> "Every DL number produces a real, consistent mock profile instantly — no database, no script, no fixed test users. It's a deterministic Synthetic Citizen Engine. GPT-5 never invents the data — it only understands your request and applies the actual RTO eligibility rules."

*Visual: brief code snippet of `generateCitizen()`*

**[1:15 – 1:35] Build story**
> "Built with ChatGPT Codex — it scaffolded the app, generated the tools, and built the chat UI."

*Visual: Codex tab, a tool being generated*

**[1:35 – 1:50] Architecture + honesty**
> "GPT-5 powers the orchestrator and the RTO Eligibility Analyst sub-agent, with automatic fallback to GPT-4o-mini for reliability. Everything is clearly mocked — no real government systems touched. Production plan: real Vahan/Sarathi API integration, DigiLocker, UPI fees, Aadhaar OTP."

**[1:50 – 2:00] Close, invite them to try it themselves**
> "Try it yourself with any DL number, in any language: parivahan-sathi.vercel.app. It's not a demo script. It's the actual product."

---

## 5. Submission Summary (updated, ~248 words)

> **Parivahan Sathi — Open, voice-first RTO services**
>
> India's 30-crore driving licence holders and 15-crore vehicle owners face confusing RTO paperwork — form numbers nobody remembers, state-specific NOC rules, an average of four visits per service. Elderly and rural users often give up entirely.
>
> Parivahan Sathi replaces the portal with one open conversation in Hindi, English, or Hinglish — type or speak anything, no script required. A Synthetic Citizen Engine generates a consistent, realistic mock profile instantly for any DL number entered, so every reviewer's test produces a genuine, working scenario rather than a canned demo. The orchestrator agent, powered by GPT-5 (with automatic GPT-4o-mini fallback), runs an RTO Eligibility Analyst sub-agent that applies real Central Motor Vehicles Rules before filing — catching age-based medical certificate needs, interstate NOC requirements, and retest triggers for long-lapsed licences — then repairs issues, picks the correct form, previews fees, and files.
>
> **Why it's better:** No forms, no portal maze, works for genuinely any input a citizen or reviewer provides, accessible to low-literacy and voice-first users on cheap phones.
>
> **Built with:** ChatGPT Codex (scaffolding, tools, UI). Powered entirely by GPT-5 and GPT-4o-mini (fallback) — no other model providers. Whisper for Hindi voice. Next.js 14, Tailwind, shadcn/ui, Vercel AI SDK — MIT/Apache-licensed, disclosed in CREDITS.md.
>
> **Mocked, clearly labelled:** citizen records (generated deterministically, not real data), application filing, RTO slots.
>
> **Scale plan:** Vahan/Sarathi API integration, DigiLocker, UPI, Aadhaar OTP, WhatsApp mirror for feature phones.

---

## 6. Updated Timeline (from 1:00 PM, deadline 10:00 PM)

| Time | Phase |
|---|---|
| 1:00 – 2:00 | Foundation: scaffold, deploy, Codex Prompt A (open landing) |
| 2:00 – 3:30 | `syntheticCitizenEngine.ts` + `applicationCodec.ts` + `agentTools.ts` + route — test with 5-6 random DL strings you make up on the spot to prove robustness |
| 3:30 – 5:00 | Codex Prompt B (chat) + Prompt C (voice) — test in both Hindi and English, unscripted |
| 5:00 – 6:30 | Codex Prompt D (stateless tracker) + edge case testing (garbage input, unrelated questions, mid-flow changes) |
| 6:30 – 7:30 | Polish: error states, accessibility pass, README/CREDITS/BUILD_LOG |
| 7:30 – 8:15 | Full regression test — genuinely try to break it with weird input |
| 8:15 – 9:15 | Record video (live, unscripted takes as described in Section 4) |
| 9:15 – 9:45 | Submit form |
| 9:45 – 10:00 | Buffer |

---

## 7. Why This Is Genuinely Stronger

- **Robustness is provable, not claimed** — judges can type garbage and it still works, which is rare and memorable
- **No hallucinated data** — the citizen engine is a pure function, GPT-5 only reasons over it
- **Serverless-safe by design** — application tracking needs zero database, encoded directly in the URL
- **GPT-5 only, as required** — with graceful fallback, meeting your exact constraint
- **Handles real edge cases** — out-of-scope requests, ambiguous asks, mid-conversation changes, all explicitly designed for, not accidentally working

---

## GO

Same first command:

```bash
npx create-next-app@latest parivahan-sathi --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Reply "installing" and we execute this version — for real, from here to submission.
