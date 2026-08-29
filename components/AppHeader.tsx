"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

export function AccessibilityBar() {
  const { lang, setLang, fontScale, setFontScale, t } = useLanguage();

  return (
    <div className="border-b border-slate-800/10 bg-teal-950 text-[11px] text-teal-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
        <p className="text-teal-100/80">
          {t(
            "Independent civic prototype · Synthetic data only",
            "स्वतंत्र नागरिक प्रोटोटाइप · केवल सिंथेटिक डेटा"
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-teal-200/70">{t("Text size", "अक्षर आकार")}</span>
          {(["sm", "md", "lg"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFontScale(s)}
              className={cn(
                "rounded px-1.5 py-0.5 font-semibold",
                fontScale === s ? "bg-teal-700 text-white" : "hover:bg-teal-800"
              )}
              aria-label={`Font size ${s}`}
            >
              {s === "sm" ? "A-" : s === "md" ? "A" : "A+"}
            </button>
          ))}
          <span className="mx-1 h-3 w-px bg-teal-700" />
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="rounded bg-teal-800 px-2 py-0.5 font-semibold hover:bg-teal-700"
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppHeader({ ctaHref = "/chat", ctaLabel }: { ctaHref?: string; ctaLabel?: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const hideCta = pathname?.startsWith("/chat");

  const links = [
    { href: "/", label: t("Home", "होम") },
    { href: "/about", label: t("About", "परिचय") },
    { href: "/how-it-works", label: t("Process", "प्रक्रिया") },
    { href: "/services", label: t("Services", "सेवाएँ") },
    { href: "/track", label: t("Track status", "स्थिति देखें") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/5 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Parivahan Sathi home">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-teal text-xs font-bold text-white">
            PS
          </span>
          <span className="truncate">
            <span className="block text-[15px] font-semibold tracking-tight text-teal-950">
              Parivahan Sathi
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-teal-700/70 sm:block">
              {t("Citizen RTO assistance", "नागरिक RTO सहायता")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm text-teal-900/70 hover:bg-teal-50 hover:text-teal-950",
                pathname === l.href && "bg-teal-50 font-medium text-teal-950"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/track"
            className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline md:hidden"
          >
            {t("Track", "ट्रैक")}
          </Link>
          {!hideCta && (
            <Link
              href={ctaHref}
              className="inline-flex items-center rounded-md bg-brand-teal px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              {ctaLabel || t("Start assistance →", "सहायता शुरू करें →")}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav
        className="flex gap-1 overflow-x-auto border-t border-teal-50 px-3 py-1.5 md:hidden"
        aria-label="Mobile"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs text-teal-800",
              pathname === l.href ? "bg-teal-100 font-semibold" : "bg-teal-50/60"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function MockPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/80 bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-teal-800">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
      {children}
    </span>
  );
}
