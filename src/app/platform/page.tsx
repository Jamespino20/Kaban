"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  LayoutDashboard,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: <LayoutDashboard className="w-10 h-10 text-emerald-600" />,
    title: "Role-based dashboards",
    description:
      "A clear view for `superadmin`, `admin`, `lender`, and `member`, making it easier to understand who performs reviews, releases, repayment verifications, and reporting.",
    points: [
      "Tanaw for staff and oversight",
      "Pintig for member self-service",
      "2FA and secured account access",
    ],
  },
  {
    icon: <Wallet className="w-10 h-10 text-emerald-600" />,
    title: "Mock money flow management",
    description:
      "Agapay does not directly process funds in this prototype. Instead, it records approvals, release methods, repayment submissions, and verifications to maintain a clear operational history.",
    points: [
      "Cash release, GCash, bank transfer, and field collection tracking",
      "Repayment submissions with reference and proof",
      "Digital records for branch verification",
    ],
  },
  {
    icon: <Users className="w-10 h-10 text-emerald-600" />,
    title: "Community-driven lending",
    description:
      "The platform fits cooperative setups through Guarantors, Trust Score limits, and mentoring cues so decisions aren't solely based on interest rates.",
    points: [
      "Guarantor validation",
      "Trust-based visibility and metrics",
      "A better supported member journey",
    ],
  },
  {
    icon: <FileCheck2 className="w-10 h-10 text-emerald-600" />,
    title: "Content and feedback operations",
    description:
      "A feedback inbox and homepage content workflow managed by admins and superadmins to keep FAQs, testimonials, and support messaging relevant.",
    points: [
      "Feedback capture from public and in-app pages",
      "Homepage FAQ and testimonial moderation",
      "Clearer support escalation",
    ],
  },
];

export default function PlatformPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              How the Platform Works
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              A platform for your{" "}
              <span className="text-emerald-600">cooperative operations</span>.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-10 leading-relaxed max-w-3xl">
              Agapay focuses on cooperative lending operations, not just another
              transaction feed. Track approvals, mock releases, repayments,
              feedback, and reports through a unified system.
            </p>
          </div>
        </section>

        <section className="w-full py-20 px-6 max-w-7xl">
          <div className="rounded-[3rem] bg-emerald-950 text-white p-10 md:p-14 shadow-xl shadow-emerald-950/10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-10">
              <div>
                <h2 className="text-3xl font-black italic mb-6">
                  What this prototype covers
                </h2>
                <p className="text-emerald-50/85 leading-relaxed text-lg">
                  This covers member onboarding, branch-scoped lending
                  operations, 2FA-secured logins, Statements of Account,
                  feedback handling, and seasonal homepage content moderation.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  "Not a direct wallet or payment processor",
                  "Records-first and verification-first system",
                  "Built for cooperative and branch workflows",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {CAPABILITIES.map((item) => (
            <div
              key={item.title}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200"
            >
              <div className="p-5 bg-white rounded-2xl w-fit mb-8 shadow-sm">
                {item.icon}
              </div>
              <h2 className="text-3xl font-black italic mb-5 tracking-tight">
                {item.title}
              </h2>
              <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
                {item.description}
              </p>
              <ul className="space-y-3">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 font-bold text-slate-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="w-full py-8 px-6 max-w-7xl">
          <div className="rounded-[2.5rem] bg-slate-50 border border-slate-200 p-8 md:p-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-600" />
                <h3 className="text-2xl font-black italic text-slate-900">
                  Security and isolation
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-3xl">
                Agapay features a multi-tenant design, complete with role-based
                authorization, 2FA support, and careful access controls for
                branch reports and admin actions.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
