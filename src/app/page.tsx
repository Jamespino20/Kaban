"use client";

import { AuthModal } from "@/components/auth/auth-modal";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  CreditCard,
  HandHelping,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FEATURE_CARDS = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Digital Receipts at malinaw na records",
    description:
      "Bawat hulog, release, at verification ay may malinaw na history. Hindi ka aasa sa screenshot lang o sa sabi-sabi.",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Trust Score na may paliwanag",
    description:
      "Hindi static ang pagtingin sa miyembro. Nakikita ang repayment behavior, community standing, at lending readiness sa mas malinaw na paraan.",
  },
  {
    icon: <HandHelping className="w-8 h-8" />,
    title: "Guarantors, Mentorship, at community support",
    description:
      "Hindi lang ito wallet app. Cooperative lending ito na may Guarantors, Mentorship, at mas makataong paggabay habang lumalago ang negosyo.",
  },
];

const SPLIT_SECTIONS = [
  {
    title: "Transparent Tracking sa iyong palad",
    body: "Sa Agapay, kita ang balance, due dates, repayment history, at verification status sa isang malinaw na Dashboard. Hindi ito static na app na bahala ka na sa paghahanap ng detalye.",
    bullets: [
      "Real-time status ng application, release, at repayment",
      "Statement of Account at digital receipts na madaling balikan",
    ],
    image: "/images/agapay_growth.png",
    imageAlt: "Agapay member dashboard",
    reverse: false,
  },
  {
    title: "Mas angkop sa cooperative lending kaysa sa generic wallet apps",
    body: "GCash ay magaling para sa payments at transfers, pero hindi ito ginawa para sa Guarantor-backed lending, Trust Score, at Mentorship workflows. Ang Agapay ay para sa relasyong pinansyal, hindi lang sa transaction feed.",
    bullets: [
      "Mock money flow na puwedeng i-verify ng branch staff",
      "Mas malinaw na support para sa branch release at repayment",
    ],
    image: "/images/agapay_security.png",
    imageAlt: "Agapay cooperative operations",
    reverse: true,
  },
];

const FAQS = [
  {
    question: "Ano ang Agapay?",
    answer:
      "Ang Agapay ay isang cooperative microfinance platform na tumutulong sa branches, lenders, at members na mag-manage ng applications, releases, repayments, Trust Score, at reports sa isang digital at mas malinaw na sistema.",
  },
  {
    question: "Paano ito naiiba sa GCash?",
    answer:
      "Hindi wallet app ang Agapay. Ang focus nito ay cooperative lending: may Guarantors, Trust Score, Mentorship, branch approval flow, at mas malinaw na operational records para sa staff at miyembro.",
  },
  {
    question: "Paano nakukuha ng member ang pera sa prototype na ito?",
    answer:
      "Sa school-project prototype na ito, ang actual fund release ay ginagawa sa tunay na buhay sa pamamagitan ng Cash release, GCash transfer, Bank transfer, o Field collection. Ang Agapay ang nagtatala, nagve-verify, at gumagawa ng digital records at receipts.",
  },
  {
    question: "Paano nagbabayad ang member sa Agapay?",
    answer:
      "Ang member ay puwedeng magsumite ng repayment gamit ang branch cashier, GCash transfer, bank transfer, o field collection. Pagkatapos, ang admin ay magve-verify ng submission bago ito pumasok bilang verified repayment sa system.",
  },
  {
    question: "May hidden fees ba?",
    answer:
      "Wala dapat. Sa demo calculator at sa application flow, ipinapakita ang principal, interest, processing fee, at kabuuang babayaran para malinaw ang cost of credit.",
  },
  {
    question: "Bakit mahalaga ang Guarantors at Trust Score?",
    answer:
      "Dito lumalabas ang community model ng Agapay. Ang Guarantors at Trust Score ay tumutulong sa mas responsableng lending, mas malinaw na accountability, at mas suportadong paglago ng miyembro.",
  },
];

