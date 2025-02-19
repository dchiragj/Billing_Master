import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received Body:", body);

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { status: false, message: "No data provided" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    const fields = Object.keys(body);
    const columns = fields.join(", ");
    const values = fields.map((field) => `@${field}`).join(", ");
    const query = `INSERT INTO Master_Users (${columns}) VALUES (${values})`;

    let request = pool.request();
    fields.forEach((field) => {
      let sqlType = sql.NVarChar; // Default type
      if (typeof body[field] === "number") sqlType = sql.Int;
      if (typeof body[field] === "boolean") sqlType = sql.Bit;
      if (field.includes("Date")) sqlType = sql.DateTime;

      request.input(field, sqlType, body[field]);
    });

    console.log("Executing Query:", query);
    await request.query(query);

    return NextResponse.json(
      { status: true, message: "User added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error" },
      { status: 500 }
    );
  }
}
