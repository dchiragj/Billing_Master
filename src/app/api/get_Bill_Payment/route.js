// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const billno = searchParams.get("billno") || "";
//     const Party_code = searchParams.get("Party_code") || "";
//     const Fromdt = searchParams.get("Fromdt") || null;
//     const Todt = searchParams.get("Todt") || null;
//     const loccode = searchParams.get("loccode") || null;
//     const manualbillno = searchParams.get("manualbillno") || "";
//     const CompanyCode = searchParams.get("CompanyCode") || null;

//     // console.log("Received Params:", {
//     //   billno,
//     //   Party_code,
//     //   Billtype,
//     //   Fromdt,
//     //   Todt,
//     //   loccode,
//     //   manualbillno,
//     //   Type,
//     //   CompanyCode,
//     // });

//     const pool = await connectDB();
//     const request = pool.request();

//     // Ensure NULL values are passed instead of empty strings
//     request.input("billno", sql.VarChar(50), billno);
//     request.input("Party_code", sql.VarChar(100), Party_code);
//     // request.input("Billtype", sql.VarChar(100), Billtype);
//     request.input("Fromdt", sql.VarChar(200), Fromdt);
//     request.input("Todt", sql.VarChar(100), Todt);
//     request.input("loccode", sql.VarChar(100), loccode);
//     request.input("manualbillno", sql.VarChar(100), manualbillno);
//     // request.input("Type", sql.VarChar(100), Type);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);

//     console.log("Executing Stored Procedure: USP_BillPayment_JV");

//     // Execute stored procedure
//     const result = await request.execute("USP_BillPayment_JV");
//     // console.log(result);

//     return NextResponse.json(
//       { status: result.recordset[0].Status === 1, message: result.recordset[0].Message },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Database error:", error.message);

//     return NextResponse.json(
//       { status: false, message: "Server error", error: error.message},
//       { status: 500 }
//     );
//   }
// }


import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const billno = searchParams.get("billno") || "";
    const Party_code = searchParams.get("Party_code") || "";
    const Fromdt = searchParams.get("Fromdt") || null;
    const Todt = searchParams.get("Todt") || null;
    const loccode = searchParams.get("loccode") || null;
    const manualbillno = searchParams.get("manualbillno") || "";
    const CompanyCode = searchParams.get("CompanyCode") || null;

    // Validate required fields
    // if (!billno) {
    //   throw { status: 400, message: "Bill number is required" };
    // }
    // console.log(Todt,Fromdt);
    const pool = await connectDB();
    const request = pool.request();

    // Set input parameters for the stored procedure
    request.input("billno", sql.VarChar(50), billno);
    request.input("Party_code", sql.VarChar(100), Party_code);
    request.input("Fromdt", sql.VarChar(200), Fromdt);
    request.input("Todt", sql.VarChar(100), Todt);
    request.input("loccode", sql.VarChar(100), loccode);
    request.input("manualbillno", sql.VarChar(100), manualbillno);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);

    console.log("Executing Stored Procedure: USP_BillPayment_JV");

    // Execute the stored procedure
    const result = await request.execute("USP_BillPayment_JV");
    // console.log(result);
    

    // Check if no data is returned
    if (result.recordset.length === 0) {
      throw { status: 404, message: "No data found for the given bill number" };
    }

    // Return successful response with data
    return NextResponse.json(
      { status: true, data: result.recordset },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error.message || error);

    // Handle custom errors thrown in the try block
    if (error.status && error.message) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: error.status }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}