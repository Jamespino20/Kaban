import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

// Define public and auth routes to bypass middleware checking
const publicRoutes = ["/", "/auth/login", "/auth/register", "/api/auth"];
const authRoutes = ["/auth/login", "/auth/register"];
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Determine redirection based on role
      const role = req.auth?.user?.role;
      if (role === "admin" || role === "superadmin") {
        return Response.redirect(new URL("/agapay-tanaw", nextUrl));
      } else {
        return Response.redirect(new URL("/agapay-pintig", nextUrl));
      }
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return;
});

// Matcher to protect specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
