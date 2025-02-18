import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server"; // Import NextResponse

export async function GET() {
  try {
    const pool = await sql.connect(connectDB);
    const result = await pool.request().query("SELECT * FROM Master_Customer");

    return NextResponse.json({ status: true, data: result.recordset }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
