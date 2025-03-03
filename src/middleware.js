import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  // console.log("Headers:", Object.fromEntries(req.headers));

  const { pathname, method } = req.nextUrl;

  if (pathname === "/api/login") {
    return NextResponse.next();
  }

  if (method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return new NextResponse(JSON.stringify({ status: false, message: "Unauthorized: No token provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret); // Verify token with jose
    // console.log("Token verification successful");

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return res;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return new NextResponse(JSON.stringify({ status: false, message: "Unauthorized: Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  matcher: "/api/:path*",
  // No need for runtime: "nodejs" since jose works in Edge
};