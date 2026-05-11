"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitMockRepayment } from "@/actions/loan-servicing";
import { payLoanWithWallet } from "@/actions/wallet-actions";
import { requestCompassionAction } from "@/actions/compassion-actions";
import { submitContextualFeedback } from "@/actions/transactional-feedback";
import {
  CreditCard,
  ReceiptText,
  Send,
  Clock3,
  Wallet,
  Loader2,
  HeartPulse,
  ShieldAlert,
  Star,
} from "lucide-react";
import {
  getCompassionPolicyCopy,
  getPenaltyPolicyCopy,
} from "@/lib/microfinance-policy";

type PaymentMethodOption = {
  method_id: number;
  provider_name: string;
};

type MoneyLike = number | string | { toString(): string };

type LoanScheduleItem = {
  schedule_id: number;
  status: "pending" | "overdue" | "paid";
  total_due: MoneyLike;
};

type LoanPaymentItem = {
  payment_id: number;
  amount_paid: MoneyLike;
  payment_reference: string;
  status: string;
  payment_method?: {
    provider_name?: string | null;
  } | null;
};

type LoanProductInfo = {
  name?: string | null;
};

type ServicingLoan = {
  loan_id: number;
  loan_reference: string;
  balance_remaining: MoneyLike;
  is_recovery_loan?: boolean | null;
  product?: LoanProductInfo | null;
  compassion_actions: {
    action_id: number;
    action_type: "grace_period" | "term_extension" | "penalty_freeze";
    status: "pending" | "approved" | "rejected";
    reason: string;
    requested_at: string | Date;
    admin_notes?: string | null;
    approved_at?: string | Date | null;
  }[];
  schedules: LoanScheduleItem[];
  payments: LoanPaymentItem[];
};

