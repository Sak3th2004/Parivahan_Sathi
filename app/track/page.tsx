"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader, MockPill } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageContext";

export default function TrackLookupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [id, setId] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const v = id.trim();
    if (!v) return;
    router.push(`/track/${encodeURIComponent(v)}`);
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <MockPill>{t("Public tracker · no login", "सार्वजनिक ट्रैकर · बिना लॉगिन")}</MockPill>
        <h1 className="mt-4 text-3xl font-bold text-teal-950">
          {t("Track application status", "आवेदन की स्थिति देखें")}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {t(
            "Enter the application ID issued after filing (starts with PS). Status is decoded from the ID — no database.",
            "फाइलिंग के बाद जारी आवेदन ID दर्ज करें (PS से शुरू)। स्थिति ID से डिकोड होती है — कोई database नहीं।"
          )}
        </p>

        <form onSubmit={go} className="mt-8 space-y-3 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          <label htmlFor="app-id" className="text-sm font-medium text-teal-950">
            {t("Application ID", "आवेदन ID")}
          </label>
          <Input
            id="app-id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="PS..."
            className="font-mono"
          />
          <Button type="submit" className="w-full bg-brand-teal text-white hover:bg-teal-800">
            {t("Check status →", "स्थिति जाँचें →")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("No ID yet?", "अभी ID नहीं है?")}{" "}
          <Link href="/chat" className="font-semibold text-brand-teal hover:underline">
            {t("Start assistance", "सहायता शुरू करें")}
          </Link>
        </p>
      </main>
    </>
  );
}
