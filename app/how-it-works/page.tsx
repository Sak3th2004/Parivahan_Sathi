"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    id: "sce",
    title: "Synthetic Citizen Engine",
    detail:
      "Pure function of the DL string. Same input → same profile forever. No LLM invents citizen facts. No database.",
  },
  {
    id: "orch",
    title: "Orchestrator agent",
    detail:
      "GPT-5.6-luna first (free/advanced quota), then fallback chain. Understands free text in Hindi or English and calls tools.",
  },
  {
    id: "elig",
    title: "Eligibility analyst",
    detail:
      "Sub-agent applies CMV-style rules on the generated profile: medical cert, NOC, retest, fees, form type.",
  },
  {
    id: "codec",
    title: "Application codec + tracker",
    detail:
      "Filing encodes state into a PS… ID (base64url). Tracker recomputes timeline client-side — serverless-safe.",
  },
];

export default function HowItWorksPage() {
  const { t } = useLanguage();
  const [active, setActive] = useState("sce");
  const stage = STAGES.find((s) => s.id === active)!;

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <MockPill>Independent prototype · Build What Moves India</MockPill>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">
          {t("Process & architecture", "प्रक्रिया एवं आर्किटेक्चर")}
        </h1>
        <p className="mt-3 text-slate-600">
          {t(
            "Click each stage. Judges can invent any DL — the demo is open, not script-locked.",
            "प्रत्येक चरण पर क्लिक करें। जज कोई भी DL बना सकते हैं — डेमो खुला है, स्क्रिप्ट-बंधित नहीं।"
          )}
        </p>

        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                active === s.id
                  ? "border-teal-700 bg-teal-950 text-white"
                  : "border-teal-100 bg-white hover:border-teal-300"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                Stage 0{i + 1}
              </p>
              <p className="font-semibold">{s.title}</p>
            </button>
          ))}
        </div>

        <article className="mt-4 rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 p-5">
          <h2 className="text-lg font-semibold text-teal-950">{stage.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{stage.detail}</p>
        </article>

        <section className="mt-10 space-y-4">
          {[
            {
              title: t("1. Citizen enters own data", "1. नागरिक अपना डेटा दर्ज करता है"),
              body: t(
                "Assist page: invent a DL → live SCE preview → hand off to AI with that exact case.",
                "Assist पृष्ठ: DL बनाएँ → लाइव SCE पूर्वावलोकन → उसी केस के साथ AI को सौंपें।"
              ),
              tag: "Open demo",
            },
            {
              title: t("2. Assisted eligibility & filing", "2. सहायता प्राप्त पात्रता एवं फाइलिंग"),
              body: t(
                "Orchestrator + eligibility tools. Document fixes are conversation-scoped mocks.",
                "Orchestrator + पात्रता टूल। दस्तावेज़ सुधार conversation-scoped मॉक।"
              ),
              tag: "Live model · mocked RTO",
            },
            {
              title: t("3. Public track by ID", "3. ID से सार्वजनिक ट्रैक"),
              body: t(
                "No login. Paste PS… ID. Timeline is decoded from the URL payload.",
                "बिना लॉगिन। PS… ID चिपकाएँ। टाइमलाइन URL पेलोड से डिकोड।"
              ),
              tag: "Stateless",
            },
          ].map((b) => (
            <article key={b.title} className="ps-panel p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-teal-950">{b.title}</h2>
                <MockPill>{b.tag}</MockPill>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{b.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[1.5rem] border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="font-semibold text-teal-950">
            {t("What is real vs mocked", "क्या असली है बनाम मॉक")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <strong>Works today:</strong> open DL entry, SCE, AI assistance, mock slots/filing,
              live tracker, simulator (zero API), evaluator tour.
            </li>
            <li>
              <strong>Mocked:</strong> citizen records, RTO systems, fees, OTPs — never live
              Parivahan / Vahan / Sarathi.
            </li>
            <li>
              <strong>Scale plan:</strong> Vahan/Sarathi, DigiLocker, UPI, Aadhaar OTP, WhatsApp.
            </li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/assist"
            className="inline-flex rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {t("Enter your own DL →", "अपना DL दर्ज करें →")}
          </Link>
          <Link
            href="/simulator"
            className="inline-flex rounded-md border border-teal-200 bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
          >
            {t("Open simulator →", "सिम्युलेटर खोलें →")}
          </Link>
        </div>
      </main>
    </>
  );
}
