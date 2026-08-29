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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";

type Props = {
  data: ApplicationData;
  initialTimeline: TimelineStep[];
  applicationId: string;
};

export default function TrackerClient({ data, initialTimeline, applicationId }: Props) {
  const { lang, t, toggle } = useLanguage();
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

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-brand-teal">
          Parivahan Sathi
        </Link>
        <Button variant="outline" size="sm" onClick={toggle}>
          {lang === "en" ? "हिंदी" : "EN"}
        </Button>
      </div>

      <Card className="border-teal-200 bg-teal-50/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-brand-teal">
              {t("Application tracker", "आवेदन ट्रैकर")}
            </CardTitle>
            <Badge className={allDone ? "bg-green-100 text-green-800" : undefined}>
              {allDone ? t("Complete", "पूर्ण") : t("In progress", "प्रगति में")}
            </Badge>
          </div>
          <p className="break-all font-mono text-xs text-slate-500">{shortId}</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-slate-500">{t("Service", "सेवा")}:</span> {data.service}
          </p>
          <p>
            <span className="text-slate-500">{t("Form", "फॉर्म")}:</span> {data.formType}
          </p>
          <p>
            <span className="text-slate-500">{t("Fees", "शुल्क")}:</span> ₹{data.fees}{" "}
            <span className="text-xs text-slate-400">(mock)</span>
          </p>
          <p>
            <span className="text-slate-500">{t("Nearest RTO", "नजदीकी RTO")}:</span>{" "}
            {data.rtoCode}
          </p>
          {data.slotDate && (
            <p>
              <span className="text-slate-500">{t("Slot", "स्लॉट")}:</span> {data.slotDate}
            </p>
          )}
          <p>
            <span className="text-slate-500">{t("Estimated completion", "अनुमानित समापन")}:</span>{" "}
            {eta.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      <ol className="mt-8 space-y-4">
        <AnimatePresence initial={false}>
          {timeline.map((step, i) => (
            <motion.li
              key={step.step}
              layout
              initial={false}
              animate={{ opacity: 1, scale: step.done ? 1 : 0.98 }}
              className="flex gap-3"
            >
              <div className="mt-0.5">
                {step.done ? (
                  <motion.div
                    key={`done-${i}-${step.timestamp}`}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </motion.div>
                ) : (
                  <Circle className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div>
                <p className={`font-medium ${step.done ? "text-slate-900" : "text-slate-400"}`}>
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
          "Live updates every 2s from the encoded application ID — no database. Mock pipeline for demo speed.",
          "एन्कोडेड ID से हर 2 सेकंड अपडेट — कोई database नहीं। डेमो स्पीड के लिए मॉक पाइपलाइन।"
        )}
      </p>

      <Button asChild variant="amber" size="lg" className="mt-8 w-full">
        <Link href="/chat">{t("Ask Sathi something", "Sathi से कुछ पूछें")}</Link>
      </Button>
    </main>
  );
}
