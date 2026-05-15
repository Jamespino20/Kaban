import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyTanawRedirectPage() {
  const session = await auth();
  const tenantSlug = session?.user?.tenantSlug;

  if (session?.user?.role === "superadmin" && tenantSlug) {
    redirect(`/${tenantSlug}/agapay-tanaw`);
  }

  if (session?.user?.role === "operator" && tenantSlug) {
    redirect(`/${tenantSlug}/agapay-tanaw`);
  }

  redirect("/auth/login");
}
