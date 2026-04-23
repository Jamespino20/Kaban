"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FeedbackForm } from "@/components/shared/feedback-form";
import { BadgeCheck, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const CONTACT_METHODS = [
  {
    title: "Email Support",
    detail: "agapay.saas@gmail.com",
    href: "mailto:agapay.saas@gmail.com",
    actionLabel: "Mag-email sa Amin",
    icon: Mail,
  },
  {
    title: "Feedback Inbox",
    detail: "Para sa concerns, cancellations, at suggestions",
    href: "#feedback-form",
    actionLabel: "Magbahagi ng Feedback",
    icon: MessageCircle,
  },
  {
    title: "Prototype Hotline",
    detail: "+63 (02) 8888-2427",
    href: "tel:+630288882427",
    actionLabel: "Tumawag Ngayon",
    icon: Phone,
  },
  {
    title: "Head Office",
    detail: "Taguig City, Philippines",
    href: "https://maps.google.com/?q=Taguig%20City%20Philippines",
    actionLabel: "Buksan ang Mapa",
    icon: MapPin,
  },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-7xl text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              Makipag-ugnayan sa Agapay
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900 text-balance">
              Usap Tayo Para sa{" "}
              <span className="text-emerald-600">Mas Maayos na Agapay.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Para sa tanong, concern, cancellation, testimonial, o suggestion,
              may malinaw na paraan para makarating ito sa tamang team.
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

        <section className="w-full py-32 px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
            <div className="rounded-[3rem] bg-slate-50 border border-slate-100 p-10 md:p-14 shadow-xl space-y-6">
              <h2 className="text-4xl font-black italic text-slate-900">
                Ano ang puwedeng ipasa rito?
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Para sa school-project prototype na ito, dito dumadaan ang
                  general concerns, cancellation requests, bug reports, feature
                  requests, at testimonial leads.
                </p>
                <p>
                  Ang admins ay makakakita ng tenant feedback sa Tanaw, at ang
                  superadmin ang may final visibility sa cross-tenant trends at
                  homepage content approval workflow.
                </p>
                <p>
                  Kung testimonial ang ipapasa mo, puwedeng i-curate ito ng
                  admin bilang proposal para sa homepage kapag relevant sa
                  kasalukuyang season o tema.
                </p>
              </div>
            </div>

            <div
              id="feedback-form"
              className="rounded-[3rem] bg-white border border-slate-200 p-8 md:p-10 shadow-xl"
            >
              <FeedbackForm
                defaultEmail="agapay.saas@gmail.com"
                defaultCategory="general"
                pagePath="/contact"
                title="Magpadala ng Feedback"
                description="Ilagay ang concern, cancellation request, tanong, o testimonial lead mo rito."
              />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

