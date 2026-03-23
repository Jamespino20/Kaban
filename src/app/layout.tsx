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
  title: "Kaban | The Shared Treasury — SEC-Registered Microfinance",
  description:
    "SEC-Registered, BSP-Supervised microfinancing for Filipino entrepreneurs. Rates from 1.5% monthly. 24-hour loan approval. Digital receipts and transparent tracking.",
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
