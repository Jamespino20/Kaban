"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />
      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black italic mb-12">
            Privacy Policy
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
            <p>
              Ang iyong privacy ay mahalaga sa amin. Ang Asenso ay sumusunod sa
              Data Privacy Act of 2012 upang matiyak na ang iyong impormasyon ay
              ligtas.
            </p>
            <h2 className="text-2xl font-black italic text-slate-900">
              1. Koleksyon ng Impormasyon
            </h2>
            <p>
              Kinokolekta namin ang iyong pangalan, numero ng telepono, at
              detalye ng negosyo para sa layunin ng microfinancing approval.
            </p>
            <h2 className="text-2xl font-black italic text-slate-900">
              2. Paggamit ng Datos
            </h2>
            <p>
              Ang iyong datos ay gagamitin lamang sa loob ng Asenso system at
              hindi ibabahagi sa mga third-party nang walang pahintulot.
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