export function LoanServicingTab({
  loans,
  paymentMethods,
}: {
  loans: ServicingLoan[];
  paymentMethods: PaymentMethodOption[];
}) {
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  if (loans.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center text-slate-400">
        You don't have any active loan to repay yet.
      </div>
    );
  }

  const filteredLoans = loans.filter((loan) => {
    if (productFilter === "all") return true;
    return String(loan.loan_id) === productFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / pageSize));
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Loan View
          </p>
          <p className="text-sm text-slate-500">
            Select the loan you want to view when there are multiple active
            repayments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[280px] rounded-xl bg-white">
              <SelectValue placeholder="Filter by loan product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All active loans</SelectItem>
              {loans.map((loan) => (
                <SelectItem key={loan.loan_id} value={String(loan.loan_id)}>
                  {loan.product?.name} · {loan.loan_reference}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {paginatedLoans.map((loan) => (
        <LoanServicingCard
          key={loan.loan_id}
          loan={loan}
          paymentMethods={paymentMethods}
        />
      ))}

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-100 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-700">
            {filteredLoans.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredLoans.length)}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-700">
            {filteredLoans.length}
          </span>{" "}
          active loans
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="rounded-xl"
          >
            Previous
          </Button>
          <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            className="rounded-xl"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoanServicingCard({
  loan,
  paymentMethods,
}: {
  loan: ServicingLoan;
  paymentMethods: PaymentMethodOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [methodId, setMethodId] = useState("");
  const [reference, setReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [compassionOpen, setCompassionOpen] = useState(false);
  const [compassionType, setCompassionType] = useState<
    "grace_period" | "term_extension" | "penalty_freeze"
  >("grace_period");
  const [compassionReason, setCompassionReason] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const nextSchedule = useMemo(
    () =>
      loan.schedules.find(
        (schedule) =>
          schedule.status === "pending" || schedule.status === "overdue",
      ),
    [loan.schedules],
  );

  const suggestedAmount = nextSchedule
    ? Number(nextSchedule.total_due)
    : Number(loan.balance_remaining);
  const latestCompassion = loan.compassion_actions?.[0] || null;

  const getCompassionLabel = (type: string) => {
    if (type === "grace_period") return "Grace Period";
    if (type === "term_extension") return "Term Extension";
    return "Penalty Freeze";
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await submitMockRepayment({
        loanId: loan.loan_id,
        methodId: Number(methodId),
        amount: Number(amount),
        reference,
        receiptUrl,
        notes,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(res.success);
      setOpen(false);
      setAmount("");
      setMethodId("");
      setReference("");
      setReceiptUrl("");
      setNotes("");
      router.refresh();

      setTimeout(() => {
        setFeedbackOpen(true);
      }, 500);
    });
  };

  const handleWalletPayment = () => {
    startTransition(async () => {
      const res = await payLoanWithWallet(loan.loan_id, suggestedAmount);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        router.refresh();
        setTimeout(() => {
          setFeedbackOpen(true);
        }, 500);
      }
    });
  };

  const handleCompassionRequest = () => {
    startTransition(async () => {
      const res = await requestCompassionAction({
        loan_id: loan.loan_id,
        action_type: compassionType,
        reason: compassionReason,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Your compassion request has been submitted for review.");
      setCompassionOpen(false);
      setCompassionType("grace_period");
      setCompassionReason("");
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-display font-bold text-slate-900">
              {loan.product?.name}
            </h3>
            {loan.is_recovery_loan && (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600">
                Recovery Loan
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Loan Reference:{" "}
            <span className="font-mono">{loan.loan_reference}</span>
          </p>
          {loan.is_recovery_loan && (
            <p className="text-xs text-rose-600">
              This loan was created from the remaining balance after automatic default recovery.
            </p>
          )}
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Remaining Balance
          </p>
          <p className="text-3xl font-display font-bold text-emerald-600">
            ₱
            {Number(loan.balance_remaining).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Clock3 className="w-4 h-4" />}
          label="Next Due"
          value={
            nextSchedule
              ? `₱${Number(nextSchedule.total_due).toLocaleString()}`
              : "Fully paid soon"
          }
        />
        <MetricCard
          icon={<CreditCard className="w-4 h-4" />}
          label="Installments"
          value={`${loan.schedules.filter((s) => s.status === "paid").length}/${loan.schedules.length} paid`}
        />
        <MetricCard
          icon={<ReceiptText className="w-4 h-4" />}
          label="Repayment Status"
          value={
            loan.payments?.[0]?.status === "pending"
              ? "May pending verification"
              : "Ready for submission"
          }
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Mock Money Flow
        </p>
        <p className="text-sm text-slate-500">
          In this prototype, money is passed in real life through the tenant cashier, GCash transfer, bank transfer, or field collection. Here in Agapay, we record and verify the repayment to have clear records and a digital receipt.
        </p>
        <p className="text-sm text-slate-500">{getPenaltyPolicyCopy()}</p>
        <p className="text-sm text-slate-500">{getCompassionPolicyCopy()}</p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Compassion Support
            </p>
            <p className="text-sm text-slate-600">
              If you have a valid hardship case, you can request relief for this loan. Only one active request is allowed at a time.
            </p>
          </div>
          <Dialog open={compassionOpen} onOpenChange={setCompassionOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-2xl border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
              >
                <HeartPulse className="mr-2 h-4 w-4" />
                Request Compassion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Compassion Request</DialogTitle>
                <DialogDescription>
                  Describe the hardship case and choose the relief that fits your situation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Relief Type
                  </label>
                  <Select
                    value={compassionType}
                    onValueChange={(value) =>
                      setCompassionType(
                        value as
                          | "grace_period"
                          | "term_extension"
                          | "penalty_freeze",
                      )
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Choose relief type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grace_period">Grace Period</SelectItem>
                      <SelectItem value="term_extension">
                        Term Extension
                      </SelectItem>
                      <SelectItem value="penalty_freeze">
                        Penalty Freeze
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Reason for Hardship
                  </label>
                  <textarea
                    value={compassionReason}
                    onChange={(e) => setCompassionReason(e.target.value)}
                    placeholder="Describe the reason for the hardship case and why relief is needed."
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <Button
                  disabled={isPending || compassionReason.trim().length < 10}
                  onClick={handleCompassionRequest}
                  className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {latestCompassion ? (
          <div className="mt-4 rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Latest request:{" "}
                  {getCompassionLabel(latestCompassion.action_type)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(latestCompassion.requested_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                  latestCompassion.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : latestCompassion.status === "rejected"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {latestCompassion.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {latestCompassion.reason}
            </p>
            {latestCompassion.admin_notes && (
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Admin Response
                </p>
                <p className="text-sm text-slate-700">
                  {latestCompassion.admin_notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-blue-200 bg-white/80 px-4 py-3 text-sm text-slate-500">
            <ShieldAlert className="h-4 w-4 text-blue-500" />
            You haven't submitted a compassion request for this loan yet.
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setAmount(String(suggestedAmount));
            setOpen(true);
          }}
          className="rounded-2xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          Suggested installment: ₱{suggestedAmount.toLocaleString()}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send className="w-4 h-4 mr-2" />
            </Button>
          </DialogTrigger>

          <Button
            disabled={isPending || suggestedAmount <= 0}
            onClick={handleWalletPayment}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            Pay with Wallet
          </Button>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Repayment Submission</DialogTitle>
              <DialogDescription>
                Choose a payment channel and enter the reference provided by the tenant or the transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Amount
                </label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="5000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Payment Method
                </label>
                <Select value={methodId} onValueChange={setMethodId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem
                        key={method.method_id}
                        value={String(method.method_id)}
                      >
                        {method.provider_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Reference Number
                </label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="GCASH-123456 / OR-0001"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Proof URL (optional)
                </label>
                <Input
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Example: Paid to tenant cashier this morning."
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <Button
                disabled={
                  isPending || !amount || !methodId || !reference.trim()
                }
                onClick={handleSubmit}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Submit for Verification
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>How is your repayment?</DialogTitle>
              <DialogDescription>
                As part of the Ka-Agapay system, your feedback is valuable in improving our community lending.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2 text-center flex flex-col items-center">
                <label className="text-sm font-bold text-slate-700">
                  Experience Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`transition-colors ${
                        star <= feedbackRating
                          ? "text-amber-500"
                          : "text-slate-200 hover:text-amber-300"
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="E.g., The process was easy, but..."
                  className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <Button
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await submitContextualFeedback({
                      category: "Loan Repayment",
                      message: `Rating: ${feedbackRating}/5\nNotes: ${feedbackMessage}`,
                      subject: "Repayment Experience Survey",
                    });
                    setFeedbackOpen(false);
                    toast.success(
                      "Thank you! Your feedback has been sent.",
                    );
                  });
                }}
                className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                Submit Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Recent Repayment Activity
        </p>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {loan.payments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No repayments submitted yet.
            </p>
          ) : (
            loan.payments.map((payment) => (
              <div
                key={payment.payment_id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {payment.payment_method?.provider_name || "Payment"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {payment.payment_reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    ₱{Number(payment.amount_paid).toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    {payment.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
