"use client";

import Link from "next/link";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { useLanguage } from "@/components/LanguageContext";

export default function HowItWorksPage() {
  const { t } = useLanguage();

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <MockPill>Independent prototype · Build What Moves India</MockPill>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">
          {t("How Parivahan Sathi works", "Parivahan Sathi कैसे काम करता है")}
        </h1>
        <p className="mt-3 text-slate-600">
          {t(
            "Built so judges can type anything — no scripted persona. Every dependency is labelled.",
            "जज कुछ भी टाइप कर सकते हैं — कोई स्क्रिप्टेड persona नहीं। हर dependency लेबल है।"
          )}
        </p>

        <section className="mt-10 space-y-6">
          {[
            {
              title: t("1. Synthetic Citizen Engine", "1. Synthetic Citizen Engine"),
              body: t(
                "Any DL string → hash-seeded profile (name, age, DL status, documents, sometimes a vehicle). Same input always same output. No LLM invents citizen facts. No database.",
                "कोई भी DL → hash-seeded प्रोफ़ाइल। एक इनपुट = एक ही आउटपुट। LLM नागरिक तथ्य नहीं गढ़ता। कोई database नहीं।"
              ),
              tag: "Mock · deterministic",
            },
            {
              title: t("2. Orchestrator + eligibility analyst", "2. Orchestrator + पात्रता विश्लेषक"),
              body: t(
                "GPT-5.6-luna (free/advanced first) understands free text in any language, then a sub-agent applies CMV-style rules. Auto-fallback to gpt-4o-mini protects paid credits.",
                "GPT-5.6-luna पहले free/advanced; फिर CMV नियम। Fail पर gpt-4o-mini — $5 बचाने के लिए।"
              ),
              tag: "Live model · mocked gov APIs",
            },
            {
              title: t("3. Fix → slot → file → track", "3. ठीक करें → स्लॉट → फाइल → ट्रैक"),
              body: t(
                "Document fixes are conversation-scoped mocks. Application ID (PS…) base64-encodes the filing so the tracker works with zero server memory.",
                "डॉक्यूमेंट फिक्स conversation-scoped मॉक हैं। Application ID (PS…) में फाइलिंग एन्कोड — ट्रैकर बिना server memory।"
              ),
              tag: "Stateless · serverless-safe",
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
              <strong>Works today:</strong> full citizen journey UI, SCE profiles, eligibility
              reasoning, mock slots/filing, live tracker, bilingual + browser voice.
            </li>
            <li>
              <strong>Mocked:</strong> citizen records, RTO slots, filing, fees — never live
              Parivahan / Vahan / Sarathi.
            </li>
            <li>
              <strong>Scale plan:</strong> Vahan/Sarathi APIs, DigiLocker, UPI, Aadhaar OTP,
              WhatsApp for feature phones.
            </li>
          </ul>
        </section>

        <Link
          href="/chat"
          className="mt-8 inline-flex rounded-full bg-[#D9F99D] px-5 py-2.5 text-sm font-semibold text-teal-950 hover:bg-[#bef264]"
        >
          {t("Try any DL now →", "अभी कोई भी DL आज़माएँ →")}
        </Link>
      </main>
    </>
  );
}
