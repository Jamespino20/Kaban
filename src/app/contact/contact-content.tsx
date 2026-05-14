"use client";

import { FeedbackForm } from "@/components/shared/feedback-form";
import { MessageCircle } from "lucide-react";

export function ContactContent() {
  return (
    <section
      id="contact-form"
      className="w-full py-32 px-6 max-w-4xl lg:max-w-7xl mx-auto"
    >
      <div className="space-y-12">
        <div className="rounded-[3rem] bg-slate-50 border border-slate-100 p-10 md:p-14 shadow-xl space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black italic text-slate-900">
              What can be submitted here?
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg md:text-xl max-w-3xl">
              <p>
                General concerns, cancellation requests, bug reports,
                feature requests, and testimonial leads all go through here.
              </p>
              <p>
                Admins can see tenant feedback in Tanaw, and the superadmin
                has final visibility into cross-tenant trends.
              </p>
            </div>
          </div>

          <div className="inline-flex p-2 bg-white/80 backdrop-blur rounded-[2rem] border border-slate-200/50 shadow-sm">
            <button
              className="px-8 py-4 rounded-2xl text-sm font-bold italic transition-all bg-white text-emerald-700 shadow-xl shadow-emerald-500/10 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                General Feedback
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-[4rem] bg-white border border-slate-200 p-8 md:p-16 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            <FeedbackForm
              defaultCategory="general"
              pagePath="/contact"
              title="Send Feedback"
              description="Submit a concern, cancellation request, question, or testimonial lead here."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
