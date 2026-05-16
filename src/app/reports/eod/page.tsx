import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { getEndOfDayReconciliation } from "@/actions/reconciliation";
import { requireTanawSession } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function EODReportPage(props: {
  searchParams: Promise<{ tenantId?: string; date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const headerStore = await headers();
  const reportSecret = process.env.REPORT_SECRET || "agapay-internal-secret";
  const hasInternalReportSecret =
    headerStore.get("X-Agapay-Report-Secret") === reportSecret;

  const requestedTenantId = searchParams.tenantId
    ? Number(searchParams.tenantId)
    : undefined;
  const requestedDate = searchParams.date;

  let tenantId = requestedTenantId;
  if (!hasInternalReportSecret) {
    const session = await requireTanawSession();
    if (session.user.role === "operator") {
      if (requestedTenantId && requestedTenantId !== session.user.tenantId) {
        return notFound();
      }
      tenantId = tenantId ?? session.user.tenantId ?? undefined;
    }

    if (session.user.role === "superadmin" && !tenantId) {
      return notFound();
    }
  }

  if (!tenantId) {
    return notFound();
  }

  const reconciliation = await getEndOfDayReconciliation(
    requestedDate,
    tenantId,
    hasInternalReportSecret,
  );

  const tenant = await prisma.tenant.findUnique({
    where: { tenant_id: tenantId },
    select: { name: true },
  });

  if (!tenant) {
    return notFound();
  }

  return (
    <div className="p-8 font-sans text-slate-900 bg-white min-h-screen">
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-emerald-700 tracking-tight">
            AGAPAY
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            {tenant.name}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            End of Day Reconciliation Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {format(reconciliation.targetDate, "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Total Disbursed
          </p>
          <p className="mt-3 text-3xl font-black text-rose-600">
            ₱{reconciliation.totalDisbursed.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Disbursed loans today ({reconciliation.disbursedCount})
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Total Collected
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-700">
            ₱{reconciliation.totalCollected.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Verified payments today ({reconciliation.collectedCount})
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Treasury vs Wallet Liability
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            ₱{reconciliation.holdings.totalTreasuryBalance.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Treasury balance compared to ₱{reconciliation.holdings.totalTenantSavings.toLocaleString()} wallet liability.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
          Ledger Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Debits
            </p>
            <p className="mt-3 text-2xl font-black text-slate-900">
              ₱{reconciliation.ledger.totalDebits.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Credits
            </p>
            <p className="mt-3 text-2xl font-black text-slate-900">
              ₱{reconciliation.ledger.totalCredits.toLocaleString()}
            </p>
          </div>
          <div
            className={`rounded-2xl p-4 border border-slate-200 ${
              reconciliation.ledger.isBalanced
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Balance Status
            </p>
            <p className="mt-3 text-2xl font-black">
              {reconciliation.ledger.isBalanced ? "Balanced" : "Imbalance"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
          Reconciliation Summary
        </h3>
        <div className="grid gap-3 text-sm text-slate-700">
          <div className="flex justify-between border-b border-slate-200 pb-3">
            <span>Total Member Wallet Savings</span>
            <span className="font-semibold">₱{reconciliation.holdings.totalTenantSavings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-3">
            <span>Total Treasury Balance</span>
            <span className="font-semibold">₱{reconciliation.holdings.totalTreasuryBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span>Imbalance</span>
            <span className="font-semibold">₱{reconciliation.holdings.imbalance.toLocaleString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
