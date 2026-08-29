"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageContext";
import { generateCitizen } from "@/lib/syntheticCitizenEngine";

export default function AssistPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [dl, setDl] = useState("");
  const [need, setNeed] = useState("renew my driving licence");
  const [previewed, setPreviewed] = useState(false);

  const profile = useMemo(() => {
    if (!previewed || dl.trim().length < 3) return null;
    return generateCitizen(dl);
  }, [dl, previewed]);

  function preview() {
    if (dl.trim().length < 3) return;
    setPreviewed(true);
  }

  function continueChat() {
    const q = `${need}. My DL number is ${dl.trim()}.`;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
          {t("Step 1 of 2 · Open your case", "चरण 1 / 2 · अपना केस खोलें")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-teal-950">
          {t("Enter your own licence details", "अपना लाइसेंस विवरण दर्ज करें")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t(
            "Judges: invent any DL string. We generate a consistent synthetic citizen for that exact input — then hand off to AI assistance.",
            "जज: कोई भी DL बनाएँ। उसी इनपुट हेतु सुसंगत सिंथेटिक नागरिक बनता है — फिर AI सहायता को सौंपा जाता है।"
          )}
        </p>
        <div className="mt-3">
          <MockPill>{t("Your data drives this session", "इस सत्र को आपका डेटा चलाता है")}</MockPill>
        </div>

        <div className="mt-8 space-y-4 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          <div>
            <label className="text-sm font-medium text-teal-950">
              {t("Driving licence number", "ड्राइविंग लाइसेंस नंबर")}
            </label>
            <Input
              className="mt-1.5 font-mono"
              value={dl}
              onChange={(e) => {
                setDl(e.target.value);
                setPreviewed(false);
              }}
              placeholder="Invent any value, e.g. RJ14-DEMO-7788"
            />
            <p className="mt-1 text-xs text-slate-500">
              {t(
                "No format validation — unusual input still produces a usable mock profile.",
                "कोई प्रारूप बाध्यता नहीं — असामान्य इनपुट पर भी मॉक प्रोफ़ाइल बनती है।"
              )}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-teal-950">
              {t("What do you need?", "आपको क्या सहायता चाहिए?")}
            </label>
            <select
              className="mt-1.5 h-11 w-full rounded-md border border-teal-200 bg-white px-3 text-sm"
              value={need}
              onChange={(e) => setNeed(e.target.value)}
            >
              <option value="renew my driving licence">Licence renewal</option>
              <option value="transfer vehicle ownership">Ownership transfer</option>
              <option value="update address on my driving licence">DL address update</option>
              <option value="update address on both DL and RC">Combined address update</option>
            </select>
          </div>

          <Button
            className="w-full bg-brand-teal text-white hover:bg-teal-800"
            onClick={preview}
            disabled={dl.trim().length < 3}
          >
            {t("Preview synthetic profile →", "सिंथेटिक प्रोफ़ाइल देखें →")}
          </Button>
        </div>

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 overflow-hidden rounded-2xl border border-teal-100 shadow-md"
          >
            <div className="bg-teal-950 px-4 py-3 text-white">
              <p className="text-xs text-teal-200">Synthetic Citizen Engine · deterministic</p>
              <p className="text-xl font-bold">{profile.name}</p>
              <p className="text-sm text-teal-100">
                {profile.age} · {profile.state} · {profile.occupation}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-white p-4 text-sm">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] text-slate-400">DL status</p>
                <p className="font-semibold">{profile.dl.status.replace(/_/g, " ")}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] text-slate-400">RTO</p>
                <p className="font-semibold">{profile.rtoCode}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] text-slate-400">Documents</p>
                <p className="text-xs">
                  medical {profile.documents.medicalCert} · address{" "}
                  {profile.documents.addressProof} · NOC {profile.documents.noc}
                </p>
              </div>
            </div>
            <div className="border-t border-teal-50 bg-teal-50/40 p-4">
              <Button
                className="w-full bg-teal-900 text-white hover:bg-teal-800"
                onClick={continueChat}
              >
                {t("Continue to AI assistance with this case →", "इस केस के साथ AI सहायता →")}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}
