import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const partyCode = searchParams.get("partyCode");
    const companyCode = searchParams.get("companyCode");

    // Validate required parameters
    if (!fromDate || !toDate || !partyCode || !companyCode) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required query parameters: fromDate, toDate, partyCode, companyCode",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate date format (expected: DD MMM YY, e.g., "01 Jul 25")
    const dateRegex = /^\d{2}\s[A-Za-z]{3}\s\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid date format for fromDate or toDate (expected: DD MMM YY)",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate partyCode (based on provided example: CMG0001CUST0083)
    if (!/^[A-Z0-9]+$/.test(partyCode) || partyCode.length > 50) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid partyCode format or length (max 50 characters, alphanumeric)",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate companyCode (based on previous APIs, max 10 characters)
    if (companyCode.length > 10) {
      return NextResponse.json(
        {
          status: false,
          message: "companyCode exceeds maximum length of 10 characters",
          data: {},
        },
        { status: 400 }
      );
    }

    // Connect to the database
    const pool = await connectDB();

    // Execute the stored procedure with provided and default parameters
    const result = await pool
      .request()
      .input("from_date", sql.VarChar(20), fromDate)
      .input("to_date", sql.VarChar(20), toDate)
      .input("Cumilative", sql.Char(1), "Y")
      .input("accode", sql.VarChar(50), "CDA0001")
      .input("CUST_EMP_VEND_CD", sql.VarChar(50), partyCode)
      .input("brcd", sql.VarChar(10), "SRT")
      .input("RPT", sql.Char(1), "2")
      .input("Company", sql.VarChar(10), companyCode)
      .input("TYPE", sql.VarChar(50), "")
      .execute("USP_GeneralLedger");

    // Extract results
    const data = result.recordset || [];

    return NextResponse.json(
      {
        status: true,
        message: "General ledger data retrieved successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
        data: {},
      },
      { status: 500 }
    );
  }
} 