"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  Save,
} from "lucide-react";
import {
  getEndOfDayReconciliation,
  resolveAndSignEndOfDay,
} from "@/actions/reconciliation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReconciliationData = Awaited<ReturnType<typeof getEndOfDayReconciliation>>;

export function ReconciliationTab() {
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await getEndOfDayReconciliation();
        setData(result);
      } catch (err) {
        toast.error("Failed to load reconciliation data");
      }
    });
  }, []);

  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [isSignPending, setIsSignPending] = useState(false);

  const handleApproveReconciliation = async () => {
    if (!data) return;

    const hasImbalance =
      !data.ledger.isBalanced || !data.holdings.isTreasuryHealthy;
    if (hasImbalance && !discrepancyReason.trim()) {
      toast.error(
        "An imbalance was detected. You must provide a reason to adjust the ledger and sign off.",
      );
      return;
    }

    setIsSignPending(true);
    try {
      const result = await resolveAndSignEndOfDay(discrepancyReason);
      if (result?.success) {
        toast.success(
          result.adjusted
            ? "Discrepancy adjusted and EOD Signed Off."
            : "End of Day Reconciliation Approved and Signed.",
        );
        // Reload data
        const updated = await getEndOfDayReconciliation();
        setData(updated);
        setDiscrepancyReason("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sign off EOD");
    } finally {
      setIsSignPending(false);
    }
  };

  const handleExport = () => {
    toast.info("Exporting CSV report...");
  };

  if (!data && isPending) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!data) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            End of Day Reconciliation
          </h2>
          <p className="text-sm text-slate-500">
            Compliance surface for validating branch transactions and ledger
            balance for {data.targetDate.toLocaleDateString("en-PH")}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 hover:border-slate-300"
            onClick={handleExport}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600" />
            Generate CSV Report
          </Button>
          <Button
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            onClick={handleApproveReconciliation}
            disabled={isSignPending}
          >
            {isSignPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Sign & Lock EOD
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cash Outflow (Disbursements) */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
            Cash Outflow
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-rose-600">
              ₱{data.totalDisbursed.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 mb-1">Disbursed</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across {data.disbursedCount} active loan(s)
          </p>
        </section>

        {/* Cash Inflow (Collections) */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
            Cash Inflow
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-emerald-600">
              ₱{data.totalCollected.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 mb-1">Collected</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across {data.collectedCount} verified payment(s)
          </p>
        </section>

        {/* Ledger Balance Sheet */}
        <section
          className={`md:col-span-2 rounded-[1.75rem] border p-6 shadow-sm ${data.ledger.isBalanced ? "border-emerald-200 bg-emerald-50/30" : data.ledger.totalDebits === 0 && data.ledger.totalCredits === 0 ? "border-slate-200 bg-white" : "border-rose-200 bg-rose-50/30"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Double-Entry Ledger Status
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cross-reference of all automated journal entries
              </p>
            </div>
            {data.ledger.isBalanced && data.ledger.totalDebits > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/50 rounded-full text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> BALANCED
              </div>
            ) : data.ledger.totalDebits === 0 &&
              data.ledger.totalCredits === 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-500 text-xs font-bold border border-slate-200">
                NO RECORDED ENTRIES TODAY
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100/50 rounded-full text-rose-700 text-xs font-bold border border-rose-200">
                <AlertTriangle className="w-4 h-4" /> DISCREPANCY DETECTED
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Debits
              </p>
              <p className="text-xl font-black text-slate-800">
                ₱{data.ledger.totalDebits.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Credits
              </p>
              <p className="text-xl font-black text-slate-800">
                ₱{data.ledger.totalCredits.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* General Holdings / Liquid Assets */}
        <section className="md:col-span-2 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
            Total Branch Liquid Holdings
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₱{data.holdings.totalBranchSavings.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 mb-1">
              in active Member Wallets / Savings
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">
            This represents the outstanding liquidity owed back to members
            across {data.targetDate.toLocaleDateString("en-PH")}.
          </p>
        </section>
        {/* Discrepancy Resolution Form - Only show if imbalanced */}
        {data &&
          (!data.ledger.isBalanced || !data.holdings.isTreasuryHealthy) && (
            <section className="col-span-1 md:col-span-2 rounded-[1.75rem] border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-rose-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Action Required: Resolve Imbalance
              </h3>
              <p className="text-sm text-rose-800 mb-4">
                The system has detected a discrepancy in the double-entry tally
                or a mismatch between your liquid holdings and treasury cash
                equivalents. To proceed with the EOD sign-off, you must provide
                a valid reason or note to generate an automatic adjusting ledger
                entry.
              </p>
              <div className="space-y-3">
                <Label
                  htmlFor="discrepancyReason"
                  className="text-rose-900 font-bold"
                >
                  Reason for Discrepancy / Adjustment
                </Label>
                <Textarea
                  id="discrepancyReason"
                  value={discrepancyReason}
                  onChange={(e) => setDiscrepancyReason(e.target.value)}
                  placeholder="e.g. Cashier shortage recognized and acknowledged. Adjustment forced for EOD."
                  className="w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-400 min-h-[100px]"
                />
              </div>
              {data.holdings.imbalance > 0 && (
                <p className="text-xs text-rose-700 mt-3 font-semibold">
                  An adjusting entry of ₱
                  {data.holdings.imbalance.toLocaleString()} will be posted upon
                  sign-off.
                </p>
              )}
            </section>
          )}
      </div>
    </div>
  );
}
