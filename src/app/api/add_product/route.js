import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ Parse request body correctly
    // console.log("Received Body:", body);

    if (!body.ProductName) {
      return NextResponse.json(
        { status: false, message: "ProductName is required" },
        { status: 400 }
      );
    }

    // Exclude ProductCode if it's an identity column
    const { ProductCode, ...productData } = body;

    const pool = await connectDB();
    const fields = Object.keys(productData);

    if (fields.length === 0) {
      return NextResponse.json(
        { status: false, message: "No valid fields to insert" },
        { status: 400 }
      );
    }

    const columns = fields.join(", ");
    const values = fields.map((field) => `@${field}`).join(", ");
    const query = `INSERT INTO Master_Product (${columns}) VALUES (${values})`;

    let request = pool.request();

    fields.forEach((field) => {
      const value = productData[field];

      // Assign SQL type dynamically
      let sqlType = sql.NVarChar; // Default type
      if (typeof value === "number") sqlType = sql.Int;
      if (typeof value === "boolean") sqlType = sql.Bit;
      if (field.includes("Date")) sqlType = sql.DateTime;

      request.input(field, sqlType, value ?? null); // Handle null values
    });

    // console.log("Executing Query:", query);
    await request.query(query);

    return NextResponse.json(
      { status: true, message: "Product added successfully" },
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
