import { connectDB, sql } from "@/db";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { UserId, Password } = await req.json();
    console.log("Login request received", UserId, Password);

    if (!UserId || !Password) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "UserId and Password are required",
        }),
        { status: 400 }
      );
    }

    const pool = await connectDB();

    const result = await pool
      .request()
      .input("UserId", sql.VarChar, UserId)
      .input("Password", sql.VarChar, Password)
      .execute("USP_LoginUser");

    const summary = {
      Status: result.recordsets[0],
      Data: result.recordsets[1],
    };

    console.log("Summary:", summary);

    if (summary.Status[0].Status === 0) {
      return new Response(
        JSON.stringify({ status: false, message: summary.Status[0].Message }),
        { status: 401 }
      );
    }

    // Extract user data
    const user = summary.Data[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.UserId, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    
    // if(token){
    //   req.headers.set("Authorization", token);
    // }

    // console.log("Login successful:", token);
    // console.log("req.headers in login", req.headers);
    
    
    return new Response(
      JSON.stringify({
        status: true,
        token,
        message: "Login successful",
        data: user,
      }),
      { status: 200}
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ status: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
