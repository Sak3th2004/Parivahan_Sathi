"use client";

import Link from "next/link";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { useLanguage } from "@/components/LanguageContext";

const SERVICES = [
  {
    id: "dl_renewal",
    en: "Driving licence renewal",
    hi: "ड्राइविंग लाइसेंस नवीनीकरण",
    form: "Form 9",
    noteEn: "Late fee and medical certificate rules applied when relevant.",
    noteHi: "आवश्यक होने पर विलंब शुल्क एवं चिकित्सा प्रमाणपत्र नियम लागू।",
  },
  {
    id: "vehicle_transfer",
    en: "Vehicle ownership transfer",
    hi: "वाहन स्वामित्व हस्तांतरण",
    form: "Form 29+30",
    noteEn: "Interstate cases may require NOC on the synthetic record.",
    noteHi: "अंतरराज्यीय मामलों में सिंथेटिक रिकॉर्ड पर NOC आवश्यक हो सकता है।",
  },
  {
    id: "dl_address_change",
    en: "DL address update",
    hi: "DL पता अद्यतन",
    form: "Form LLD",
    noteEn: "Address proof must be verified on the mock profile.",
    noteHi: "मॉक प्रोफ़ाइल पर पता प्रमाण सत्यापित होना चाहिए।",
  },
  {
    id: "rc_address_change",
    en: "RC address update",
    hi: "RC पता अद्यतन",
    form: "Form 33",
    noteEn: "Requires a vehicle linked to the synthetic citizen.",
    noteHi: "सिंथेटिक नागरिक से जुड़ा वाहन आवश्यक।",
  },
  {
    id: "combined_address_change",
    en: "Combined DL + RC address",
    hi: "संयुक्त DL + RC पता",
    form: "Form 33+LLD",
    noteEn: "Single assisted flow when both documents need the same address.",
    noteHi: "दोनों दस्तावेज़ों पर समान पता हेतु एकीकृत सहायता प्रवाह।",
  },
];

export default function ServicesPage() {
  const { lang, t } = useLanguage();
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <MockPill>{t("Assisted services · mock filing", "सहायता सेवाएँ · मॉक फाइलिंग")}</MockPill>
        <h1 className="mt-4 text-3xl font-bold text-teal-950">
          {t("Services covered in this prototype", "इस प्रोटोटाइप में उपलब्ध सेवाएँ")}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {t(
            "Each service maps free-text citizen intent to the correct form type, fees, and eligibility checks — without live government systems.",
            "प्रत्येक सेवा नागरिक के मुक्त पाठ को सही फॉर्म, शुल्क और पात्रता जाँच से जोड़ती है — बिना लाइव सरकारी प्रणालियों के।"
          )}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-teal-950">
                  {lang === "hi" ? s.hi : s.en}
                </h2>
                <span className="shrink-0 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                  {s.form}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {lang === "hi" ? s.noteHi : s.noteEn}
              </p>
            </article>
          ))}
        </div>

        <Link
          href="/chat"
          className="mt-8 inline-flex rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          {t("Start with any DL →", "किसी भी DL से शुरू करें →")}
        </Link>
      </main>
    </>
  );
}
