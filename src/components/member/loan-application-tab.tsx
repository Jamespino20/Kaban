"use client";

import { useEffect, useState } from "react";
import { getLoanProducts } from "@/actions/loan-product";
import {
  CheckCircle2,
  Info,
  ArrowRight,
  TrendingUp,
  Clock,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanApplicationForm } from "./loan-application-form";
import { toast } from "sonner";

export const LoanApplicationTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLoanProducts();
        setProducts(data.filter((p: any) => p.is_active));
      } catch (error) {
        toast.error("Hindi ma-load ang mga produkto.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400">
        Kinukuha ang mga produkto...
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-emerald-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-all"
        >
          ← Bumalik sa mga Produkto
        </button>
        <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 space-y-6 bg-slate-900 text-white">
            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold">
                {selectedProduct.name}
              </h2>
              <p className="text-slate-400 leading-relaxed italic">
                {selectedProduct.description ||
                  "Isang mabilis na paraan para sa iyong pangangailangang pinansyal."}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">
                  Interes: {selectedProduct.interest_rate_percent}% Fixed kada
                  Buwan
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">
                  Pinakamahabang Tagal: {selectedProduct.max_term_months} Buwan
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <LoanApplicationForm
              product={selectedProduct}
              onSuccess={() => setSelectedProduct(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-slate-900">
          Pumili ng Produkto ng Loan
        </h2>
        <p className="text-slate-500">
          Mayroon kaming iba't ibang opsyon na akma sa iyong pangangailangan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">
            Sa kasalukuyan ay walang available na loan products. Mangyaring
            bumalik muli mamaya.
          </div>
        ) : (
          products.map((product: any) => (
            <div
              key={product.product_id}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all p-8 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                  <Banknote className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold text-slate-900">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-4 py-2 border-y border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      {product.max_term_months}mo
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      {product.interest_rate_percent}% Rate
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Maaaring hiramin mula ₱
                  {Number(product.min_amount).toLocaleString()} hanggang ₱
                  {Number(product.max_amount).toLocaleString()}.
                </p>
              </div>

              <Button
                onClick={() => setSelectedProduct(product)}
                className="mt-8 w-full rounded-2xl h-14 bg-slate-900 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
              >
                <span>Mag-apply Ngayon</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
