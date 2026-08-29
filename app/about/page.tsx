"use client";

import Link from "next/link";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { useLanguage } from "@/components/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <MockPill>{t("Independent prototype", "स्वतंत्र प्रोटोटाइप")}</MockPill>
        <h1 className="mt-4 text-3xl font-bold text-teal-950 sm:text-4xl">
          {t("About Parivahan Sathi", "परिवहन साथी के बारे में")}
        </h1>
        <p className="mt-4 leading-relaxed text-slate-600">
          {t(
            "Parivahan Sathi is an independent hackathon prototype that helps citizens complete RTO journeys — licence renewal, ownership transfer, and address updates — through one assisted conversation. It is not Parivahan Sewa, MoRTH, or any Government of India product.",
            "परिवहन साथी एक स्वतंत्र हैकथॉन प्रोटोटाइप है जो नागरिकों को RTO प्रक्रियाएँ — लाइसेंस नवीनीकरण, स्वामित्व हस्तांतरण, पता अद्यतन — एक सहायता प्राप्त संवाद में पूर्ण करने में मदद करता है। यह परिवहन सेवा, MoRTH या भारत सरकार का उत्पाद नहीं है।"
          )}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              t: t("Who it serves", "यह किसके लिए है"),
              b: t(
                "Citizens facing confusing forms, repeated RTO visits, and unclear eligibility rules — including mobile-first and limited-literacy users.",
                "जिन नागरिकों के लिए फॉर्म जटिल हैं, बार-बार RTO जाना पड़ता है, और पात्रता नियम स्पष्ट नहीं — मोबाइल-प्रथम एवं सीमित डिजिटल अनुभव वाले उपयोगकर्ता सहित।"
              ),
            },
            {
              t: t("What we changed", "हमने क्या बदला"),
              b: t(
                "Replace portal maze with assisted dialogue. Eligibility is checked against a synthetic profile before filing. Status is explained in plain language.",
                "पोर्टल भूलभुलैया के स्थान पर सहायता प्राप्त संवाद। फाइलिंग से पहले सिंथेटिक प्रोफ़ाइल पर पात्रता जाँच। स्थिति सरल भाषा में।"
              ),
            },
          ].map((c) => (
            <article key={c.t} className="rounded-2xl border border-teal-100 bg-white p-5">
              <h2 className="font-semibold text-teal-950">{c.t}</h2>
              <p className="mt-2 text-sm text-slate-600">{c.b}</p>
            </article>
          ))}
        </div>

        <Link
          href="/chat"
          className="mt-8 inline-flex rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          {t("Begin assistance →", "सहायता शुरू करें →")}
        </Link>
      </main>
    </>
  );
}
