import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const UserId = searchParams.get("UserId") || null;
    const CompanyCode = searchParams.get("CompanyCode");

    console.log("Received Params:", { UserId, CompanyCode });

    if (!CompanyCode) {
      return NextResponse.json(
        { status: false, message: "CompanyCode is required" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    const request = pool.request();

    request.input("UserId", sql.VarChar, UserId);
    request.input("CompanyCode", sql.VarChar, CompanyCode);

    console.log("Executing Stored Procedure: USP_GetUsers with", { UserId, CompanyCode });

    const result = await request.execute("USP_GetUsers");

    return NextResponse.json(
      { status: true, data: result.recordset },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error" },
      { status: 500 }
    );
  }
}
