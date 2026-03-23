"use client";

import { AuthModal } from "@/components/auth/auth-modal";
import {
  Lock,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
  Calculator,
  ArrowRight,
  Menu,
  Star,
  BadgeCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useEffect, useRef, useState } from "react";

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
        .bg-glass {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Persistent Background Video */}
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
        {/* Soft convergence to slate-50 as we scroll down */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-slate-50 z-10" />
      </div>

      <Navbar />

      {/* Main Content Sections */}
      <main className="relative z-20 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full h-[95vh] flex flex-col items-start justify-center px-6 max-w-7xl">
          <div className="max-w-4xl animate-in fade-in slide-in-from-left-12 duration-1000">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50 backdrop-blur-sm">
              <BadgeCheck className="w-4 h-4" /> SEC-REGISTERED · BSP-SUPERVISED
            </span>
            <h1
              className={`text-6xl md:text-9xl font-display font-black tracking-tight italic mb-8 leading-[0.95] transition-colors duration-500 ${isScrolled ? "text-slate-950" : "text-white"}`}
            >
              Iyong yaman,{" "}
              <span className="text-emerald-600 drop-shadow-sm">
                ating Kaban.
              </span>
            </h1>
            <p
              className={`text-xl md:text-2xl font-medium mb-12 leading-relaxed max-w-2xl transition-colors duration-500 ${isScrolled ? "text-slate-700" : "text-white/80"}`}
            >
              Mababang interes na nagsisimula sa 1.5% bawat buwan. Simple,
              mabilis, at mapagkakatiwalaang microfinancing para sa bawat Pinoy
              negosyante.
            </p>
            <div className="flex flex-wrap gap-4">
              <AuthModal />
              <a
                href="#calculator"
                className="px-10 py-2.5 bg-slate-200/80 backdrop-blur-md text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-all flex items-center gap-3 border border-slate-300/30 cursor-pointer"
              >
                <Calculator className="w-5 h-5" /> Loan Calculator
              </a>
            </div>
          </div>
        </section>

        {/* Info Wrapper with solid background */}
        <div className="w-full bg-slate-50 flex flex-col items-center">
          {/* Why Choose Kaban */}
          <section
            id="why-kaban"
            ref={addToRefs}
            className="reveal w-full py-40 px-6 max-w-7xl"
          >
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                Bakit pipiliin ang Kaban?
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg text-balance">
                Walang nakatagong bayarin. Walang sorpresa. Ang iyong pera,
                protektado at transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <TransparentFeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Secure na Digital Receipts"
                description="Bawat transaksyon ay may digital receipt. Hindi na mawawala ang patunay ng iyong mga bayarin."
              />
              <TransparentFeatureCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="1.5%–2.5% Monthly Interest"
                description="1.5% para sa 3-buwan, 2.0% para sa 6-buwan, 2.5% para sa 12-buwan. Transparent ang bawat bracket."
              />
              <TransparentFeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Mentorship at Komunidad"
                description="Hindi lang kami nagpapahiram—may dedicated mentor ka para palaguin ang negosyo. Kasama mo kami sa bawat hakbang."
              />
            </div>
          </section>

          {/* Split Sections */}
          <section
            id="features"
            ref={addToRefs}
            className="reveal w-full py-40 px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
          >
            <div className="order-2 lg:order-1">
              <div className="w-16 h-1.5 bg-emerald-500 mb-10 rounded-full" />
              <h2 className="text-5xl md:text-6xl font-black text-slate-950 mb-8 leading-tight italic tracking-tight">
                Transparent Tracking sa iyong palad
              </h2>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
                Suriin ang iyong balanse at susunod na bayarin anumang oras.
                Gamit ang aming dashboard, kampante ka sa bawat sentimo.
              </p>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-slate-950 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />{" "}
                  Real-time updates sa balanse
                </li>
                <li className="flex items-center gap-4 text-slate-950 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Digital
                  receipts na mabilis makuha
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] bg-slate-200 group aspect-[4/3] border border-white">
                <img
                  src="/images/kaban_growth.png"
                  alt="Tracking"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-emerald-600/5 mix-blend-multiply" />
              </div>
            </div>
          </section>

          <section
            ref={addToRefs}
            className="reveal w-full py-40 px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] bg-slate-200 group aspect-[4/3] border border-white">
              <img
                src="/images/kaban_security.png"
                alt="Flexible"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-slate-900/5 mix-blend-multiply" />
            </div>
            <div>
              <div className="w-16 h-1.5 bg-emerald-500 mb-10 rounded-full" />
              <h2 className="text-5xl md:text-6xl font-black text-slate-950 mb-8 leading-tight italic tracking-tight">
                Flexible na paraan ng pagbabayad
              </h2>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
                Naiintindihan namin ang takbo ng negosyo. Pumili ng payment
                schedule na swak sa iyong budget—daily, weekly, o monthly.
              </p>
              <button className="group flex items-center gap-3 text-emerald-600 font-black text-lg hover:translate-x-2 transition-transform">
                Tingnan ang mga schedule <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </section>

          {/* Inline Loan Calculator */}
          <section
            id="calculator"
            ref={addToRefs}
            className="reveal w-full py-40 px-6 max-w-4xl"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 italic tracking-tight">
                Alamin ang eksaktong babayaran
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
                Walang "starting at" o "as low as." Ito ang totoong numero.
              </p>
            </div>
            <LoanCalculator />
          </section>

          {/* Testimonials Section */}
          <section
            id="testimonials"
            className="w-full py-40 overflow-hidden bg-emerald-950 text-white relative flex flex-col items-center"
          >
            <div className="text-center mb-20 px-6 z-10 relative">
              <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight">
                Mula sa komunidad ng Kaban
              </h2>
              <p className="text-emerald-200/80 max-w-2xl mx-auto font-medium text-lg">
                Huwag lang sa amin manggaling. Pakinggan ang mga kwento ng
                tagumpay mula sa nga negosyanteng katulad mo.
              </p>
            </div>

            {/* Sliding Track */}
            <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max animate-scroll hover:animation-paused">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                  <TestimonialCard key={idx} t={t} />
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Accordion */}

          <section
            id="faqs"
            ref={addToRefs}
            className="reveal w-full py-40 px-6 max-w-4xl"
          >
            <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-20 text-center italic tracking-tight">
              Kadalasan na Itanong (FAQs)
            </h2>
            <div className="space-y-6">
              <AccordionItem
                question="Ano ang Kaban?"
                answer="Ang Kaban ay isang microfinancing digital lending SaaS (software as a service) platform na nagbibigay ng pondo sa mga negosyante na nangangailangan ng kapital para mapalago ang kanilang negosyo. Sa pamamagitan ng Kaban, ang mga negosyante ay maaaring humiram ng pondo at bayaran ito sa pamamagitan ng daily, weekly, o monthly installments.

                Sa kahulugan ng Kaban na “ipon” o “lalagyan ng yaman,” layunin nitong magsilbing ligtas at maaasahang sistema kung saan maaaring pamahalaan ang pondo, pautang, at bayarin ng mga miyembro sa isang organisado at digital na paraan."
              />
              <AccordionItem
                question="Sino ang maaaring gumamit ng Kaban??"
                answer="Kahit sino na kailangan ng sarili nilang Kaban. Mapakooperatiba, microfinance institution, lending business, o mga negosyanteng nangangailangan ng pondo o kapital, ang Kaban ay para sa inyo."
              />
              <AccordionItem
                question="Paano ang application process?"
                answer="Mabilis at digital ang lahat. I-click lamang ang 'Gumawa ng Kaban', punan ang impormasyon ng iyong negosyo, at susuriin namin ito sa loob ng 24 oras."
              />
              <AccordionItem
                question="Ano ang mga requirements?"
                answer="Kailangan lamang ng valid business permit, government ID, at patunay na ang negosyo ay tumatakbo na ng hindi bababa sa anim na buwan."
              />
              <AccordionItem
                question="May hidden fees ba?"
                answer="Wala. Naniniwala kami sa katapatan. Makikita mo ang lahat ng charges at interes bago mo pirmahan ang agreement."
              />
              <AccordionItem
                question="Ganoong kaligtas ba ang Kaban?"
                answer="Ligtas talaga ang Kaban sa paggamit nito ng secure na database, user authentication, at role-based access control (RBAC) upang matiyak na protektado ang datos ng bawat user at organisasyon."
              />
              <AccordionItem
                question="May mobile access ba ang Kaban?"
                answer="Oo. May mobile application ang Kaban kung saan maaaring tingnan ang loan balance, subaybayan ang hulog at makakita ng transaction history habang nasa biyahe."
              />
              <AccordionItem
                question="Maaari bang gamitin ang Kaban sa maraming branch?"
                answer="Oo. Sinusuportahan ng Kaban ang multiple branches kung saan bawat branch ay may sariling miyembro at records at ang head office ay may access sa consolidated reports."
              />
              <AccordionItem
                question="Ano ang pinagkaiba ng Kaban sa tradisyonal na lending system?"
                answer="Sa halip na manual na proseso (papel, ledger, at mano-manong computation), ang Kaban ay: Digital, Automated, Mas mabilis at mas accurate.
                Ang iyong yaman, ating Kaban talaga."
              />
            </div>
          </section>

          {/* Final CTA */}
          <section
            ref={addToRefs}
            id="calculator"
            className="reveal w-full py-40 px-6 max-w-5xl"
          >
            <div className="relative w-full bg-emerald-600 rounded-[4rem] p-16 md:p-32 text-center text-white overflow-hidden group shadow-2xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-5xl md:text-8xl font-black italic mb-10 leading-none tracking-tight">
                  Simulan na ang pag-asenso
                </h2>
                <p className="text-xl md:text-2xl font-medium text-emerald-50 mb-16 max-w-2xl opacity-90 leading-relaxed text-balance">
                  Sumama sa libu-libong negosyante na pinili ang Kaban bilang
                  katuwang sa paglago.
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  <AuthModal />
                  <button className="px-12 py-5 bg-transparent border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white hover:text-emerald-700 transition-all text-lg shadow-xl shadow-black/5">
                    Makipag-ugnayan sa Amin
                  </button>
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
        <p className="mt-8 text-slate-500 leading-relaxed font-medium text-xl max-w-3xl">
          {answer}
        </p>
      </details>
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Jose Pelaquez",
    role: "Sari-sari Store Owner",
    photo: "/images/testimonial_1.png",
    content:
      "Umuutang ako dati sa 5-6 na 20% interest. Sa Kaban, 1.5% lang bawat buwan at may digital receipt pa. Hindi na ako pinagtatakpan ng collector.",
  },
  {
    name: "Juanito Reyes",
    role: "Tricycle Driver",
    photo: "/images/testimonial_2.png",
    content:
      "Napaayos ko agad ang motor ko. Nag-apply ako sa app, 18 oras lang may pondo na. Daily installment na ₱85 lang.",
  },
  {
    name: "Eliza Sanchez",
    role: "Essential Oils Advocate",
    photo: "/images/testimonial_3.png",
    content:
      "Pumili ako ng daily payment kasi dun lumalakas ang kita ko sa essential oil business ko. ₱150 lang araw-araw, tapos na sa 3 buwan. Walang surpresa.",
  },
  {
    name: "Cassandra Martinez",
    role: "Floral Designer",
    photo: "/images/testimonial_4.png",
    content:
      "Napalaki ko ang negosyo ko gamit ang pondo. Nakikita ko lahat ng bayarin ko sa dashboard. First time na ganun ka-transparent.",
  },
  {
    name: "Nestor Dizon",
    role: "Online Seller",
    photo: "/images/testimonial_5.png",
    content:
      "Sobrang daling gamitin ng platform. Bago pa mag-due date, may reminder na agad. At naka-download ko lahat ng receipts ko.",
  },
];

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div className="w-[420px] md:w-[520px] flex-shrink-0 rounded-[1.5rem] bg-emerald-900/50 border border-emerald-800/50 mx-4 flex overflow-hidden">
      {/* Photo side */}
      <div className="w-[140px] md:w-[180px] flex-shrink-0 relative">
        <img
          src={t.photo}
          alt={t.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-900/30" />
      </div>
      {/* Content side */}
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

function LoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(3);

  // Tiered rates: 1.5% for 1-3mo, 2.0% for 4-6mo, 2.5% for 7-12mo
  const rate = term <= 3 ? 0.015 : term <= 6 ? 0.02 : 0.025;
  const rateLabel = term <= 3 ? "1.5%" : term <= 6 ? "2.0%" : "2.5%";
  const totalInterest = amount * rate * term;
  const totalPayable = amount + totalInterest;
  const monthlyPayment = totalPayable / term;

  return (
    <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-200/60 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Halaga ng Loan
            </label>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-3xl font-black text-slate-900 block mt-2">
              ₱{amount.toLocaleString()}
            </span>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Bilang ng Buwan
            </label>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-3xl font-black text-slate-900 block mt-2">
              {term} buwan
            </span>
          </div>
          {/* Rate tier indicator */}
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full border ${term <= 3 ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-slate-50 text-slate-400 border-slate-200"}`}
            >
              1–3 mo: 1.5%
            </span>
            <span
              className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full border ${term > 3 && term <= 6 ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-slate-50 text-slate-400 border-slate-200"}`}
            >
              4–6 mo: 2.0%
            </span>
            <span
              className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full border ${term > 6 ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-slate-50 text-slate-400 border-slate-200"}`}
            >
              7–12 mo: 2.5%
            </span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col justify-center gap-6 border border-slate-100">
          <div>
            <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
              Buwanang Bayarin
            </span>
            <p className="text-4xl font-black text-emerald-600">
              ₱
              {monthlyPayment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <hr className="border-slate-200" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">
                Total Interest
              </span>
              <p className="text-lg font-black text-slate-800">
                ₱
                {totalInterest.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">
                Kabuuang Babayaran
              </span>
              <p className="text-lg font-black text-slate-800">
                ₱
                {totalPayable.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Interest rate: {rateLabel}/mo flat for {term}-month term. Walang
            hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}
