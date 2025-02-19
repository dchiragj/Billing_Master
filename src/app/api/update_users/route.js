import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json();
    // console.log("Received Body:", body);

    const { ID, ...updatedData } = body; // Extract ID and other fields

    if (!ID) {
      return NextResponse.json(
        { status: false, message: "ID is required for update" },
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
    let query = "UPDATE Master_Users SET ";
    let request = pool.request();

    Object.keys(updatedData).forEach((key, index) => {
      if (updatedData[key] === null || updatedData[key] === undefined) return; // Skip null/undefined values

      let sqlType = sql.NVarChar; // Default type
      if (typeof updatedData[key] === "number") sqlType = sql.BigInt;
      if (typeof updatedData[key] === "boolean") sqlType = sql.Bit;
      if (key.includes("Date")) sqlType = sql.DateTime;

      query += `${key} = @${key}${
        index < Object.keys(updatedData).length - 1 ? "," : ""
      } `;
      request.input(key, sqlType, updatedData[key]);
    });

    query += " WHERE ID = @ID";
    request.input("ID", sql.Int, ID);

    // console.log("Executing Query:", query);
    await request.query(query);

    return NextResponse.json(
      { status: true, message: "User updated successfully" },
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
