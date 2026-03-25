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
import { Calculator, ArrowRightCircle } from "lucide-react";

const LoanApplicationSchema = z.object({
  product_id: z.number(),
  amount: z.number().min(100, "Minimum ₱100"),
  term_months: z.number().min(1, "Minimum 1 month"),
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
  });

  const form = useForm<z.infer<typeof LoanApplicationSchema>>({
    resolver: zodResolver(LoanApplicationSchema),
    defaultValues: {
      product_id: product.product_id,
      amount: Number(product.min_amount),
      term_months: Math.min(6, product.max_term_months),
    },
  });

  const watchAmount = form.watch("amount");
  const watchTerm = form.watch("term_months");

  useEffect(() => {
    const amount = Number(watchAmount) || 0;
    const term = Number(watchTerm) || 0;
    const rate = Number(product.interest_rate_percent) / 100;

    // Simple Interest Calculation
    const totalInterest = amount * rate * term;
    const totalRepayment = amount + totalInterest;
    const monthlyAmortization = term > 0 ? totalRepayment / term : 0;

    setCalculation({
      monthly: monthlyAmortization,
      total: totalRepayment,
      interest: totalInterest,
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

          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">
                Monthly Payment
              </span>
              <span className="text-emerald-700 font-display font-bold text-2xl">
                ₱
                {calculation.monthly.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="pt-4 border-t border-emerald-100/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium uppercase tracking-widest">
                  Total Interest
                </span>
                <span className="text-slate-600 font-bold">
                  ₱{calculation.interest.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium uppercase tracking-widest">
                  Total Repayment
                </span>
                <span className="text-slate-600 font-bold">
                  ₱{calculation.total.toLocaleString()}
                </span>
              </div>
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
