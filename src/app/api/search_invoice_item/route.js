import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract query parameter from URL
    const { searchParams } = new URL(req.url);
    const prefixText = searchParams.get("prefixText");

    // Validate required parameter
    if (!prefixText) {
      return NextResponse.json(
        { status: false, message: "prefixText query parameter is required" },
        { status: 400 }
      );
    }

    // Database connection and query execution
    const pool = await connectDB();
    const request = pool.request();

    // Add input parameter for the stored procedure
    request.input("prefixText", sql.VarChar(100), prefixText);

    // console.log("Executing Stored Procedure: USP_Search_Invoice_Item with prefixText:", prefixText);
    const result = await request.execute("USP_Search_Invoice_Item");

    // Log full result for debugging
    // console.log("Database Result:", JSON.stringify(result, null, 2));

    // Check if there's a recordset and process the response
    if (!result.recordset || result.recordset.length === 0) {
      return NextResponse.json(
        {
          status: true,
          message: "No items found matching the search criteria",
          data: []
        },
        { status: 200 }
      );
    }

    // Format the results into a clean JSON array
    const items = result.recordset.map(row => ({
      code: row.Code,
      name: row.Name,
      price: row.Price, // Includes "(MRP)" suffix from SP
      discount: row.Discount, // Includes "(%) (Discount)" suffix from SP
      description: row.IDesc
    }));

    return NextResponse.json(
      {
        status: true,
        message: "Items retrieved successfully",
        data: items
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