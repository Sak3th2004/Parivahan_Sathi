"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageContext";
import { generateCitizen } from "@/lib/syntheticCitizenEngine";
import { validateDlInput } from "@/lib/dlValidation";

export default function LandingPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [dl, setDl] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => (touched ? validateDlInput(dl) : null), [dl, touched]);
  const profile = useMemo(() => {
    if (!validation || !validation.ok) return null;
    return generateCitizen(validation.normalized);
  }, [validation]);

  function onDlChange(value: string) {
    setDl(value);
    setTouched(true);
    setError(null);
  }

  function continueAssist() {
    const v = validateDlInput(dl);
    if (!v.ok) {
      setTouched(true);
      setError(lang === "hi" ? v.reasonHi : v.reason);
      return;
    }
    router.push(
      `/chat?q=${encodeURIComponent(
        `Please assist with renewing my driving licence. My DL is ${v.normalized}.`
      )}`
    );
  }

  return (
    <>
      <AppHeader ctaHref="/assist" ctaLabel={t("Start →", "शुरू करें →")} />

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-10 sm:px-6 sm:pt-14">
        {/* Hero — one clear composition */}
        <section className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-teal">Parivahan Sathi</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.12] tracking-tight text-teal-950 sm:text-5xl">
            {t("Licence renew? RC transfer?", "लाइसेंस नवीनीकरण? RC हस्तांतरण?")}
            <br />
            <span className="text-brand-teal">{t("Checked before you file.", "फाइल से पहले जाँच।")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
            {t(
              "Type any driving licence number below — even invented. See a synthetic profile instantly, then continue into assisted filing.",
              "नीचे कोई भी ड्राइविंग लाइसेंस नंबर लिखें — काल्पनिक भी। तुरंत सिंथेटिक प्रोफ़ाइल देखें, फिर सहायता प्राप्त फाइलिंग पर जाएँ।"
            )}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <MockPill>{t("Synthetic data", "सिंथेटिक डेटा")}</MockPill>
            <MockPill>{t("Not Government of India", "भारत सरकार नहीं")}</MockPill>
            <MockPill>{t("Any DL works", "कोई भी DL")}</MockPill>
          </div>
        </section>

        {/* Live interactive try-it — homepage wow */}
        <section className="mx-auto mt-10 max-w-xl">
          <div className="rounded-[1.75rem] border border-teal-100 bg-white p-5 shadow-[0_24px_60px_-28px_rgba(15,118,110,0.45)] sm:p-6">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-teal-950">
                {t("Try it live on this page", "इस पृष्ठ पर लाइव आज़माएँ")}
              </h2>
              <span className="text-[11px] font-medium text-teal-700">Step 1</span>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              {t(
                "Enter a DL number — not a website link. Example: MH14-99887766",
                "लाइसेंस नंबर दर्ज करें — वेबसाइट लिंक नहीं। उदाहरण: MH14-99887766"
              )}
            </p>

            <label htmlFor="home-dl" className="sr-only">
              Driving licence number
            </label>
            <Input
              id="home-dl"
              value={dl}
              onChange={(e) => onDlChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && continueAssist()}
              placeholder="MH14-99887766"
              className="h-12 rounded-2xl border-teal-100 font-mono text-base"
              autoComplete="off"
            />

            {(error || (validation && !validation.ok)) && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-amber-800">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {error ||
                  (lang === "hi" && validation && !validation.ok
                    ? validation.reasonHi
                    : validation && !validation.ok
                      ? validation.reason
                      : "")}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {["MH14-99887766", "TS09ZZ0001", "KA05MZ4321"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onDlChange(sample)}
                  className="rounded-full border border-teal-100 bg-teal-50/70 px-3 py-1 font-mono text-xs text-teal-900 hover:bg-teal-50"
                >
                  {sample}
                </button>
              ))}
            </div>

            {profile && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/40">
                <div className="flex items-center justify-between bg-teal-950 px-4 py-2.5 text-white">
                  <span className="text-xs font-medium">Synthetic profile · live</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-lg font-bold text-teal-950">{profile.name}</p>
                  <p className="text-sm text-slate-600">
                    {profile.age} yrs · {profile.state} · {profile.occupation}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-white px-3 py-2">
                      <p className="text-[10px] uppercase text-slate-400">Status</p>
                      <p className="font-semibold text-amber-700">
                        {profile.dl.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2">
                      <p className="text-[10px] uppercase text-slate-400">RTO</p>
                      <p className="font-semibold">{profile.rtoCode}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(profile.documents).map(([k, v]) => (
                      <span
                        key={k}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          v === "verified"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="mt-5 h-12 w-full rounded-2xl bg-[#D9F99D] text-base font-semibold text-teal-950 hover:bg-[#bef264]"
              onClick={continueAssist}
              disabled={!profile}
            >
              {t("Continue with AI assistance", "AI सहायता जारी रखें")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Simple why */}
        <section className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            {
              t: t("Catch blockers first", "पहले समस्या पकड़ें"),
              b: t(
                "Medical cert, NOC, retest — before you queue at the RTO.",
                "मेडिकल, NOC, रीटेस्ट — RTO कतार से पहले।"
              ),
            },
            {
              t: t("Any language", "कोई भी भाषा"),
              b: t(
                "English or Hindi. The assistant matches your language.",
                "अंग्रेज़ी या हिंदी। सहायक आपकी भाषा में उत्तर देता है।"
              ),
            },
            {
              t: t("Live tracker", "लाइव ट्रैकर"),
              b: t(
                "Application ID encodes status. No database required.",
                "आवेदन ID में स्थिति एन्कोड। Database आवश्यक नहीं।"
              ),
            },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-teal-50 bg-white/80 p-4 text-center">
              <p className="font-semibold text-teal-950">{c.t}</p>
              <p className="mt-1 text-sm text-slate-600">{c.b}</p>
            </div>
          ))}
        </section>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/how-it-works" className="font-medium text-brand-teal hover:underline">
            {t("How it works & what is mocked →", "कैसे काम करता है एवं क्या मॉक है →")}
          </Link>
          {" · "}
          <Link href="/simulator" className="font-medium text-brand-teal hover:underline">
            {t("Offline simulator", "ऑफ़लाइन सिम्युलेटर")}
          </Link>
        </p>
      </main>
    </>
  );
}
