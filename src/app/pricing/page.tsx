import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getActiveTenantsForNav } from "@/actions/tenant-management";

export const dynamic = "force-dynamic";
import { BadgeCheck, CheckCircle2, Building, Zap, Shield } from "lucide-react";
import Link from "next/link";

const SUBSCRIPTION_PLANS = [
  {
    name: "Agapay Core",
    price: "₱3,500",
    interval: "3 months",
    description:
      "For cooperatives just getting started and small lending teams.",
    icon: Building,
    features: [
      "Up to 500 members",
      "Basic admin dashboard (Tanaw)",
      "Standard microfinance policy access",
      "Email & In-app notifications",
      "Standard 5% default penalty rate",
      "Member management & tracking",
      "Basic repayment recording",
    ],
    buttonText: "Start with Core",
    highlight: false,
  },
  {
    name: "Agapay Pro",
    price: "₱6,500",
    interval: "6 months",
    description: "For growing cooperatives that need advanced analytics.",
    icon: Zap,
    features: [
      "Up to 2,500 members",
      "Advanced Analytics module",
      "Custom tenant branding",
      "Mentorship & Community Tools setup",
      "Premium chat and email support",
      "Automated Compassion workflow",
      "Trust Score management system",
      "Guarantor workflow & tracking",
    ],
    buttonText: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Agapay Enterprise",
    price: "₱12,000",
    interval: "12 months",
    description: "For larger institutions. Limitless capacity.",
    icon: Shield,
    features: [
      "Unlimited members",
      "Dedicated account manager",
      "Full API access and custom export",
      "Priority feature requests",
      "White-label options",
      "Custom policy configuration",
      "Advanced reporting & compliance",
    ],
    buttonText: "Get in Touch",
    highlight: false,
  },
];

const RATE_GUIDE = [
  {
    label: "Tier 1",
    rate: "5%",
    description: "For new members. Higher rate to cover first-time risk.",
    features: ["₱5,000 max bracket", "Strict weekly payments"],
  },
  {
    label: "Tier 2",
    rate: "4.5%",
    description:
      "Has a track record. Can have monthly terms and larger amounts.",
    features: ["Build trust network", "Bi-weekly allowance"],
  },
  {
    label: "Tier 3",
    rate: "4%",
    description: "For consistent payers with growing credit history.",
    features: ["Higher credit limit", "Flexible payment terms"],
  },
  {
    label: "Tier 4",
    rate: "3.5%",
    description: "For well-established members with strong Trust Scores.",
    features: ["Declining balance mode", "Extended term options"],
  },
  {
    label: "Tier 5",
    rate: "3%",
    description:
      "The lowest rate platform-wide. Long-time member, zero defaults.",
    features: ["Premium rates", "₱100k+ credit line limit"],
  },
];

export default async function PricingPage() {
  const tenants = await getActiveTenantsForNav();

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid tenants={tenants} />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* SAAS PRICING SECTION */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              SaaS for Cooperatives
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight italic mb-6 leading-[0.95] text-slate-900">
              Subscribing to <span className="text-emerald-600">Agapay.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Simple and fair pricing to run your cooperative with technology.
              No hidden fees.
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
                  href="/onboarding"
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
                Member Loan Rate Guide
              </h2>
              <p className="text-slate-600 font-medium text-lg max-w-2xl">
                Once you join a cooperative, here is a guide to the typical
                monthly interest rates applied.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
