"use client";

import { useMemo, useState, useTransition } from "react";
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
import { CreditCard, ReceiptText, Send, Clock3 } from "lucide-react";
import {
  getCompassionPolicyCopy,
  getPenaltyPolicyCopy,
} from "@/lib/microfinance-policy";

export function LoanServicingTab({
  loans,
  paymentMethods,
}: {
  loans: any[];
  paymentMethods: any[];
}) {
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  if (loans.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center text-slate-400">
        Wala ka pang active loan na puwedeng hulugan.
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
            Piliin ang loan na gusto mong tingnan kapag marami nang active repayments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[280px] rounded-xl bg-white">
              <SelectValue placeholder="Filter by loan product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lahat ng active loans</SelectItem>
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
          Ipinapakita ang{" "}
          <span className="font-bold text-slate-700">
            {filteredLoans.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredLoans.length)}
          </span>{" "}
          ng <span className="font-bold text-slate-700">{filteredLoans.length}</span>{" "}
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
  loan: any;
  paymentMethods: any[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [methodId, setMethodId] = useState("");
  const [reference, setReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const nextSchedule = useMemo(
    () =>
      loan.schedules.find(
        (schedule: any) => schedule.status === "pending" || schedule.status === "overdue",
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
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold text-slate-900">
            {loan.product?.name}
          </h3>
          <p className="text-sm text-slate-500">
            Loan Reference: <span className="font-mono">{loan.loan_reference}</span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Natitirang Balanse
          </p>
          <p className="text-3xl font-display font-bold text-emerald-600">
            ₱{Number(loan.balance_remaining).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Clock3 className="w-4 h-4" />}
          label="Susunod na Due"
          value={
            nextSchedule
              ? `₱${Number(nextSchedule.total_due).toLocaleString()}`
              : "Fully paid soon"
          }
        />
        <MetricCard
          icon={<CreditCard className="w-4 h-4" />}
          label="Installments"
          value={`${loan.schedules.filter((s: any) => s.status === "paid").length}/${loan.schedules.length} paid`}
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
          Sa prototype na ito, ang pera ay ipinapasa sa tunay na buhay sa pamamagitan ng
          branch cashier, GCash transfer, bank transfer, o field collection. Dito sa Agapay,
          itinatala at bine-verify natin ang repayment para may malinaw na records at digital receipt.
        </p>
        <p className="text-sm text-slate-500">
          {getPenaltyPolicyCopy()}
        </p>
        <p className="text-sm text-slate-500">
          {getCompassionPolicyCopy()}
        </p>
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
              Magsumite ng Repayment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Repayment Submission</DialogTitle>
              <DialogDescription>
                Pumili ng payment channel at ilagay ang reference na ibinigay ng branch o ng transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Halaga</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="5000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Payment Method</label>
                <Select value={methodId} onValueChange={setMethodId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pumili ng channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method: any) => (
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
                  placeholder="Halimbawa: Binayaran sa branch cashier kaninang umaga."
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <Button
                disabled={isPending || !amount || !methodId || !reference.trim()}
                onClick={handleSubmit}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Isumite para sa Verification
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
            <p className="text-sm text-slate-400 italic">Wala pang naipapasang repayment.</p>
          ) : (
            loan.payments.map((payment: any) => (
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
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
