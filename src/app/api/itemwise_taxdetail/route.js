import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract query parameters from URL
    const { searchParams } = new URL(req.url);
    const taxType = searchParams.get("taxType");
    const priceType = searchParams.get("priceType");
    const itemCode = searchParams.get("itemCode");
    const iname = searchParams.get("iname") || "";

    // Validate required parameters
    if (!itemCode) {
      return NextResponse.json(
        { status: false, message: "itemCode query parameter is required" },
        { status: 400 }
      );
    }

    // Database connection and query execution
    const pool = await connectDB();
    const request = pool.request();

    // Add input parameters for the stored procedure
    request.input("TaxType", sql.VarChar(30), taxType);
    request.input("PriceType", sql.VarChar(30), priceType);
    request.input("Itemcode", sql.VarChar(30), itemCode);
    request.input("Iname", sql.VarChar(300), iname || "");

    console.log("Executing Stored Procedure: USP_ITEMWise_TaxDetails with params:", {
      taxType,
      priceType,
      itemCode,
      iname
    });
    const result = await request.execute("USP_ITEMWise_TaxDetails");

    // Log full result for debugging
    // console.log("Database Result:", JSON.stringify(result, null, 2));

    // Check if there's a recordset and process the response
    if (!result.recordset || result.recordset.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: "No tax or price details found for the item",
          data: null
        },
        { status: 200 }
      );
    }
//    console.log(result.recordset[0]);
   
    // Handle the two possible cases
    const firstRow = result.recordset[0];
      return NextResponse.json(
        {
          status: firstRow.Status===1,
          message: firstRow.Message,
          data: firstRow
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