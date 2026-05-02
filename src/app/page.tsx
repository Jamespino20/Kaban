import { LandingClient } from "@/components/shared/landing-client";
import { getActiveBranches } from "@/actions/tenant-management";

export const metadata = {
  title: "Agapay | Iyong Agapay, Ating Tagumpay",
  description:
    "Ang Agapay ay isang cooperative microfinance platform na tumutulong sa branches, lenders, at members.",
};

export default async function LandingPage() {
  const branches = await getActiveBranches();

  return <LandingClient branches={branches} />;
}
