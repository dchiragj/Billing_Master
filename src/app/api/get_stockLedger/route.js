import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
    const year = searchParams.get("year");
    const fromdt = searchParams.get("fromdt");
    const todt = searchParams.get("todt");
    const partyCode = searchParams.get("partyCode");
    const icode = searchParams.get("icode");

    // Validate required parameters
    if (!location || !year || !fromdt || !todt || !partyCode || !icode) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required query parameters: location, year, fromdt, todt, partyCode, icode",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate location (e.g., 'SRT', max 10 characters based on previous APIs)
    if (location.length > 10) {
      return NextResponse.json(
        {
          status: false,
          message: "location exceeds maximum length of 10 characters",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate year format (expected: YYYY-YYYY, e.g., "2025-2026")
    if (!/^[0-9]{4}-[0-9]{4}$/.test(year)) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid year format (expected: YYYY-YYYY)",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate date format (expected: DD MMM YY, e.g., "01 Apr 25")
    const dateRegex = /^\d{2}\s[A-Za-z]{3}\s\d{2}$/;
    if (!dateRegex.test(fromdt) || !dateRegex.test(todt)) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid date format for fromdt or todt (expected: DD MMM YY)",
          data: {},
        },
        { status: 400 }
      );
    }

    // Validate partyCode (based on example: CMG0001CUST0083, alphanumeric, max 50 characters)
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

    // Validate icode (based on example: 0001IT0024, alphanumeric, max 50 characters)
    if (!/^[A-Z0-9]+$/.test(icode) || icode.length > 50) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid icode format or length (max 50 characters, alphanumeric)",
          data: {},
        },
        { status: 400 }
      );
    }

    // Connect to the database
    const pool = await connectDB();

    // Execute the stored procedure
    const result = await pool
      .request()
      .input("Location", sql.VarChar(10), location)
      .input("year", sql.VarChar(10), year)
      .input("fromdt", sql.VarChar(20), fromdt)
      .input("todt", sql.VarChar(20), todt)
      .input("PartyCode", sql.VarChar(50), partyCode)
      .input("Icode", sql.VarChar(50), icode)
      .execute("USP_Stock_Ledger");

    // Extract results
    const data = result.recordset || [];

    return NextResponse.json(
      {
        status: true,
        message: "Stock ledger data retrieved successfully",
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