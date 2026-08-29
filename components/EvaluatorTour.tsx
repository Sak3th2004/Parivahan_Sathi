"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

const SAMPLE_DLS = [
  {
    dl: "MH14-99887766",
    tip: "Maharashtra · often expired / renewal path",
  },
  {
    dl: "TS09ZZ0001",
    tip: "Telangana · try ownership transfer",
  },
  {
    dl: "KA05MZ4321",
    tip: "Karnataka · try address update",
  },
];

const STEPS = [
  {
    title: "Invent any DL",
    body: "Type a made-up licence number on Assist. The Synthetic Citizen Engine builds a consistent mock profile instantly.",
    href: "/assist",
    cta: "Open Assist",
  },
  {
    title: "Run eligibility",
    body: "Continue into Citizen Assistance. The analyst applies CMV-style rules on THAT profile — medical, NOC, retest.",
    href: "/chat",
    cta: "Open Assistance",
  },
  {
    title: "File & track",
    body: "Confirm filing. Open the live tracker from the PS… ID. Steps advance without a database.",
    href: "/track",
    cta: "Track lookup",
  },
  {
    title: "Architecture",
    body: "See how SCE → orchestrator → eligibility → encoded tracker separate facts from reasoning.",
    href: "/how-it-works",
    cta: "View process",
  },
  {
    title: "Zero-API simulator",
    body: "Walk the full journey client-side with your own DL — no model spend.",
    href: "/simulator",
    cta: "Launch simulator",
  },
];

export function EvaluatorTour() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-teal-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-teal-950/30 hover:bg-teal-900"
      >
        <Sparkles className="h-4 w-4 text-amber-300" />
        {t("Evaluator demo tour", "मूल्यांकन डेमो टूर")}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-black/40 p-3 sm:p-6">
          <div
            role="dialog"
            aria-label="Evaluator demo tour"
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-teal-50 bg-teal-950 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">
                  {t("Evaluator & judge guided tour", "मूल्यांकन एवं जज गाइडेड टूर")}
                </p>
                <p className="text-[11px] text-teal-200">
                  {t(
                    "5-step open journey · enter your own DL",
                    "5-चरण खुली यात्रा · अपना DL दर्ज करें"
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-teal-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                {t(
                  "Preferred path: invent a DL yourself (not a fixed persona). Sample DLs below are optional shortcuts only.",
                  "अनुशंसित: स्वयं कोई DL बनाएँ (निश्चित persona नहीं)। नीचे नमूना DL वैकल्पिक शॉर्टकट मात्र हैं।"
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("Optional sample DLs (tap to copy)", "वैकल्पिक नमूना DL (कॉपी हेतु टैप)")}
                </p>
                <ul className="space-y-2">
                  {SAMPLE_DLS.map((s) => (
                    <li
                      key={s.dl}
                      className="flex items-center justify-between gap-2 rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-teal-950">{s.dl}</p>
                        <p className="truncate text-[11px] text-slate-500">{s.tip}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(s.dl)}
                        className="shrink-0 rounded-md border border-teal-200 bg-white p-1.5 text-teal-800 hover:bg-teal-50"
                        aria-label={`Copy ${s.dl}`}
                      >
                        {copied === s.dl ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <ol className="space-y-3">
                {STEPS.map((step, i) => (
                  <li
                    key={step.title}
                    className="rounded-xl border border-teal-100 bg-white p-3 shadow-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">
                      Step {i + 1}
                    </p>
                    <p className="font-semibold text-teal-950">{step.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{step.body}</p>
                    <Link
                      href={step.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex text-xs font-semibold text-brand-teal hover:underline"
                    >
                      {step.cta} →
                    </Link>
                  </li>
                ))}
              </ol>

              <p className="text-center text-[10px] text-slate-400">
                Independent prototype · synthetic data · not Government of India
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
