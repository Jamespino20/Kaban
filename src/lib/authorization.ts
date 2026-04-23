import { auth } from "@/lib/auth";

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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
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
  if (
    session.user.role !== "admin" &&
    session.user.role !== "superadmin"
  ) {
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

  return isTenantStaffRole(session.user.role) && session.user.tenantId === tenantId;
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
