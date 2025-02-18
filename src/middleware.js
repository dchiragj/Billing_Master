// import Cors from 'cors';

// // Initialize the cors middleware
// const cors = Cors({
//   origin: '*', // Allow all origins (adjust as needed)
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
// });

// // Middleware function to run cors before the API handler
// function runMiddleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

// export default async function handler(req, res) {
//   // Run CORS middleware
//   await runMiddleware(req, res, cors);

//   res.json({ message: 'CORS is enabled for this API route' });
// }


import { NextResponse } from "next/server";

export function middleware(req) {
  const res = NextResponse.next();

  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return res;
}

export const config = {
  matcher: "/api/:path*", // Apply middleware to all API routes
};
