import { EnhancedRegisterForm } from "@/components/auth/enhanced-register-form";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 italic font-sans overflow-x-hidden">
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent -z-10 blur-3xl opacity-50" />

          <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-tight">
              Ang Inyong <span className="text-emerald-600">Treasury</span>, Sa
              Iyong Kamay.
            </h1>
            <p className="text-lg text-slate-500 italic">
              Sumali sa libo-libong Pilipinong naniniwala sa Shared Treasury ng
              Kaban. Sama-samang pag-unlad, walang iwanan.
            </p>
          </div>

          <EnhancedRegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
