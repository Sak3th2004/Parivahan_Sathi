"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import {
  ApplicationData,
  TimelineStep,
  computeTimeline,
} from "@/lib/applicationCodec";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";
import { AppHeader, MockPill } from "@/components/AppHeader";

type Props = {
  data: ApplicationData;
  initialTimeline: TimelineStep[];
  applicationId: string;
};

export default function TrackerClient({ data, initialTimeline, applicationId }: Props) {
  const { lang, t } = useLanguage();
  const [timeline, setTimeline] = useState(initialTimeline);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeline(computeTimeline(data));
    }, 2000);
    return () => clearInterval(id);
  }, [data]);

  const shortId =
    applicationId.length > 28
      ? `${applicationId.slice(0, 12)}…${applicationId.slice(-8)}`
      : applicationId;
  const eta = new Date(data.filedAtMs + 7 * 24 * 60 * 60 * 1000);
  const allDone = timeline.every((s) => s.done);
  const doneCount = timeline.filter((s) => s.done).length;

  return (
    <>
      <AppHeader ctaHref="/chat" ctaLabel={t("Ask Sathi →", "Sathi से पूछें →")} />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="ps-panel overflow-hidden">
          <div className="bg-teal-900 px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-teal-200">
                  {t("Application tracker", "आवेदन ट्रैकर")}
                </p>
                <p className="mt-1 font-mono text-sm">{shortId}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  allDone ? "bg-emerald-300 text-emerald-950" : "bg-[#D9F99D] text-teal-950"
                }`}
              >
                {allDone ? t("Complete", "पूर्ण") : t("In progress", "प्रगति में")}
              </span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-teal-800">
              <div
                className="h-full rounded-full bg-[#D9F99D] transition-all duration-500"
                style={{ width: `${(doneCount / timeline.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 p-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <MockPill>Mock pipeline · demo speed</MockPill>
              <MockPill>No database</MockPill>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Meta label={t("Service", "सेवा")} value={data.service} />
              <Meta label={t("Form", "फॉर्म")} value={data.formType} />
              <Meta label={t("Fees", "शुल्क")} value={`₹${data.fees}`} />
              <Meta label={t("RTO", "RTO")} value={data.rtoCode} />
            </div>
            {data.slotDate && (
              <Meta label={t("Slot", "स्लॉट")} value={data.slotDate} />
            )}
            <p className="text-xs text-slate-500">
              {t("Estimated completion", "अनुमानित समापन")}:{" "}
              {eta.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <ol className="mt-8 space-y-4">
          <AnimatePresence initial={false}>
            {timeline.map((step, i) => (
              <motion.li
                key={step.step}
                layout
                className="flex gap-3 rounded-2xl border border-teal-50 bg-white/80 px-4 py-3"
              >
                <div className="mt-0.5">
                  {step.done ? (
                    <motion.div
                      key={`done-${i}-${step.timestamp}`}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </motion.div>
                  ) : (
                    <Circle className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${step.done ? "text-teal-950" : "text-slate-400"}`}>
                    {lang === "hi" ? step.stepHi : step.step}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-slate-500">
                      {new Date(step.timestamp).toLocaleTimeString("en-IN")}
                    </p>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        <p className="mt-6 text-xs text-slate-500">
          {t(
            "Steps flip from the encoded ID every 2 seconds — serverless-safe, zero DB.",
            "एन्कोडेड ID से हर 2 सेकंड स्टेप बदलते हैं — बिना database।"
          )}
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 w-full rounded-full bg-[#D9F99D] font-semibold text-teal-950 hover:bg-[#bef264]"
        >
          <Link href="/chat">{t("Ask Sathi something", "Sathi से कुछ पूछें")}</Link>
        </Button>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-teal-50/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-teal-950">{value}</p>
    </div>
  );
}
