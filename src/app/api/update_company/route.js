import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json(); // ✅ Parse request body correctly
    // console.log("Received Body:", body);

    const { CompanyCode, ...updatedData } = body;

    if (!CompanyCode) {
      return NextResponse.json(
        { status: false, message: "CompanyCode is required" },
        { status: 400 }
      );
    }

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { status: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    let query = "UPDATE Master_Company SET ";
    let request = pool.request();

    Object.keys(updatedData).forEach((key, index) => {
      if (updatedData[key] === null || updatedData[key] === undefined) return; // Skip null/undefined values

      let sqlType = sql.NVarChar; // Default type
      if (typeof updatedData[key] === "number") {
        sqlType = updatedData[key] > 2147483647 ? sql.BigInt : sql.Int;
      }
      
      if (typeof updatedData[key] === "boolean") sqlType = sql.Bit;
      if (key.includes("Date")) sqlType = sql.DateTime;

      query += `${key} = @${key}${index < Object.keys(updatedData).length - 1 ? "," : ""} `;
      request.input(key, sqlType, updatedData[key]);
    });

    query += " WHERE CompanyCode = @CompanyCode";
    request.input("CompanyCode", sql.Int, CompanyCode);

    // console.log("Executing Query:", query);
    await request.query(query);

    return NextResponse.json(
      { status: true, message: "Company updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error" },
      { status: 500 }
    );
  }
}
