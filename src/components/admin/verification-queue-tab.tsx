"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  UserCheck,
  Fingerprint,
  Calendar,
  Wallet,
  Send,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
import {
  approveLoanApplication,
  rejectLoanApplication,
  releaseLoanFunds,
  verifySubmittedPayment,
  rejectSubmittedPayment,
} from "@/actions/loan-servicing";
import { manuallyDeclareDefault } from "@/actions/admin-actions";
import { useRouter } from "next/navigation";

interface VerificationQueueTabProps {
  data: {
    loans: any[];
    verifications: any[];
    approvedLoans?: any[];
    pendingPayments?: any[];
    recoveryLoans?: any[];
    overdueLoans?: any[];
  };
}

export function VerificationQueueTab({ data }: VerificationQueueTabProps) {
  const {
    loans,
    verifications,
    approvedLoans = [],
    pendingPayments = [],
    recoveryLoans = [],
    overdueLoans = [],
  } = data;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <PendingLoansSection loans={loans} />
      <ReleaseQueueSection loans={approvedLoans} />
      <PendingPaymentsSection payments={pendingPayments} />
      <OverdueLoansSection loans={overdueLoans} />
      <RecoveryLoansSection loans={recoveryLoans} />
      <IdentityVerificationSection verifications={verifications} />
    </div>
  );
}

