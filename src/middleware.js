// // import { NextResponse } from "next/server";

// // export function middleware() {
// //   const res = NextResponse.next();
  

// //   res.headers.set("Access-Control-Allow-Origin", "*");
// //   res.headers.set("Access-Control-Allow-Methods", "GET, POST");
// //   res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

// //   return res;
// // }

// // export const config = {
// //   matcher: "/api/:path*", // Apply middleware to all API routes
// // };

// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req) {
//   const { pathname, method } = req.nextUrl;

//   // Allow public access to the login API
//   if (pathname === "/api/login") {
//     return NextResponse.next();
//   }

//   // Apply middleware only to GET and POST requests
//   if (method !== "GET" && method !== "POST") {
//     return NextResponse.next();
//   }

//   const token = req.headers.get("Authorization")?.split(" ")[1];

//   if (!token) {
//     return NextResponse.json(
//       { status: false, message: "Unauthorized: No token provided" },
//       { status: 401 }
//     );
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach the user info to the request (but Next.js doesn't support modifying req directly)
//     req.user = decoded;

//     return NextResponse.next();
//   } catch (error) {
//     return NextResponse.json(
//       { status: false, message: "Unauthorized: Invalid token" },
//       { status: 401 }
//     );
//   }
// }

// export const config = {
//   matcher: "/api/:path*", // Apply middleware to all /api routes
// };




// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req) {
//   console.log("req in middlewares", req.headers);
  
//   const { pathname, method } = req.nextUrl;

//   console.log("we are in middleware", pathname, method);
//   console.log("we have JWS secret in middleware", process.env.JWT_SECRET);
  
//   // Bypass middleware for /api/login
//   if (pathname === "/api/login") {
//     return NextResponse.next();
//   }

//   // Apply middleware only for GET and POST methods
//   if (method !== "GET" && method !== "POST") {
//     return NextResponse.next();
//   }

//   // Set CORS headers
//   const res = NextResponse.next();
//   res.headers.set("Access-Control-Allow-Origin", "*");
//   res.headers.set("Access-Control-Allow-Methods", "GET, POST");
//   res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   // Handle preflight (OPTIONS) requests for CORS
//   if (method === "OPTIONS") {
//     return new NextResponse(null, { status: 204 });
//   }

//   // Validate JWT token
//   const token = req.headers.get("Authorization")?.split(" ")[1];

//   if (!token) {
//     return NextResponse.json(
//       { status: false, message: "Unauthorized: No token provided" },
//       { status: 401 }
//     );
//   }

//   try {
//     // Verify JWT using the secret
//     jwt.verify(token, process.env.JWT_SECRET);
//     return res; // Proceed if the token is valid
//   } catch (error) {
//     return NextResponse.json(
//       { status: false, message: "Unauthorized: Invalid token" },
//       { status: 401 }
//     );
//   }
// }

// // Apply middleware to all /api routes except /api/login
// export const config = {
//   matcher: ["/api/:path*"], // Applies to all API routes
// };

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  console.log("Headers:", Object.fromEntries(req.headers));

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
    console.log("Token verification successful");

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