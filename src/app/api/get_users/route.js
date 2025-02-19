import { connectDB } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const pool = await connectDB();
    const query = "SELECT * FROM Master_Users"; // Fetch all users
    const result = await pool.request().query(query);

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
