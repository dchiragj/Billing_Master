import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    // Extract query parameters from URL
    const { searchParams } = new URL(req.url);
    const locCode = searchParams.get("locCode");
    const entryBy = searchParams.get("entryBy");

    // Validate required parameters
    if (!locCode || !entryBy) {
      return NextResponse.json(
        { status: false, message: "locCode and entryBy query parameters are required" },
        { status: 400 }
      );
    }

    // Database connection and query execution
    const pool = await connectDB();
    const request = pool.request();

    // Add input parameters for the stored procedure
    request.input("LocCode", sql.VarChar(50), locCode);
    request.input("entryby", sql.VarChar(50), entryBy);

    console.log("Executing Stored Procedure: USP_Location_Cancel with params:", {
      locCode,
      entryBy
    });
    const result = await request.execute("USP_Location_Cancel");

    // Log full result for debugging
    console.log("Database Result:", JSON.stringify(result, null, 2));

    // Check if there's a recordset and process the response
    if (!result || !result.recordset || result.recordset.length === 0) {
      console.log("No recordset returned from stored procedure");
      return NextResponse.json(
        { status: false, message: "No response from stored procedure" },
        { status: 500 }
      );
    }

    const { status, message } = result.recordset[0];

    return NextResponse.json(
      {
        status: status, // Convert BIT (1/0) to boolean (true/false)
        message: message || "No message returned from database"
      },
      { status: status ? 200 : 404 }
    );

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}