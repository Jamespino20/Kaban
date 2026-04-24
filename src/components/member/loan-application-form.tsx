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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RepaymentFrequency } from "@prisma/client";
import {
  computeLoanQuote,
  getCompassionPolicyCopy,
  getPenaltyPolicyCopy,
  MICROFINANCE_POLICY,
} from "@/lib/microfinance-policy";

const LoanApplicationSchema = z.object({
  product_id: z.number(),
  amount: z
    .number()
    .min(
      MICROFINANCE_POLICY.minAmount,
      `Minimum PHP ${MICROFINANCE_POLICY.minAmount.toLocaleString()}`,
    ),
  term_months: z
    .number()
    .min(
      MICROFINANCE_POLICY.minTermMonths,
      `Minimum ${MICROFINANCE_POLICY.minTermMonths} months`,
    )
    .max(
      MICROFINANCE_POLICY.maxTermMonths,
      `Maximum ${MICROFINANCE_POLICY.maxTermMonths} months`,
    ),
  guarantor_ids: z
    .array(z.number())
    .min(
      MICROFINANCE_POLICY.minGuarantors,
      "Kailangan ng hindi bababa sa isang guarantor.",
    )
    .max(
      MICROFINANCE_POLICY.maxGuarantors,
      "Hanggang dalawang guarantor lang ang pinapayagan sa kasalukuyang policy.",
    ),
  repayment_frequency: z.enum(["weekly", "bi_weekly", "monthly"]),
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
      term_months: Math.max(
        MICROFINANCE_POLICY.minTermMonths,
        Math.min(6, product.max_term_months),
      ),
      guarantor_ids: [],
      repayment_frequency:
        (product.allowed_frequencies?.[0] as
          | "weekly"
          | "bi_weekly"
          | "monthly") || "monthly",
    },
  });

  const watchAmount = form.watch("amount");
  const watchTerm = form.watch("term_months");
  const watchFrequency = form.watch("repayment_frequency");

  useEffect(() => {
    const amount = Number(watchAmount) || 0;
    const term = Number(watchTerm) || 0;
    const quote = computeLoanQuote({
      principalAmount: amount,
      termMonths: term,
      monthlyRatePercent: Number(product.interest_rate_percent),
      frequency: watchFrequency,
    });

    setCalculation({
      monthly: quote.installmentAmount,
      total: quote.totalPayable,
      interest: quote.totalInterest,
      fees: quote.processingFee,
      totalCostOfCredit: quote.totalInterest + quote.processingFee,
    });
  }, [watchAmount, watchTerm, product]);

  const onSubmit = (values: z.infer<typeof LoanApplicationSchema>) => {
    startTransition(async () => {
      try {
        const result = await applyForLoan(values);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(
            "Naisumite na ang iyong application. Susuriin ito ng branch team kasama ang guarantor backing mo.",
          );
          onSuccess();
        }
      } catch (error) {
        toast.error("May nangyaring mali!");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <Calculator className="h-5 w-5 text-emerald-600" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
          Tagatuos ng Loan
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Halaga ng Hiramin (PHP)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    type="number"
                    step="500"
                    min={product.min_amount}
                    max={product.max_amount}
                    disabled={isPending}
                    className="h-14 rounded-2xl border-slate-100 text-xl font-bold font-display focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </FormControl>
                <p className="text-xs text-slate-500">
                  Available for this product: PHP{" "}
                  {Number(product.min_amount).toLocaleString()} to PHP{" "}
                  {Number(product.max_amount).toLocaleString()}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Tagal ng Pagbabayad (Buwan)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    type="number"
                    min={MICROFINANCE_POLICY.minTermMonths}
                    max={Math.min(
                      product.max_term_months,
                      MICROFINANCE_POLICY.maxTermMonths,
                    )}
                    disabled={isPending}
                    className="h-14 rounded-2xl border-slate-100 text-xl font-bold font-display focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </FormControl>
                <p className="text-xs text-slate-500">
                  Current Agapay policy supports{" "}
                  {MICROFINANCE_POLICY.minTermMonths} to{" "}
                  {Math.min(
                    product.max_term_months,
                    MICROFINANCE_POLICY.maxTermMonths,
                  )}{" "}
                  months for this product.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repayment_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Dalas ng Pagbabayad
                </FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 text-xl font-bold font-display focus:border-emerald-500 focus:ring-emerald-500/20">
                      <SelectValue placeholder="Pumili ng dalas ng pagbabayad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(
                      product.allowed_frequencies || [
                        RepaymentFrequency.monthly,
                      ]
                    ).map((freq: RepaymentFrequency) => {
                      const labels: Record<RepaymentFrequency, string> = {
                        [RepaymentFrequency.weekly]: "Lingguhan",
                        [RepaymentFrequency.bi_weekly]: "Kada Dalawang Linggo",
                        [RepaymentFrequency.monthly]: "Buwanan",
                      };
                      return (
                        <SelectItem key={freq} value={freq}>
                          {labels[freq]}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Ang options na ito ay nakadepende sa piniling produkto.
                </p>
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
                    selectedGuarantors={field.value ?? []}
                    onChange={(guarantors) => field.onChange(guarantors)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="relative space-y-6 overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <div className="absolute right-0 top-0 p-4">
              <div className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">
                Tier-Aligned Quote
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Tantyang Hulog (
                {watchFrequency === RepaymentFrequency.weekly
                  ? "Lingguhan"
                  : watchFrequency === RepaymentFrequency.bi_weekly
                    ? "Kada Dalawang Linggo"
                    : "Buwanan"}
                )
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-emerald-400">
                  PHP{" "}
                  {calculation.monthly.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-sm text-slate-500">
                  /{" "}
                  {watchFrequency === RepaymentFrequency.weekly
                    ? "linggo"
                    : watchFrequency === RepaymentFrequency.bi_weekly
                      ? "2 linggo"
                      : "buwan"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Punong Halaga
                </p>
                <p className="text-sm font-bold">
                  PHP {Number(watchAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Interes ({product.interest_rate_percent}%)
                </p>
                <p className="text-sm font-bold text-emerald-400">
                  +PHP {calculation.interest.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Service Fee
                </p>
                <p className="text-sm font-bold text-amber-400">
                  +PHP {calculation.fees.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  Kabuuang Bayad
                </p>
                <p className="text-sm font-black text-white">
                  PHP {calculation.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
                  <p>
                    <strong className="text-white">Penalty policy:</strong>{" "}
                    {getPenaltyPolicyCopy()}
                  </p>
                  <p>
                    <strong className="text-white">Compassion support:</strong>{" "}
                    {getCompassionPolicyCopy()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            disabled={isPending}
            type="submit"
            className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-700"
          >
            <span>Isumite ang Application</span>
            <ArrowRightCircle className="h-6 w-6" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
