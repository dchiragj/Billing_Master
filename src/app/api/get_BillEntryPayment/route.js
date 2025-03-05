import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const billnos = searchParams.get("billnos") || null;
    const PartyCode = searchParams.get("PartyCode") || null;
    const Type = searchParams.get("Type") || null;
    const CompanyCode = searchParams.get("CompanyCode") || null;

    // console.log("Received Params:", {
    //   billnos,
    //   PartyCode,
    //   Type,
    //   CompanyCode,
    // });

    const pool = await connectDB();
    const request = pool.request();

    request.input("BILLNOS", sql.VarChar(sql.MAX), billnos);
    request.input("PartyCode", sql.VarChar(50), PartyCode);
    request.input("Type", sql.VarChar(50), Type);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);

    console.log("Executing Stored Procedure: USP_BillEntryPayment");

    const result = await request.execute("USP_BillEntryPayment");
    // console.log(result);

    return NextResponse.json(
      { status: true, data: result.recordset },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error.message);

    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
