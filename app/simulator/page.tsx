"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageContext";
import { generateCitizen } from "@/lib/syntheticCitizenEngine";
import { validateDlInput } from "@/lib/dlValidation";

/** Pure client eligibility — no API spend (mirrors agentTools deterministic path) */
function localEligibility(dl: string, service: string) {
  const c = generateCitizen(dl);
  const issues: string[] = [];
  let formType = "9";
  let fees = 200;
  let slotRequired = true;
  let eligible = true;

  if (service === "dl_renewal") {
    formType = "9";
    fees = 200 + (c.dl.status !== "valid" ? 500 : 0);
    if (c.dl.status === "expired_over_1yr") issues.push("retest_required");
    if (c.age >= 50 && c.documents.medicalCert !== "verified") issues.push("medical_cert_needed");
  } else if (service === "vehicle_transfer") {
    formType = "29+30";
    fees = 500;
    if (!c.vehicle) {
      eligible = false;
      issues.push("no_vehicle_on_record");
    } else if (!c.vehicle.sameStateAsOwner && c.documents.noc !== "verified") {
      issues.push("noc_needed");
    }
  } else if (service === "combined_address_change") {
    formType = "33+LLD";
    fees = 200;
    slotRequired = false;
    if (!c.vehicle) {
      eligible = false;
      issues.push("no_vehicle_on_record");
    }
    if (c.documents.addressProof !== "verified") issues.push("address_proof_missing");
  } else {
    formType = "LLD";
    fees = 100;
    if (c.documents.addressProof !== "verified") issues.push("address_proof_missing");
  }

  if (issues.length && eligible) eligible = false;
  return { c, eligible, issues, formType, fees, slotRequired };
}

const SERVICES = [
  { id: "dl_renewal", label: "Licence renewal" },
  { id: "vehicle_transfer", label: "Ownership transfer" },
  { id: "dl_address_change", label: "DL address update" },
  { id: "combined_address_change", label: "Combined address" },
] as const;

export default function SimulatorPage() {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [dl, setDl] = useState("");
  const [service, setService] = useState<string>("dl_renewal");
  const [dlError, setDlError] = useState<string | null>(null);

  const result = useMemo(() => {
    const v = validateDlInput(dl);
    if (!v.ok) return null;
    return localEligibility(v.normalized, service);
  }, [dl, service]);

  function goFromDl() {
    const v = validateDlInput(dl);
    if (!v.ok) {
      setDlError(lang === "hi" ? v.reasonHi : v.reason);
      return;
    }
    setDlError(null);
    setStep(1);
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <MockPill>{t("Zero API spend · client-side only", "शून्य API व्यय · केवल क्लाइंट-साइड")}</MockPill>
        <h1 className="mt-3 text-3xl font-bold text-teal-950">
          {t("Interactive journey simulator", "इंटरैक्टिव यात्रा सिम्युलेटर")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t(
            "Enter your own DL. Watch Synthetic Citizen Engine + CMV rules run locally — then jump into live AI assistance with the same input.",
            "अपना DL दर्ज करें। SCE + CMV नियम स्थानीय रूप से देखें — फिर उसी इनपुट से लाइव AI सहायता में जाएँ।"
          )}
        </p>

        <div className="mt-6 flex gap-2">
          {["DL", "Service", "Profile", "Rules", "Next"].map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className={`flex-1 rounded-lg py-2 text-[11px] font-semibold ${
                step === i ? "bg-teal-900 text-white" : "bg-teal-50 text-teal-800"
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          {step === 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-teal-950">
                {t("Your DL number", "आपका DL नंबर")}
              </label>
              <Input
                value={dl}
                onChange={(e) => {
                  setDl(e.target.value);
                  setDlError(null);
                }}
                placeholder="e.g. MH14-99887766 — not a website URL"
                className="font-mono"
              />
              {dlError && <p className="text-sm text-amber-800">{dlError}</p>}
              <Button className="bg-brand-teal text-white hover:bg-teal-800" onClick={goFromDl}>
                Continue →
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-teal-950">Select service</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm ${
                      service === s.id
                        ? "border-teal-700 bg-teal-50 font-semibold"
                        : "border-teal-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <Button className="bg-brand-teal text-white hover:bg-teal-800" onClick={() => setStep(2)}>
                Generate profile →
              </Button>
            </div>
          )}

          {step === 2 && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-sm font-semibold text-teal-950">Synthetic profile (deterministic)</p>
              <div className="rounded-xl bg-teal-950 p-4 text-white">
                <p className="text-lg font-bold">{result.c.name}</p>
                <p className="text-sm text-teal-200">
                  {result.c.age} yrs · {result.c.state} · {result.c.occupation}
                </p>
                <p className="mt-2 font-mono text-xs">{result.c.dlNumber}</p>
                <p className="mt-1 text-sm">
                  DL status:{" "}
                  <span className="font-semibold text-amber-300">
                    {result.c.dl.status.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
              <Button className="bg-brand-teal text-white hover:bg-teal-800" onClick={() => setStep(3)}>
                Run eligibility rules →
              </Button>
            </motion.div>
          )}

          {step === 3 && result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-teal-950">Eligibility result</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    result.eligible
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {result.eligible ? "Ready" : "Fix required"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Form {result.formType} · ₹{result.fees} · slot{" "}
                {result.slotRequired ? "required" : "not required"}
              </p>
              {result.issues.length > 0 ? (
                <ul className="space-y-1 text-sm text-amber-900">
                  {result.issues.map((i) => (
                    <li key={i} className="rounded-lg bg-amber-50 px-3 py-2">
                      {i.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-700">No blockers on this synthetic profile.</p>
              )}
              <Button className="bg-brand-teal text-white hover:bg-teal-800" onClick={() => setStep(4)}>
                Finish →
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Simulator complete. Continue with the same DL into live AI assistance (uses your OpenAI
                key) or invent another number and re-run.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/chat?q=${encodeURIComponent(
                    (() => {
                      const v = validateDlInput(dl);
                      const id = v.ok ? v.normalized : dl.trim();
                      return `Please assist with ${service.replace(/_/g, " ")}. My DL is ${id}.`;
                    })()
                  )}`}
                  className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Continue with AI assistance →
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(0);
                    setDl("");
                    setDlError(null);
                  }}
                >
                  Reset simulator
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
