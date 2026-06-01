import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { ADMIN_ROLE, AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/constants";



const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/cart", "/checkout"];



export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;



  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>

    pathname.startsWith(prefix),

  );



  if (isProtected && !token) {

    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);

  }



  if (isAuthRoute && token) {
    const destination = role === ADMIN_ROLE ? "/admin" : "/sneakers";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname.startsWith("/admin") && token && role !== ADMIN_ROLE) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    token &&
    role === ADMIN_ROLE &&
    (pathname.startsWith("/cart") || pathname.startsWith("/checkout"))
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();

}



export const config = {

  matcher: [

    "/dashboard/:path*",

    "/admin/:path*",

    "/login",

    "/register",

    "/cart",

    "/checkout/:path*",

  ],

};

