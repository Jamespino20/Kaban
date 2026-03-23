"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Lock,
  Shield,
  Smartphone,
  Layers,
  BadgeCheck,
  CheckCircle2,
} from "lucide-react";

export default function PlatformPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* Hero */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Ang Maunlad na <span className="text-emerald-600">Platform.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl">
              Isang high-end na ecosystem na binuo para sa seguridad at mabilis
              na pag-asenso. Tunghayan ang bawat teknolohiya sa likod ng Kaban.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="w-full py-32 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12">
          <FeatureBlock
            id="security"
            icon={<Lock className="w-10 h-10 text-emerald-600" />}
            title="Military-Grade Security"
            description="Ang bawat kaban ay pinoprotektahan ng advanced encryption at Role-Based Access Control (RBAC). Ang iyong data ay sa iyo lamang."
            points={[
              "End-to-end data encryption",
              "Automated daily backups",
              "2nd-factor authentication (2FA)",
            ]}
          />
          <FeatureBlock
            icon={<Layers className="w-10 h-10 text-emerald-600" />}
            title="Multi-Tenant Architecture"
            description="Isang matalinong sistema kung saan bawat organisasyon o branch ay may sariling isolated treasury habang may consolidated reports para sa head office."
            points={[
              "Branch isolation technology",
              "Global hierarchy management",
              "Emergency decommissioning flags",
            ]}
          />
          <FeatureBlock
            icon={<Smartphone className="w-10 h-10 text-emerald-600" />}
            title="Mobile Accessibility"
            description="Walang delay sa pagsubaybay. May mabilis na mobile access ang mga miyembro para makita ang kanilang balance kahit nasaan man sila."
            points={[
              "Simplified mobile dashboard",
              "Push notification reminders",
              "Transaction history download",
            ]}
          />
          <FeatureBlock
            icon={<Shield className="w-10 h-10 text-emerald-600" />}
            title="Secure Digital Receipts"
            description="Pinapalitan namin ang lumang papel at ledger ng digital, secure, at hindi nababago na mga resibo bawat transaksyon."
            points={[
              "Tamper-proof digital logs",
              "Instant PDF generation",
              "Email and SMS receipts",
            ]}
          />
        </section>

        <Footer />
      </main>
    </div>
  );
}

function FeatureBlock({
  id,
  icon,
  title,
  description,
  points,
}: {
  id?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div
      id={id}
      className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/30 transition-all duration-700"
    >
      <div className="p-5 bg-white rounded-2xl w-fit mb-8 shadow-sm">
        {icon}
      </div>
      <h2 className="text-3xl font-black italic mb-6 tracking-tight">
        {title}
      </h2>
      <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-4">
        {points.map((p) => (
          <li
            key={p}
            className="flex items-center gap-3 font-bold text-slate-700"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
