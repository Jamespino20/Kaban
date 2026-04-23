"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const RATE_GUIDE = [
  {
    label: "Starter Tier",
    rate: "5%",
    description:
      "Mas mataas na karaniwang rate para sa bagong miyembro o unang maliit na puhunan.",
    features: [
      "Mas mababang initial credit cap",
      "Akma sa starter inventory at maliit na restocking",
      "Mas mahigpit na branch review at support",
    ],
  },
  {
    label: "Growing Tier",
    rate: "4.5% - 4%",
    description:
      "Para sa miyembrong may mas maayos nang repayment record at mas regular na cash flow.",
    features: [
      "Mas flexible na term at amount",
      "Mas malinaw na Trust Score progression",
      "Puwedeng iakma sa weekly o monthly cadence",
    ],
  },
  {
    label: "Established Tier",
    rate: "3.5% - 3%",
    description:
      "Para sa miyembrong may mas matatag na standing, mas magandang repayment behavior, at mas mababang risk profile.",
    features: [
      "Mas mababang karaniwang rate",
      "Mas mataas na available credit habang lumalago",
      "Mas tiwala ang branch sa repeat borrowing",
    ],
  },
];

const TRANSPARENCY_POINTS = [
  "Makikita ang principal, interest, processing fee, at kabuuang babayaran sa calculator at application flow.",
  "Ang aktwal na approval ay naka-base sa branch policy, Trust Score, at member standing.",
  "Maaaring manual na galawin ang calculator rate para makita ang iba’t ibang repayment scenarios.",
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              Pricing at Interest Guide
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Transparent na <span className="text-emerald-600">rate guide</span>.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl">
              Hindi iisang rate lang ang mundo ng cooperative lending. Sa
              Agapay, puwedeng maglaro ang estimate depende sa profile ng
              miyembro, sa Loan Product, at sa branch review.
            </p>
          </div>
        </section>

        <section className="w-full py-16 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {RATE_GUIDE.map((tier) => (
            <div
              key={tier.label}
              className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm flex flex-col"
            >
              <h3 className="text-lg font-black italic text-slate-500 mb-2">
                {tier.label}
              </h3>
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-5xl font-black text-emerald-600">
                  {tier.rate}
                </span>
                <span className="text-lg font-bold text-slate-400">
                  / buwan
                </span>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                {tier.description}
              </p>
              <ul className="space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm font-bold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="w-full py-20 px-6 max-w-7xl">
          <div className="bg-emerald-600 rounded-[4rem] p-12 md:p-20 text-white">
            <h2 className="text-4xl md:text-6xl font-black italic mb-10">
              Ano ang ibig sabihin nito sa prototype?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-95">
              {TRANSPARENCY_POINTS.map((point) => (
                <div key={point} className="space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-200" />
                  <p className="font-medium leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link
                href="/#calculator"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 font-black italic text-emerald-700 transition-all hover:bg-emerald-50"
              >
                Subukan ang Calculator
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
