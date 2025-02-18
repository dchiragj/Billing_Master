import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  if (req.method !== "PUT") {
    return NextResponse.json(
      { status: false, message: `Method ${req.method} Not Allowed` },
      { status: 405 }
    );
  }

  try {
    const pool = await connectDB();
    const request = pool.request();
    const body = await req.json();

    // console.log("Received Body:", body); // Debugging

    const { CustomerCode, ...updatedData } = body;

    if (!CustomerCode) {
      return NextResponse.json(
        { status: false, message: "CustomerCode is required" },
        { status: 400 }
      );
    }

    // Check if CustomerCode exists in the database
    const checkQuery = "SELECT COUNT(*) AS count FROM Master_Customer WHERE CustomerCode = @CustomerCode";
    request.input("CustomerCode", sql.Int, CustomerCode);
    const result = await request.query(checkQuery);

    if (result.recordset[0].count === 0) {
      return NextResponse.json(
        { status: false, message: "CustomerCode not found" },
        { status: 404 }
      );
    }

    let updateFields = [];
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== null && updatedData[key] !== undefined) {
        let sqlType = sql.NVarChar; // Default type

        if (typeof updatedData[key] === "number") {
          sqlType = sql.Int;
        } else if (typeof updatedData[key] === "boolean") {
          sqlType = sql.Bit;
        }

        updateFields.push(`${key} = @${key}`);
        request.input(key, sqlType, updatedData[key]);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { status: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const query = `UPDATE Master_Customer SET ${updateFields.join(", ")} WHERE CustomerCode = @CustomerCode`;
    // console.log("Executing Query:", query); // Debugging

    const updateResult = await request.query(query);

    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { status: false, message: "Update failed, no rows affected" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: true, message: "Customer updated successfully" },
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
