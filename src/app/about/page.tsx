"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  BadgeCheck,
  BookOpenText,
  HandHelping,
  Shield,
  Users,
} from "lucide-react";

const PRINCIPLES = [
  {
    icon: <HandHelping className="w-8 h-8 text-emerald-600" />,
    title: "Makataong lending flow",
    body: "Hindi lang approval at collection ang tinitingnan. Mahalaga sa Agapay ang paliwanag, mentoring, at malinaw na support sa miyembro habang lumalago ang negosyo.",
  },
  {
    icon: <Users className="w-8 h-8 text-emerald-600" />,
    title: "Community accountability",
    body: "Nakasentro ang platform sa Guarantors, Trust Score, at branch-guided na proseso para mas may pananagutan ang bawat loan at repayment.",
  },
  {
    icon: <Shield className="w-8 h-8 text-emerald-600" />,
    title: "Mas malinaw na operations",
    body: "Digital records, Statement of Account, repayment verification, at feedback tracking ang tumutulong para hindi malito ang staff at miyembro sa estado ng account.",
  },
];

const TIMELINE = [
  {
    title: "Mula sa tunay na problema",
    body: "Binuo ang Agapay bilang school project na nakaugat sa karaniwang problema ng micro-entrepreneurs: kulang sa malinaw na records, hirap sa follow-up, at magulong coordination sa branch at borrower.",
  },
  {
    title: "Hindi wallet app, kundi cooperative platform",
    body: "Ang Agapay ay hindi direktang payment rail sa prototype na ito. Sa halip, ito ang source of truth para sa approvals, mock disbursement, repayments, reports, at guided member support.",
  },
  {
    title: "Filipino-first na karanasan",
    body: "Layunin ng content at interface na mas madali para sa lokal na users: Filipino-first na wika, malinaw na technical terms, at flows na mas bagay sa branch-based lending at small-business cash cycles.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              Tungkol sa Agapay
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Ang layunin ng{" "}
              <span className="text-emerald-600">Agapay</span> ay hindi lang
              pondo.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-10 leading-relaxed max-w-3xl">
              Ang Agapay ay isang Filipino-first cooperative microfinance SaaS
              na ginawa para sa mas malinaw na branch operations, mas
              explainable na loan flow, at mas suportadong pag-asenso ng mga
              miyembro.
            </p>
            <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-3xl">
              Bilang school-project prototype, nakatuon ito sa tamang records,
              guided approvals, mock money flow, feedback handling, at
              community-based lending features tulad ng{" "}
              <strong className="text-slate-900">Guarantors</strong>,{" "}
              <strong className="text-slate-900">Trust Score</strong>, at{" "}
              <strong className="text-slate-900">Mentorship</strong>.
            </p>
          </div>
        </section>

        <section className="w-full py-24 px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="rounded-[3rem] bg-white border border-slate-200 p-10 md:p-14 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <BookOpenText className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-black italic text-slate-900">
                Bakit ito ginawa
              </h2>
            </div>
            <div className="space-y-8">
              {TIMELINE.map((item) => (
                <div key={item.title} className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[3rem] bg-emerald-950 text-white p-10 md:p-14 shadow-xl shadow-emerald-950/10">
            <h2 className="text-3xl font-black italic mb-8">
              Ano ang ipinapangako ng prototype
            </h2>
            <div className="space-y-5 text-emerald-50/90 leading-relaxed">
              <p>
                Malinaw na status para sa application, approval, release, at
                repayment.
              </p>
              <p>
                Role-based views para sa `superadmin`, `admin`, `lender`, at
                `member`.
              </p>
              <p>
                Feedback at content workflows para manatiling relevant ang
                homepage at support experience.
              </p>
              <p>
                Isang mas grounded na cooperative product story na hindi
                umaasa sa generic wallet behavior lang.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRINCIPLES.map((item) => (
              <div
                key={item.title}
                className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-sm"
              >
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-2xl font-black italic text-slate-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