const TESTIMONIALS = [
  {
    name: "Jose Pelaquez",
    role: "Sari-sari Store Owner",
    photo: "/images/testimonial_1.png",
    content:
      "Dati, ang option ko lang ay 5-6 o mabilis pero magulong apps. Sa Agapay, malinaw ang hulog, may digital receipt, at may paliwanag ang branch bago ako mag-commit.",
  },
  {
    name: "Juanito Reyes",
    role: "Tricycle Driver",
    photo: "/images/testimonial_2.png",
    content:
      "Mas kampante ako rito kasi hindi lang transaction ang tinitingnan. May Guarantors, may Trust Score, at may tao talagang pwedeng kausapin kapag kailangan ng tulong.",
  },
  {
    name: "Eliza Sanchez",
    role: "Online Seller",
    photo: "/images/testimonial_3.png",
    content:
      "Maganda ang repayment flow dahil puwede kong i-record ang GCash transfer ko at ma-verify ito ng branch. Hindi ako nalilito kung pumasok na ba o hindi.",
  },
  {
    name: "Cassandra Martinez",
    role: "Floral Designer",
    photo: "/images/testimonial_4.png",
    content:
      "Malinaw ang computation at hindi mukhang static na dashboard lang. Ramdam mong ginawa ito para sa cooperative lending at hindi simpleng generic fintech template.",
  },
  {
    name: "Nestor Dizon",
    role: "Marketplace Reseller",
    photo: "/images/testimonial_5.png",
    content:
      "Sa totoong negosyo, cash flow ang laban. Gusto ko na puwede kong makita ang due, remaining balance, at next action nang hindi naghahanap sa kung saan-saan.",
  },
];

const LOAN_OFFERS = [
  {
    id: "starter",
    name: "Sari-Sari Starter",
    description:
      "Para sa restocking, maliit na inventory build-up, at unang expansion ng tindahan.",
    minAmount: 5000,
    maxAmount: 20000,
    maxTerm: 3,
    monthlyRate: 0.015,
    badge: "Starter",
  },
  {
    id: "growth",
    name: "Negosyo Growth",
    description:
      "Para sa mas regular na negosyo tulad ng online selling, food operations, at service-based microbusiness.",
    minAmount: 10000,
    maxAmount: 50000,
    maxTerm: 6,
    monthlyRate: 0.02,
    badge: "Growth",
  },
  {
    id: "community",
    name: "Paluwagan Plus",
    description:
      "Para sa community-backed groups na may Guarantors at mas malapit na support ng branch staff.",
    minAmount: 3000,
    maxAmount: 15000,
    maxTerm: 6,
    monthlyRate: 0.018,
    badge: "Community",
  },
  {
    id: "agri",
    name: "Agri-Agapay",
    description:
      "Para sa mas malaking puhunan gaya ng farm inputs, equipment support, o branch-managed livelihood expansion.",
    minAmount: 15000,
    maxAmount: 100000,
    maxTerm: 12,
    monthlyRate: 0.025,
    badge: "Extended",
  },
];

type PaymentCadence = "daily" | "weekly" | "monthly";

