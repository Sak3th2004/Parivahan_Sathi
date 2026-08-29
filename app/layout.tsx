import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { DisclaimerBar } from "@/components/DisclaimerBar";
import { AccessibilityBar } from "@/components/AppHeader";
import { EvaluatorTour } from "@/components/EvaluatorTour";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parivahan Sathi — RTO paperwork, checked before you file",
  description:
    "Independent hackathon prototype. Voice-first RTO help for DL renewal, transfers and address changes. Synthetic mock data only. Not Government of India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoDevanagari.variable}`}>
      <body className="font-sans antialiased ps-atmosphere min-h-screen text-teal-950">
        <LanguageProvider>
          <AccessibilityBar />
          <DisclaimerBar />
          {children}
          <EvaluatorTour />
        </LanguageProvider>
      </body>
    </html>
  );
}
