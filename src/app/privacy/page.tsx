"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const SECTIONS = [
  {
    title: "1. Anong datos ang kinokolekta",
    body: "Maaaring kolektahin ng Agapay ang pangalan, email, username, branch o tenant association, business profile details, loan application data, repayment references, uploaded documents, at feedback submissions na kailangan para sa prototype flows.",
  },
  {
    title: "2. Paano ginagamit ang datos",
    body: "Ginagamit ang datos para sa account access, verification, branch-level lending operations, reports, feedback handling, at homepage content moderation. Hindi ito para sa unrelated marketing campaigns sa loob ng scope ng prototype na ito.",
  },
  {
    title: "3. Mock money flow at records",
    body: "Sa prototype, hindi direktang pinoproseso ng Agapay ang totoong pera. Ang nire-record nito ay approvals, release method, repayment submissions, at verification history para sa malinaw na operational audit trail.",
  },
  {
    title: "4. Access control at visibility",
    body: "May role-based access ang platform para sa `superadmin`, `admin`, `lender`, at `member`. Nilalayon ng system na limitahan ang reports at records batay sa tamang role at tenant scope.",
  },
  {
    title: "5. Feedback at support submissions",
    body: "Kapag nagsumite ka ng feedback sa public pages o sa app, maaaring mai-store ito sa feedback inbox at maipadala rin bilang notification email sa support mailbox para sa review at follow-up.",
  },
  {
    title: "6. Contact para sa privacy concerns",
    body: "Para sa tanong tungkol sa privacy, account handling, o support requests, maaari kang makipag-ugnayan sa agapay.saas@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />
      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-black italic mb-6 text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-3xl">
            Ang page na ito ay naglalarawan kung paano ginagamit ang datos sa
            Agapay school-project prototype. Layunin nitong maging malinaw,
            simple, at relevant sa aktwal na flows ng app ngayon.
          </p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div
                key={section.title}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8"
              >
                <h2 className="text-2xl font-black italic text-slate-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-slate-600 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
