"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Languages } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

export function AppHeader({ ctaHref = "/chat", ctaLabel }: { ctaHref?: string; ctaLabel?: string }) {
  const pathname = usePathname();
  const { lang, toggle, t } = useLanguage();
  const hideCta = pathname?.startsWith("/chat");

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/5 bg-[#F7FBF9]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Parivahan Sathi home">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-sm font-bold text-white shadow-sm">
            PS
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-teal-950">
            Parivahan Sathi
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/how-it-works"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-teal-900/70 hover:bg-teal-50 hover:text-teal-950",
              pathname === "/how-it-works" && "bg-teal-50 text-teal-950"
            )}
          >
            <CircleHelp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("How it works", "कैसे काम करता है")}</span>
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-teal-900/70 hover:bg-teal-50"
            aria-label="Toggle language"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "en" ? "हिं" : "EN"}
          </button>
          {!hideCta && (
            <Link
              href={ctaHref}
              className="ml-1 inline-flex items-center rounded-full bg-[#D9F99D] px-3.5 py-1.5 text-sm font-semibold text-teal-950 shadow-sm transition hover:bg-[#bef264]"
            >
              {ctaLabel || t("Start →", "शुरू करें →")}
            </Link>
          )}
        </nav>
      </div>
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
