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

    const pathSegments = nextUrl.pathname.split("/").filter(Boolean);
    const urlBranchSlug = pathSegments[0];
    const isAuthRoute = nextUrl.pathname.includes("/auth");
    const isLandingPage = nextUrl.pathname === "/";

    // Async telemetry
    logTraffic(nextUrl.pathname, userTenantId).catch(() => {});

    console.log(
      `[PROXY] ${req.method} ${nextUrl.pathname} | Branch: ${urlBranchSlug} | Role: ${role} | TenantSlug: ${userTenantSlug}`,
    );

    // 1. Unauthenticated workflow
    if (!isLoggedIn) {
      if (!isAuthRoute && !isLandingPage) {
        // Force branch-sensitive login
        const targetBranch = urlBranchSlug || "main";
        return NextResponse.redirect(
          new URL(`/${targetBranch}/auth/login`, nextUrl),
        );
      }
      return NextResponse.next();
    }

    // 2. Authenticated workflow
    const isSuperadmin = role === "superadmin";

    // 2.1 Branch Isolation Guard
    // Check if the user is in their assigned branch. Superadmins can be in any branch.
    const isTenantAccessPage = nextUrl.pathname.includes("/tenant-access");
    const hasBranchMismatch =
      !isSuperadmin &&
      urlBranchSlug &&
      urlBranchSlug !== userTenantSlug &&
      !isTenantAccessPage;
    const isMissingBranch = !urlBranchSlug;

    if (hasBranchMismatch || isMissingBranch) {
      const targetBranch = isSuperadmin
        ? urlBranchSlug || "main"
        : userTenantSlug || "main";
      const targetPath = role === "member" ? "agapay-pintig" : "agapay-tanaw";

      // If we are already at the target path, don't redirect (prevent loop)
      if (nextUrl.pathname === `/${targetBranch}/${targetPath}`) {
        return NextResponse.next();
      }

      return NextResponse.redirect(
        new URL(`/${targetBranch}/${targetPath}`, nextUrl),
      );
    }

    // 2.2 Portal Correction (Member vs Staff)
    const isTanawRoute = nextUrl.pathname.includes("/agapay-tanaw");
    const isPintigRoute = nextUrl.pathname.includes("/agapay-pintig");

    if (role === "member" && isTanawRoute) {
      return NextResponse.redirect(
        new URL(`/${urlBranchSlug}/agapay-pintig`, nextUrl),
      );
    }
    if (role !== "member" && isPintigRoute && !isSuperadmin) {
      return NextResponse.redirect(
        new URL(`/${urlBranchSlug}/agapay-tanaw`, nextUrl),
      );
    }

    // 2.3 Entitlement Checks (Exclude Superadmin)
    if (!isSuperadmin && userTenantId) {
      // In middleware, we only do a quick check if possible or rely on the page guards
      // to avoid excessive DB calls. The page guards in requireTanawSession handle this robustly.
    }

    // All guards passed, proceed
    return NextResponse.next();
  })(req, {} as any);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|videos|favicon.ico).*)"],
};
