"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { applyForLoan } from "@/actions/loan-application";
import { Calculator, ArrowRightCircle, CheckCircle2 } from "lucide-react";
import { GuaranteeRequestPanel } from "./guarantee-request-panel";

const LoanApplicationSchema = z.object({
  product_id: z.number(),
  amount: z.number().min(100, "Minimum ₱100"),
  term_months: z.number().min(1, "Minimum 1 month"),
  guarantor_ids: z
    .array(z.number())
    .min(3, "At least 3 guarantors are required for Paluwagan 2.0"),
});

interface LoanApplicationFormProps {
  product: any;
  onSuccess: () => void;
}

export const LoanApplicationForm = ({
  product,
  onSuccess,
}: LoanApplicationFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [calculation, setCalculation] = useState({
    monthly: 0,
    total: 0,
    interest: 0,
    fees: 0,
    totalCostOfCredit: 0,
  });

  const form = useForm<z.infer<typeof LoanApplicationSchema>>({
    resolver: zodResolver(LoanApplicationSchema),
    defaultValues: {
      product_id: product.product_id,
      amount: Number(product.min_amount),
      term_months: Math.min(6, product.max_term_months),
      guarantor_ids: [],
    },
  });

  const watchAmount = form.watch("amount");
  const watchTerm = form.watch("term_months");

  useEffect(() => {
    const amount = Number(watchAmount) || 0;
    const term = Number(watchTerm) || 0;
    // Multi-Layered Cost Calculation (Anti-GCash Transparency)
    const rate = Number(product.interest_rate_percent) / 100;
    const totalInterest = amount * rate * term;

    // Transparent Processing Fee (Simulating a flat 2% or min ₱50)
    const processingFee = Math.max(50, amount * 0.02);

    const totalRepayment = amount + totalInterest + processingFee;
    const monthlyAmortization = term > 0 ? totalRepayment / term : 0;

    setCalculation({
      monthly: monthlyAmortization,
      total: totalRepayment,
      interest: totalInterest,
      fees: processingFee,
      totalCostOfCredit: totalInterest + processingFee,
    });
  }, [watchAmount, watchTerm, product]);

  const onSubmit = (values: z.infer<typeof LoanApplicationSchema>) => {
    startTransition(async () => {
      try {
        const result = await applyForLoan(values);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Application submitted! We will review it shortly.");
          onSuccess();
        }
      } catch (error) {
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
        <Calculator className="w-5 h-5 text-emerald-600" />
        <h3 className="font-display font-bold text-slate-900 uppercase tracking-wider text-sm">
          Loan Calculator
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Amount to Borrow (₱)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="500"
                    disabled={isPending}
                    className="h-14 rounded-2xl border-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20 text-xl font-bold font-display"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Term Duration (Months)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    disabled={isPending}
                    className="h-14 rounded-2xl border-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20 text-xl font-bold font-display"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guarantor_ids"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <GuaranteeRequestPanel
                    selectedGuarantors={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-emerald-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse">
                Total Cost Guarantee
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Monthly Amortization
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-emerald-400">
                  ₱
                  {calculation.monthly.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-slate-500 text-sm">/ month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Principal
                </p>
                <p className="text-sm font-bold">
                  ₱{Number(watchAmount).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Interest ({product.interest_rate_percent}%)
                </p>
                <p className="text-sm font-bold text-emerald-400">
                  +₱{calculation.interest.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Service Fees
                </p>
                <p className="text-sm font-bold text-amber-400">
                  +₱{calculation.fees.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-emerald-500">
                  Total Repayment
                </p>
                <p className="text-sm font-black text-white">
                  ₱{calculation.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400">
                <strong>Walang hidden charges.</strong> Ang halagang ito ay
                final at hindi magbabago sa buong duration ng iyong loan.
              </p>
            </div>
          </div>

          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all"
          >
            <span>Isumite ang Application</span>
            <ArrowRightCircle className="w-6 h-6" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
