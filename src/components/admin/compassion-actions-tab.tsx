"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  Ban,
  CheckCircle2,
  Clock,
  Wallet,
  MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { processCompassionAction } from "@/actions/compassion-actions";
import { Textarea } from "@/components/ui/textarea";

export function CompassionActionsTab({ actions }: { actions: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const [adminNotesByAction, setAdminNotesByAction] = useState<
    Record<number, string>
  >({});

  const getActionLabel = (type: string) => {
    if (type === "grace_period") return "Grace Period";
    if (type === "term_extension") return "Term Extension";
    return "Penalty Freeze";
  };

  const handleProcess = (actionId: number, status: "approved" | "rejected") => {
    const adminNotes = adminNotesByAction[actionId] || "";

    if (!adminNotes || adminNotes.trim().length < 5) {
      toast.error("Feedback (Admin Notes) is required (at least 5 chars).");
      return;
    }

    startTransition(async () => {
      try {
        const res = await processCompassionAction({
          action_id: actionId,
          status,
          admin_notes: adminNotes,
        });
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(`Action successfully ${status}.`);
          setSelectedAction(null);
          setAdminNotesByAction((prev) => ({ ...prev, [actionId]: "" }));
          router.refresh();
        }
      } catch (e) {
        toast.error("Process failed.");
      }
    });
  };

  if (actions.length === 0) {
    return (
      <Card className="border-emerald-100/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <HeartPulse className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
          <p className="text-emerald-900 font-bold font-display text-lg">
            Walang Pending Requests
          </p>
          <p className="text-emerald-600/70 text-sm">
            You have no Compassion Action requests awaiting approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((act) => (
        <Card
          key={act.action_id}
          className="overflow-hidden border-emerald-100 shadow-sm"
        >
          <CardHeader className="bg-emerald-50/50 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-emerald-950 font-display">
                    {act.requester?.profile?.first_name}{" "}
                    {act.requester?.profile?.last_name}
                  </CardTitle>
                  <CardDescription>
                    Loan #{act.loan.loan_id} ({act.loan.product.name})
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-600"
                >
                  {getActionLabel(act.action_type)}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-600"
                >
                  Loan balance: ₱
                  {Number(act.loan?.balance_remaining || 0).toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="mb-1 font-bold uppercase tracking-widest text-slate-400">
                      Requested
                    </p>
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      {new Date(act.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="mb-1 font-bold uppercase tracking-widest text-slate-400">
                      Product
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {act.loan?.product?.name || "Loan Product"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="mb-1 font-bold uppercase tracking-widest text-slate-400">
                      Borrower
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {act.requester?.username || "member"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Reason for Hardship
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {act.reason}
                  </p>
                </div>

                {act.loan?.user && (
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      Borrower Snapshot
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        <span className="font-semibold text-slate-800">
                          Name:
                        </span>{" "}
                        {act.loan.user.profile?.first_name}{" "}
                        {act.loan.user.profile?.last_name}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">
                          Reference:
                        </span>{" "}
                        {act.loan.loan_reference || `#${act.loan.loan_id}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-emerald-100/50 bg-emerald-50/40 p-4">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Admin Approval Process
                </h4>
                {selectedAction === act.action_id ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter Admin Notes (Feedback)... e.g., 'Approved due to valid calamity.'"
                      value={adminNotesByAction[act.action_id] || ""}
                      onChange={(e) =>
                        setAdminNotesByAction((prev) => ({
                          ...prev,
                          [act.action_id]: e.target.value,
                        }))
                      }
                      className="min-h-[80px] bg-white text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleProcess(act.action_id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Relief
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleProcess(act.action_id, "rejected")}
                        className="flex-1"
                      >
                        <Ban className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => {
                          setSelectedAction(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/70 bg-white px-3 py-2 text-sm text-slate-600">
                      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <MessageSquareText className="h-4 w-4 text-emerald-600" />
                        Response needed
                      </div>
                      Magbigay ng malinaw na tugon sa miyembro. Makikita nila
                      ang notes mo sa kanilang active loan view pagkatapos ng
                      processing.
                    </div>
                    <Button
                      onClick={() => setSelectedAction(act.action_id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Review Case & Provide Feedback
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
