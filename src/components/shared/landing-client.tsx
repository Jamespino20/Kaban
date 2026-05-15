"use client";

import Link from "next/link";

import { PublicTenantSelector } from "@/components/layout/public-tenant-selector";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  TenantNetworkMap,
  Tenant,
} from "@/components/shared/tenant-network-map";
import {
  ArrowRight,
  BadgeCheck,
  Building,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Gem,
  HandCoins,
  HandHelping,
  LineChart,
  MapPin,
  Shield,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FEATURE_CARDS = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Digital Receipts and clear transaction records",
    description:
      "Every repayment, release, and verification has a clear history. You don't have to rely on screenshots or hearsay.",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Trust Score with full transparency",
    description:
      "Member evaluation is dynamic. Repayment behavior, community standing, and lending readiness are visible in a clear, explainable way.",
  },
  {
    icon: <HandHelping className="w-8 h-8" />,
    title: "Guarantors, Mentorship, and community support",
    description:
      "This is not just a wallet app. It's cooperative lending with Guarantors, Mentorship, and more human guidance as your business grows.",
  },
];

const SPLIT_SECTIONS = [
  {
    title: "Transparent Tracking at your fingertips",
    body: "With Agapay, your balance, due dates, repayment history, and verification status are visible in one clear Dashboard. This is not a static app that leaves you hunting for details.",
    bullets: [
      "Real-time status of application, release, and repayment",
      "Statement of Account and digital receipts you can always refer back to",
    ],
    image: "/images/agapay_growth.png",
    imageAlt: "Agapay member dashboard",
    reverse: false,
  },
  {
    title: "Better suited for cooperative lending than generic wallet apps",
    body: "Other apps like GCash is great for payments and transfers, but it was not built for Guarantor-backed lending, Trust Scores, and Mentorship workflows. Agapay is for financial relationships, not just a transaction feed.",
    bullets: [
      "Mock money flow that can be verified by tenant staff",
      "Clearer support for tenant release and repayment tracking",
    ],
    image: "/images/agapay_security.png",
    imageAlt: "Agapay cooperative operations",
    reverse: true,
  },
];

const FALLBACK_FAQS = [
  {
    question: "What is Agapay?",
    answer:
      "Agapay is a platform system offering microfinancing cooperative services that helps tenants, lenders, and members manage applications, releases, repayments, Trust Scores, and reports in a digital, transparent system.",
  },
  {
    question: "How is it different from apps like GCash?",
    answer:
      "Agapay is not a wallet app. Its focus is cooperative lending: with Guarantors, Trust Scores, Mentorship, a tenant approval flow, and clearer operational records for staff and members.",
  },
  {
    question: "How does a member receive funds in this prototype?",
    answer:
      "In this school-project prototype, actual fund release happens in real life via cash release, GCash transfer, bank transfer, or field collection. Agapay records, verifies, and generates digital records and receipts.",
  },
  {
    question: "How does a member make repayments?",
    answer:
      "A member can submit a repayment through a tenant cashier, GCash transfer, bank transfer, or field collection. The admin then verifies the submission before it enters the system as a verified repayment.",
  },
  {
    question: "Are there hidden fees?",
    answer:
      "There shouldn't be. In the demo calculator and in the application flow, the principal, interest, processing fee, and total payable are all displayed so the cost of credit is always clear.",
  },
  {
    question: "Why are Guarantors and Trust Scores important?",
    answer:
      "This is where Agapay's community model shines. Guarantors and Trust Scores promote more responsible lending, clearer accountability, and better-supported member growth.",
  },
];

const FALLBACK_TESTIMONIALS = [
  {
    name: "Jose Pelaquez",
    role: "Sari-sari Store Owner",
    photo: "/images/testimonial_1.png",
    content:
      "Before, my only options were 5-6 lenders or fast but confusing apps. With Agapay, my repayment schedule is clear, I have a digital receipt, and the tenant explains everything before I commit.",
  },
  {
    name: "Juanito Reyes",
    role: "Tricycle Driver",
    photo: "/images/testimonial_2.png",
    content:
      "I feel more comfortable here because it's not just about the transaction. There are Guarantors, a Trust Score, and real people I can talk to when I need help.",
  },
  {
    name: "Eliza Sanchez",
    role: "Online Seller",
    photo: "/images/testimonial_3.png",
    content:
      "The repayment flow is great because I can record my GCash transfer and have it verified by the tenant. I'm never confused about whether it went through or not.",
  },
  {
    name: "Cassandra Martinez",
    role: "Floral Designer",
    photo: "/images/testimonial_4.png",
    content:
      "The computation is clear and it doesn't feel like a static dashboard. You can tell it was built for cooperative lending, not just a generic fintech template.",
  },
  {
    name: "Nestor Dizon",
    role: "Marketplace Reseller",
    photo: "/images/testimonial_5.png",
    content:
      "In real business, cash flow is everything. I love that I can see what's due, the remaining balance, and what to do next — all in one place.",
  },
];

