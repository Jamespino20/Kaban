import NextAuth from "next-auth";
import { logTraffic } from "@/lib/analytics-logger";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getDbUrl } from "@/lib/db-url";

const { auth } = NextAuth(authConfig);

const authProxy = auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const userTenantId =
    (req.auth?.user as any)?.tenantId ??
    (req.auth?.user as any)?.tenant_id ??
    null;

  // Extract branch from path: /branch-slug/...
  const pathSegments = nextUrl.pathname.split("/").filter(Boolean);
  const urlBranchSlug = pathSegments[0]; // e.g., 'main', 'malolos', 'branch1'

  // Note: We'll need a way to map slug to ID. For now, we rely on the authenticated session's tenant.
  // In the franchise model, we need to verify if user can access the specific urlBranchSlug.

  // Asynchronously log traffic
  logTraffic(nextUrl.pathname, userTenantId).catch((err) =>
    console.error("Traffic log failed:", err),
  );

  console.log(
    `[PROXY] ${req.method} ${nextUrl.pathname} | Branch: ${urlBranchSlug} | Role: ${role} | Tenant: ${userTenantId}`,
  );

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicAsset =
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname.startsWith("/videos") ||
    nextUrl.pathname.startsWith("/favicon.ico");

  if (isApiAuthRoute || isPublicAsset) return;

  const publicRoutes = [
    "/",
    "/about",
    "/platform",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
    "/auth/login",
    "/auth/register",
  ];

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isLandingPage = nextUrl.pathname === "/";

  // If logged in and on a public/auth route, redirect to the appropriate branch dashboard
  if (isLoggedIn && (isAuthRoute || isLandingPage)) {
    // Default to 'main' for superadmin if not specified, or the user's specific branch
    const targetBranch =
      role === "superadmin"
        ? "main"
        : (req.auth?.user as any)?.tenantSlug || "branch";
    const targetPath = role === "member" ? "agapay-pintig" : "agapay-tanaw";
    return NextResponse.redirect(
      new URL(`/${targetBranch}/${targetPath}`, nextUrl),
    );
  }

  // If not logged in and trying to access a private route
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // Handle cross-role or cross-tenant route protection
  if (isLoggedIn && urlBranchSlug) {
    const isTanawRoute = nextUrl.pathname.includes("/agapay-tanaw");
    const isPintigRoute = nextUrl.pathname.includes("/agapay-pintig");
    const isTenantAccessRoute = nextUrl.pathname.includes("/tenant-access");

    // Superadmin has access to everything
    if (role === "superadmin") return;

    // TODO: Verify urlBranchSlug matches user's tenantSlug
    // For now, check role-based access
    if (role === "member" && isTanawRoute) {
      return NextResponse.redirect(
        new URL(`/${urlBranchSlug}/agapay-pintig`, nextUrl),
      );
    }

    if (role !== "member" && isPintigRoute) {
      return NextResponse.redirect(
        new URL(`/${urlBranchSlug}/agapay-tanaw`, nextUrl),
      );
    }

    // Entitlement checks
    try {
      const connectionString = getDbUrl();
      if (connectionString && userTenantId) {
        const sql = neon(connectionString);
        const tenants = await sql`
          SELECT is_active, entitlement_status
          FROM tenants
          WHERE tenant_id = ${userTenantId}
          LIMIT 1
        `;

        const tenant = tenants[0] as
          | { is_active: boolean; entitlement_status: string }
          | undefined;

        const tenantIsOperational =
          !!tenant &&
          tenant.is_active === true &&
          tenant.entitlement_status === "active";

        if (!tenantIsOperational && !isTenantAccessRoute) {
          return NextResponse.redirect(
            new URL(`/${urlBranchSlug}/tenant-access`, nextUrl),
          );
        }
      }
    } catch (error) {
      console.error("Tenant entitlement check failed in proxy:", error);
    }
  }
});

export default authProxy;
export const proxy = authProxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|videos|favicon.ico).*)"],
};