function PendingLoansSection({ loans }: { loans: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = (loanId: number) => {
    startTransition(async () => {
      const res = await approveLoanApplication({ loanId });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  const handleReject = (loanId: number) => {
    startTransition(async () => {
      const res = await rejectLoanApplication({
        loanId,
        notes: "Needs manual reassessment.",
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Wallet className="w-5 h-5" />}
        title="Mga Loan Application"
        count={loans.length}
        accent="indigo"
      />
      <div className="space-y-4">
        {loans.length === 0 ? (
          <EmptyState message="Walang nakabinbing loan applications." />
        ) : (
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {loans.map((loan: any) => (
              <div
                key={loan.loan_id}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <ApplicantSummary
                    firstName={loan.user?.profile?.first_name}
                    lastName={loan.user?.profile?.last_name}
                    subtitle={loan.product?.name}
                  />
                  <AmountSummary
                    amount={Number(loan.principal_amount)}
                    caption={`${loan.term_months} buwan`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(loan.applied_at), "MMM d, yyyy")}
                  </div>
                  <span className="uppercase tracking-widest">
                    {loan.loan_reference}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    disabled={isPending}
                    onClick={() => handleApprove(loan.loan_id)}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    disabled={isPending}
                    variant="outline"
                    onClick={() => handleReject(loan.loan_id)}
                    className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReleaseQueueSection({ loans }: { loans: any[] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Send className="w-5 h-5" />}
        title="Mock Fund Release"
        count={loans.length}
        accent="emerald"
      />
      <div className="space-y-4">
        {loans.length === 0 ? (
          <EmptyState message="Walang approved loans na handa para i-release." />
        ) : (
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {loans.map((loan: any) => (
              <ReleaseLoanCard key={loan.loan_id} loan={loan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PendingPaymentsSection({ payments }: { payments: any[] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<BadgeCheck className="w-5 h-5" />}
        title="Repayment Verification"
        count={payments.length}
        accent="amber"
      />
      <div className="space-y-4">
        {payments.length === 0 ? (
          <EmptyState message="Walang repayment submissions na naghihintay ng verification." />
        ) : (
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {payments.map((payment: any) => (
              <ReviewPaymentCard key={payment.payment_id} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecoveryLoansSection({ loans }: { loans: any[] }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<ShieldAlert className="w-5 h-5" />}
        title="Recovery Loans"
        count={loans.length}
        accent="rose"
      />
      <div className="space-y-4">
        {loans.length === 0 ? (
          <EmptyState message="Walang aktibong recovery loans sa kasalukuyan." />
        ) : (
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {loans.map((loan: any) => (
              <div
                key={loan.loan_id}
                className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <ApplicantSummary
                    firstName={loan.user?.profile?.first_name}
                    lastName={loan.user?.profile?.last_name}
                    subtitle={`Parent: ${loan.recovery_parent?.loan_reference || "N/A"}`}
                  />
                  <AmountSummary
                    amount={Number(loan.balance_remaining)}
                    caption="Natitirang recovery"
                  />
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <p className="font-medium text-rose-600 uppercase tracking-widest">
                    Recovery Loan
                  </p>
                  <p>
                    Reference:{" "}
                    <span className="font-mono text-slate-700">
                      {loan.loan_reference}
                    </span>
                  </p>
                  <p>
                    Borrower: {loan.user?.profile?.first_name}{" "}
                    {loan.user?.profile?.last_name}
                  </p>
                  <p>
                    Source default:{" "}
                    <span className="font-mono text-slate-700">
                      {loan.recovery_parent?.loan_reference || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IdentityVerificationSection({
  verifications,
}: {
  verifications: any[];
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Fingerprint className="w-5 h-5" />}
        title="Identity Verification"
        count={verifications.length}
        accent="slate"
      />
      <div className="space-y-4">
        {verifications.length === 0 ? (
          <EmptyState message="Walang nakabinbing identity checks." />
        ) : (
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {verifications.map((user: any) => (
              <div
                key={user.user_id}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <ApplicantSummary
                    firstName={user.profile?.first_name}
                    lastName={user.profile?.last_name}
                    subtitle={`${user.documents.length} file(s) uploaded`}
                  />
                  <button className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReleaseLoanCard({ loan }: { loan: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [methodId, setMethodId] = useState<string>("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRelease = () => {
    startTransition(async () => {
      const res = await releaseLoanFunds({
        loanId: loan.loan_id,
        methodId: Number(methodId),
        releaseReference: reference,
        notes,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(res.success);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <ApplicantSummary
          firstName={loan.user?.profile?.first_name}
          lastName={loan.user?.profile?.last_name}
          subtitle={`${loan.product?.name} • ${loan.tenant?.name}`}
        />
        <AmountSummary
          amount={Number(loan.total_payable)}
          caption="Kabuuang babayaran"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-xl bg-slate-900 hover:bg-emerald-600 text-white">
            I-release ang Mock Funds
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mock Fund Release</DialogTitle>
            <DialogDescription>
              Itala kung paano matatanggap ng miyembro ang pera sa tunay na
              buhay.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Release Method
              </label>
              <Select value={methodId} onValueChange={setMethodId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Pumili ng release method" />
                </SelectTrigger>
                <SelectContent>
                  {loan.tenant?.payment_methods?.map((method: any) => (
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
                placeholder="GCASH-REF-001 / CASH-RELEASE-001"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Halimbawa: Over-the-counter cash release sa branch."
                className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <Button
              disabled={isPending || !methodId || !reference.trim()}
              onClick={handleRelease}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Release
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewPaymentCard({ payment }: { payment: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    startTransition(async () => {
      const res = await verifySubmittedPayment({
        paymentId: payment.payment_id,
        notes: "Verified by admin in mock flow.",
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectSubmittedPayment({
        paymentId: payment.payment_id,
        notes: "Reference mismatch. Please resubmit proof.",
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <ApplicantSummary
          firstName={payment.loan?.user?.profile?.first_name}
          lastName={payment.loan?.user?.profile?.last_name}
          subtitle={`${payment.payment_method?.provider_name} • ${payment.loan?.product?.name}`}
        />
        <AmountSummary
          amount={Number(payment.amount_paid)}
          caption={payment.payment_reference}
        />
      </div>
      <div className="space-y-1 text-xs text-slate-500 mb-4">
        <p>
          Submitted:{" "}
          {format(new Date(payment.submitted_at), "MMM d, yyyy h:mm a")}
        </p>
        {payment.receipt_url && (
          <a
            href={payment.receipt_url}
            target="_blank"
            className="text-emerald-600 underline"
          >
            Tingnan ang proof / receipt
          </a>
        )}
        {payment.notes && <p>Notes: {payment.notes}</p>}
      </div>
      <div className="flex gap-3">
        <Button
          disabled={isPending}
          onClick={handleVerify}
          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Verify
        </Button>
        <Button
          disabled={isPending}
          variant="outline"
          onClick={handleReject}
          className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  accent: "indigo" | "amber" | "slate" | "emerald" | "rose";
}) {
  const accentMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 bg-indigo-500",
    amber: "bg-amber-500/10 text-amber-600 bg-amber-500",
    slate: "bg-slate-500/10 text-slate-600 bg-slate-500",
    emerald: "bg-emerald-500/10 text-emerald-600 bg-emerald-500",
    rose: "bg-rose-500/10 text-rose-600 bg-rose-500",
  }[accent];

  const [chipBg, chipText, badgeBg] = accentMap.split(" ");

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-2xl ${chipBg} flex items-center justify-center ${chipText}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 italic">
        {title}
      </h3>
      <span
        className={`${badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}
      >
        {count}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] text-slate-400">
      <p className="font-medium">{message}</p>
    </div>
  );
}

function ApplicantSummary({
  firstName,
  lastName,
  subtitle,
}: {
  firstName?: string;
  lastName?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
        {firstName?.[0]}
        {lastName?.[0]}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 line-clamp-1">
          {firstName} {lastName}
        </p>
        <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function AmountSummary({
  amount,
  caption,
}: {
  amount: number;
  caption: string;
}) {
  return (
    <div className="text-right">
      <p className="text-sm font-bold text-emerald-600">
        ₱{amount.toLocaleString()}
      </p>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
        {caption}
      </p>
    </div>
  );
}

function OverdueLoansSection({ loans }: { loans: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEnforceDefault = (loanId: number) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Sigurado ka bang i-enforce ang default? Kakaltasan ang mga guarantors.",
      )
    )
      return;

    startTransition(async () => {
      const res = await manuallyDeclareDefault(loanId);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<ShieldAlert className="w-5 h-5" />}
        title="Overdue (At Risk)"
        count={loans.length}
        accent="rose"
      />
      <div className="space-y-4">
        {loans.length === 0 ? (
          <EmptyState message="Walang overdue loans na naghihintay ng enforcement." />
        ) : (
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {loans.map((loan: any) => (
              <div
                key={loan.loan_id}
                className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <ApplicantSummary
                    firstName={loan.user?.profile?.first_name}
                    lastName={loan.user?.profile?.last_name}
                    subtitle={loan.product?.name}
                  />
                  <AmountSummary
                    amount={Number(loan.balance_remaining)}
                    caption="Natitirang balanseng"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    disabled={isPending}
                    onClick={() => handleEnforceDefault(loan.loan_id)}
                    className="w-full rounded-xl bg-slate-900 hover:bg-rose-600 text-white"
                  >
                    {isPending ? "Processing..." : "Enforce Default Protocol"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
