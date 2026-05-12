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
import { submitMockRepayment, processFullPayment } from "@/actions/loan-servicing";
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
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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
  status?: string;
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

type LoanCategory = "on_track" | "overdue" | "defaulted";

function categorizeLoan(loan: ServicingLoan): LoanCategory {
  if (loan.status === "defaulted" || loan.is_recovery_loan) return "defaulted";
  const hasOverdue = loan.schedules.some((s) => s.status === "overdue");
  if (hasOverdue) return "overdue";
  return "on_track";
}

const categoryConfig: Record<LoanCategory, { label: string; icon: ReactNode; color: string; bg: string; border: string }> = {
  on_track: {
    label: "Active / On Track",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  overdue: {
    label: "Overdue",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  defaulted: {
    label: "Defaulted / Recovery",
    icon: <XCircle className="w-4 h-4" />,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

export function LoanServicingTab({
  loans,
  paymentMethods,
}: {
  loans: ServicingLoan[];
  paymentMethods: PaymentMethodOption[];
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categorized = useMemo(() => {
    const groups: Record<LoanCategory, ServicingLoan[]> = {
      on_track: [],
      overdue: [],
      defaulted: [],
    };
    for (const loan of loans) {
      const cat = categorizeLoan(loan);
      groups[cat].push(loan);
    }
    return groups;
  }, [loans]);

  if (loans.length === 0) {
    return (
      <div className="dashboard-card p-12 text-center text-slate-400">
        You don't have any loans yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(categorized) as [LoanCategory, ServicingLoan[]][]).map(([cat, catLoans]) => {
          const cfg = categoryConfig[cat];
          return (
            <div key={cat} className={`dashboard-card p-4 border-t-4 ${cfg.border} ${cfg.bg}/30`}>
              <div className={`flex items-center gap-2 mb-3 ${cfg.color}`}>
                {cfg.icon}
                <span className="text-xs font-bold uppercase tracking-widest">{cfg.label}</span>
                <span className="ml-auto text-xs font-bold">{catLoans.length}</span>
              </div>
              <div className="space-y-2">
                {catLoans.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No loans</p>
                ) : (
                  catLoans.map((loan) => (
                    <LoanSummaryCard
                      key={loan.loan_id}
                      loan={loan}
                      isExpanded={expandedId === loan.loan_id}
                      onToggle={() =>
                        setExpandedId(expandedId === loan.loan_id ? null : loan.loan_id)
                      }
                      paymentMethods={paymentMethods}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoanSummaryCard({
  loan,
  isExpanded,
  onToggle,
  paymentMethods,
}: {
  loan: ServicingLoan;
  isExpanded: boolean;
  onToggle: () => void;
  paymentMethods: PaymentMethodOption[];
}) {
  const category = categorizeLoan(loan);
  const cfg = categoryConfig[category];

  const nextDue = useMemo(
    () =>
      loan.schedules.find(
        (s) => s.status === "pending" || s.status === "overdue",
      ),
    [loan.schedules],
  );

  const paidSchedules = loan.schedules.filter((s) => s.status === "paid").length;
  const totalSchedules = loan.schedules.length;

  return (
    <div className={`rounded-xl border ${cfg.border} bg-white overflow-hidden transition-shadow hover:shadow-md`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            {loan.product?.name || "Loan"}
          </p>
          <p className="text-xs text-slate-500 font-mono truncate">
            {loan.loan_reference}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">
            ₱{Number(loan.balance_remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
            {category === "on_track" ? "Active" : category === "overdue" ? "Overdue" : "Defaulted"}
          </span>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard
              icon={<Clock3 className="w-3 h-3" />}
              label="Next Due"
              value={nextDue ? `₱${Number(nextDue.total_due).toLocaleString()}` : "Fully paid"}
            />
            <MetricCard
              icon={<CreditCard className="w-3 h-3" />}
              label="Installments"
              value={`${paidSchedules}/${totalSchedules}`}
            />
            <MetricCard
              icon={<ReceiptText className="w-3 h-3" />}
              label="Status"
              value={loan.status || "active"}
            />
          </div>

          {loan.schedules.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Schedule</p>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {loan.schedules.map((s) => (
                  <div key={s.schedule_id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                    <span className="text-slate-600">Installment #{s.schedule_id}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-900">
                        ₱{Number(s.total_due).toLocaleString()}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        s.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                        s.status === "overdue" ? "bg-rose-100 text-rose-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loan.payments.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Payments</p>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {loan.payments.map((p) => (
                  <div key={p.payment_id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                    <span className="text-slate-600 truncate">{p.payment_method?.provider_name || "Payment"}</span>
                    <span className="font-bold text-primary">₱{Number(p.amount_paid).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {category !== "defaulted" && (
            <LoanActions loan={loan} paymentMethods={paymentMethods} />
          )}

          {loan.compassion_actions.length > 0 && (
            <CompassionStatus loan={loan} />
          )}
        </div>
      )}
    </div>
  );
}

function LoanActions({
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
  const [fullPaymentOpen, setFullPaymentOpen] = useState(false);
  const [fullPaymentMethodId, setFullPaymentMethodId] = useState("");
  const [isPending, startTransition] = useTransition();

  const nextSchedule = useMemo(
    () =>
      loan.schedules.find(
        (s) => s.status === "pending" || s.status === "overdue",
      ),
    [loan.schedules],
  );

  const suggestedAmount = nextSchedule
    ? Number(nextSchedule.total_due)
    : Number(loan.balance_remaining);

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
      setTimeout(() => setFeedbackOpen(true), 500);
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
        setTimeout(() => setFeedbackOpen(true), 500);
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAmount(String(suggestedAmount));
            setOpen(true);
          }}
          className="rounded-xl text-xs border-primary/20 text-primary hover:bg-primary/10"
        >
          ₱{suggestedAmount.toLocaleString()} installment
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFullPaymentOpen(true)}
          className="rounded-xl text-xs border-violet-200 text-violet-700 hover:bg-violet-50"
        >
          Pay in Full
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || suggestedAmount <= 0}
          onClick={handleWalletPayment}
          className="rounded-xl text-xs bg-amber-500 hover:bg-amber-600 text-white border-none"
        >
          {isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wallet className="w-3 h-3 mr-1" />}
          Wallet
        </Button>

        {loan.compassion_actions.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompassionOpen(true)}
            className="rounded-xl text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <HeartPulse className="w-3 h-3 mr-1" />
            Compassion
          </Button>
        )}
      </div>

      <Dialog open={compassionOpen} onOpenChange={setCompassionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Compassion Request</DialogTitle>
            <DialogDescription>Describe the hardship case and choose the relief that fits your situation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Relief Type</label>
              <Select value={compassionType} onValueChange={(v) => setCompassionType(v as any)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose relief type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grace_period">Grace Period</SelectItem>
                  <SelectItem value="term_extension">Term Extension</SelectItem>
                  <SelectItem value="penalty_freeze">Penalty Freeze</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Reason for Hardship</label>
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

      <Dialog open={fullPaymentOpen} onOpenChange={setFullPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pay in Full</DialogTitle>
            <DialogDescription>Pay the remaining principal and have all remaining interest waived.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Remaining Balance</span>
                <span className="font-bold text-slate-900">
                  ₱{Number(loan.balance_remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Payment Method</label>
              <Select value={fullPaymentMethodId} onValueChange={setFullPaymentMethodId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a channel" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.method_id} value={String(method.method_id)}>
                      {method.provider_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={isPending || !fullPaymentMethodId}
              onClick={() => {
                startTransition(async () => {
                  const res = await processFullPayment({
                    loanId: loan.loan_id,
                    methodId: Number(fullPaymentMethodId),
                  });
                  if (res.error) { toast.error(res.error); return; }
                  toast.success(res.success);
                  setFullPaymentOpen(false);
                  setFullPaymentMethodId("");
                  router.refresh();
                });
              }}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Full Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Repayment Submission</DialogTitle>
            <DialogDescription>Choose a payment channel and enter the reference.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Amount</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Payment Method</label>
              <Select value={methodId} onValueChange={setMethodId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a channel" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.method_id} value={String(method.method_id)}>
                      {method.provider_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Reference Number</label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="GCASH-123456 / OR-0001"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Proof URL (optional)</label>
              <Input
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Example: Paid to tenant cashier this morning."
                className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <Button
              disabled={isPending || !amount || !methodId || !reference.trim()}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
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
            <DialogDescription>Your feedback is valuable in improving our community lending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2 text-center flex flex-col items-center">
              <label className="text-sm font-bold text-slate-700">Experience Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className={`transition-colors ${star <= feedbackRating ? "text-amber-500" : "text-slate-200 hover:text-amber-300"}`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Additional Comments (Optional)</label>
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
                  toast.success("Thank you! Your feedback has been sent.");
                });
              }}
              className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompassionStatus({ loan }: { loan: ServicingLoan }) {
  const latest = loan.compassion_actions[0];
  if (!latest) return null;
  const label = latest.action_type === "grace_period" ? "Grace Period"
    : latest.action_type === "term_extension" ? "Term Extension"
    : "Penalty Freeze";
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-blue-700">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
          latest.status === "approved" ? "bg-emerald-100 text-emerald-700"
          : latest.status === "rejected" ? "bg-rose-100 text-rose-700"
          : "bg-amber-100 text-amber-700"
        }`}>
          {latest.status}
        </span>
      </div>
      <p className="text-xs text-slate-600">{latest.reason}</p>
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
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-bold text-slate-900">{value}</p>
    </div>
  );
}
