import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const CustomerCode = searchParams.get("CustomerCode") || null;
    const CompanyCode = searchParams.get("CompanyCode");

    // Validate required parameter
    if (!CompanyCode) {
      return NextResponse.json(
        { status: false, message: "CompanyCode is required" },
        { status: 400 }
      );
    }

    // console.log("Fetching customer data:", { CustomerCode, CompanyCode });

    const pool = await connectDB();
    const request = pool.request();

    // Pass parameters to the stored procedure
    request.input("CustomerCode", sql.VarChar(50), CustomerCode);
    request.input("CompanyCode", sql.VarChar(50), CompanyCode);

    console.log("Executing Stored Procedure: USP_GetCustomers");

    // Execute the stored procedure
    const result = await request.execute("USP_GetCustomers");
    // console.log("Result:", result);

    return NextResponse.json(
      { status: true, data: result.recordset },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
