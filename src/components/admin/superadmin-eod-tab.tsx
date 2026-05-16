"use client";

import { useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getSuperadminEODReport } from "@/actions/superadmin-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type EODReport = Awaited<ReturnType<typeof getSuperadminEODReport>> & {
  success: true;
};
type EODData = NonNullable<EODReport["data"]>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cycleLabel: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annually: "Semi-Annual",
  annually: "Annual",
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    expired: "bg-red-100 text-red-700 border-red-200",
    canceled: "bg-slate-100 text-slate-500 border-slate-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 bg-white shadow-sm flex flex-col gap-2 ${accent}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SuperadminEODTab() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [report, setReport] = useState<EODData | null>(null);
  const [reportDate, setReportDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);

  const loadReport = useCallback(() => {
    startTransition(async () => {
      const res = await getSuperadminEODReport({ date });
      if (res.success && res.data) {
        setReport(res.data);
        setReportDate((res as EODReport).date ?? date);
      } else {
        toast.error(
          "error" in res ? (res.error as string) : "Failed to load EOD report.",
        );
      }
    });
  }, [date]);

  const downloadPdf = useCallback(async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(
        `/api/reports/superadmin-eod?date=${date}`,
      );
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agapay-superadmin-eod-${date}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [date]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            Superadmin EOD Report
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Platform-wide subscription reconciliation and financial snapshot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm bg-transparent outline-none text-slate-700"
            />
          </div>

          <Button
            onClick={loadReport}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isPending ? "Loading…" : "Generate"}
          </Button>

          {report && (
            <Button
              variant="outline"
              onClick={downloadPdf}
              disabled={isDownloading}
              className="rounded-xl gap-2 border-slate-200"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              PDF
            </Button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!report && !isPending && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No report loaded.</p>
          <p className="text-sm text-slate-400 mt-1">
            Select a date and click <strong>Generate</strong> to pull the EOD data.
          </p>
        </div>
      )}

      {isPending && (
        <div className="rounded-2xl border border-slate-100 bg-white p-16 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-slate-500 text-sm">Aggregating platform data…</p>
        </div>
      )}

      {report && !isPending && (
        <>
          {/* Date label */}
          <p className="text-xs text-slate-400 font-medium">
            Report for{" "}
            <span className="text-slate-600 font-semibold">
              {new Date(reportDate + "T00:00:00").toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard
              label="Contract Revenue"
              value={peso(report.totals.totalPeriodRevenue)}
              sub="Active portfolio"
              icon={TrendingUp}
              accent="border-emerald-100"
            />
            <KpiCard
              label="Invoiced Today"
              value={peso(report.totals.totalInvoicedToday)}
              sub="Paid invoices"
              icon={CheckCircle2}
              accent="border-blue-100"
            />
            <KpiCard
              label="Earnings Deposited"
              value={peso(report.totals.earningsDepositToday)}
              sub="SA wallet"
              icon={TrendingUp}
              accent="border-teal-100"
            />
            <KpiCard
              label="Active Tenants"
              value={String(report.totals.activeTenants)}
              icon={Building2}
              accent="border-slate-100"
            />
            <KpiCard
              label="Expiring Soon"
              value={String(report.totals.expiringCount)}
              sub="Next 7 days"
              icon={Clock}
              accent="border-amber-100"
            />
            <KpiCard
              label="Pending Upgrades"
              value={String(report.totals.pendingCount)}
              icon={AlertTriangle}
              accent="border-red-100"
            />
          </div>

          {/* Subscription Revenue Breakdown */}
          <Section title="Revenue by Plan & Billing Cycle">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Plan", "Cycle", "Status", "Tenants", "Period Revenue"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.subscriptionSummary.length === 0 && (
                  <EmptyRow cols={5} />
                )}
                {report.subscriptionSummary.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.plan}</td>
                    <td className="px-4 py-3 text-slate-600">{cycleLabel[r.billing_cycle] ?? r.billing_cycle}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadge(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.tenant_count}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{peso(r.period_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Per-Tenant Snapshot */}
          <Section title="Tenant Health Snapshot">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Tenant", "Plan", "Cycle", "Sub Status", "Entitlement", "Members", "Active Loans", "Contract Value", "End Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.tenantSnapshot.length === 0 && <EmptyRow cols={9} />}
                {report.tenantSnapshot.map((s) => (
                  <tr key={s.tenant_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{s.tenant_name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.plan}</td>
                    <td className="px-4 py-3 text-slate-600">{cycleLabel[s.billing_cycle] ?? s.billing_cycle}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadge(s.sub_status)}>{s.sub_status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadge(s.entitlement_status)}>{s.entitlement_status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-right">{s.member_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600 text-right">{s.active_loans.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">{peso(s.contract_value)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {s.end_date ? new Date(s.end_date).toLocaleDateString("en-PH") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Invoices Today */}
          {report.invoicesToday.length > 0 && (
            <Section title={`Invoices Settled Today (${report.invoicesToday.length})`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Invoice #", "Tenant", "Amount", "Status", "Method", "Paid At"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.invoicesToday.map((inv, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{inv.invoice_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{inv.tenant_name}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{peso(inv.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusBadge(inv.status)}>{inv.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{inv.payment_method ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {inv.paid_at ? new Date(inv.paid_at).toLocaleString("en-PH") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Expiring Subscriptions */}
          {report.expiringSubscriptions.length > 0 && (
            <Section
              title={`Expiring Soon — Next 7 Days (${report.expiringSubscriptions.length})`}
              accent="border-amber-100"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100">
                    {["Tenant", "Plan", "Cycle", "Status", "Expires"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-amber-800">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {report.expiringSubscriptions.map((e, i) => (
                    <tr key={i} className="hover:bg-amber-50/40">
                      <td className="px-4 py-3 font-medium text-slate-900">{e.tenant_name}</td>
                      <td className="px-4 py-3 text-slate-600">{e.plan}</td>
                      <td className="px-4 py-3 text-slate-600">{cycleLabel[e.billing_cycle] ?? e.billing_cycle}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusBadge(e.status)}>{e.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-amber-700 font-semibold whitespace-nowrap">
                        {new Date(e.end_date).toLocaleDateString("en-PH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Pending Upgrades */}
          {report.pendingUpgrades.length > 0 && (
            <Section
              title={`Pending Upgrade Requests (${report.pendingUpgrades.length})`}
              accent="border-red-100"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50 border-b border-red-100">
                    {["Tenant", "Target Plan", "Cycle", "Pending Amount", "Requested"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-red-800">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {report.pendingUpgrades.map((p, i) => (
                    <tr key={i} className="hover:bg-red-50/40">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.tenant_name}</td>
                      <td className="px-4 py-3 text-slate-600">{p.plan}</td>
                      <td className="px-4 py-3 text-slate-600">{cycleLabel[p.billing_cycle] ?? p.billing_cycle}</td>
                      <td className="px-4 py-3 font-semibold text-red-700">{peso(p.pending_amount)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {p.requested_at
                          ? new Date(p.requested_at).toLocaleDateString("en-PH")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
  accent = "border-slate-100",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl border ${accent} bg-white shadow-sm overflow-hidden`}>
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-slate-400 text-sm italic">
        No data for this period.
      </td>
    </tr>
  );
}
