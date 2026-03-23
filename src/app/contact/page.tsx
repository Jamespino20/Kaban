"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* Hero */}
        <section className="w-full py-24 px-6 max-w-7xl text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" /> Narito Kami Para Sayo
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900 text-balance">
              Buksan ang Inyong{" "}
              <span className="text-emerald-600">Komunikasyon.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              May katanungan? O pakay na mag-expansion? Nandito ang aming team
              para gabayan ka sa bawat hakbang.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="w-full py-32 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ContactMethod
            icon={<Phone className="w-8 h-8 text-emerald-600" />}
            title="Tawagan Kami"
            detail="+63 (02) 8888-KABAN"
            actionLabel="Call Now"
          />
          <ContactMethod
            icon={<Mail className="w-8 h-8 text-emerald-600" />}
            title="Email Support"
            detail="support@kaban.com.ph"
            actionLabel="Send Email"
          />
          <ContactMethod
            icon={<MessageCircle className="w-8 h-8 text-emerald-600" />}
            title="Live Chat"
            detail="24/7 Virtual Assistant"
            actionLabel="Open Chat"
          />
          <ContactMethod
            icon={<MapPin className="w-8 h-8 text-emerald-600" />}
            title="Head Office"
            detail="BGC, Taguig City, Philippines"
            actionLabel="View Map"
          />
        </section>

        {/* Support Form Container */}
        <section className="w-full py-40 px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-[4rem] p-12 md:p-24 border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black italic mb-10 text-slate-900 underline decoration-emerald-500 decoration-8 underline-offset-8">
                Sumulat ng Mensahe
              </h2>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField
                    label="Buong Pangalan"
                    placeholder="Juan dela Cruz"
                  />
                  <InputField
                    label="Numero ng Telepono"
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <InputField
                  label="Email Address"
                  placeholder="juan@gmail.com"
                />
                <div className="space-y-3">
                  <label className="text-sm font-black italic text-slate-500 uppercase tracking-widest">
                    Inyong Mensahe
                  </label>
                  <textarea
                    className="w-full p-6 rounded-[2rem] bg-white border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[200px] outline-none font-medium resize-none"
                    placeholder="Ano ang maibabahagi mo tungkol sa iyong pangarap na negosyo?"
                  ></textarea>
                </div>
                <button className="w-full md:w-fit px-16 py-6 bg-emerald-600 text-white font-black italic rounded-[2rem] hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all text-lg flex items-center justify-center gap-3">
                  Ipadala ang Mensahe <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

function ContactMethod({
  icon,
  title,
  detail,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  actionLabel: string;
}) {
  return (
    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group flex flex-col items-center text-center">
      <div className="p-5 bg-white rounded-2xl mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black italic text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 font-medium mb-8 text-sm">{detail}</p>
      <button className="text-emerald-600 font-black italic text-sm hover:underline tracking-tight uppercase">
        {actionLabel}
      </button>
    </div>
  );
}

function InputField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black italic text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="text"
        className="w-full p-6 rounded-[2rem] bg-white border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium"
        placeholder={placeholder}
      />
    </div>
  );
}
