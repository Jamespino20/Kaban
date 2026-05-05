"use client";

import { useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FeedbackForm } from "@/components/shared/feedback-form";
import { CoopApplicationForm } from "@/components/shared/coop-application-form";
import {
  BadgeCheck,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Building2,
} from "lucide-react";

const CONTACT_METHODS = [
  {
    title: "Email Support",
    detail: "agapay.saas@gmail.com",
    href: "mailto:agapay.saas@gmail.com",
    actionLabel: "Email Us",
    icon: Mail,
  },
  {
    title: "Feedback Inbox",
    detail: "For concerns, cancellations, and suggestions",
    href: "#contact-form",
    actionLabel: "Share Feedback",
    icon: MessageCircle,
  },
  {
    title: "Prototype Hotline",
    detail: "+63 (02) 8888-2427",
    href: "tel:+630288882427",
    actionLabel: "Call Now",
    icon: Phone,
  },
  {
    title: "Head Office",
    detail: "Malolos City, Philippines",
    href: "https://maps.google.com/?q=Malolos%20City%20Philippines",
    actionLabel: "Open Map",
    icon: MapPin,
  },
];

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<"feedback" | "onboarding">(
    "feedback",
  );

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-7xl text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              Get in Touch with Agapay
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900 text-balance">
              Let&apos;s Talk About{" "}
              <span className="text-emerald-600">a Better Agapay.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              For questions, concerns, cancellations, testimonials, or
              suggestions — there is a clear path to reach the right team.
            </p>
          </div>
        </section>

        <section className="w-full py-20 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CONTACT_METHODS.map((method) => (
            <a
              key={method.title}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={
                method.href.startsWith("http")
                  ? "noreferrer noopener"
                  : undefined
              }
              className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group flex flex-col items-center text-center"
            >
              <div className="p-5 bg-white rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                <method.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black italic text-slate-900 mb-2">
                {method.title}
              </h3>
              <p className="text-slate-500 font-medium mb-8 text-sm">
                {method.detail}
              </p>
              <span className="text-emerald-600 font-black italic text-sm tracking-tight uppercase">
                {method.actionLabel}
              </span>
            </a>
          ))}
        </section>

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
                        feature requests, and testimonial leads all go through
                        here.
                      </p>
                      <p>
                        Admins can see tenant feedback in Tanaw, and the
                        superadmin has final visibility into cross-tenant
                        trends.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Bring your cooperative into the digital age. With
                        Agapay, you&apos;ll have your own management dashboard
                        (Tanaw).
                      </p>
                      <p>
                        Fast loan processing, a transparent ledger, and
                        automated trust scoring for your members.
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
                    Branch Onboarding
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

        <Footer />
      </main>
    </div>
  );
}
