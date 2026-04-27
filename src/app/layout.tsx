import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agapay-iatk.vercel.app"),
  title: {
    default: "Agapay | Cooperative Microfinance SaaS",
    template: "%s | Agapay",
  },
  description:
    "Filipino-first cooperative microfinance software with transparent 3% to 5% monthly rates, guarantor-backed lending, trust scoring, and branch-managed repayment support.",
  keywords: [
    "microfinance philippines",
    "cooperative lending software",
    "sari-sari store loan",
    "business loan options philippines",
    "cooperative saas",
  ],
  authors: [{ name: "Agapay Cooperative Board" }],
  creator: "Agapay Technologies",
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://agapay-iatk.vercel.app",
    title: "Agapay | Cooperative Microfinance SaaS",
    description:
      "Transparent, cooperative-backed credit flows for Filipino communities, with guarantors, trust scoring, and branch-managed repayment records.",
    siteName: "Agapay Microfinance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agapay | Cooperative Microfinance SaaS",
    description:
      "Transparent cooperative lending for Filipino members and branch teams.",
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
        <AuthProvider>
          <div className="relative min-h-screen bg-white">
            <div className="pointer-events-none fixed right-0 top-0 z-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/30 blur-[120px]" />

            <main className="relative z-10">{children}</main>
          </div>
          <Toaster />
          <SpeedInsights />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
