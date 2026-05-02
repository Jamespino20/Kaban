"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const TERMS = [
  {
    title: "1. Nature of the Service",
    body: "Agapay is a school-project prototype for cooperative microfinance operations. It should not be treated as a fully deployed banking, e-wallet, or regulated payment-transmission platform in its current form.",
  },
  {
    title: "2. Account Responsibility",
    body: "Users are responsible for proper use of their username, password, and 2FA setup. Misuse of an account or sharing credentials may result in account risk and operational confusion.",
  },
  {
    title: "3. Loan and Repayment Information",
    body: "Loan approvals, mock releases, and repayment submissions visible in the prototype are part of record-keeping and workflow simulation. Actual branch policy and human review remain the basis for final operational decisions.",
  },
  {
    title: "4. Feedback and Content Moderation",
    body: "Feedback submissions, testimonial leads, and homepage content proposals may be reviewed by admins and the superadmin before being published or marked as resolved. Not all submissions will automatically appear on public pages.",
  },
  {
    title: "5. Availability and Changes",
    body: "Because this is a prototype, there may be changes to the interface, calculations, flows, and content as the project improves. Some features may also be removed or modified as part of ongoing refinement.",
  },
  {
    title: "6. Contact",
    body: "For concerns, clarification, cancellation requests, or support questions, use the contact page or email agapay.saas@gmail.com.",
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
            These terms apply to the current Agapay prototype and should be read
            alongside the platform purpose, privacy notes, and feedback flows
            described on the public pages.
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
