import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const COPY = {
  prospect: {
    title: "Hindi pa active ang inyong Agapay workspace",
    body: "Nagawa na ang tenant record, pero hinihintay pa ang one-time lifetime availing confirmation mula sa superadmin bago buksan ang buong operations access.",
  },
  suspended: {
    title: "Pansamantalang naka-hold ang tenant access",
    body: "May administrative hold ang workspace na ito. Makipag-ugnayan sa superadmin para sa paglilinaw at reactivation kung naaangkop.",
  },
  inactive: {
    title: "Hindi available ang tenant workspace",
    body: "Hindi aktibo ang branch o tenant na ito sa kasalukuyan. Makipag-ugnayan sa inyong tenant admin o sa Agapay superadmin.",
  },
} as const;

export default async function TenantAccessPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  if (session.user.role === "superadmin") {
    redirect("/agapay-tanaw");
  }

  if (!session.user.tenantId) {
    redirect("/auth/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { tenant_id: session.user.tenantId },
    select: {
      name: true,
      is_active: true,
      entitlement_status: true,
      lifetime_availed_at: true,
    },
  });

  if (tenant && tenant.is_active && tenant.entitlement_status === "active") {
    redirect(
      session.user.role === "member" ? "/agapay-pintig" : "/agapay-tanaw",
    );
  }

  const copyKey =
    !tenant || !tenant.is_active ? "inactive" : tenant.entitlement_status;
  const copy = COPY[copyKey as keyof typeof COPY] ?? COPY.inactive;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur md:p-10">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
          Tenant Access Hold
        </p>
        <h1 className="text-3xl font-display font-bold italic text-slate-900 md:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          {copy.body}
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Tenant
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {tenant?.name || "Unknown Tenant"}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Status:{" "}
            <span className="font-semibold text-slate-900">
              {!tenant || !tenant.is_active
                ? "inactive"
                : tenant.entitlement_status}
            </span>
          </p>
          {tenant?.lifetime_availed_at ? (
            <p className="mt-2 text-sm text-slate-600">
              Availed at:{" "}
              <span className="font-semibold text-slate-900">
                {new Date(tenant.lifetime_availed_at).toLocaleString("en-PH")}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Makipag-ugnayan sa Agapay
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Bumalik sa Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
