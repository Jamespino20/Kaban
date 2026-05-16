import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getActiveTenantsForNav } from "@/actions/tenant-management";
import { getAvailablePlans } from "@/actions/subscription-actions";

export const dynamic = "force-dynamic";
import { BadgeCheck, CheckCircle2, Building, Zap, Shield } from "lucide-react";
import Link from "next/link";

const PLAN_ICON_MAP: Record<string, { icon: any; highlight: boolean }> = {
  "Agapay Core": { icon: Building, highlight: false },
  "Agapay Pro": { icon: Zap, highlight: true },
  "Agapay Enterprise": { icon: Shield, highlight: false },
};

const PLAN_CTA_MAP: Record<string, string> = {
  "Agapay Core": "Start with Core",
  "Agapay Pro": "Upgrade to Pro",
  "Agapay Enterprise": "Get Started",
};

function getPlanInterval(plan: any, tierName: string): string {
  if (tierName === "Agapay Core") return "3 months";
  if (tierName === "Agapay Pro") return "6 months";
  return "12 months";
}


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

function getPlanPrice(plan: any, tierName: string): number {
  if (tierName === "Agapay Core") return Number(plan.price_quarterly || 0);
  if (tierName === "Agapay Pro") return Number(plan.price_semi_annually || 0);
  return Number(plan.price_annually || 0);
}

function getMemberLimit(plan: any): string {
  return plan.max_members >= 1000000
    ? "Unlimited members"
    : `Up to ${plan.max_members.toLocaleString()} members`;
}

import { PricingCards } from "./pricing-cards";

export default async function PricingPage() {
  const tenants = await getActiveTenantsForNav();
  const plansResult = await getAvailablePlans();
  const plans = plansResult.success ? plansResult.plans : [];

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid tenants={tenants} />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* SAAS PRICING SECTION */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <PricingCards plans={plans} />
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
