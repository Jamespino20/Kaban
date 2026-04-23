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
      "May malinaw na view para sa `superadmin`, `admin`, `lender`, at `member`, kaya mas madaling maintindihan kung sino ang gumagawa ng review, release, repayment verification, at reports.",
    points: [
      "Tanaw para sa staff at oversight",
      "Pintig para sa member self-service",
      "2FA at secured account access",
    ],
  },
  {
    icon: <Wallet className="w-10 h-10 text-emerald-600" />,
    title: "Mock money flow management",
    description:
      "Sa prototype, hindi direktang nagpo-process ng pera ang Agapay. Sa halip, nire-record nito ang approval, release method, repayment submission, at verification para malinaw ang operational history.",
    points: [
      "Cash release, GCash, bank transfer, at field collection tracking",
      "Repayment submission na may reference at proof",
      "Digital records para sa branch verification",
    ],
  },
  {
    icon: <Users className="w-10 h-10 text-emerald-600" />,
    title: "Community-driven lending",
    description:
      "Mas bagay ang platform sa cooperative setup dahil may Guarantors, Trust Score, at mentoring cues para hindi lang presyo ang basehan ng desisyon.",
    points: [
      "Guarantor validation",
      "Trust-based visibility at metrics",
      "Mas suportadong member journey",
    ],
  },
  {
    icon: <FileCheck2 className="w-10 h-10 text-emerald-600" />,
    title: "Content at feedback operations",
    description:
      "May feedback inbox at homepage content workflow na puwedeng i-manage ng admins at superadmin para manatiling relevant ang FAQs, testimonials, at support messaging.",
    points: [
      "Feedback capture mula public at in-app pages",
      "Homepage FAQ at testimonial moderation",
      "Mas malinaw na support escalation",
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
              Paano Gumagana ang Platform
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Isang platform para sa{" "}
              <span className="text-emerald-600">cooperative operations</span>.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-10 leading-relaxed max-w-3xl">
              Ang Agapay ay nakatuon sa lending operations, hindi lang sa
              simpleng transaction feed. Nakikita rito ang approvals, mock
              releases, repayments, feedback, at reports sa isang malinaw na
              sistema.
            </p>
          </div>
        </section>

        <section className="w-full py-20 px-6 max-w-7xl">
          <div className="rounded-[3rem] bg-emerald-950 text-white p-10 md:p-14 shadow-xl shadow-emerald-950/10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-10">
              <div>
                <h2 className="text-3xl font-black italic mb-6">
                  Ano ang sakop ng prototype na ito
                </h2>
                <p className="text-emerald-50/85 leading-relaxed text-lg">
                  Kasama rito ang member onboarding, branch-scoped lending
                  operations, 2FA-secured login, Statement of Account,
                  feedback handling, at seasonal homepage content moderation.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  "Hindi direktang wallet o payment processor",
                  "Records-first at verification-first na sistema",
                  "Mas akma sa cooperative at branch workflows",
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
                  Security at isolation
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-3xl">
                Multi-tenant ang design ng Agapay, may role-based authorization,
                2FA support, at mas maingat na access control para sa reports at
                admin actions.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
