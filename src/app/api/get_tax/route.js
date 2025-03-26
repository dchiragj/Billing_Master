import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const TaxType = searchParams.get("TaxType") || "";

    // console.log("Received Params:", { TaxType });

    const pool = await connectDB();
    const request = pool.request();
    request.input("TaxType", sql.VarChar, TaxType);

    // console.log("Executing Stored Procedure: USP_TaxDetails with", { TaxType });

    const result = await request.execute("USP_TaxDetails");

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
