"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartPulse, Ban, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { processCompassionAction } from "@/actions/compassion-actions";
import { Textarea } from "@/components/ui/textarea";

export function CompassionActionsTab({ actions }: { actions: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const handleProcess = (actionId: number, status: "approved" | "rejected") => {
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
          setAdminNotes("");
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
    <div className="space-y-6">
      {actions.map((act) => (
        <Card
          key={act.action_id}
          className="border-emerald-100 shadow-sm overflow-hidden"
        >
          <CardHeader className="bg-emerald-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-5 w-5 text-emerald-600" />
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
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200 bg-amber-50"
              >
                {act.action_type === "grace_period"
                  ? "Grace Period"
                  : act.action_type === "restructure"
                    ? "Restructure"
                    : "Penalty Freeze"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Reason for Hardship
                  </h4>
                  <p className="text-sm bg-slate-50 rounded-lg p-3 text-slate-700 leading-relaxed">
                    {act.reason}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Requested At
                  </h4>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    {new Date(act.requested_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2">
                  Admin Approval Process
                </h4>
                {selectedAction === act.action_id ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter Admin Notes (Feedback)... e.g., 'Approved due to valid calamity.'"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
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
                          setAdminNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
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
