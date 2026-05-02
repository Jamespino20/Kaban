import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export type AuthorizedSession = {
  user: {
    id: string;
    user_id: number;
    role: string;
    tenantId: number | null;
    username: string;
    accessibleTenantIds: number[];
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
};

export const isSuperadminRole = (role?: string | null) => role === "superadmin";
export const isTenantStaffRole = (role?: string | null) =>
  role === "admin" || role === "lender";
export const isTanawRole = (role?: string | null) =>
  isSuperadminRole(role) || isTenantStaffRole(role);

export async function requireAuthenticatedSession(): Promise<AuthorizedSession> {
  // Guard against auth() execution during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    // Return a mock or null if allowed, but here we probably just want to exit early
    // though the build shouldn't even call this if the page is truly static.
    // However, if some component calls this during "Collecting page data", it triggers bailout.
    return { user: { role: "guest" } } as any;
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Superadmins bypass tenant-specific availability checks for the session itself,
  // but they will see alerts or restricted views elsewhere.
  if (session.user.role !== "superadmin" && session.user.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: session.user.tenantId },
      select: { is_active: true, entitlement_status: true },
    });

    if (
      !tenant ||
      !tenant.is_active ||
      ((tenant.entitlement_status as any) !== "active" &&
        (tenant.entitlement_status as any) !== "availed")
    ) {
      redirect("/tenant-access");
    }
  }

  return session as unknown as AuthorizedSession;
}

export async function requireTanawSession(): Promise<AuthorizedSession> {
  const session = await requireAuthenticatedSession();
  if (!isTanawRole(session.user.role)) {
    throw new Error("Unauthorized");
  }

  if (!isSuperadminRole(session.user.role) && !session.user.tenantId) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdminSession(): Promise<AuthorizedSession> {
  const session = await requireAuthenticatedSession();
  if (session.user.role !== "admin" && session.user.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  if (session.user.role === "admin" && !session.user.tenantId) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireSuperadminSession(): Promise<AuthorizedSession> {
  const session = await requireAuthenticatedSession();
  if (!isSuperadminRole(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

export function canAccessTenantStaffResource(
  session: AuthorizedSession,
  tenantId: number,
) {
  if (isSuperadminRole(session.user.role)) {
    return true;
  }

  return (
    isTenantStaffRole(session.user.role) && session.user.tenantId === tenantId
  );
}

export function canAccessOwnOrTenantStaffResource(
  session: AuthorizedSession,
  userId: number,
  tenantId: number,
) {
  if (
    session.user.role === "member" &&
    session.user.user_id === userId &&
    session.user.tenantId === tenantId
  ) {
    return true;
  }

  return canAccessTenantStaffResource(session, tenantId);
}
