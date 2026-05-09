import { LandingClient } from "@/components/shared/landing-client";
import { getActiveTenants } from "@/actions/tenant-management";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agapay | Iyong Agapay, Ating Tagumpay",
  description:
    "Ang Agapay ay isang cooperative microfinance platform na tumutulong sa tenants, lenders, at members.",
};

export default async function LandingPage() {
  const tenants = await getActiveTenants();

  return <LandingClient tenants={tenants} />;
}
