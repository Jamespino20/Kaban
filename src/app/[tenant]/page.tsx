import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { getActiveTenantsForNav } from "@/actions/tenant-management";

export default async function TenantIndexPage({
  params,
  searchParams,
}: {
  params: { tenant: string };
  searchParams: { preview?: string };
}) {
  const { tenant } = params;
  const isPreview = searchParams.preview === "true";
  const session = await auth();

  if (session?.user?.id && !isPreview) {
    // Redirect to the appropriate portal based on role
    if (session.user.role === "member") {
      redirect(`/${tenant}/agapay-pintig`);
    } else {
      redirect(`/${tenant}/agapay-tanaw`);
    }
  }

  // Not logged in: Show the Tenant Homepage
  const tenantData = await prisma.tenant.findUnique({
    where: { slug: tenant },
  });

  if (!tenantData || !tenantData.is_active) {
    // Tenant not found or inactive
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Tenant Not Found
          </h1>
          <p className="text-slate-500 mb-8">
            The cooperative tenant you are looking for does not exist or is
            currently inactive.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            Go to Main Homepage
          </Link>
        </div>
      </div>
    );
  }

  const activeTenants = await getActiveTenantsForNav();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar tenants={activeTenants} forceSolid />
      <main className="flex-1 w-full pt-32 pb-24 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl text-center">
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8"
            style={{
              backgroundColor: tenantData.accent_color
                ? `${tenantData.accent_color}15`
                : "#ecfdf5",
            }}
          >
            <Building2
              className="w-10 h-10"
              style={{ color: tenantData.accent_color || "#059669" }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {tenantData.name}
          </h1>
          <p className="text-xl text-slate-500 font-medium mb-10">
            Welcome to your cooperative's official portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${tenant}/auth/login`}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              style={
                tenantData.accent_color
                  ? { backgroundColor: tenantData.accent_color }
                  : {}
              }
            >
              Member Login <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${tenant}/auth/register`}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              Apply for Membership
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
