import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Statement of Account (SOA) Template Page
 * This page is intended to be rendered by Puppeteer.
 * It uses the "Vibrant Agapay Palette" and high-contrast tables.
 */
export default async function SOAPage({
  searchParams,
}: {
  searchParams: Promise<{ userId: string; tenantId: string }>;
}) {
  const session = await auth();
  const headerStore = await headers();
  const { userId, tenantId } = await searchParams;
  const requestedUserId = Number.parseInt(userId, 10);
  const requestedTenantId = Number.parseInt(tenantId, 10);
  const reportSecret = process.env.REPORT_SECRET || "agapay-internal-secret";
  const hasInternalReportSecret =
    headerStore.get("X-Agapay-Report-Secret") === reportSecret;
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";
  const sameMember =
    session?.user?.role === "member" &&
    session.user.user_id === requestedUserId &&
    session.user.tenantId === requestedTenantId;
  const sameTenantAdmin =
    isAdmin && session?.user?.tenantId === requestedTenantId;

  if (!hasInternalReportSecret && !sameMember && !sameTenantAdmin) {
    return notFound();
  }

  const user = await prisma.user.findFirst({
    where: {
      user_id: requestedUserId,
      tenant_id: requestedTenantId,
    },
    include: {
      profile: true,
      loans: {
        where: { status: "active" },
        include: {
          schedules: {
            orderBy: { installment_number: "asc" },
          },
          payments: true,
        },
      },
      tenant: true,
    },
  });

  if (!user) return notFound();

  const activeLoan = user.loans[0];
  const paidAmount =
    activeLoan?.payments.reduce(
      (acc: number, p: any) => acc + Number(p.amount_paid),
      0,
    ) || 0;
  const balance =
    Number(activeLoan?.balance_remaining || 0) -
    paidAmount;

  return (
    <div className="p-8 font-sans text-slate-900 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-emerald-500 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-emerald-700 tracking-tight">
            AGAPAY
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            {user.tenant?.name}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold italic text-slate-800">
            Ulat ng Pagbabayad (SOA)
          </h2>
          <p className="text-sm text-slate-500">
            Petsa: {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Member Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
            Impormasyon ng Miyembro
          </h3>
          <p className="text-lg font-bold text-slate-900">
            {user.profile?.first_name} {user.profile?.last_name}
          </p>
          <p className="text-sm text-slate-600 italic">
            Member Code: <span className="font-mono">{user.member_code}</span>
          </p>
          <p className="text-sm text-slate-600">{user.profile?.address}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center">
          <h3 className="text-xs font-bold text-emerald-600 uppercase mb-1 text-right">
            Kabuoang Balanse
          </h3>
          <p className="text-3xl font-black text-emerald-700 text-right">
            ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Active Loan Details */}
      {activeLoan ? (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Detalye ng Aktibong Utang
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                  <th className="p-3 border-b border-slate-200">Bilang</th>
                  <th className="p-3 border-b border-slate-200">
                    Takdang Petsa
                  </th>
                  <th className="p-3 border-b border-slate-200 text-right">
                    Halaga
                  </th>
                  <th className="p-3 border-b border-slate-200 text-right">
                    Interes
                  </th>
                  <th className="p-3 border-b border-slate-200">Katayuan</th>
                </tr>
              </thead>
              <tbody>
                {activeLoan.schedules.map((s: any) => (
                  <tr
                    key={s.schedule_id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 text-sm font-medium">
                      {s.installment_number}
                    </td>
                    <td className="p-3 text-sm">
                      {format(new Date(s.due_date), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 text-sm text-right font-mono">
                      ₱{Number(s.principal_amount).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-right font-mono text-emerald-600">
                      ₱{Number(s.interest_amount).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : s.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.status === "paid"
                          ? "Bayad na"
                          : s.status === "overdue"
                            ? "Huli"
                            : "Hinihintay"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                Hiniram
              </p>
              <p className="text-xl font-bold">
                ₱{Number(activeLoan.principal_amount).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                Kabuoang Bayad
              </p>
              <p className="text-xl font-bold text-emerald-600">
                ₱{paidAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                Trust Score
              </p>
              <p className="text-xl font-bold text-indigo-600">842 / 1000</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-12 bg-slate-50 rounded-2xl">
          <p className="text-slate-500 italic">
            Walang aktibong utang na nahanap.
          </p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-20 text-center text-[10px] text-slate-300 italic uppercase tracking-widest">
        Inilathala ng Agapay System • Iyong Agapay, Ating Tagumpay
      </div>
    </div>
  );
}
