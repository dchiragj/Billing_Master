import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    //const { itemCode } = params;
    const itemCode = req.nextUrl.searchParams.get("itemCode");
    const companyCode = req.nextUrl.searchParams.get("companyCode");

    if (!companyCode) {
      return NextResponse.json(
        { status: false, message: "CompanyCode is required" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    let request = pool.request();

    request.input("Itemcode", sql.VarChar(30), itemCode || null);
    request.input("CompanyCode", sql.VarChar(10), companyCode);
console.log(itemCode, companyCode);

    console.log("Executing Stored Procedure: Usp_GetItemDetail");

    const result = await request.execute("Usp_GetItemDetail");

    // Extract results from multiple result sets
    const itemDetails = result.recordsets[0]?.[0] || null;
    const itemImages = result.recordsets[1] || [];
    const priceData = result.recordsets[2] || [];
    const taxData = result.recordsets[3] || [];
    const rackDetails = result.recordsets[4] || [];

    return NextResponse.json(
      {
        status: true,
        message: "Item details fetched successfully",
        data: {
          itemDetails,
          itemImages,
          priceData,
          taxData,
          rackDetails,
        },
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
