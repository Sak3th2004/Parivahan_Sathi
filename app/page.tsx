"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mic2, ShieldCheck, Sparkles } from "lucide-react";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageContext";

const EXAMPLES = [
  { en: "My license expired", hi: "मेरा लाइसेंस expire हो गया" },
  { en: "I bought a used car", hi: "मैंने पुरानी गाड़ी खरीदी" },
  { en: "Moved houses, need address change", hi: "घर बदला, address change चाहिए" },
];

export default function LandingPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [text, setText] = useState("");

  function go(q?: string) {
    const value = (q ?? text).trim();
    if (!value) {
      router.push("/chat");
      return;
    }
    router.push(`/chat?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      <AppHeader ctaHref="/chat" ctaLabel={t("Talk to Sathi →", "Sathi से बात करें →")} />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        {/* Hero */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-3 text-sm font-semibold tracking-wide text-brand-teal">
              Parivahan Sathi
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-teal-950 sm:text-5xl">
              {t("RTO paperwork,", "RTO कागज़,")}{" "}
              <span className="text-brand-teal">
                {t("checked before you file it.", "फाइल करने से पहले चेक।")}
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              {t(
                "45+ confusing forms. Average 4 RTO visits. Sathi understands Hindi, English or Hinglish — catches medical certs, NOCs and retests — then files and tracks.",
                "45+ भ्रामक फॉर्म। औसत 4 RTO विज़िट। Sathi हिंदी, अंग्रेज़ी या हिंग्लिश समझता है — medical, NOC, retest पहले पकड़ता है — फिर फाइल और ट्रैक।"
              )}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="rounded-full bg-[#D9F99D] px-6 font-semibold text-teal-950 hover:bg-[#bef264]"
                onClick={() => go()}
              >
                {t("Check my case", "मेरा केस चेक करें")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-teal-800 underline-offset-4 hover:underline"
              >
                {t("See how it works", "कैसे काम करता है देखें")}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                t("Any DL number", "कोई भी DL"),
                t("Eligibility first", "पहले पात्रता"),
                t("Right form", "सही फॉर्म"),
                t("Live tracker", "लाइव ट्रैकर"),
                t("Voice-ready", "आवाज़ से"),
              ].map((chip) => (
                <span key={chip} className="ps-chip">
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Product mock card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="relative"
          >
            <div className="ps-panel relative overflow-hidden p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-teal-900 px-3 py-1 text-xs font-semibold text-white">
                  Ready to file
                </span>
                <MockPill>Synthetic · not live RTO</MockPill>
              </div>
              <p className="text-2xl font-bold text-teal-950">Rohan Deshmukh</p>
              <p className="text-sm text-slate-500">MH14-99887766 · Maharashtra · age 34</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-teal-50 p-3">
                  <p className="text-[10px] uppercase text-teal-700/70">DL status</p>
                  <p className="font-semibold text-amber-700">Expired</p>
                </div>
                <div className="rounded-2xl bg-teal-50 p-3">
                  <p className="text-[10px] uppercase text-teal-700/70">Form + fees</p>
                  <p className="font-semibold text-teal-950">Form 9 · ₹700</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">
                <CheckCircle2 className="h-4 w-4" /> 1 issue caught before filing
              </div>
              <div className="mt-3 rounded-2xl bg-teal-900 p-3 text-white">
                <p className="text-xs text-teal-100">Application ID</p>
                <p className="font-mono text-sm">PS… encoded · track live</p>
              </div>
            </div>
            <div className="absolute -right-2 -top-3 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold text-teal-950 shadow">
              Avg 4 visits → 1 conversation
            </div>
          </motion.div>
        </section>

        {/* Open entry */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-14 max-w-2xl"
        >
          <div className="ps-panel p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-teal-950">
                {t("Type any problem. Any DL.", "कोई भी समस्या। कोई भी DL।")}
              </h2>
              <MockPill>Open demo · no script</MockPill>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              {t(
                "Judges: invent a DL on the spot. The Synthetic Citizen Engine builds a consistent mock profile every time.",
                "जज: मौके पर कोई DL बनाएँ। Synthetic Citizen Engine हर बार consistent मॉक प्रोफ़ाइल बनाता है।"
              )}
            </p>
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder={t(
                  "e.g. My DL expired 8 months ago, MH12AB1234…",
                  "जैसे: DL 8 महीने पहले expire, MH12AB1234…"
                )}
                className="h-12 rounded-2xl border-teal-100 text-base shadow-inner"
              />
              <Button
                size="lg"
                onClick={() => go()}
                className="h-12 shrink-0 rounded-2xl bg-teal-900 px-5 text-white hover:bg-teal-800"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.en}
                  type="button"
                  onClick={() => setText(lang === "hi" ? ex.hi : ex.en)}
                  className="rounded-full border border-teal-100 bg-teal-50/50 px-3 py-1.5 text-xs text-teal-900 hover:bg-teal-50"
                >
                  {lang === "hi" ? ex.hi : ex.en}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Before / after */}
        <section className="mt-20">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-teal-950 sm:text-3xl">
            {t(
              "One rejected visit costs you another day off work. We move the checks before you go.",
              "एक रिजेक्ट विज़िट = एक और दिन छुट्टी। हम चेक पहले कर देते हैं।"
            )}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/60 p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("Today, on the portal", "आज, पोर्टल पर")}
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  t("Guess the form number", "फॉर्म नंबर का अंदाज़ा"),
                  t("Find out about medical/NOC weeks later", "medical/NOC हफ्तों बाद पता"),
                  t("Queue again after a reject", "रिजेक्ट के बाद फिर कतार"),
                  t("Status codes nobody explains", "स्टेटस कोड कोई नहीं समझाता"),
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-slate-300">—</span> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-teal-200 bg-teal-50/50 p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-teal">
                {t("With Parivahan Sathi", "Parivahan Sathi के साथ")}
              </p>
              <ul className="space-y-2 text-sm text-teal-950">
                {[
                  t("Say it in plain words — or speak", "सादे शब्दों में कहें — या बोलें"),
                  t("Catch blockers on this exact mock profile", "इसी प्रोफ़ाइल पर blockers पकड़ें"),
                  t("Right form + fees preview once", "सही फॉर्म + शुल्क एक बार"),
                  t("Live tracker in plain language", "सादी भाषा में लाइव ट्रैकर"),
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3 steps */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-teal-950 sm:text-3xl">
            {t("Your case, in three steps", "आपका केस, तीन कदमों में")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: t("Tell Sathi", "Sathi से कहें"),
                body: t(
                  "Any language. Any DL — even made up. Profile is generated deterministically.",
                  "कोई भी भाषा। कोई भी DL — बनावटी भी। प्रोफ़ाइल deterministic बनती है।"
                ),
                icon: Mic2,
              },
              {
                n: "2",
                title: t("Eligibility first", "पहले पात्रता"),
                body: t(
                  "CMV-style rules catch medical cert, NOC, retest — before you file.",
                  "CMV नियमों से medical, NOC, retest — फाइल से पहले।"
                ),
                icon: ShieldCheck,
              },
              {
                n: "3",
                title: t("File & track", "फाइल और ट्रैक"),
                body: t(
                  "Mock filing encodes status in the ID. Tracker updates live — no database.",
                  "मॉक फाइलिंग ID में स्टेटस एन्कोड करती है। ट्रैकर लाइव — बिना database।"
                ),
                icon: Sparkles,
              },
            ].map((s) => (
              <div key={s.n} className="ps-panel p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl font-bold text-teal-200">{s.n}</span>
                  <s.icon className="h-5 w-5 text-brand-teal" />
                </div>
                <h3 className="font-semibold text-teal-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Honest */}
        <section className="mt-20 rounded-[1.75rem] border border-teal-100 bg-white/70 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-teal-950">
            {t("Honest by design", "ईमानदारी से डिज़ाइन")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {t(
              "Citizen records, slots and filing are synthetic. GPT only reasons over generated data — it never invents the DL facts. Production path: Vahan/Sarathi, DigiLocker, UPI, Aadhaar OTP.",
              "नागरिक रिकॉर्ड, स्लॉट और फाइलिंग सिंथेटिक हैं। GPT केवल जनरेटेड डेटा पर सोचता है — DL तथ्य नहीं गढ़ता। प्रोडक्शन: Vahan/Sarathi, DigiLocker, UPI, Aadhaar OTP।"
            )}
          </p>
          <Link
            href="/how-it-works"
            className="mt-4 inline-flex text-sm font-semibold text-brand-teal hover:underline"
          >
            {t("Read what is real →", "क्या असली है पढ़ें →")}
          </Link>
        </section>
      </main>
    </>
  );
}
