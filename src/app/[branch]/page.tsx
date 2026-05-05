import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { getActiveBranchesForNav } from "@/actions/tenant-management";

export default async function BranchIndexPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;
  const session = await auth();

  if (session?.user?.id) {
    // Redirect to the appropriate portal based on role
    if (session.user.role === "member") {
      redirect(`/${branch}/agapay-pintig`);
    } else {
      redirect(`/${branch}/agapay-tanaw`);
    }
  }

  // Not logged in: Show the Branch Homepage
  const tenant = await prisma.tenant.findUnique({
    where: { slug: branch },
  });

  if (!tenant || !tenant.is_active) {
    // Branch not found or inactive
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Branch Not Found
          </h1>
          <p className="text-slate-500 mb-8">
            The cooperative branch you are looking for does not exist or is
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

  const activeBranches = await getActiveBranchesForNav();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar branches={activeBranches} forceSolid />
      <main className="flex-1 w-full pt-32 pb-24 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-xl text-center">
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8"
            style={{
              backgroundColor: tenant.accent_color
                ? `${tenant.accent_color}15`
                : "#ecfdf5",
            }}
          >
            <Building2
              className="w-10 h-10"
              style={{ color: tenant.accent_color || "#059669" }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {tenant.name}
          </h1>
          <p className="text-xl text-slate-500 font-medium mb-10">
            Welcome to your cooperative's official portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${branch}/auth/login`}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              style={
                tenant.accent_color
                  ? { backgroundColor: tenant.accent_color }
                  : {}
              }
            >
              Member Login <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${branch}/auth/register`}
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
