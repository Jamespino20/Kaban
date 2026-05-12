"use client";

import { useState, useTransition } from "react";
import { Wallet, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  approveWalletTopUp,
  rejectWalletTopUp,
} from "@/actions/wallet-actions";
import { format } from "date-fns";

interface TopUpRequest {
  id: number;
  amount: number | string;
  status: string;
  receipt_url: string | null;
  created_at: Date | string;
  user: {
    username: string;
    email: string;
    profile: {
      first_name: string;
      last_name: string;
    } | null;
  };
}

interface TopUpQueueTabProps {
  requests: TopUpRequest[];
}

export function TopUpQueueTab({ requests }: TopUpQueueTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const formatCurrency = (val: number | string) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(val));

  const handleApprove = (id: number) => {
    setProcessingId(id);
    startTransition(async () => {
      const res = (await approveWalletTopUp(id)) as any;
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        router.refresh();
      }
      setProcessingId(null);
    });
  };

  const handleReject = (id: number) => {
    setProcessingId(id);
    startTransition(async () => {
      const res = (await rejectWalletTopUp(id)) as any;
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        router.refresh();
      }
      setProcessingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="dashboard-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Wallet Administration
            </p>
            <h2 className="text-xl font-display font-bold italic text-slate-950">
              Pending Top-Up Requests
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Member deposits awaiting your approval.
            </p>
          </div>
          <div className="ml-auto rounded-2xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
              Pending
            </p>
            <p className="text-xl font-black text-amber-700">
              {requests.length}
            </p>
          </div>
        </div>
      </div>

      {/* Queue */}
      {requests.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-400 italic">
            Walang nakabinbing top-up requests sa kasalukuyan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const fullName = req.user.profile
              ? `${req.user.profile.first_name} ${req.user.profile.last_name}`
              : req.user.username;
            const isProcessing = isPending && processingId === req.id;

            return (
              <div
                key={req.id}
                className="rounded-[1.5rem] border border-amber-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Member info */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{fullName}</p>
                      <p className="text-xs text-slate-500">{req.user.email}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-left md:text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Amount
                    </p>
                    <p className="text-xl font-display font-bold text-slate-900">
                      {formatCurrency(req.amount)}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Submitted
                    </p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(req.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                    {req.receipt_url && (
                      <a
                        href={req.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-emerald-600 underline"
                      >
                        Tingnan ang Receipt
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      disabled={isProcessing}
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      disabled={isProcessing}
                      variant="outline"
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
