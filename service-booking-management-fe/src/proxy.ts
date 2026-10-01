
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_KEY } from "@/services/api";

//Check if the user has valid token in cookies, if not redirect to login page with redirect param
export function proxy(request: NextRequest) {
  const hasToken = Boolean(request.cookies.get(TOKEN_KEY)?.value);
  if (hasToken) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/customer-home/:path*",
    "/services/:path*",
    "/booking/:path*",
    "/my-bookings/:path*",
    "/admin/:path*",
  ],
};