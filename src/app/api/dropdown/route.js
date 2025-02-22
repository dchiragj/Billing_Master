import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const MstCode = searchParams.get("MstCode") || null;
    const Param1 = searchParams.get("Param1") || null;
    const CompanyCode = searchParams.get("CompanyCode") || null;

    if (!MstCode || !CompanyCode) {
      return NextResponse.json(
        { status: false, message: "MstCode and CompanyCode are required" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    const request = pool.request();

    request.input("MstCode", sql.VarChar, MstCode);
    request.input("Param1", sql.VarChar, Param1);
    request.input("CompanyCode", sql.VarChar, CompanyCode);

    console.log("Executing Stored Procedure: USP_GetMst_List with", { MstCode, Param1, CompanyCode });

    const result = await request.execute("USP_GetMst_List");

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
