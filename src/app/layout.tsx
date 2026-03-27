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
  metadataBase: new URL("https://kaban-iatk.vercel.app"),
  title: {
    default: "Kaban | The Shared Treasury — SEC-Registered Microfinance",
    template: "%s | Kaban",
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
  authors: [{ name: "Kaban Cooperative Board" }],
  creator: "Kaban Technologies",
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://kaban-iatk.vercel.app",
    title: "Kaban | The Shared Treasury",
    description:
      "The Business Operating System for Filipino Entrepreneurs. Transparent, cooperative-backed credit designed for the real world.",
    siteName: "Kaban Microfinance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaban | The Shared Treasury",
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
