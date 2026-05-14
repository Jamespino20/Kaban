import { CoopApplicationForm } from "@/components/shared/coop-application-form";

export const metadata = {
  title: "Get Started | Agapay",
  description: "Join Agapay and bring your cooperative into the digital age.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-32 px-6">
      <div className="max-w-4xl lg:max-w-7xl mx-auto space-y-12">
        <div className="rounded-[3rem] bg-white border border-slate-100 p-10 md:p-14 shadow-xl space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black italic text-slate-900">
              Why join Agapay?
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg md:text-xl max-w-3xl">
              <p>
                Bring your cooperative into the digital age. With Agapay,
                you&apos;ll have your own management dashboard (Tanaw).
              </p>
              <p>
                Fast loan processing, a transparent ledger, and automated
                trust scoring for your members.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[4rem] bg-white border border-slate-200 p-8 md:p-16 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            <CoopApplicationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
