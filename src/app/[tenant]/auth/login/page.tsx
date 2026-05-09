import { LoginForm } from "@/components/auth/login-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function LoginPage({
  params,
}: {
  params: { tenant: string };
}) {
  const { tenant } = params;

  let tenantData = null;
  if (tenant && tenant !== "auth") {
    tenantData = await prisma.tenant.findUnique({ where: { slug: tenant } });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <LoginForm
          preselectedTenantId={tenantData?.tenant_id?.toString()}
          tenantName={tenantData?.name}
          currentTenant={tenantData?.slug}
        />
      </div>
    </div>
  );
}
