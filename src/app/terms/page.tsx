"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const TERMS = [
  {
    title: "1. Nature ng serbisyo",
    body: "Ang Agapay ay isang school-project prototype para sa cooperative microfinance operations. Hindi ito dapat ituring bilang fully deployed banking, e-wallet, o regulated payment-transmission platform sa kasalukuyang anyo nito.",
  },
  {
    title: "2. Account responsibility",
    body: "Responsibilidad ng user ang tamang paggamit ng username, password, at 2FA setup. Ang maling paggamit ng account o pagbabahagi ng credentials ay maaaring magdulot ng account risk at operational confusion.",
  },
  {
    title: "3. Loan at repayment information",
    body: "Ang loan approvals, mock releases, at repayment submissions na nakikita sa prototype ay bahagi ng record-keeping at workflow simulation. Ang aktwal na branch policy at human review pa rin ang basehan ng final operational decisions.",
  },
  {
    title: "4. Feedback at content moderation",
    body: "Ang mga feedback, testimonial leads, at homepage content proposals ay maaaring suriin ng admins at superadmin bago ma-publish o ma-markahang resolved. Hindi lahat ng ipinasa ay awtomatikong mapapakita sa public pages.",
  },
  {
    title: "5. Availability at changes",
    body: "Dahil prototype ang system, maaaring may changes sa interface, calculations, flows, at content habang ina-improve ang project. Maaari ring alisin o baguhin ang ilang features bilang bahagi ng refinement.",
  },
  {
    title: "6. Contact",
    body: "Para sa concerns, clarification, cancellation requests, o support questions, gamitin ang contact page o mag-email sa agapay.saas@gmail.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />
      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-black italic mb-6 text-slate-900">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-3xl">
            Ang mga tuntuning ito ay para sa kasalukuyang Agapay prototype at
            dapat basahin kasabay ng platform purpose, privacy notes, at
            feedback flows na nasa public pages.
          </p>

          <div className="space-y-8">
            {TERMS.map((term) => (
              <div
                key={term.title}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8"
              >
                <h2 className="text-2xl font-black italic text-slate-900 mb-4">
                  {term.title}
                </h2>
                <p className="text-slate-600 leading-relaxed">{term.body}</p>
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
