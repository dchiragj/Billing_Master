import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const pool = await connectDB();
    const { searchParams } = new URL(req.url);
    const ProductCode = searchParams.get("ProductCode"); // Get ProductCode from query params

    let query = "SELECT * FROM Master_Product";
    let request = pool.request();

    if (ProductCode) {
      query += " WHERE ProductCode = @ProductCode";
      request.input("ProductCode", sql.Int, ProductCode);
    }

    console.log("Executing Query:", query);
    const result = await request.query(query);

    return NextResponse.json(
      { status: true, data: result.recordset },
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
