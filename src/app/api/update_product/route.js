import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json(); // ✅ Correct way to parse request body
    // console.log("Received Body:", body);

    const { ProductCode, ...updatedData } = body;

    if (!ProductCode) {
      return NextResponse.json(
        { status: false, message: "ProductCode is required" },
        { status: 400 }
      );
    }

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { status: false, message: "No data provided for update" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    let query = "UPDATE Master_Product SET ";
    let request = pool.request();

    Object.keys(updatedData).forEach((key, index) => {
      if (updatedData[key] === null || updatedData[key] === undefined) {
        return; // Skip null or undefined values
      }

      let sqlType = sql.NVarChar; // Default SQL type
      if (typeof updatedData[key] === "number") sqlType = sql.Int;
      if (typeof updatedData[key] === "boolean") sqlType = sql.Bit;
      if (key.includes("Date")) sqlType = sql.DateTime;

      query += `${key} = @${key}${
        index < Object.keys(updatedData).length - 1 ? "," : ""
      } `;
      request.input(key, sqlType, updatedData[key]);
    });

    query += " WHERE ProductCode = @ProductCode";
    request.input("ProductCode", sql.Int, ProductCode);

    // console.log("Executing Query:", query);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { status: false, message: "No product found with this ProductCode" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: true, message: "Product updated successfully" },
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
