import NextAuth from "next-auth";
import { logTraffic } from "@/lib/analytics-logger";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const authProxy = auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const tenantId = (req.auth?.user as any)?.tenant_id;

  // Asynchronously log traffic to avoid blocking the request
  // Note: In middleware, database operations should be as fast as possible.
  logTraffic(nextUrl.pathname, tenantId).catch((err) =>
    console.error("Traffic log failed:", err),
  );

  console.log(
    `[PROXY] ${req.method} ${nextUrl.pathname} | LoggedIn: ${isLoggedIn} | Role: ${role} | Tenant: ${tenantId}`,
  );

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = [
    "/",
    "/about",
    "/platform",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
    "/auth/login",
    "/auth/register",
  ].includes(nextUrl.pathname);
  const isPublicAsset =
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname.startsWith("/videos");
  const isLandingPage = nextUrl.pathname === "/";
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  if (isApiAuthRoute || isPublicAsset) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          role === "member" ? "/agapay-pintig" : "/agapay-tanaw",
          nextUrl,
        ),
      );
    }
    return;
  }

  if (isLoggedIn && isLandingPage) {
    return NextResponse.redirect(
      new URL(role === "member" ? "/agapay-pintig" : "/agapay-tanaw", nextUrl),
    );
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
});

export default authProxy;
export const proxy = authProxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|videos|favicon.ico).*)"],
};
