"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />
      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black italic mb-12">
            Terms of Service
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
            <p>
              Sa paggamit ng Agapay, sumasang-ayon ka sa mga sumusunod na
              tuntunin.
            </p>
            <h2 className="text-2xl font-black italic text-slate-900">
              1. Paggamit ng Serbisyo
            </h2>
            <p>
              Ang Agapay ay para lamang sa mga lehitimong negosyante at
              organisasyon.
            </p>
            <h2 className="text-2xl font-black italic text-slate-900">
              2. Responsibilidad sa Account
            </h2>
            <p>
              Ikaw ay responsable sa pagpapanatili ng seguridad ng iyong account
              password.
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
