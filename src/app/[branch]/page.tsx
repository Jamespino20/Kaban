import { redirect } from "next/navigation";
import { requireAuthenticatedSession } from "@/lib/authorization";

export default async function BranchIndexPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;
  const session = await requireAuthenticatedSession();

  // Redirect to the appropriate portal based on role
  if (session.user.role === "member") {
    redirect(`/${branch}/agapay-pintig`);
  } else {
    redirect(`/${branch}/agapay-tanaw`);
  }
}
