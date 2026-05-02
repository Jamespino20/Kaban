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
    title: "Human-centered lending flow",
    body: "It's not just about approval and collection. Agapay values clarity, mentoring, and genuine support for members as their businesses grow.",
  },
  {
    icon: <Users className="w-8 h-8 text-emerald-600" />,
    title: "Community accountability",
    body: "The platform is built around Guarantors, Trust Scores, and branch-guided processes so every loan and repayment has a layer of social accountability.",
  },
  {
    icon: <Shield className="w-8 h-8 text-emerald-600" />,
    title: "Clearer operations",
    body: "Digital records, Statements of Account, repayment verification, and feedback tracking help staff and members stay clear on account status at all times.",
  },
];

const TIMELINE = [
  {
    title: "Rooted in a real problem",
    body: "Agapay was built as a school project addressing a common pain point for micro-entrepreneurs: lack of clear records, difficulty following up, and confusing coordination between branches and borrowers.",
  },
  {
    title: "Not a wallet app, but a cooperative platform",
    body: "Agapay is not a direct payment rail in this prototype. Instead, it is the source of truth for approvals, mock disbursements, repayments, reports, and guided member support.",
  },
  {
    title: "Filipino-first experience",
    body: "The content and interface aim to be accessible to local users: clear technical terms and flows designed for branch-based lending and small-business cash cycles.",
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
              About Agapay
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Agapay&apos;s mission is{" "}
              <span className="text-emerald-600">more than capital.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-10 leading-relaxed max-w-3xl">
              Agapay is a Filipino-first cooperative microfinance SaaS built for
              clearer branch operations, a more explainable loan flow, and
              better-supported member growth.
            </p>
            <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-3xl">
              As a school-project prototype, it focuses on proper records,
              guided approvals, mock money flow, feedback handling, and
              community-based lending features like{" "}
              <strong className="text-slate-900">Guarantors</strong>,{" "}
              <strong className="text-slate-900">Trust Score</strong>, and{" "}
              <strong className="text-slate-900">Mentorship</strong>.
            </p>
          </div>
        </section>

        <section className="w-full py-24 px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="rounded-[3rem] bg-white border border-slate-200 p-10 md:p-14 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <BookOpenText className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-black italic text-slate-900">
                Why it was built
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
              What the prototype delivers
            </h2>
            <div className="space-y-5 text-emerald-50/90 leading-relaxed">
              <p>
                Clear status for application, approval, release, and repayment.
              </p>
              <p>
                Role-based views for `superadmin`, `admin`, `lender`, and
                `member`.
              </p>
              <p>
                Feedback and content workflows to keep the homepage and support
                experience relevant.
              </p>
              <p>
                A more grounded cooperative product story that doesn&apos;t rely
                solely on generic wallet behavior.
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
