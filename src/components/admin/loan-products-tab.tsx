"use client";

import { useEffect, useState } from "react";
import { Plus, Settings2, ShieldCheck, MoreVertical } from "lucide-react";
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

export const LoanProductsTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await getLoanProducts();
      setProducts(data);
    } catch (error) {
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
            Available Products
          </h2>
          <p className="text-sm text-slate-500">
            Define loan products within the Agapay policy band for amount, rate,
            and term.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700">
              <Plus className="h-5 w-5" />
              <span>New Loan Product</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
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
                  Interest Rate
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Max Term
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="p-5 text-right text-xs font-bold uppercase tracking-widest text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                        <span className="font-bold text-slate-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 font-medium text-slate-600">
                      PHP {Number(product.min_amount).toLocaleString()} - PHP{" "}
                      {Number(product.max_amount).toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {product.interest_rate_percent}% / month
                      </span>
                    </td>
                    <td className="p-5 font-medium text-slate-600">
                      {product.max_term_months} Months
                    </td>
                    <td className="p-5">
                      {product.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-emerald-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-slate-400">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
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
