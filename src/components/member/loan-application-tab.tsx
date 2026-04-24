"use client";

import { useEffect, useState } from "react";
import { getLoanProducts } from "@/actions/loan-product";
import { TrendingUp, Clock, Banknote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanApplicationForm } from "./loan-application-form";
import { toast } from "sonner";
import { MICROFINANCE_POLICY } from "@/lib/microfinance-policy";

type LoanProductCard = {
  product_id: number;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  interest_rate_percent: number;
  guarantor_liability_rate: number;
  max_term_months: number;
  is_active: boolean;
};

export const LoanApplicationTab = () => {
  const [products, setProducts] = useState<LoanProductCard[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProductCard | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLoanProducts();
        setProducts(data.filter((product) => product.is_active) as LoanProductCard[]);
      } catch {
        toast.error("Hindi ma-load ang mga produkto.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-100 bg-white p-10 text-center text-slate-400">
        Kinukuha ang mga produkto...
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => setSelectedProduct(null)}
          className="flex items-center gap-2 text-sm font-bold text-emerald-600 transition-all hover:translate-x-[-3px]"
        >
          ← Bumalik sa mga Produkto
        </button>

        <div className="grid grid-cols-1 overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-xl md:grid-cols-2">
          <div className="space-y-5 bg-slate-900 p-6 text-white md:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold">
                {selectedProduct.name}
              </h2>
              <p className="text-sm italic leading-6 text-slate-400">
                {selectedProduct.description ||
                  "Isang malinaw at tier-aware na financing option para sa iyong pangangailangang pinansyal."}
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <PolicyRow
                label="Interes"
                value={`${selectedProduct.interest_rate_percent}% kada buwan`}
              />
              <PolicyRow
                label="Tagal"
                value={`${MICROFINANCE_POLICY.minTermMonths} hanggang ${Math.min(
                  MICROFINANCE_POLICY.maxTermMonths,
                  selectedProduct.max_term_months,
                )} buwan`}
              />
              <PolicyRow
                label="Guarantors"
                value={`${MICROFINANCE_POLICY.minGuarantors} hanggang ${MICROFINANCE_POLICY.maxGuarantors}`}
              />
              <PolicyRow
                label="Liability kada guarantor"
                value={`${selectedProduct.guarantor_liability_rate}%`}
              />
            </div>
          </div>

          <div className="p-5 md:p-7">
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold text-slate-900">
          Pumili ng Produkto ng Loan
        </h2>
        <p className="max-w-2xl text-sm text-slate-500">
          Pumili ng produktong tugma sa iyong tier, puhunan, at kakayahang
          magbayad.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-10 text-center italic text-slate-400">
            Sa kasalukuyan ay walang available na loan products. Mangyaring
            bumalik muli mamaya.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.product_id}
              className="group flex flex-col justify-between rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                  <Banknote className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-display font-bold text-slate-900">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 border-y border-slate-50 py-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {product.max_term_months}mo
                    </div>
                    <div className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-600">
                      {product.interest_rate_percent}% rate
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-500">
                  Maaaring hiramin mula PHP{" "}
                  {Number(product.min_amount).toLocaleString()} hanggang PHP{" "}
                  {Number(product.max_amount).toLocaleString()}.
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Recovery share kada guarantor:{" "}
                  {product.guarantor_liability_rate}%
                </p>
              </div>

              <Button
                onClick={() => setSelectedProduct(product)}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/20 hover:bg-emerald-600"
              >
                <span>Mag-apply Ngayon</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="font-medium text-slate-100">
        {label}: <span className="text-slate-300">{value}</span>
      </span>
    </div>
  );
}
