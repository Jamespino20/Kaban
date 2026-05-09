import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getActiveTenantsForNav } from "@/actions/tenant-management";

const SECTIONS = [
  {
    title: "1. What data is collected",
    body: "Agapay may collect your name, email, username, tenant or tenant association, business profile details, loan application data, repayment references, uploaded documents, and feedback submissions required for prototype flows.",
  },
  {
    title: "2. How data is used",
    body: "Data is used for account access, verification, tenant-level lending operations, reports, feedback handling, and homepage content moderation. It is not used for unrelated marketing campaigns within the scope of this prototype.",
  },
  {
    title: "3. Mock money flow and records",
    body: "In this prototype, Agapay does not directly process real money. It records approvals, release methods, repayment submissions, and verification history to provide a clear operational audit trail.",
  },
  {
    title: "4. Access control and visibility",
    body: "The platform has role-based access for `superadmin`, `admin`, `lender`, and `member`. The system aims to limit reports and records to the appropriate role and tenant scope.",
  },
  {
    title: "5. Feedback and support submissions",
    body: "When you submit feedback on public pages or in the app, it may be stored in the feedback inbox and forwarded as a notification email to the support mailbox for review and follow-up.",
  },
  {
    title: "6. Contact for privacy concerns",
    body: "For questions about privacy, account handling, or support requests, you can reach us at agapay.saas@gmail.com.",
  },
];

export default async function PrivacyPage() {
  const tenants = await getActiveTenantsForNav();

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid tenants={tenants} />
      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-black italic mb-6 text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-3xl">
            This privacy note applies to the current Agapay prototype. It
            describes how member, tenant, and admin data is handled within the
            system.
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
