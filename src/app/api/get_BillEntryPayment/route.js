import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // const { searchParams } = new URL(req.url);
    // const billnos = searchParams.get("billnos") || null;
    // const PartyCode = searchParams.get("PartyCode") || null;
    // const Type = searchParams.get("Type") || null;
    // const CompanyCode = searchParams.get("CompanyCode") || null;

    const body = await req.json();
    const {  billnos,PartyCode,Type,CompanyCode} = body;

    // console.log("Received Params:", {
    //   billnos,
    //   PartyCode,
    //   Type,
    //   CompanyCode,
    // });

    const pool = await connectDB();
    const request = pool.request();

    console.log("billNos : ",billnos);
    

    const abc = billnos?.join(",")

    console.log("Hello q : ",abc);
    // console.log("Hello 1 : ",PartyCode);
    // console.log("Hello 2 : ",Type);
    // console.log("Hello 3 : ",CompanyCode);
    

    request.input("BILLNOS", sql.VarChar(8000), abc);
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
