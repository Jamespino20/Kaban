import { EnhancedRegisterForm } from "@/components/auth/enhanced-register-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function RegisterPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;

  let tenant = null;
  if (branch && branch !== "auth") {
    tenant = await prisma.tenant.findUnique({ where: { slug: branch } });
  }

  if (!tenant) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50/50 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>
      <div className="w-full max-w-4xl z-10 animate-in fade-in zoom-in duration-700 bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100">
        <EnhancedRegisterForm
          preselectedTenantId={tenant.tenant_id.toString()}
          preselectedRegionId={tenant.tenant_group_id?.toString() || "SKIP"}
        />
      </div>
    </div>
  );
}
