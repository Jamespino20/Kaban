import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://asenso-iatk.vercel.app"),
  title: {
    default: "Asenso | The Shared Treasury — SEC-Registered Microfinance",
    template: "%s | Asenso",
  },
  description:
    "SEC-Registered, BSP-Supervised microfinancing for Filipino entrepreneurs. Rates from 1.5% monthly. The community-driven Paluwagan 2.0 alternative to GCash.",
  keywords: [
    "microfinance philippines",
    "paluwagan app",
    "sari-sari store loan",
    "business loan options philippines",
    "gcash alternative",
  ],
  authors: [{ name: "Asenso Cooperative Board" }],
  creator: "Asenso Technologies",
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://asenso-iatk.vercel.app",
    title: "Asenso | The Shared Treasury",
    description:
      "The Business Operating System for Filipino Entrepreneurs. Transparent, cooperative-backed credit designed for the real world.",
    siteName: "Asenso Microfinance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asenso | The Shared Treasury",
    description: "The Business Operating System for Filipino Entrepreneurs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${plusJakartaSans.variable} ${fraunces.variable} font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300`}
      >
        <div className="relative min-h-screen bg-white">
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />

          <main className="relative z-10">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
