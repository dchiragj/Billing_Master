import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract query parameter from URL
    const { searchParams } = new URL(req.url);
    const billNo = searchParams.get("billNo");

    // Validate required parameter
    if (!billNo) {
      return NextResponse.json(
        { status: false, message: "billNo query parameter is required" },
        { status: 400 }
      );
    }

    // Database connection and query execution
    const pool = await connectDB();
    const request = pool.request();

    // Add input parameter for the stored procedure
    request.input("Billno", sql.VarChar(100), billNo);

    console.log("Executing Stored Procedure: Usp_Get_Invoice_Details with params:", { billNo });
    const result = await request.execute("Usp_Get_Invoice_Details");

    // Log full result for debugging
    console.log("Database Result:", JSON.stringify(result, null, 2));

    // Check if there are recordsets and process the response
    if (!result || !result.recordsets || result.recordsets.length < 2) {
      return NextResponse.json(
        {
          status: false,
          message: "Incomplete data returned from stored procedure",
          data: null
        },
        { status: 500 }
      );
    }

    // Extract master and detail data from recordsets
    const masterData = result.recordsets[0][0]; // First result set, first row (single master record)
    const detailData = result.recordsets[1]; // Second result set (array of detail records)

    // Check if master data exists
    if (!masterData) {
      return NextResponse.json(
        {
          status: false,
          message: "No master invoice data found for the given billNo",
          data: null
        },
        { status: 404 }
      );
    }

    // Format the response
    const responseData = {
      master: masterData,
      details: detailData || [] // Default to empty array if no details
    };

    return NextResponse.json(
      {
        status: true,
        message: "Invoice details retrieved successfully",
        data: responseData
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