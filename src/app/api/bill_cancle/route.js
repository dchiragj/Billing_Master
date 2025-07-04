import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    // Extract and validate query parameters
    const { searchParams } = new URL(req.url);
    const billno = searchParams.get("billno")?.trim();
    const entryby = searchParams.get("entryby")?.trim();

    if (!billno || !entryby) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required query parameters: billno and entryby",
        },
        { status: 400 }
      );
    }

    // Validate billno format (e.g., INVT/394107/25_26/000006)
    if (!/^[A-Z0-9\/_]+$/.test(billno) || billno.length > 500) {
      return NextResponse.json(
        { status: false, message: "Invalid billno format or length" },
        { status: 400 }
      );
    }

    // Validate entryby length
    if (entryby.length > 50) {
      return NextResponse.json(
        {
          status: false,
          message: "entryby exceeds maximum length of 50 characters",
        },
        { status: 400 }
      );
    }

    // Database connection and stored procedure execution
    const pool = await connectDB();
    const request = pool
      .request()
      .input("billno", sql.VarChar(500), billno)
      .input("entryby", sql.VarChar(50), entryby);

    await request.execute("USP_Bill_Cancel");

    // Verify cancellation by checking if billno still exists in Invoice_Master
    const checkResult = await pool
      .request()
      .input("billno", sql.VarChar(500), billno)
      .query(
        "SELECT COUNT(*) AS count FROM dbo.Invoice_Master WITH(NOLOCK) WHERE BillNO = @billno"
      );

    const billCount = checkResult.recordset[0].count;

    if (billCount > 0) {
      return NextResponse.json(
        {
          status: false,
          message: "Failed to cancel bill; bill still exists in Invoice_Master",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Bill canceled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
