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
import { Calculator, ArrowRightCircle, CheckCircle2, Save } from "lucide-react";
import { GuaranteeRequestPanel } from "./guarantee-request-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeLoanQuote,
  getCompassionPolicyCopy,
  getPenaltyPolicyCopy,
  MICROFINANCE_POLICY,
  RepaymentFrequency,
} from "@/lib/microfinance-policy";
import { useFormPersistence } from "@/hooks/use-form-persistence";

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
      "At least one guarantor is required.",
    )
    .max(
      MICROFINANCE_POLICY.maxGuarantors,
      "A maximum of two guarantors are allowed under current policy.",
    ),
  repayment_frequency: z.enum(["weekly", "bi_weekly", "monthly"]),
});

interface LoanProduct {
  product_id: number;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  interest_rate_percent: number;
  max_term_months: number;
  allowed_frequencies?: RepaymentFrequency[];
}

interface LoanApplicationFormProps {
  product: LoanProduct;
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

  const [isLoaded, setIsLoaded] = useState(false);
  const STORAGE_KEY = `agapay_loan_draft_${product.product_id}`;

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

  const formValues = form.watch();

  const { draftFound, clearPersistence, dismissDraftNotice } = useFormPersistence(
    `loan_${product.product_id}`,
    formValues as Record<string, unknown>,
    (restored) => {
      form.reset(restored as any);
    },
    true,
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !draftFound) {
      try {
        const parsed = JSON.parse(saved);
        form.reset({
          ...parsed,
          product_id: product.product_id,
        });
      } catch (e) {
        console.error("Failed to load loan draft", e);
      }
    }
    setIsLoaded(true);
  }, [product.product_id, form]);

  useEffect(() => {
    if (!isLoaded) return;
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, isLoaded, STORAGE_KEY]);

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
      fees: quote.processingFee + quote.serviceFee,
      totalCostOfCredit:
        quote.totalInterest + quote.processingFee + quote.serviceFee,
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
            "Your application has been submitted. The tenant team will review it alongside your guarantor backing.",
          );
          localStorage.removeItem(STORAGE_KEY);
          clearPersistence();
          onSuccess();
        }
      } catch (error) {
        toast.error("An error occurred!");
      }
    });
  };

  return (
    <div className="space-y-8">
      {draftFound && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <Save className="h-4 w-4 shrink-0" />
          <span className="flex-1">Draft restored from your last session.</span>
          <button
            onClick={() => { clearPersistence(); dismissDraftNotice(); }}
            className="font-bold underline hover:no-underline"
          >
            Clear draft
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <Calculator className="h-5 w-5 text-emerald-600" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
          Loan Calculator
        </h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Loan Amount (PHP)
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
                    Available: ₱{Number(product.min_amount).toLocaleString()} -
                    ₱{Number(product.max_amount).toLocaleString()}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="term_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Term (Months)
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
                      Frequency
                    </FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 text-xl font-bold font-display focus:border-emerald-500 focus:ring-emerald-500/20">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          product.allowed_frequencies || [
                            RepaymentFrequency.monthly,
                          ]
                        ).map((freq: RepaymentFrequency) => {
                          const labels: Record<RepaymentFrequency, string> = {
                            [RepaymentFrequency.weekly]: "Weekly",
                            [RepaymentFrequency.bi_weekly]: "Bi-weekly",
                            [RepaymentFrequency.monthly]: "Monthly",
                          };
                          return (
                            <SelectItem key={freq} value={freq}>
                              {labels[freq]}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
          </div>

          <div className="space-y-6">
            <div className="relative space-y-6 overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
              <div className="absolute right-0 top-0 p-4">
                <div className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">
                  Tier-Aligned Quote
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Estimated{" "}
                  {watchFrequency === RepaymentFrequency.weekly
                    ? "Weekly"
                    : watchFrequency === RepaymentFrequency.bi_weekly
                      ? "Bi-weekly"
                      : "Monthly"}{" "}
                  Payment
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-bold text-emerald-400">
                    PHP{" "}
                    {calculation.monthly.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm text-slate-500 italic">
                    /{" "}
                    {watchFrequency === RepaymentFrequency.weekly
                      ? "week"
                      : watchFrequency === RepaymentFrequency.bi_weekly
                        ? "2 weeks"
                        : "month"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Principal
                  </p>
                  <p className="text-sm font-bold">
                    ₱{Number(watchAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Interest ({product.interest_rate_percent}%)
                  </p>
                  <p className="text-sm font-bold text-emerald-400">
                    +₱{calculation.interest.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Service Fee
                  </p>
                  <p className="text-sm font-bold text-amber-400">
                    +₱{calculation.fees.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                    Total Payable
                  </p>
                  <p className="text-lg font-black text-white">
                    ₱{calculation.total.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
                    <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Terms & Conditions</p>
                    <p>
                      <strong className="text-white">Penalty Policy:</strong>{" "}
                      {getPenaltyPolicyCopy()}
                    </p>
                    <p>
                      <strong className="text-white">Compassion Support:</strong>{" "}
                      {getCompassionPolicyCopy()}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 text-[11px] text-slate-400 space-y-1.5">
                  <p>• <strong className="text-white">Repayment Obligation:</strong> You agree to repay the full amount plus interest per the selected schedule. Missed payments accrue penalty fees.</p>
                  <p>• <strong className="text-white">Default Consequences:</strong> Defaulting may result in guarantor enforcement, membership suspension, credit score downgrade, and referral to a third-party collection agency.</p>
                  <p>• <strong className="text-white">Early Settlement:</strong> Full early payment qualifies for a 100% interest waiver on remaining term. Partial prepayment is subject to re-computation.</p>
                  <p>• <strong className="text-white">Data Privacy:</strong> Your personal and financial data will be processed solely for loan evaluation, credit reporting, and regulatory compliance per the Data Privacy Act.</p>
                  <p>• All loan decisions are subject to tenant approval and credit evaluation. Terms may be updated with prior notice.</p>
                </div>
              </div>
            </div>

            <Button
              disabled={isPending}
              type="submit"
              className="group relative flex h-20 w-full items-center justify-center gap-3 overflow-hidden rounded-[2rem] bg-emerald-600 text-xl font-black italic tracking-tight text-white transition-all hover:bg-emerald-700 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/10 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 uppercase">
                Submit Application
              </span>
              <ArrowRightCircle className="relative z-10 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
