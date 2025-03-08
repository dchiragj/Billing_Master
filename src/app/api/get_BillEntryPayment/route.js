import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {

    const body = await req.json();
    const {  billnos,PartyCode,Type,CompanyCode} = body;

    const pool = await connectDB();
    const request = pool.request();

    request.input("BILLNOS", sql.VarChar(8000), billnos);
    request.input("PartyCode", sql.VarChar(50), PartyCode);
    request.input("Type", sql.VarChar(50), Type||"");
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);

    console.log("Executing Stored Procedure: USP_BillEntryPayment",request);

    const result = await request.execute("USP_BillEntryPayment");
    // console.log(result);

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
