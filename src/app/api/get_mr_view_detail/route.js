import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract and validate query parameters
    const { searchParams } = new URL(req.url);
    const mrsno = searchParams.get("MRSNO")?.trim();

    if (!mrsno) {
      return NextResponse.json(
        { status: false, message: "Missing required query parameter: MRSNO", data: [] },
        { status: 400 }
      );
    }

    // Validate MRSNO format (e.g., MR/2/24_25/000003) and length
    if (!/^[A-Z0-9\/_]+$/.test(mrsno) || mrsno.length > 50) {
      return NextResponse.json(
        { status: false, message: "Invalid MRSNO format or length", data: [] },
        { status: 400 }
      );
    }

    // Database connection and stored procedure execution
    const pool = await connectDB();
    const request = pool.request().input("MRSNO", sql.VarChar(50), mrsno);

    const result = await request.execute("Usp_MR_View");

    // Check if there's a recordset
    if (!result?.recordset) {
      return NextResponse.json(
        { status: false, message: "No data returned from stored procedure", data: [] },
        { status: 500 }
      );
    }

    // Return the result set
    return NextResponse.json(
      {
        status: true,
        message: result.recordset.length > 0 ? "Data retrieved successfully" : "No records found",
        data: result.recordset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { status: false, message: "Internal server error", data: [] },
      { status: 500 }
    );
  }
}