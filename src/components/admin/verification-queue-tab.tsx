"use client";

import React, { useState, useTransition } from "react";
import {
  BadgeCheck,
  Calendar,
  Fingerprint,
  Send,
  ShieldAlert,
  UserCheck,
  Wallet,
  ShieldCheck,
  MoreVertical,
  UserCog,
  Mail,
  UserMinus,
  Ban,
  Slash,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogFooter,
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
  rejectSubmittedPayment,
  verifySubmittedPayment,
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

type QueueKey = "loans" | "release" | "payments" | "identity" | "delinquent";

const QUEUE_TABS: Array<{
  key: QueueKey;
  label: string;
  description: string;
  color: string;
}> = [
  {
    key: "loans",
    label: "Loan Applications",
    description:
      "Applicant, scores, product, value, cadence, purpose, and reference.",
    color: "border-indigo-300 text-indigo-700 bg-indigo-50",
  },
  {
    key: "release",
    label: "Fund Releases",
    description: "Approved loans awaiting release method, date, and reference.",
    color: "border-emerald-300 text-emerald-700 bg-emerald-50",
  },
  {
    key: "payments",
    label: "Payment Verification",
    description:
      "Installment proofs, references, receipts, and verification actions.",
    color: "border-amber-300 text-amber-700 bg-amber-50",
  },
  {
    key: "identity",
    label: "Identity Verification",
    description: "Membership code, uploaded IDs, and verification status.",
    color: "border-sky-300 text-sky-700 bg-sky-50",
  },
  {
    key: "delinquent",
    label: "Delinquent / Compassion",
    description:
      "Overdue loans, recovery loans, and default handling readiness.",
    color: "border-rose-300 text-rose-700 bg-rose-50",
  },
];

export function VerificationQueueTab({ data }: VerificationQueueTabProps) {
  const {
    loans,
    verifications,
    approvedLoans = [],
    pendingPayments = [],
    recoveryLoans = [],
    overdueLoans = [],
  } = data;

  const [activeQueue, setActiveQueue] = useState<QueueKey>("loans");

  const counts: Record<QueueKey, number> = {
    loans: loans.length,
    release: approvedLoans.length,
    payments: pendingPayments.length,
    identity: verifications.length,
    delinquent: overdueLoans.length + recoveryLoans.length,
  };

  const activeMeta = QUEUE_TABS.find((tab) => tab.key === activeQueue);

  return (
    <div className="space-y-4">
      <div className="dashboard-card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Tenant Operator
            </p>
            <h2 className="text-xl font-display font-bold italic text-slate-950">
              Approvals & Queue
            </h2>
            <p className="text-sm text-slate-500">
              Unified review board for loan applications, fund releases, payment
              verification, identity checks, and compassion handling.
            </p>
          </div>

          <div className="dashboard-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Active Queue
            </p>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900">
                  {activeMeta?.label}
                </span>
                <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-black text-white">
                  {activeMeta ? counts[activeMeta.key] : 0}
                </span>
              </div>
              <p className="max-w-xs text-xs text-slate-500">
                {activeMeta?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUEUE_TABS.map((tab) => {
            const isActive = activeQueue === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveQueue(tab.key)}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? `${tab.color} shadow-sm`
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                {counts[tab.key] > 0 ? (
                  <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-black text-white">
                    {counts[tab.key]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeQueue === "loans" && <PendingLoansSection loans={loans} />}
        {activeQueue === "release" && (
          <ReleaseQueueSection loans={approvedLoans} />
        )}
        {activeQueue === "payments" && (
          <PendingPaymentsSection payments={pendingPayments} />
        )}
        {activeQueue === "identity" && (
          <IdentityVerificationSection verifications={verifications} />
        )}
        {activeQueue === "delinquent" && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <OverdueLoansSection loans={overdueLoans} />
            <RecoveryLoansSection loans={recoveryLoans} />
          </div>
        )}
      </div>
    </div>
  );
}

function PendingLoansSection({ loans }: { loans: any[] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (loanId: number) => {
    setProcessingId(loanId);
    startTransition(async () => {
      try {
        const res = await approveLoanApplication({ loanId }) as any;
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          router.refresh();
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  const handleReject = (loanId: number) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setProcessingId(loanId);
    startTransition(async () => {
      try {
        const res = await rejectLoanApplication({
          loanId,
          notes: rejectReason.trim(),
        }) as any;

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          setRejectingId(null);
          setRejectReason("");
          router.refresh();
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <QueueSection
      icon={<Wallet className="h-5 w-5" />}
      title="Loan Applications"
      description="Rejected, pending, and approved applications with borrower scores and loan intent."
      count={loans.length}
      accent="indigo"
      emptyMessage="No loan applications are waiting for operator review."
    >
      {loans.map((loan: any) => (
        <QueueCard
          key={loan.loan_id}
          accent="indigo"
          summary={
            <ApplicantSummary
              firstName={loan.user?.profile?.first_name}
              lastName={loan.user?.profile?.last_name}
              subtitle={loan.product?.name}
              photoUrl={loan.user?.profile?.photo_url}
            />
          }
          amount={
            <AmountSummary
              amount={Number(loan.principal_amount)}
              caption={`${loan.term_months} buwan`}
            />
          }
          sideAction={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Options</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  <span>View Full Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                  <Fingerprint className="h-4 w-4 text-sky-500" />
                  <span>Check Verification Status</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50" onClick={() => setRejectingId(loan.loan_id)}>
                  <Ban className="h-4 w-4" />
                  <span>Reject Application</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          meta={[
            {
              label: "Trust Score",
              value: String(loan.user?.trust_score ?? "Pending"),
            },
            {
              label: "Cadence / Term",
              value: `${loan.repayment_frequency?.replaceAll("_", " ") || "Not set"} / ${loan.term_months} mo`,
            },
            {
              label: "Applied",
              value: format(new Date(loan.applied_at), "MMM d, yyyy"),
            },
            { label: "Reference", value: loan.loan_reference },
            { label: "Purpose", value: loan.purpose || "No note" },
          ]}
          actions={
            <>
              <Button
                disabled={isPending && processingId === loan.loan_id}
                onClick={() => handleApprove(loan.loan_id)}
                className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending && processingId === loan.loan_id ? "Approving..." : "Approve"}
              </Button>
              {rejectingId === loan.loan_id ? (
                <div className="flex flex-col gap-2 w-full">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full text-sm p-2 border border-rose-200 rounded-xl resize-none h-20 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <div className="flex gap-2">
                    <Button
                      disabled={isPending && processingId === loan.loan_id}
                      onClick={() => handleReject(loan.loan_id)}
                      className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {isPending && processingId === loan.loan_id ? "Rejecting..." : "Confirm Reject"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isPending}
                      onClick={() => { setRejectingId(null); setRejectReason(""); }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  disabled={isPending && processingId === loan.loan_id}
                  variant="outline"
                  onClick={() => setRejectingId(loan.loan_id)}
                  className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Reject
                </Button>
              )}
            </>
          }
        />
      ))}
    </QueueSection>
  );
}

function ReleaseQueueSection({ loans }: { loans: any[] }) {
  return (
    <QueueSection
      icon={<Send className="h-5 w-5" />}
      title="Fund Releases"
      description="Approved loans awaiting release method, scheduled release, and reference recording."
      count={loans.length}
      accent="emerald"
      emptyMessage="No approved loans are waiting for fund release."
    >
      {loans.map((loan: any) => (
        <ReleaseLoanCard key={loan.loan_id} loan={loan} />
      ))}
    </QueueSection>
  );
}

function PendingPaymentsSection({ payments }: { payments: any[] }) {
  return (
    <QueueSection
      icon={<BadgeCheck className="h-5 w-5" />}
      title="Payment Verification"
      description="Submitted installment or full-payment proofs waiting for approval or rejection."
      count={payments.length}
      accent="amber"
      emptyMessage="No payment proofs are waiting for verification."
    >
      {payments.map((payment: any) => (
        <ReviewPaymentCard key={payment.payment_id} payment={payment} />
      ))}
    </QueueSection>
  );
}

function RecoveryLoansSection({ loans }: { loans: any[] }) {
  return (
    <QueueSection
      icon={<ShieldAlert className="h-5 w-5" />}
      title="Compassion / Recovery Loans"
      description="Loans already routed into recovery or compassion handling."
      count={loans.length}
      accent="rose"
      emptyMessage="No recovery loans are active right now."
    >
      {loans.map((loan: any) => (
        <QueueCard
          key={loan.loan_id}
          accent="rose"
          summary={
            <ApplicantSummary
              firstName={loan.user?.profile?.first_name}
              lastName={loan.user?.profile?.last_name}
              subtitle={loan.product?.name}
              photoUrl={loan.user?.profile?.photo_url}
            />
          }
          amount={
            <AmountSummary
              amount={Number(loan.balance_remaining)}
              caption="Natitirang balanse"
            />
          }
          meta={[
            { label: "Type", value: "Recovery Loan" },
            { label: "Reference", value: loan.loan_reference },
            {
              label: "Parent",
              value: loan.recovery_parent?.loan_reference || "Unknown",
            },
          ]}
        />
      ))}
    </QueueSection>
  );
}

function IdentityVerificationSection({
  verifications,
}: {
  verifications: any[];
}) {
  return (
    <QueueSection
      icon={<Fingerprint className="h-5 w-5" />}
      title="Identity Verification"
      description="New member identity bundles with membership code, uploaded IDs, and review status."
      count={verifications.length}
      accent="slate"
      emptyMessage="No identity checks are waiting for review."
    >
      {verifications.map((user: any) => (
        <IdentityCard key={user.user_id} user={user} />
      ))}
    </QueueSection>
  );
}

function IdentityCard({ user }: { user: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      const { approveIdentityVerification } = await import("@/actions/identity");
      const res = await approveIdentityVerification(user.user_id) as any;
      if (res.error) toast.error(res.error);
      else { toast.success(res.success); router.refresh(); }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const { rejectIdentityVerification } = await import("@/actions/identity");
      const res = await rejectIdentityVerification(user.user_id, rejectReason.trim()) as any;
      if (res.error) toast.error(res.error);
      else { toast.success(res.success); setRejectOpen(false); setRejectReason(""); router.refresh(); }
    });
  };

  return (
    <QueueCard
      accent="slate"
      summary={
        <ApplicantSummary
          firstName={user.profile?.first_name}
          lastName={user.profile?.last_name}
          subtitle={user.member_code || "Membership code pending"}
          photoUrl={user.profile?.photo_url}
        />
      }
      meta={[
        { label: "Uploaded IDs", value: `${user.documents.length} file(s)` },
        { label: "Status", value: user.status?.replaceAll("_", " ") || "pending" },
        {
          label: "Monthly Income",
          value: user.profile?.income_min && user.profile?.income_max 
            ? `₱${Number(user.profile.income_min).toLocaleString()} - ₱${Number(user.profile.income_max).toLocaleString()}`
            : "N/A"
        },
        { label: "Tenant", value: user.tenant?.name || "Current tenant" },
      ]}
      extra={
        user.documents.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {user.documents.map((doc: any) => (
              <a
                key={doc.document_id}
                href={doc.file_url}
                target="_blank"
                className="text-xs text-sky-600 underline hover:text-sky-800"
              >
                {doc.document_type?.replaceAll("_", " ") || "Document"}
              </a>
            ))}
          </div>
        ) : null
      }
      actions={
        <>
          <Button
            disabled={isPending}
            onClick={handleApprove}
            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? "Processing..." : "Approve"}
          </Button>
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isPending}
                variant="outline"
                className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Reject Identity Verification</DialogTitle>
                <DialogDescription>
                  Provide a reason — this will be sent to the member so they can resubmit.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., ID is blurry, barangay certificate missing..."
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <div className="flex gap-2">
                  <Button
                    disabled={isPending}
                    onClick={handleReject}
                    className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                  >
                    {isPending ? "Rejecting..." : "Confirm Reject"}
                  </Button>
                  <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      }
    />
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
      }) as any;

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
    <QueueCard
      accent="emerald"
      summary={
        <ApplicantSummary
          firstName={loan.user?.profile?.first_name}
          lastName={loan.user?.profile?.last_name}
          subtitle={loan.product?.name}
          photoUrl={loan.user?.profile?.photo_url}
        />
      }
      amount={
        <AmountSummary
          amount={Number(loan.principal_amount || loan.total_payable)}
          caption="Approved value"
        />
      }
      meta={[
        {
          label: "Release Method",
          value: loan.release_method || "Not recorded",
        },
        {
          label: "Scheduled",
          value: loan.release_scheduled_at
            ? format(new Date(loan.release_scheduled_at), "MMM d, yyyy")
            : "Not scheduled",
        },
        { label: "Product", value: loan.product?.name || "N/A" },
        { label: "Reference", value: loan.loan_reference },
      ]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              I-release ang Mock Funds
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-2xl">
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
                <label className="text-sm font-bold text-slate-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Halimbawa: Over-the-counter cash release sa tenant."
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <Button
                disabled={isPending || !methodId || !reference.trim()}
                onClick={handleRelease}
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Release
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    />
  );
}

function ReviewPaymentCard({ payment }: { payment: any }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    setProcessingId(payment.payment_id);
    startTransition(async () => {
      try {
        const res = await verifySubmittedPayment({
          paymentId: payment.payment_id,
          notes: "Verified by admin in mock flow.",
        }) as any;
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          router.refresh();
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  const handleReject = () => {
    setProcessingId(payment.payment_id);
    startTransition(async () => {
      try {
        const res = await rejectSubmittedPayment({
          paymentId: payment.payment_id,
          notes: "Reference mismatch. Please resubmit proof.",
        }) as any;
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          router.refresh();
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <QueueCard
      accent="amber"
      summary={
        <ApplicantSummary
          firstName={payment.loan?.user?.profile?.first_name}
          lastName={payment.loan?.user?.profile?.last_name}
          subtitle={payment.loan?.product?.name}
          photoUrl={payment.loan?.user?.profile?.photo_url}
        />
      }
      amount={
        <AmountSummary
          amount={Number(payment.amount_paid)}
          caption={payment.payment_reference || "Reference pending"}
        />
      }
      meta={[
        {
          label: "Installment",
          value: String(
            payment.schedule?.installment_number ?? "Full / manual",
          ),
        },
        {
          label: "Submitted",
          value: format(new Date(payment.submitted_at), "MMM d, yyyy h:mm a"),
        },
        {
          label: "Method",
          value: payment.payment_method?.provider_name || "N/A",
        },
        { label: "Reference", value: payment.payment_reference },
      ]}
      extra={
        <div className="space-y-1 text-xs text-slate-500">
          {payment.receipt_url ? (
            <a
              href={payment.receipt_url}
              target="_blank"
              className="font-medium text-emerald-600 underline"
            >
              Tingnan ang proof / receipt
            </a>
          ) : null}
          {payment.notes ? <p>Notes: {payment.notes}</p> : null}
        </div>
      }
      actions={
        <>
          <Button
            disabled={isPending && processingId === payment.payment_id}
            onClick={handleVerify}
            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending && processingId === payment.payment_id ? "Verifying..." : "Verify"}
          </Button>
          <Button
            disabled={isPending && processingId === payment.payment_id}
            variant="outline"
            onClick={() => handleReject()}
            className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            {isPending && processingId === payment.payment_id ? "Rejecting..." : "Reject"}
          </Button>
        </>
      }
    />
  );
}

function OverdueLoansSection({ loans }: { loans: any[] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEnforceOpen, setIsEnforceOpen] = useState(false);
  const [enforceId, setEnforceId] = useState<number | null>(null);

  const handleEnforceDefault = (loanId: number) => {
    setEnforceId(loanId);
    setIsEnforceOpen(true);
  };

  const handleEnforceConfirm = () => {
    if (!enforceId) return;
    setProcessingId(enforceId);
    startTransition(async () => {
      try {
        const res = await manuallyDeclareDefault(enforceId) as any;
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          setIsEnforceOpen(false);
          setEnforceId(null);
          router.refresh();
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <QueueSection
      icon={<ShieldAlert className="h-5 w-5" />}
      title="Delinquent Loans"
      description="Overdue loans ready for default handling or compassion review."
      count={loans.length}
      accent="rose"
      emptyMessage="No delinquent loans are waiting for enforcement."
    >
      {loans.map((loan: any) => (
        <QueueCard
          key={loan.loan_id}
          accent="rose"
          summary={
            <ApplicantSummary
              firstName={loan.user?.profile?.first_name}
              lastName={loan.user?.profile?.last_name}
              subtitle={loan.product?.name}
              photoUrl={loan.user?.profile?.photo_url}
            />
          }
          amount={
            <AmountSummary
              amount={Number(loan.balance_remaining)}
              caption="Natitirang balanse"
            />
          }
          meta={[
            {
              label: "Penalty Count",
              value: String(loan.penalty_count ?? loan.penalties?.length ?? 0),
            },
            { label: "Product", value: loan.product?.name || "N/A" },
            { label: "Reference", value: loan.loan_reference },
            {
              label: "Status",
              value: loan.status?.replaceAll("_", " ") || "overdue",
            },
          ]}
          actions={
            <Button
              disabled={isPending && processingId === loan.loan_id}
              onClick={() => handleEnforceDefault(loan.loan_id)}
              className="w-full rounded-xl bg-primary italic font-black hover:bg-rose-700 transition-colors"
            >
              {isPending && processingId === loan.loan_id ? "Processing..." : "Enforce Default Protocol"}
            </Button>
          }
        />
      ))}
      
      {/* Enforce Default Confirmation Dialog */}
      <Dialog open={isEnforceOpen} onOpenChange={setIsEnforceOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              Enforce Default Protocol
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to enforce default for this loan? This will penalize both the borrower and their guarantors. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsEnforceOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
                variant="destructive" 
                className="rounded-xl"
                disabled={isPending}
                onClick={handleEnforceConfirm}
            >
              {isPending ? "Processing..." : "Confirm Default Enforcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </QueueSection>
  );
}

function QueueSection({
  icon,
  title,
  description,
  count,
  accent,
  emptyMessage,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  accent: "indigo" | "amber" | "slate" | "emerald" | "rose";
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
        count={count}
        accent={accent}
      />
      {count === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <QueueScroller>{children}</QueueScroller>
      )}
    </div>
  );
}

function QueueCard({
  accent,
  summary,
  amount,
  meta,
  actions,
  extra,
  sideAction,
}: {
  accent: "indigo" | "amber" | "slate" | "emerald" | "rose";
  summary: React.ReactNode;
  amount?: React.ReactNode;
  meta?: Array<{ label: string; value: string }>;
  actions?: React.ReactNode;
  extra?: React.ReactNode;
  sideAction?: React.ReactNode;
}) {
  const borderClass = {
    indigo: "border-indigo-100",
    amber: "border-amber-100",
    slate: "border-slate-200/70",
    emerald: "border-emerald-100",
    rose: "border-rose-100",
  }[accent];

  return (
    <div
      className={`rounded-[1.5rem] border ${borderClass} bg-white p-4 shadow-sm`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">{summary}</div>
        {amount ? <div className="shrink-0">{amount}</div> : null}
        {sideAction ? <div className="shrink-0">{sideAction}</div> : null}
      </div>
      {meta && meta.length > 0 ? <CompactMetaGrid items={meta} /> : null}
      {extra ? <div className="mt-3">{extra}</div> : null}
      {actions ? <div className="mt-4 flex gap-3">{actions}</div> : null}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  count,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${chipBg} ${chipText}`}
        >
          {icon}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-display font-bold italic text-slate-900">
              {title}
            </h3>
            <span
              className={`${badgeBg} rounded-full px-2 py-0.5 text-[10px] font-bold text-white`}
            >
              {count}
            </span>
          </div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
      <p className="font-medium">{message}</p>
    </div>
  );
}

function QueueScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2">
      {children}
    </div>
  );
}

function CompactMetaGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600 md:grid-cols-3">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {item.label}
          </p>
          <p className="line-clamp-2 font-medium text-slate-700">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ApplicantSummary({
  firstName,
  lastName,
  subtitle,
  photoUrl,
}: {
  firstName?: string;
  lastName?: string;
  subtitle?: string;
  photoUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt={firstName} 
          className="h-11 w-11 rounded-full object-cover border border-slate-100 shadow-sm" 
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-xs font-bold uppercase text-slate-500">
          {firstName?.[0]}
          {lastName?.[0]}
        </div>
      )}
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-bold text-slate-900">
          {firstName} {lastName}
        </p>
        <p className="line-clamp-1 text-[10px] font-medium text-slate-400">
          {subtitle}
        </p>
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
      <p className="text-sm font-bold text-primary">
        PHP {amount.toLocaleString()}
      </p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {caption}
      </p>
    </div>
  );
}
