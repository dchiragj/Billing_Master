// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     // console.log("Received Body:", body);

//     if (!body || Object.keys(body).length === 0) {
//       return NextResponse.json(
//         { status: false, message: "No data provided" },
//         { status: 400 }
//       );
//     }

//     const pool = await connectDB();
//     let request = pool.request();
    
//     const fields = Object.keys(body);
//     const columns = fields.join(", ");
//     const values = fields.map((field) => `@${field}`).join(", ");
//     const query = `INSERT INTO Master_Company (${columns}) VALUES (${values})`;

//     fields.forEach((field) => {
//       let sqlType = sql.NVarChar; // Default type

//       if (typeof body[field] === "number") {
//         sqlType = body[field] > 2147483647 ? sql.BigInt : sql.Int; // Use BigInt for large numbers
//       }
//       if (typeof body[field] === "boolean") sqlType = sql.Bit;
//       if (field.includes("Date")) sqlType = sql.DateTime; // Handle Date fields

//       request.input(field, sqlType, body[field]);
//     });

//     // console.log("Executing Query:", query);
//     await request.query(query);

//     return NextResponse.json(
//       { status: true, message: "Company added successfully" },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { status: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }


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
        sqlType = body[field] > 2147483647 ? sql.BigInt : sql.Int;
      }
      if (typeof body[field] === "boolean") sqlType = sql.Bit;
      if (field.includes("Date")) sqlType = sql.DateTime;

      request.input(field, sqlType, body[field]);
    });

    // console.log("Executing Query:", query);
    await request.query(query);

    // Call the stored procedure after successful insert
    let auditRequest = pool.request();
    auditRequest.input("Sql_String", sql.NVarChar, query);
    auditRequest.input("ModuleName", sql.NVarChar, "Master_Company");
    auditRequest.input("EntryType", sql.NVarChar, "Insert");
    auditRequest.input("EntryBy", sql.NVarChar, "10001"); // You can modify this value as needed
    
    await auditRequest.execute("Usp_Insert_SQL");

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
