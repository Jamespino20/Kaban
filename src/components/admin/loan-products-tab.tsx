"use client";

import { useEffect, useState } from "react";
import { Plus, Settings2, ShieldCheck, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProductForm } from "./create-product-form";
import { getLoanProducts } from "@/actions/loan-product";
import { toast } from "sonner";

const FREQ_LABELS: Record<string, string> = {
  weekly: "Lingguhán",
  biweekly: "Dalawang Linggo",
  monthly: "Buwanán",
};

export const LoanProductsTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await getLoanProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Loan Products
          </h2>
          <p className="text-sm text-slate-500">
            Define loan products with payment cadence, guarantor liability, and
            policy-compliant rates.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700">
              <Plus className="h-5 w-5" />
              <span>New Loan Product</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-display font-bold">
                <Settings2 className="h-5 w-5 text-emerald-500" />
                <span>Create Loan Product</span>
              </DialogTitle>
            </DialogHeader>
            <CreateProductForm
              onSuccess={() => {
                setIsOpen(false);
                fetchProducts();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Product Name
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Amount Range
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Interest / Mo.
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Payment Cadence
                  </div>
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Guarantor %
                  </div>
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Term
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-20 text-center italic text-slate-400"
                  >
                    No loan products defined yet. Create your first one to start
                    lending.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr
                    key={product.product_id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">
                            {product.name}
                          </span>
                          {product.description && (
                            <p className="text-xs text-slate-400 truncate max-w-[160px]">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-medium text-slate-600">
                      <span className="text-xs">
                        ₱{Number(product.min_amount).toLocaleString()} – ₱
                        {Number(product.max_amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {product.interest_rate_percent}%
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-1">
                        {(
                          (product.allowed_frequencies as string[]) ?? [
                            "monthly",
                          ]
                        ).map((freq: string) => (
                          <span
                            key={freq}
                            className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600"
                          >
                            {FREQ_LABELS[freq] ?? freq}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        {product.guarantor_liability_rate}%
                      </span>
                    </td>
                    <td className="p-5 font-medium text-slate-600">
                      <span className="text-xs">
                        {product.max_term_months} Buwan
                      </span>
                    </td>
                    <td className="p-5">
                      {product.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-emerald-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Aktibo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-slate-400">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Hindi Aktibo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
