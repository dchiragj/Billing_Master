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
    let request = pool.request();
    
    const fields = Object.keys(body);
    const columns = fields.join(", ");
    const values = fields.map((field) => `@${field}`).join(", ");
    const query = `INSERT INTO Master_Company (${columns}) VALUES (${values})`;

    fields.forEach((field) => {
      let sqlType = sql.NVarChar; // Default type

      if (typeof body[field] === "number") {
        sqlType = body[field] > 2147483647 ? sql.BigInt : sql.Int; // Use BigInt for large numbers
      }
      if (typeof body[field] === "boolean") sqlType = sql.Bit;
      if (field.includes("Date")) sqlType = sql.DateTime; // Handle Date fields

      request.input(field, sqlType, body[field]);
    });

    // console.log("Executing Query:", query);
    await request.query(query);

    return NextResponse.json(
      { status: true, message: "Company added successfully" },
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

// {
//     "CompanyCode": 1,
//     "CompanyName": "also",
//     "LocationId": "mini",
//     "Address": "abc",
//     "ContactPerson": "ankit",
//     "ContactNo": 9726012740,
//     "ServicetaxNo": 9726012740,
//     "PANNo": "66fvge",
//     "TANNo": "46isfvii",
//     "PunchLine": "wofoh",
//     "RegistrationNo": 2164,
//     "TelephoneNo": 646469416166,
//     "FaxNo": 25416496,
//     "HelpLineNo": 14613264562,
//     "IsActive": true,
//     "EntryBy": "jvbciwbc",
//     "EntryDate": "2025-02-18T10:00:00Z",
//     "UpdatedBy": "admib",
//     "UpdatedDate": "2025-02-18T10:00:00Z"
// }
