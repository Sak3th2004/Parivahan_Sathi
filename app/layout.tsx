import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { DisclaimerBar } from "@/components/DisclaimerBar";

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
  title: "Parivahan Sathi — Voice-first RTO assistant",
  description:
    "Demo prototype: renew DL, transfer vehicle, update address in Hindi or English. Synthetic mock data only. Not affiliated with Government of India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoDevanagari.variable}`}>
      <body className="font-sans antialiased ps-atmosphere min-h-screen">
        <LanguageProvider>
          <DisclaimerBar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
