import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json(); // Parse request body correctly
    // console.log("Received Body:", body);

    const { CompanyCode, EntryBy, ...updatedData } = body;

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

    if (!EntryBy) {
      return NextResponse.json(
        { status: false, message: "EntryBy is required for logging" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // First operation: Dynamic UPDATE query
    let query = "UPDATE Master_Company SET ";
    let request1 = pool.request();

    const validUpdatedData = Object.keys(updatedData)
      .filter(key => updatedData[key] !== null && updatedData[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = updatedData[key];
        return obj;
      }, {});

    Object.keys(validUpdatedData).forEach((key, index) => {
      let sqlType = sql.NVarChar; // Default type
      if (typeof validUpdatedData[key] === "number") {
        sqlType = validUpdatedData[key] > 2147483647 ? sql.BigInt : sql.Int;
      }
      if (typeof validUpdatedData[key] === "boolean") sqlType = sql.Bit;
      if (key.includes("Date")) sqlType = sql.DateTime;

      query += `${key} = @${key}${index < Object.keys(validUpdatedData).length - 1 ? "," : ""} `;
      request1.input(key, sqlType, validUpdatedData[key]);
    });

    query += " WHERE CompanyCode = @CompanyCode";
    request1.input("CompanyCode", sql.Int, CompanyCode);

    // console.log("Executing Query:", query);
    await request1.query(query);

    // Second stored procedure: Usp_Insert_SQL
    const sqlString = query; // Log the exact SQL query executed
    const moduleName = "CompanyUpdate"; // Customize as needed
    const entryType = "Update"; // This is an update operation

    const request2 = pool.request();
    request2.input("Sql_String", sql.Text, sqlString);
    request2.input("ModuleName", sql.VarChar(100), moduleName);
    request2.input("EntryType", sql.VarChar(100), entryType);
    request2.input("EntryBy", sql.VarChar(100), EntryBy);

    console.log("Executing Stored Procedure: Usp_Insert_SQL");
    await request2.execute("Usp_Insert_SQL");

    // Return response after both operations
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