const LOAN_OFFERS = [
  {
    id: "starter",
    name: "Sari-Sari Starter",
    description:
      "For restocking, small inventory build-up, and first-time store expansion.",
    minAmount: 5000,
    maxAmount: 20000,
    maxTerm: 3,
    usualRatePercent: 5,
    badge: "Starter",
  },
  {
    id: "growth",
    name: "Negosyo Growth",
    description:
      "For more established businesses like online selling, food operations, and more.",
    minAmount: 10000,
    maxAmount: 50000,
    maxTerm: 6,
    usualRatePercent: 4.5,
    badge: "Growth",
  },
  {
    id: "community",
    name: "Paluwagan Plus",
    description:
      "For community-backed groups with Guarantors and closer support from tenant staff.",
    minAmount: 3000,
    maxAmount: 15000,
    maxTerm: 6,
    usualRatePercent: 4,
    badge: "Community",
  },
  {
    id: "agri",
    name: "Agri-Agapay",
    description:
      "For larger capital needs such as farm inputs, equipment support, or tenant-managed livelihood expansion.",
    minAmount: 15000,
    maxAmount: 100000,
    maxTerm: 12,
    usualRatePercent: 3.5,
    badge: "Extended",
  },
];

type PaymentCadence = "biweekly" | "weekly" | "monthly";
const INTEREST_RATE_OPTIONS = [3, 3.5, 4, 4.5, 5];

