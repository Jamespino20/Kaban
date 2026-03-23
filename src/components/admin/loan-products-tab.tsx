"use client";

import { useEffect, useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Available Products
          </h2>
          <p className="text-slate-500 text-sm">
            Define the rules, interest rates, and terms for member loans.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-6 h-12 shadow-lg shadow-emerald-500/20 transition-all">
              <Plus className="w-5 h-5" />
              <span>New Loan Product</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-500" />
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Product Name
                </th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Amount Range
                </th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Interest Rate
                </th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Max Term
                </th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-20 text-center text-slate-400 italic"
                  >
                    No loan products defined yet. Create your first one to start
                    lending.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.product_id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-bold text-slate-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">
                      ₱{Number(product.min_amount).toLocaleString()} - ₱
                      {Number(product.max_amount).toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                        {product.interest_rate_percent}% Fixed
                      </span>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">
                      {product.max_term_months} Months
                    </td>
                    <td className="p-5">
                      {product.is_active ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-tighter">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
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
