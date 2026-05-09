"use client";

import { useState } from "react";
import { FeedbackForm } from "@/components/shared/feedback-form";
import { CoopApplicationForm } from "@/components/shared/coop-application-form";
import { MessageCircle, Building2 } from "lucide-react";

export function ContactContent() {
  const [activeTab, setActiveTab] = useState<"feedback" | "onboarding">(
    "feedback",
  );

  return (
    <section
      id="contact-form"
      className="w-full py-32 px-6 max-w-4xl lg:max-w-7xl mx-auto"
    >
      <div className="space-y-12">
        <div className="rounded-[3rem] bg-slate-50 border border-slate-100 p-10 md:p-14 shadow-xl space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black italic text-slate-900">
              {activeTab === "feedback"
                ? "What can be submitted here?"
                : "Why join Agapay?"}
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg md:text-xl max-w-3xl">
              {activeTab === "feedback" ? (
                <>
                  <p>
                    General concerns, cancellation requests, bug reports,
                    feature requests, and testimonial leads all go through here.
                  </p>
                  <p>
                    Admins can see tenant feedback in Tanaw, and the superadmin
                    has final visibility into cross-tenant trends.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Bring your cooperative into the digital age. With Agapay,
                    you&apos;ll have your own management dashboard (Tanaw).
                  </p>
                  <p>
                    Fast loan processing, a transparent ledger, and automated
                    trust scoring for your members.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="inline-flex p-2 bg-white/80 backdrop-blur rounded-[2rem] border border-slate-200/50 shadow-sm">
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-8 py-4 rounded-2xl text-sm font-bold italic transition-all ${
                activeTab === "feedback"
                  ? "bg-white text-emerald-700 shadow-xl shadow-emerald-500/10 border border-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                General Feedback
              </div>
            </button>
            <button
              onClick={() => setActiveTab("onboarding")}
              className={`px-8 py-4 rounded-2xl text-sm font-bold italic transition-all ${
                activeTab === "onboarding"
                  ? "bg-white text-emerald-700 shadow-xl shadow-emerald-500/10 border border-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Tenant Onboarding
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-[4rem] bg-white border border-slate-200 p-8 md:p-16 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            {activeTab === "feedback" ? (
              <FeedbackForm
                defaultCategory="general"
                pagePath="/contact"
                title="Send Feedback"
                description="Submit a concern, cancellation request, question, or testimonial lead here."
              />
            ) : (
              <CoopApplicationForm />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