export function LandingClient({ tenants }: { tenants: Tenant[] }) {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.15 },
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        // Fetch approved testimonials from server action
        const testRes = await fetch("/api/testimonials", {
          cache: "no-store",
        });
        if (testRes.ok) {
          const testData = await testRes.json();
          if (
            !cancelled &&
            Array.isArray(testData.testimonials) &&
            testData.testimonials.length > 0
          ) {
            setTestimonials(
              testData.testimonials.map(
                (
                  testimonial: {
                    name: string;
                    role_label: string;
                    photo_url?: string;
                    content: string;
                    tenant?: { name: string; slug: string } | null;
                  },
                  index: number,
                ) => ({
                  name: testimonial.name,
                  role: testimonial.role_label,
                  photo:
                    testimonial.photo_url ||
                    (testimonial.tenant
                      ? `/images/tenant-${testimonial.tenant.slug}.png`
                      : FALLBACK_TESTIMONIALS[
                          index % FALLBACK_TESTIMONIALS.length
                        ].photo),
                  content: testimonial.content,
                }),
              ),
            );
          }
        }

        // Also try fetching FAQs from the existing endpoint
        const response = await fetch("/api/site-content", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (cancelled) return;

        if (Array.isArray(payload.faqs) && payload.faqs.length > 0) {
          setFaqs(
            payload.faqs.map((faq: { question: string; answer: string }) => ({
              question: faq.question,
              answer: faq.answer,
            })),
          );
        }
      } catch {}
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-520px * 5 - 2rem * 5));
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>

      <div className="fixed inset-0 z-0 bg-slate-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-100"
        >
          <source src="/videos/hero_section.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-slate-50 z-10" />
      </div>

      <Navbar tenants={tenants} />

      <main className="relative z-20 w-full flex flex-col items-center">
        <section className="relative w-full h-[95vh] flex flex-col items-start justify-center px-6 max-w-7xl">
          <div className="max-w-5xl animate-in fade-in slide-in-from-left-12 duration-1000">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50 backdrop-blur-sm">
              <BadgeCheck className="w-4 h-4" />
              SEC-REGISTERED • BSP-SUPERVISED
            </span>
            <h1
              className={`text-6xl md:text-8xl font-display font-black tracking-tight italic mb-8 leading-[0.95] transition-colors duration-500 ${isScrolled ? "text-slate-950" : "text-white"}`}
            >
              Iyong Agapay,
              <span className="block text-emerald-600 drop-shadow-sm">
                Ating Tagumpay
              </span>
            </h1>
            <p
              className={`text-xl md:text-2xl font-medium mb-12 leading-relaxed max-w-3xl transition-colors duration-500 ${isScrolled ? "text-slate-700" : "text-white/85"}`}
            >
              A Filipino-first lending platform with <strong>Guarantors</strong>
              ,<strong> Trust Score</strong>, <strong>Mentorship</strong>, and
              clearer records for members, admins, and cooperative tenants.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/onboarding"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-between gap-3 text-lg"
              >
                Apply for Agapay
              </Link>
              <a
                href="#calculator"
                className="px-10 py-3 bg-slate-200/85 backdrop-blur-md text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-all flex items-center gap-3 border border-slate-300/30 cursor-pointer"
              >
                <Calculator className="w-5 h-5" />
                Loan Calculator
              </a>
            </div>
          </div>
        </section>

        <div className="w-full bg-slate-50 flex flex-col items-center">
          <section
            id="why-agapay"
            ref={addToRefs}
            className="reveal w-full py-36 px-6 max-w-7xl"
          >
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                Why is Agapay better for cooperative lending?
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg text-balance">
                Agapay is built for tenant operations, Trust Scores,
                Guarantor-backed loans, and more human lending support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {FEATURE_CARDS.map((card) => (
                <TransparentFeatureCard
                  key={card.title}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
          </section>

          <section
            id="features"
            ref={addToRefs}
            className="reveal w-full py-36 px-6 max-w-7xl space-y-28"
          >
            {SPLIT_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
              >
                <div className={section.reverse ? "lg:order-2" : ""}>
                  <div className="w-16 h-1.5 bg-emerald-500 mb-10 rounded-full" />
                  <h2 className="text-5xl md:text-6xl font-black text-slate-950 mb-8 leading-tight italic tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
                    {section.body}
                  </p>
                  <ul className="space-y-6">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-4 text-slate-950 font-bold text-lg"
                      >
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={section.reverse ? "lg:order-1" : ""}>
                  <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] bg-slate-200 group aspect-[4/3] border border-white">
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-emerald-600/5 mix-blend-multiply" />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section
            id="calculator"
            ref={addToRefs}
            className="reveal w-full py-36 px-6 max-w-7xl"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                The Real Agapay Loan Calculator
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                Select a Loan Product, amount, term, and payment cadence.
                We&apos;ll show you an estimated repayment using the same
                transparent logic used in the prototype flow.
              </p>
              <p className="text-slate-400 text-sm mt-2 italic">
                * This is an example set of business operation. Actual terms may
                depend on the specific cooperative policies.
              </p>
            </div>
            <HomeLoanCalculator />
          </section>

          <section
            id="network"
            ref={addToRefs}
            className="reveal w-full py-36 px-6 max-w-7xl"
          >
            <div className="text-center mb-16 px-6">
              <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
                <MapPin className="w-4 h-4" />
                Agapay Tenant Network
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                Live Tenant Map
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                From Metro Manila to Davao, we are here to support. Each tenant
                is independent but united in Agapay&apos;s mission.
              </p>
            </div>
            <TenantNetworkMap tenants={tenants} />
          </section>

          <section className="w-full py-36 px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
                <Building className="w-4 h-4" />
                For Cooperatives
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                Simple SaaS Pricing
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                No hidden fees. Choose a subscription plan that fits the size of
                your operation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {[
                {
                  name: "Agapay Core",
                  price: "₱3,500",
                  period: "/3 months",
                  limit: "Up to 500 members",
                  features: [
                    "Basic Dashboard",
                    "Standard Policy Access",
                    "Audit Logs",
                    "Email Support",
                  ],
                },
                {
                  name: "Agapay Pro",
                  price: "₱6,500",
                  period: "/6 months",
                  limit: "Up to 2,500 members",
                  highlight: true,
                  features: [
                    "Custom Branding",
                    "Chat Support",
                    "Mentorship Tools",
                    "Priority Support",
                  ],
                },
                {
                  name: "Agapay Enterprise",
                  price: "₱12,000",
                  period: "/12 months",
                  limit: "Unlimited members",
                  features: [
                    "Analytics Module",
                    "Advanced Reporting",
                    "Full Configuration",
                    "Priority SLA",
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 rounded-[2rem] border text-center transition-all ${plan.highlight ? "bg-slate-900 border-slate-800 text-white shadow-xl scale-105" : "bg-white border-slate-200 shadow-sm"}`}
                >
                  <h3 className="text-xl font-black italic mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-black mb-1">{plan.price}</div>
                  <p
                    className={`text-xs font-medium mb-6 ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {plan.period}
                  </p>
                  <p
                    className={`font-medium mb-4 ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {plan.limit}
                  </p>
                  <ul
                    className={`text-left text-sm space-y-2 mb-8 ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="text-emerald-500">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View full Pricing Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          <section
            id="testimonials"
            className="w-full py-36 overflow-hidden bg-emerald-950 text-white relative flex flex-col items-center"
          >
            <div className="text-center mb-20 px-6 z-10 relative">
              <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight">
                From the Agapay community
              </h2>
              <p className="text-emerald-200/80 max-w-2xl mx-auto font-medium text-lg">
                Hear from entrepreneurs who prefer a clear, guided, and
                community-aware lending experience.
              </p>
            </div>

            <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max animate-scroll hover:animation-paused">
                {[...testimonials, ...testimonials].map((testimonial, idx) => (
                  <TestimonialCard
                    key={`${testimonial.name}-${idx}`}
                    t={testimonial}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            id="faqs"
            ref={addToRefs}
            className="reveal w-full py-36 px-6 max-w-4xl"
          >
            <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-20 text-center italic tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </section>

          <section
            ref={addToRefs}
            id="cta"
            className="reveal w-full py-36 px-6 max-w-5xl"
          >
            <div className="relative w-full bg-emerald-600 rounded-[4rem] p-16 md:p-28 text-center text-white overflow-hidden group shadow-2xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-5xl md:text-7xl font-black italic mb-8 leading-none tracking-tight">
                  Start a clearer lending flow
                </h2>
                <p className="text-xl md:text-2xl font-medium text-emerald-50 mb-14 max-w-3xl opacity-90 leading-relaxed text-balance">
                  For this school-project prototype, the goal is clear: not just
                  fast, but more reliable, more explainable, and more human than
                  a static wallet experience.
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="bg-white hover:bg-emerald-50 text-emerald-700 font-black h-14 px-10 rounded-full shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-between gap-3 text-xl"
                  >
                    Apply for Agapay Now
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </div>
  );
}

function TransparentFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200/60 hover:border-emerald-500/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all duration-700 group flex flex-col items-start text-left">
      <div className="p-5 bg-slate-100/50 rounded-2xl mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700 text-slate-400">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-950 mb-4 italic tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 leading-relaxed font-medium text-lg">
        {description}
      </p>
    </div>
  );
}

function AccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="group border-b border-slate-200/80 last:border-0 overflow-hidden">
      <details className="py-10">
        <summary className="flex justify-between items-center font-bold text-2xl md:text-3xl italic cursor-pointer list-none text-slate-950 hover:text-emerald-700 transition-colors tracking-tight">
          {question}
          <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-open:bg-emerald-50 group-open:border-emerald-200 transition-all">
            <span className="text-emerald-500 font-normal group-open:rotate-180 transition-transform text-lg">
              ↓
            </span>
          </div>
        </summary>
        <p className="mt-8 text-slate-500 leading-relaxed font-medium text-xl max-w-3xl whitespace-pre-line">
          {answer}
        </p>
      </details>
    </div>
  );
}

function TestimonialCard({ t }: { t: (typeof FALLBACK_TESTIMONIALS)[0] }) {
  return (
    <div className="w-[420px] md:w-[520px] flex-shrink-0 rounded-[1.5rem] bg-emerald-900/50 border border-emerald-800/50 mx-4 flex overflow-hidden">
      <div className="w-[140px] md:w-[180px] flex-shrink-0 relative">
        <img
          src={t.photo}
          alt={t.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-900/30" />
      </div>
      <div className="flex flex-col justify-between p-6 flex-1 min-w-0">
        <div>
          <div className="flex text-emerald-400 gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-emerald-50 font-medium text-[15px] leading-relaxed">
            &ldquo;{t.content}&rdquo;
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-emerald-800/40">
          <h4 className="font-black text-white italic text-sm">{t.name}</h4>
          <span className="text-xs text-emerald-400/80">{t.role}</span>
        </div>
      </div>
    </div>
  );
}

function HomeLoanCalculator() {
  const [selectedOfferId, setSelectedOfferId] = useState(LOAN_OFFERS[0].id);
  const [amount, setAmount] = useState(LOAN_OFFERS[0].minAmount);
  const [term, setTerm] = useState(LOAN_OFFERS[0].maxTerm);
  const [cadence, setCadence] = useState<PaymentCadence>("weekly");
  const [selectedRatePercent, setSelectedRatePercent] = useState(
    LOAN_OFFERS[0].usualRatePercent,
  );

  const selectedOffer =
    LOAN_OFFERS.find((offer) => offer.id === selectedOfferId) ?? LOAN_OFFERS[0];

  useEffect(() => {
    setAmount((currentAmount) =>
      Math.min(
        selectedOffer.maxAmount,
        Math.max(selectedOffer.minAmount, currentAmount),
      ),
    );
    setTerm((currentTerm) =>
      Math.min(selectedOffer.maxTerm, Math.max(1, currentTerm)),
    );
    setSelectedRatePercent(selectedOffer.usualRatePercent);
  }, [selectedOffer]);

  const selectedRateDecimal = selectedRatePercent / 100;
  const processingFee = Math.max(50, amount * 0.02);
  const totalInterest = amount * selectedRateDecimal * term;
  const totalPayable = amount + totalInterest + processingFee;
  const paymentCount =
    cadence === "biweekly" ? term * 2 : cadence === "weekly" ? term * 4 : term;
  const cadenceLabel =
    cadence === "biweekly"
      ? "Bi-weekly"
      : cadence === "weekly"
        ? "Weekly"
        : "Monthly";
  const installmentAmount = paymentCount > 0 ? totalPayable / paymentCount : 0;

  return (
    <div className="bg-white p-6 md:p-16 rounded-[3rem] border border-slate-200/60 shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
              Loan Product
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOAN_OFFERS.map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={`rounded-2xl border py-5 px-4 text-left transition-all ${
                    offer.id === selectedOffer.id
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20"
                      : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="mb-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border border-emerald-100">
                    {offer.badge}
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {offer.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-4">
                    {offer.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Loan Amount
            </label>
            <input
              type="range"
              min={selectedOffer.minAmount}
              max={selectedOffer.maxAmount}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>₱{selectedOffer.minAmount.toLocaleString()}</span>
              <span>₱{selectedOffer.maxAmount.toLocaleString()}</span>
            </div>
            <span className="text-3xl md:text-4xl font-black text-slate-900 block mt-2">
              ₱{amount.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Term
            </label>
            <input
              type="range"
              min={1}
              max={selectedOffer.maxTerm}
              step={1}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>1 Month</span>
              <span>{selectedOffer.maxTerm} Months</span>
            </div>
            <span className="text-3xl md:text-4xl font-black text-slate-900 block mt-2">
              {term} {term > 1 ? "Months" : "Month"}
            </span>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Payment Cadence
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {(["weekly", "biweekly", "monthly"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCadence(opt)}
                  className={`rounded-xl md:rounded-2xl border py-2.5 md:py-3 text-center transition-all ${
                    cadence === opt
                      ? "border-emerald-500 bg-emerald-600 shadow-md text-white"
                      : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="text-xs md:text-sm font-black capitalize">
                    {opt === "biweekly" ? "Bi-weekly" : opt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50/50 rounded-[2.5rem] p-6 md:p-10 border border-slate-200/50 flex flex-col justify-center">
          <div className="mb-8 p-6 md:p-8 bg-white rounded-[2rem] border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">
              Estimated {cadenceLabel} Payment
            </p>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className="text-4xl md:text-4xl font-black text-emerald-600 italic">
                ₱
                {installmentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                / {cadenceLabel.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">
                Processing Fee
              </span>
              <span className="text-slate-900 font-mono">
                ₱{processingFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">
                Interest Rate ({selectedRatePercent}%)
              </span>
              <span className="text-slate-900 font-mono text-emerald-600">
                +₱{totalInterest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-6 mt-2 border-t border-slate-200">
              <span className="text-slate-900 font-black italic uppercase tracking-tighter text-sm">
                Total Amount Payable
              </span>
              <span className="text-xl md:text-2xl font-black text-slate-900">
                ₱{totalPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center gap-6 justify-between p-6 md:p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 flex items-center justify-center shadow-lg">
            <LineChart className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
              Trust-Powered Dynamic Rates
            </p>
            <p className="text-base font-bold italic text-emerald-50">
              Interest rates decrease as your Trust Score improves.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          {INTEREST_RATE_OPTIONS.map((rate) => (
            <button
              key={rate}
              onClick={() => setSelectedRatePercent(rate)}
              className={`w-12 h-12 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                selectedRatePercent === rate
                  ? "bg-white border-white text-emerald-950 scale-110 shadow-xl"
                  : "border-emerald-800/50 bg-emerald-900/30 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-900/50"
              }`}
            >
              <span className="text-xs font-black">{rate}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
