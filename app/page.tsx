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
  { en: "My driving licence has expired", hi: "मेरा ड्राइविंग लाइसेंस समाप्त हो गया है" },
  { en: "I purchased a used vehicle", hi: "मैंने प्रयुक्त वाहन खरीदा है" },
  { en: "I require an address update", hi: "मुझे पते का अद्यतन आवश्यक है" },
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
      <AppHeader ctaHref="/chat" ctaLabel={t("Start assistance →", "सहायता शुरू करें →")} />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        {/* Hero */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold text-teal-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t(
                "Independent prototype · Civtech assistance layer",
                "स्वतंत्र प्रोटोटाइप · नागरिक सहायता परत"
              )}
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-teal-950 sm:text-5xl">
              {t("Complete RTO services with clarity.", "RTO सेवाएँ स्पष्टता के साथ पूर्ण करें।")}{" "}
              <span className="text-brand-teal">
                {t("Eligibility checked before filing.", "फाइलिंग से पहले पात्रता जाँच।")}
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              {t(
                "Citizens face dozens of forms and repeated office visits. Parivahan Sathi assists in Hindi or English: retrieves a synthetic profile, applies CMV-style rules, then files and tracks — without live government systems.",
                "नागरिकों के समक्ष अनेक फॉर्म एवं बार-बार कार्यालय जाना पड़ता है। परिवहन साथी हिंदी या अंग्रेज़ी में सहायता करता है: सिंथेटिक प्रोफ़ाइल प्राप्त करता है, CMV-शैली नियम लागू करता है, फिर फाइल एवं ट्रैक करता है — बिना लाइव सरकारी प्रणालियों के।"
              )}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="rounded-md bg-brand-teal px-6 font-semibold text-white hover:bg-teal-800"
                onClick={() => go()}
              >
                {t("Begin assistance", "सहायता आरंभ करें")}{" "}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Link
                href="/track"
                className="rounded-md border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
              >
                {t("Track application", "आवेदन ट्रैक करें")}
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { n: "30cr+", l: t("DL holders served by RTO maze", "DL धारक · जटिल प्रक्रिया") },
                { n: "0", l: t("Live gov systems touched", "लाइव सरकारी सिस्टम स्पर्श") },
                { n: "5", l: t("Assisted service types", "सहायता सेवा प्रकार") },
                { n: "100%", l: t("Synthetic demo data", "सिंथेटिक डेमो डेटा") },
              ].map((m) => (
                <div key={m.l} className="rounded-xl border border-teal-100 bg-white/80 px-3 py-2.5">
                  <p className="text-lg font-bold text-brand-teal">{m.n}</p>
                  <p className="text-[11px] leading-snug text-slate-500">{m.l}</p>
                </div>
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
              "Citizen records, slots and filing are synthetic. The language model only reasons over generated data — it never invents licence facts. This is not an official government portal.",
              "नागरिक रिकॉर्ड, स्लॉट और फाइलिंग सिंथेटिक हैं। भाषा मॉडल केवल जनरेटेड डेटा पर तर्क करता है — लाइसेंस तथ्य नहीं गढ़ता। यह आधिकारिक सरकारी पोर्टल नहीं है।"
            )}
          </p>
          <Link
            href="/how-it-works"
            className="mt-4 inline-flex text-sm font-semibold text-brand-teal hover:underline"
          >
            {t("Read architecture & what is real →", "आर्किटेक्चर एवं वास्तविकता पढ़ें →")}
          </Link>
        </section>

        {/* Architecture */}
        <section className="mt-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            {t("System architecture", "सिस्टम आर्किटेक्चर")}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-teal-950">
            {t("How the assistance layer operates", "सहायता परत कैसे कार्य करती है")}
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              {
                n: "01",
                t: t("Citizen intent", "नागरिक आशय"),
                b: t("Free text or voice in Hindi / English", "हिंदी / अंग्रेज़ी में मुक्त पाठ या आवाज़"),
              },
              {
                n: "02",
                t: t("Synthetic Citizen Engine", "सिंथेटिक सिटीजन इंजन"),
                b: t("Deterministic profile from any DL string", "किसी भी DL से निश्चित प्रोफ़ाइल"),
              },
              {
                n: "03",
                t: t("Eligibility analyst", "पात्रता विश्लेषक"),
                b: t("CMV-style rules before filing", "फाइलिंग से पहले CMV-शैली नियम"),
              },
              {
                n: "04",
                t: t("Encoded tracker", "एन्कोडेड ट्रैकर"),
                b: t("PS-ID carries status · zero database", "PS-ID में स्थिति · शून्य database"),
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/30 p-4">
                <p className="font-mono text-xs text-teal-600">{s.n}</p>
                <p className="mt-1 font-semibold text-teal-950">{s.t}</p>
                <p className="mt-1 text-xs text-slate-600">{s.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-teal-950">
            {t("Frequently asked questions", "अक्सर पूछे जाने वाले प्रश्न")}
          </h2>
          <div className="mt-6 space-y-3">
            {[
              {
                q: t("Is this an official government website?", "क्या यह आधिकारिक सरकारी वेबसाइट है?"),
                a: t(
                  "No. It is an independent hackathon prototype with synthetic data. Not affiliated with Parivahan Sewa, MoRTH, or Government of India.",
                  "नहीं। यह सिंथेटिक डेटा वाला स्वतंत्र हैकथॉन प्रोटोटाइप है। परिवहन सेवा, MoRTH या भारत सरकार से संबद्ध नहीं।"
                ),
              },
              {
                q: t("Do I need a real driving licence number?", "क्या वास्तविक ड्राइविंग लाइसेंस नंबर चाहिए?"),
                a: t(
                  "No. Enter any string — even invented. The Synthetic Citizen Engine produces a consistent mock profile for testing.",
                  "नहीं। कोई भी स्ट्रिंग दर्ज करें — काल्पनिक भी। परीक्षण हेतु Synthetic Citizen Engine एक सुसंगत मॉक प्रोफ़ाइल बनाता है।"
                ),
              },
              {
                q: t("Are payments or OTPs real?", "क्या भुगतान या OTP वास्तविक हैं?"),
                a: t(
                  "No. Fees, slots, filing and documents are mocked and clearly labelled.",
                  "नहीं। शुल्क, स्लॉट, फाइलिंग और दस्तावेज़ मॉक हैं तथा स्पष्ट रूप से चिह्नित।"
                ),
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-teal-100 bg-white px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-teal-950 marker:content-none">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