export default function Home() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

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

      <Navbar />

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
              Filipino-first na lending platform na may{" "}
              <strong>Guarantors</strong>,<strong> Trust Score</strong>,{" "}
              <strong>Mentorship</strong>, at mas malinaw na records para sa mga
              miyembro, admin, at cooperative branches.
            </p>
            <div className="flex flex-wrap gap-4">
              <AuthModal />
              <a
                href="#calculator"
                className="px-10 py-3 bg-slate-200/85 backdrop-blur-md text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-all flex items-center gap-3 border border-slate-300/30 cursor-pointer"
              >
                <Calculator className="w-5 h-5" />
                Subukan ang Loan Calculator
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
                Bakit mas bagay ang Agapay sa cooperative lending?
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg text-balance">
                Ang Agapay ay ginawa para sa branch operations, Trust Score,
                Guarantor-backed loans, at mas makataong lending support.
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
            className="reveal w-full py-36 px-6 max-w-5xl"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                Loan Calculator na mas totoo sa Agapay
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                Piliin ang Loan Product, amount, term, at payment cadence.
                Ipapakita namin ang estimated repayment gamit ang parehong
                transparent logic na ginagamit sa prototype flow.
              </p>
            </div>
            <HomeLoanCalculator />
          </section>

          <section
            id="testimonials"
            className="w-full py-36 overflow-hidden bg-emerald-950 text-white relative flex flex-col items-center"
          >
            <div className="text-center mb-20 px-6 z-10 relative">
              <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight">
                Mula sa komunidad ng Agapay
              </h2>
              <p className="text-emerald-200/80 max-w-2xl mx-auto font-medium text-lg">
                Pakinggan ang mga kuwento ng mga negosyanteng mas gusto ang
                malinaw, guided, at community-aware na lending experience.
              </p>
            </div>

            <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max animate-scroll hover:animation-paused">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, idx) => (
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
              Mga madalas itanong
            </h2>
            <div className="space-y-6">
              {FAQS.map((faq) => (
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
                  Simulan ang mas malinaw na lending flow
                </h2>
                <p className="text-xl md:text-2xl font-medium text-emerald-50 mb-14 max-w-3xl opacity-90 leading-relaxed text-balance">
                  Para sa school-project prototype na ito, malinaw ang layunin:
                  hindi lang mabilis, kundi mas maaasahan, mas explainable, at
                  mas makatao kaysa sa static na wallet experience.
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  <AuthModal />
                  <a
                    href="/contact"
                    className="px-12 py-5 bg-transparent border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white hover:text-emerald-700 transition-all text-lg shadow-xl shadow-black/5"
                  >
                    Makipag-ugnayan sa Amin
                  </a>
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

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
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
  }, [selectedOffer]);

  const processingFee = Math.max(50, amount * 0.015);
  const totalInterest = amount * selectedOffer.monthlyRate * term;
  const totalPayable = amount + totalInterest + processingFee;
  const paymentCount =
    cadence === "daily" ? term * 26 : cadence === "weekly" ? term * 4 : term;
  const cadenceLabel =
    cadence === "daily"
      ? "kada araw ng negosyo"
      : cadence === "weekly"
        ? "kada linggo"
        : "kada buwan";
  const installmentAmount = paymentCount > 0 ? totalPayable / paymentCount : 0;

  return (
    <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-200/60 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
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
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    offer.id === selectedOffer.id
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="mb-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    {offer.badge}
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {offer.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {offer.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Halaga ng Loan
            </label>
            <input
              type="range"
              min={selectedOffer.minAmount}
              max={selectedOffer.maxAmount}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>₱{selectedOffer.minAmount.toLocaleString()}</span>
              <span>₱{selectedOffer.maxAmount.toLocaleString()}</span>
            </div>
            <span className="text-3xl font-black text-slate-900 block mt-2">
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
              className="w-full accent-emerald-600"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>1 buwan</span>
              <span>{selectedOffer.maxTerm} buwan</span>
            </div>
            <span className="text-3xl font-black text-slate-900 block mt-2">
              {term} buwan
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
              Payment cadence
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["daily", "weekly", "monthly"] as PaymentCadence[]).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCadence(option)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                      cadence === option
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-emerald-200"
                    }`}
                  >
                    {option === "daily"
                      ? "Daily"
                      : option === "weekly"
                        ? "Weekly"
                        : "Monthly"}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col justify-center gap-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
              Estimated installment
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              {selectedOffer.badge}
            </span>
          </div>

          <div>
            <p className="text-4xl font-black text-emerald-600">
              ₱
              {installmentAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {paymentCount} payments • {cadenceLabel}
            </p>
          </div>

          <hr className="border-slate-200" />

          <div className="grid grid-cols-2 gap-4">
            <CalculatorMetric label="Principal" value={amount} />
            <CalculatorMetric
              label={`Interest (${(selectedOffer.monthlyRate * 100).toFixed(1)}% / month)`}
              value={totalInterest}
            />
            <CalculatorMetric label="Processing Fee" value={processingFee} />
            <CalculatorMetric
              label="Kabuuang babayaran"
              value={totalPayable}
              emphasize
            />
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 space-y-3">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">Mock money flow:</strong> sa
                prototype, ang release at repayment ay puwedeng gawin sa branch
                cashier, GCash transfer, bank transfer, o field collection. Ang
                Agapay ang nagtatala at nagve-verify ng records.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm text-slate-600">
                Para sa ilang Loan Product, mahalaga ang{" "}
                <strong className="text-slate-900">Guarantors</strong>, malinaw
                na branch review, at mas suportadong{" "}
                <strong className="text-slate-900">Mentorship</strong>.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            Demo estimate ito para sa homepage. Ang actual approval, fees, at
            cadence ay maaaring magbago depende sa branch policy, Trust Score,
            at admin review.
          </p>
        </div>
      </div>
    </div>
  );
}

function CalculatorMetric({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div>
      <span className="text-xs text-slate-400 font-bold uppercase">
        {label}
      </span>
      <p
        className={`text-lg font-black ${emphasize ? "text-emerald-700" : "text-slate-800"}`}
      >
        ₱
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}
