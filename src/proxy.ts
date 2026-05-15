import NextAuth from "next-auth";
import { logTraffic } from "@/lib/analytics-logger";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

function resolveDomainTenantSlug(hostname: string) {
  const isProduction = process.env.NODE_ENV === "production";
  const baseDomain = isProduction ? "agapay-saas.vercel.app" : "localhost";

  // Reverting to Path-based Routing: Subdomains on .vercel.app are restricted.
  // We force slug to null so the middleware relies on path segments (/[tenant]).
  return {
    baseDomain,
    slug: null as string | null,
  };
}

function shouldUseTenantRewrite(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/agapay-tanaw") ||
    pathname.startsWith("/agapay-pintig") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/tenant-access")
  );
}

function getTenantInternalPath(tenantSlug: string, pathname: string) {
  if (pathname === `/${tenantSlug}` || pathname.startsWith(`/${tenantSlug}/`)) {
    return pathname;
  }

  return pathname === "/" ? `/${tenantSlug}` : `/${tenantSlug}${pathname}`;
}

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const { baseDomain, slug: domainTenantSlug } =
    resolveDomainTenantSlug(hostname);
  const isDomainTenantRoute = Boolean(domainTenantSlug);
  const domainInternalPath = domainTenantSlug
    ? getTenantInternalPath(domainTenantSlug, nextUrl.pathname)
    : nextUrl.pathname;
  const isPublicRoute =
    !isDomainTenantRoute && PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicAsset =
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname.startsWith("/videos") ||
    nextUrl.pathname.startsWith("/favicon.ico");

  if (
    domainTenantSlug &&
    shouldUseTenantRewrite(nextUrl.pathname) &&
    (nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/auth"))
  ) {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = domainInternalPath;
    return NextResponse.rewrite(rewriteUrl);
  }

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

    const pathSegments = domainInternalPath.split("/").filter(Boolean);
    const urlTenantSlug = domainTenantSlug || pathSegments[0];
    const isAuthRoute = domainInternalPath.includes("/auth");
    const isLandingPage = !domainTenantSlug && nextUrl.pathname === "/";
    const isTenantHomepage = domainTenantSlug
      ? nextUrl.pathname === "/"
      : pathSegments.length === 1 && urlTenantSlug;

    const tenantUrl = (tenantSlug: string, path: string) => {
      const redirectUrl = new URL(req.url);

      if (domainTenantSlug) {
        redirectUrl.hostname = `${tenantSlug}.${baseDomain}`;
        redirectUrl.pathname = path;
      } else {
        redirectUrl.pathname = `/${tenantSlug}${path}`;
      }

      return redirectUrl;
    };

    // Async telemetry
    logTraffic(nextUrl.pathname, userTenantId).catch(() => {});

    console.log(
      `[PROXY] ${req.method} ${host}${nextUrl.pathname} | DomainTenant: ${domainTenantSlug} | PathTenant: ${pathSegments[0]} | Role: ${role} | UserTenant: ${userTenantSlug}`,
    );

    // 1. Unauthenticated workflow
    if (!isLoggedIn) {
      if (!isAuthRoute && !isLandingPage && !isTenantHomepage && !nextUrl.pathname.startsWith('/onboarding')) {
        // Force tenant-sensitive login
        const targetTenant = urlTenantSlug || "malolos"; // Route all unknown logins to primary branch
        if(!domainTenantSlug && pathSegments.length > 0 && targetTenant !== pathSegments[0]) {
           return NextResponse.next();
        }
        return NextResponse.redirect(tenantUrl(targetTenant, "/auth/login"));
      }
      return NextResponse.next();
    }

    // 2. Authenticated workflow
    const isSuperadmin = role === "superadmin";

    // 2.1 Tenant Isolation Guard
    // Check if the user is in their assigned tenant. Superadmins can be in any tenant.
    const isTenantAccessPage = nextUrl.pathname.includes("/tenant-access");
    const hasTenantMismatch =
      !isSuperadmin &&
      urlTenantSlug &&
      urlTenantSlug !== userTenantSlug &&
      !isTenantAccessPage;
    const isMissingTenant = !urlTenantSlug;

    if (hasTenantMismatch || isMissingTenant) {
      const targetTenant = isSuperadmin
        ? urlTenantSlug || "malolos"
        : userTenantSlug || "malolos";
      const targetPath = role === "member" ? "agapay-pintig" : "agapay-tanaw";

      // If we are already at the target path, don't redirect (prevent loop)
      if (nextUrl.pathname === `/${targetTenant}/${targetPath}`) {
        return NextResponse.next();
      }

      return NextResponse.redirect(tenantUrl(targetTenant, `/${targetPath}`));
    }

    // 2.2 Portal Correction (Member vs Staff)
    const isStaffRole = role === "operator";
    const isTanawRoute = domainInternalPath.includes("/agapay-tanaw");
    const isPintigRoute = domainInternalPath.includes("/agapay-pintig");

    // BLOCK: Member at Tanaw Dashboard
    if (!isStaffRole && !isSuperadmin && isTanawRoute) {
      return NextResponse.redirect(
        tenantUrl(urlTenantSlug || "malolos", "/agapay-pintig"),
      );
    }

    if (domainTenantSlug && shouldUseTenantRewrite(nextUrl.pathname)) {
      const rewriteUrl = nextUrl.clone();
      rewriteUrl.pathname = domainInternalPath;
      return NextResponse.rewrite(rewriteUrl);
    }

    // All guards passed, proceed
    return NextResponse.next();
  })(req, {} as any);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|videos|favicon.ico).*)"],
};
