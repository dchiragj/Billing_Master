// pages/api/invoice_view.js
import { connectDB, sql } from "@/db";
import { sortByDate } from "@/lib/utiles";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      Billno = "",
      Party_code = "",
      Fromdt,
      Todt,
      BillType = "ALL",
      Brcd,
      CompanyCode,
    } = body;

    // Validate required fields
    if (!Fromdt || !Todt || !Brcd || !CompanyCode) {
      return NextResponse.json(
        {
          status: false,
          message: "Fromdt, Todt, Brcd, and CompanyCode are required",
        },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    const request = pool.request();

    // Map parameters to the stored procedure
    request.input("Billno", sql.VarChar(50), Billno);
    request.input("Party_code", sql.VarChar(100), Party_code);
    request.input("Fromdt", sql.VarChar(200), Fromdt);
    request.input("Todt", sql.VarChar(100), Todt);
    request.input("Type", sql.VarChar(100), "BILL"); // Fixed to 'BILL' for invoice_view
    request.input("BillType", sql.VarChar(100), BillType);
    request.input("Brcd", sql.VarChar(20), Brcd);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);

    const result = await request.execute("USP_Invoice_MR_ViewPrint");

    // Process the result
    if (!result.recordset || result.recordset.length === 0) {
      return NextResponse.json(
        { status: false, message: "No invoice data found" },
        { status: 404 }
      );
    }    

    const sortedInvoices = sortByDate(result.recordset, "bgndt", "desc");

    return NextResponse.json(
      {
        status: true,
        message: "Invoice data retrieved and sorted successfully",
        data: sortedInvoices,
      },
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
