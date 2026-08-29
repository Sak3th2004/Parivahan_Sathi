"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
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
  const { lang, toggle, t } = useLanguage();
  const [text, setText] = useState("");

  function go() {
    const q = text.trim();
    if (!q) {
      router.push("/chat");
      return;
    }
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl flex-col px-4 pb-16 pt-8 sm:pt-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-teal">Parivahan Sathi</p>
          <p className="text-xs text-slate-500">{t("Mock RTO assistant", "मॉक RTO सहायक")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggle} aria-label="Toggle language">
          {lang === "en" ? "हिंदी" : "EN"}
        </Button>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-1 flex-col justify-center"
      >
        <h1 className="font-hindi text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          {t("License renew? RC transfer?", "License renew? RC transfer?")}{" "}
          <span className="text-brand-teal">बस बोलिए.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          {t(
            "Type or speak your problem in any language — try any DL number, it just works.",
            "किसी भी भाषा में लिखें या बोलें — कोई भी DL नंबर आज़माएँ, काम हो जाएगा।"
          )}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { n: "30cr+", l: t("DL holders", "DL धारक") },
            { n: "45+", l: t("Confusing forms", "भ्रामक फॉर्म") },
            { n: "4", l: t("Avg RTO visits / service", "औसत RTO विज़िट / सेवा") },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl border border-teal-100/80 bg-white/70 px-4 py-3 backdrop-blur"
            >
              <p className="text-2xl font-bold text-brand-teal">{s.n}</p>
              <p className="text-sm text-slate-600">{s.l}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          className="mt-10"
        >
          <label htmlFor="landing-ask" className="sr-only">
            Describe your RTO problem
          </label>
          <div className="flex gap-2">
            <Input
              id="landing-ask"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder={t(
                "e.g. My DL expired 8 months ago, DL number MH12...",
                "जैसे: मेरा DL 8 महीने पहले expire, नंबर MH12..."
              )}
              className="h-12 text-base shadow-sm"
            />
            <Button size="lg" onClick={go} className="shrink-0 gap-2" aria-label="Start chat">
              <Send className="h-4 w-4" />
              {t("Send", "भेजें")}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.en}
                type="button"
                onClick={() => setText(lang === "hi" ? ex.hi : ex.en)}
                className="rounded-full border border-teal-200 bg-white/80 px-3 py-1.5 text-xs text-teal-800 hover:bg-teal-50"
              >
                {lang === "hi" ? ex.hi : ex.en}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {t(
              "Or just try any DL number — try MH12AB1234, or make one up",
              "या कोई भी DL नंबर आज़माएँ — MH12AB1234, या खुद बनाएँ"
            )}
          </p>
        </motion.div>
      </motion.section>
    </main>
  );
}
