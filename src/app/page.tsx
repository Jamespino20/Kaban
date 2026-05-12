import { LandingClient } from "@/components/shared/landing-client";
import { getActiveTenants } from "@/actions/tenant-management";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agapay | Iyong Agapay, Ating Tagumpay",
  description:
    "Agapay is a platform system that offers microfinancing cooperative platform services.",
};

export default async function LandingPage() {
  const tenants = await getActiveTenants();

  return <LandingClient tenants={tenants} />;
}
