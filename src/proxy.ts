import NextAuth from "next-auth";
import { logTraffic } from "@/lib/analytics-logger";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getDbUrl } from "@/lib/db-url";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/platform",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicAsset =
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname.startsWith("/videos") ||
    nextUrl.pathname.startsWith("/favicon.ico");

  // Immediate exit for public/auth routes to avoid NextAuth session overhead during build/prerender
  if (isPublicRoute || isApiAuthRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // Use NextAuth auth wrapper for protected routes
  return auth(async (req) => {
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;
    const userTenantId = req.auth?.user?.tenantId ?? null;
    const userTenantSlug = req.auth?.user?.tenantSlug ?? null;

    // Extract branch from path: /branch-slug/...
    const pathSegments = nextUrl.pathname.split("/").filter(Boolean);
    const urlBranchSlug = pathSegments[0];

    // Asynchronously log traffic
    logTraffic(nextUrl.pathname, userTenantId).catch((err) =>
      console.error("Traffic log failed:", err),
    );

    console.log(
      `[PROXY] ${req.method} ${nextUrl.pathname} | Branch: ${urlBranchSlug} | Role: ${role} | Tenant: ${userTenantId} | TenantSlug: ${userTenantSlug}`,
    );

    const isAuthRoute = nextUrl.pathname.includes("/auth");
    const isLandingPage = nextUrl.pathname === "/";

    // If logged in and on a public/auth route, redirect to the appropriate branch dashboard
    if (isLoggedIn && (isAuthRoute || isLandingPage)) {
      const targetBranch =
        role === "superadmin" ? "main" : userTenantSlug || "branch";
      const targetPath = role === "member" ? "agapay-pintig" : "agapay-tanaw";
      return NextResponse.redirect(
        new URL(`/${targetBranch}/${targetPath}`, nextUrl),
      );
    }

    // If not logged in and trying to access a private route
    if (!isLoggedIn && !isAuthRoute && !isLandingPage) {
      if (urlBranchSlug) {
        return NextResponse.redirect(
          new URL(`/${urlBranchSlug}/auth/login`, nextUrl),
        );
      }
      // If we don't know the branch, bounce them to the global entry
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Tenant Isolation Guard: ensure users cannot access a different branch
    if (
      isLoggedIn &&
      urlBranchSlug &&
      !isAuthRoute &&
      !isLandingPage &&
      role !== "superadmin"
    ) {
      if (userTenantSlug && userTenantSlug !== urlBranchSlug) {
        // Enforce physical boundary redirection
        return NextResponse.redirect(
          new URL(`/${userTenantSlug}/agapay-tanaw`, nextUrl),
        );
      }
    }

    // Handle cross-role or cross-tenant route protection
    if (isLoggedIn && urlBranchSlug) {
      const isTanawRoute = nextUrl.pathname.includes("/agapay-tanaw");
      const isPintigRoute = nextUrl.pathname.includes("/agapay-pintig");
      const isTenantAccessRoute = nextUrl.pathname.includes("/tenant-access");

      if (role === "superadmin") {
        return NextResponse.rewrite(new URL(nextUrl.pathname, nextUrl));
      }

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

    // Rewrite to the internal dynamic directory flow if it's a branch route
    if (urlBranchSlug) {
      return NextResponse.rewrite(new URL(nextUrl.pathname, nextUrl));
    }

    return NextResponse.next();
  })(req, {} as any);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|videos|favicon.ico).*)"],
};
