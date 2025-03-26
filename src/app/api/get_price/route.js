import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const TaxType = searchParams.get("TaxType") || "";
    const CompanyCode = searchParams.get("CompanyCode") || "";

    // console.log("Received Params:", { TaxType, CompanyCode });

    const pool = await connectDB();
    const request = pool.request();

    request.input("TaxType", sql.VarChar, TaxType);
    request.input("CompanyCode", sql.VarChar, CompanyCode); 

    // console.log("Executing Stored Procedure: USP_PriceDetails with", { TaxType, CompanyCode });

    const result = await request.execute("USP_PriceDetails");
    
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
