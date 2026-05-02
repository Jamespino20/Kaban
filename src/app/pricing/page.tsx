"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { BadgeCheck, CheckCircle2, Building, Zap, Shield } from "lucide-react";
import Link from "next/link";

const SUBSCRIPTION_PLANS = [
  {
    name: "Agapay Core",
    price: "₱2,500",
    interval: "kada buwan",
    description:
      "Para sa mga nagsisimulang kooperatiba at maliliit na lending team.",
    icon: Building,
    features: [
      "Hanggang 500 members",
      "Basic admin dashboard (Tanaw)",
      "Standard microfinance policy access",
      "Email & In-app notifications",
      "Standard 5% default penalty rate",
    ],
    buttonText: "Simulan ang Core",
    highlight: false,
  },
  {
    name: "Agapay Pro",
    price: "₱4,500",
    interval: "kada buwan",
    description:
      "Para sa mga lumalagong kooperatiba na kailangan ang advanced analytics.",
    icon: Zap,
    features: [
      "Hanggang 2,500 members",
      "Advanced Analytics module",
      "Custom branch branding",
      "Mentorship & Community Tools setup",
      "Premium chat and email support",
      "Automated Compassion workflow",
    ],
    buttonText: "I-upgrade sa Pro",
    highlight: true,
  },
  {
    name: "Agapay Enterprise",
    price: "Custom",
    interval: "kada taon",
    description: "Para sa malalaking institusyon. Limitless capacity.",
    icon: Shield,
    features: [
      "Walang limit na members",
      "Dedicated account manager",
      "Full API access at custom export",
      "Priority feature requests",
      "White-label options",
    ],
    buttonText: "Makipag-ugnayan",
    highlight: false,
  },
];

const RATE_GUIDE = [
  {
    label: "Starter Tier",
    rate: "5%",
    description:
      "Para sa bagong miyembro. Mataas na rate pang cover ng first-time risk.",
    features: ["₱5,000 max bracket", "Strict weekly payments"],
  },
  {
    label: "Growing Tier",
    rate: "4%",
    description:
      "May track record na. Puwede nang monthly at mas malaki ang terms.",
    features: ["Build trust network", "Bi-weekly allowance"],
  },
  {
    label: "Elite Tier",
    rate: "3%",
    description: "Ang lowest rate platform-wide. Suki na, zero defaults.",
    features: ["Declining balance mode", "₱100k+ credit line limit"],
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* SAAS PRICING SECTION */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              SaaS Para sa Kooperatiba
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight italic mb-6 leading-[0.95] text-slate-900">
              Subscribing to <span className="text-emerald-600">Agapay.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Simple at patas na pricing para magpatakbo ng inyong kooperatiba
              gamit ang teknolohiya. Walang hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-10 rounded-[3rem] border flex flex-col transition-all ${
                  plan.highlight
                    ? "bg-slate-900 border-slate-800 text-white shadow-2xl scale-105 z-10"
                    : "bg-white border-slate-200 shadow-sm text-slate-900"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-sm px-4 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl w-fit mb-6 ${plan.highlight ? "bg-slate-800" : "bg-emerald-50"}`}
                >
                  <plan.icon
                    className={`w-8 h-8 ${plan.highlight ? "text-emerald-400" : "text-emerald-600"}`}
                  />
                </div>
                <h3 className="text-2xl font-black italic mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span
                    className={`text-sm font-bold ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}
                  >
                    / {plan.interval}
                  </span>
                </div>
                <p
                  className={`font-medium leading-relaxed mb-8 h-14 ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}
                >
                  {plan.description}
                </p>
                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`}
                      />
                      <span
                        className={`text-sm font-bold leading-relaxed ${plan.highlight ? "text-slate-200" : "text-slate-700"}`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/contact"
                  className={`block text-center py-4 rounded-2xl font-black italic transition-all ${
                    plan.highlight
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* MEMBER LOAN RATE GUIDE SECTION */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="bg-slate-100 rounded-[4rem] p-12 md:p-16 border border-slate-200">
            <div className="mb-12">
              <h2 className="text-4xl font-black italic text-slate-900 mb-4">
                Pang-miyembrong Rate Guide
              </h2>
              <p className="text-slate-600 font-medium text-lg max-w-2xl">
                Kapag kayo ay nakasali na sa isang kooperatiba, narito ang gabay
                para sa kalimitang interes na ipinapataw kada buwan.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RATE_GUIDE.map((tier) => (
                <div
                  key={tier.label}
                  className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
                >
                  <h4 className="text-lg font-black text-slate-500 mb-2 italic">
                    {tier.label}
                  </h4>
                  <div className="text-4xl font-black text-emerald-600 mb-4">
                    {tier.rate}
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-xl">
                    {tier.description}
                  </p>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-slate-700 font-bold"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
