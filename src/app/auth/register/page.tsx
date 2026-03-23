export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50/50">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-display font-bold text-slate-900 italic mb-2 text-center">
          Maging Miyembro
        </h1>
        <p className="text-slate-500 text-center mb-10 font-medium">
          Simulan ang iyong paglalakbay sa Kaban.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2 uppercase text-[10px] tracking-widest">Personal Identification</h3>
            <p className="text-sm text-slate-500">Ihanda ang iyong Valid ID at Proof of Residency para sa KYC process.</p>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-900 text-sm font-medium">
              "Trust is the bedrock of our Treasury." - Kaban Core Philosophy
            </div>
          </div>
          
          <div className="flex flex-col justify-center items-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
             <p className="text-slate-400 font-bold mb-4">Registration Portal under construction</p>
             <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold opacity-50 cursor-not-allowed">
               Buksan ang Pintuan
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
