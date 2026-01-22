import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self';script-src 'self' 'unsafe-inline' 'unsafe-eval';style-src 'self' 'unsafe-inline';img-src 'self' data:;font-src 'self';connect-src 'self' https://api.phn.com.my;frame-src 'self';object-src 'none';base-uri 'self';form-action 'self'"
      .replace(/\s+/g, " ")
      .trim(),
  );

  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://forma.phn.com.my",
  );

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  return response;
}

export const config = {
  matcher: "/:path*",
};
