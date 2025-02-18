import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    // console.log("Received Body:", body);

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { status: false, message: "No data provided" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    // console.log("Connected to Database:", pool.config.database);

    const { CustomerCode, ...updatedData } = body; // Exclude IDENTITY column
    const fields = Object.keys(updatedData);

    if (fields.length === 0) {
      return NextResponse.json(
        { status: false, message: "No valid fields to insert" },
        { status: 400 }
      );
    }

    const columns = fields.join(", ");
    const values = fields.map((field) => `@${field}`).join(", ");
    const query = `INSERT INTO Master_Customer (${columns}) VALUES (${values})`;

    let request = pool.request();
    fields.forEach((field) => {
      let sqlType = sql.NVarChar;
      if (typeof updatedData[field] === "number") sqlType = sql.Int;
      if (typeof updatedData[field] === "boolean") sqlType = sql.Bit;

      request.input(field, sqlType, updatedData[field]);
    });

    // console.log("Executing Query:", query);
    const result = await request.query(query);

    // console.log("SQL Execution Result:", result);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { status: false, message: "Insert failed, no rows affected" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: true, message: "Customer added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
