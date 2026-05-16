import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getSuperadminEODReport } from "@/actions/superadmin-actions";
import { requireSuperadminSession } from "@/lib/authorization";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SuperadminEODReportPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const headerStore = await headers();
  const reportSecret = process.env.REPORT_SECRET || "agapay-internal-secret";
  const hasInternalReportSecret =
    headerStore.get("X-Agapay-Report-Secret") === reportSecret;

  const requestedDate = searchParams.date;

  if (!hasInternalReportSecret) {
    await requireSuperadminSession();
  }

  const res = await getSuperadminEODReport({ date: requestedDate });

  if (!res.success || !res.data) {
    return notFound();
  }

  const report = res.data;
  const reportDate = res.date || requestedDate || new Date().toISOString().split("T")[0];

  const peso = (n: number) =>
    `₱${n.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const statusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      expired: "bg-red-100 text-red-700 border-red-200",
      canceled: "bg-slate-100 text-slate-500 border-slate-200",
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return map[status] ?? "bg-slate-100 text-slate-600";
  };

  return (
    <div className="p-8 font-sans text-slate-900 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-emerald-700 tracking-tight">
            AGAPAY
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            Superadmin Platform Report
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            End of Day Platform Reconciliation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {format(new Date(reportDate + "T00:00:00"), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Contract Revenue
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            {peso(report.totals.totalPeriodRevenue)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            Total active portfolio
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Invoiced Today
          </p>
          <p className="mt-2 text-2xl font-black text-blue-700">
            {peso(report.totals.totalInvoicedToday)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            Settled via billing invoices
          </p>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-teal-50/30 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
            Earnings Deposited
          </p>
          <p className="mt-2 text-2xl font-black text-teal-700">
            {peso(report.totals.earningsDepositToday)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            Credited to SA earnings wallet
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Active Tenants
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {report.totals.activeTenants}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
            Expiring Soon
          </p>
          <p className="mt-2 text-2xl font-black text-amber-700">
            {report.totals.expiringCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            Within next 7 days
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
            Pending Upgrades
          </p>
          <p className="mt-2 text-2xl font-black text-red-700">
            {report.totals.pendingCount}
          </p>
        </div>
      </section>

      {/* Subscription Summary */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-700">
            Revenue by Plan & Billing Cycle
          </h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-3 font-semibold text-slate-600">Plan</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Cycle</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-right">Tenants</th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.subscriptionSummary.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/30">
                <td className="px-6 py-4 font-medium text-slate-900">{r.plan}</td>
                <td className="px-6 py-4 text-slate-500 capitalize">{r.billing_cycle.replace("_", " ")}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeClass(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 text-right">{r.tenant_count}</td>
                <td className="px-6 py-4 font-bold text-emerald-700 text-right">{peso(r.period_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tenant Snapshot */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-700">
            Tenant Health Snapshot
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 font-semibold text-slate-600">Tenant</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Plan</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Members</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Value</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Ends At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.tenantSnapshot.map((s) => (
                <tr key={s.tenant_id} className="hover:bg-slate-50/30">
                  <td className="px-6 py-4 font-medium text-slate-900">{s.tenant_name}</td>
                  <td className="px-6 py-4 text-slate-500">{s.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusBadgeClass(s.sub_status)}`}>
                      {s.sub_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-right">{s.member_count.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-right">{peso(s.contract_value)}</td>
                  <td className="px-6 py-4 text-slate-500 text-right">
                    {s.end_date ? format(new Date(s.end_date), "MMM d, yyyy") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-12 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          Generated via Agapay Tanaw Superadmin Console on {format(new Date(), "PPpp")}
          <br />
          Confidential Platform Report — For internal use only.
        </p>
      </footer>
    </div>
  );
}
