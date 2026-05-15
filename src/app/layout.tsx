import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { IdleSessionTimer } from "@/components/auth/idle-session-timer";
import { ThemeProvider } from "next-themes";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agapay-iatk.vercel.app"),
  title: {
    default: "Agapay | Cooperative Microfinance SaaS",
    template: "%s | Agapay",
  },
  description:
    "Filipino-first cooperative microfinance software with transparent 3% to 5% monthly rates, guarantor-backed lending, trust scoring, and tenant-managed repayment support.",
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
      "Transparent, cooperative-backed credit flows for Filipino communities, with guarantors, trust scoring, and tenant-managed repayment records.",
    siteName: "Agapay Microfinance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agapay | Cooperative Microfinance SaaS",
    description:
      "Transparent cooperative lending for Filipino members and tenant teams.",
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
    <html lang="en" className={`${fraunces.variable} ${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
      <body
        className="font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <IdleSessionTimer />
            <div className="relative min-h-screen">
              <main className="relative z-10">{children}</main>
              <Toaster position="top-right" richColors expand visibleToasts={1} />
            </div>
          </AuthProvider>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
