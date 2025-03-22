// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const {
//       ChqDet,          // Cheque Details data
//       BillMRDET,       // Bill MR Details data
//       MRHDR,           // MR Header data
//       MR_Location,     // Location code
//       FinYear,         // Financial year
//       EntryBy,         // User entering the data
//       CompanyCode      // Company code
//     } = body;

//     // Validate required fields
//     if (!MRHDR || !FinYear || !CompanyCode || !EntryBy || !MR_Location) {
//       return NextResponse.json(
//         { status: false, message: "MRHDR, FinYear, CompanyCode, EntryBy, and MR_Location are required." },
//         { status: 400 }
//       );
//     }

//     // XML conversion helper function
//     const convertToXml = (data, rootName) => {
//       if (!data) return '';
//       const builder = new Builder({ rootName: "root", headless: true });
//       return builder.buildObject({ [rootName]: data });
//     };

//     // Convert JSON to XML
//     const ChqDetXML = convertToXml(ChqDet, "ChqDet");
//     const BillMRDETXML = convertToXml(BillMRDET, "BillMRDET");
//     const MRHDRXML = convertToXml(MRHDR, "MRHDR");

//     // Log XML for debugging
//     // console.log("ChqDetXML:", ChqDetXML);
//     // console.log("BillMRDETXML:", BillMRDETXML);
//     // console.log("MRHDRXML:", MRHDRXML);

//     // Database connection and query execution
//     const pool = await connectDB();
//     const request = pool.request();

//     // Input parameters for the stored procedure
//     request.input("MR_Location", sql.VarChar(20), MR_Location);
//     request.input("Xml_Chq_Det", sql.Text, ChqDetXML || '');
//     request.input("Xml_BillMR_DET", sql.Text, BillMRDETXML || '');
//     request.input("Xml_MRHDR", sql.Text, MRHDRXML);
//     request.input("FinYear", sql.VarChar(10), FinYear);
//     request.input("EntryBy", sql.VarChar(10), EntryBy);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);

//     console.log("Executing Stored Procedure: Usp_BillMR_Generate");
//     const result = await request.execute("Usp_BillMR_Generate");

//     // Log full result for debugging
//     //  console.log("Database Result:", JSON.stringify(result, null, 2));

//     // Process database response
//     if (!result.recordset || result.recordset.length === 0) {
//       return NextResponse.json(
//         { status: false, message: "No response from stored procedure" },
//         { status: 500 }
//       );
//     }

//     const [status, message, mrsnoWithVoucher] = [
//       result.recordset[0].Status,
//       result.recordset[0].Message,
//       result.recordset[0].MRSNO
//     ];
//     const [mrsno, voucherno] = mrsnoWithVoucher.split('~');

//     const data = {
//       mrsno: mrsno === 'NA' ? null : mrsno,
//       voucherno: voucherno || null
//     };

//     return NextResponse.json(
//       {
//         status: status === 1,
//         message: message || "Bill MR generated successfully",
//         data
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { status: false, message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";
import { Builder } from "xml2js";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      ChqDet, // Cheque Details data
      BillMRDET, // Bill MR Details data
      MRHDR, // MR Header data
      MR_Location, // Location code
      FinYear, // Financial year
      EntryBy, // User entering the data
      CompanyCode, // Company code
    } = body;

    // Validate required fields
    if (!MRHDR || !FinYear || !CompanyCode || !EntryBy || !MR_Location) {
      return NextResponse.json(
        {
          status: false,
          message:
            "MRHDR, FinYear, CompanyCode, EntryBy, and MR_Location are required.",
        },
        { status: 400 }
      );
    }

    // XML conversion helper function
    const convertToXml = (data, rootName) => {
      if (!data) return "";
      const builder = new Builder({ rootName: "root", headless: true });
      return builder.buildObject({ [rootName]: data });
    };

    // Convert JSON to XML
    const ChqDetXML = convertToXml(ChqDet, "ChqDet");
    const BillMRDETXML = convertToXml(BillMRDET, "BillMRDET");
    const MRHDRXML = convertToXml(MRHDR, "MRHDR");

    // Database connection
    const pool = await connectDB();

    // First stored procedure: Usp_BillMR_Generate
    const request1 = pool.request();
    request1.input("MR_Location", sql.VarChar(20), MR_Location);
    request1.input("Xml_Chq_Det", sql.Text, ChqDetXML || "");
    request1.input("Xml_BillMR_DET", sql.Text, BillMRDETXML || "");
    request1.input("Xml_MRHDR", sql.Text, MRHDRXML);
    request1.input("FinYear", sql.VarChar(10), FinYear);
    request1.input("EntryBy", sql.VarChar(10), EntryBy);
    request1.input("CompanyCode", sql.VarChar(20), CompanyCode);

    // Second stored procedure: Usp_Insert_SQL
    const sqlString = `EXEC Usp_BillMR_Generate @MR_Location='${MR_Location}', @Xml_Chq_Det='${
      ChqDetXML || ""
    }', @Xml_BillMR_DET='${
      BillMRDETXML || ""
    }', @Xml_MRHDR='${MRHDRXML}', @FinYear='${FinYear}', @EntryBy='${EntryBy}', @CompanyCode='${CompanyCode}'`;
    const moduleName = "BillMRGeneration"; // Customize this as needed
    const entryType = "Insert"; // Could be 'Insert', 'Update', or 'Delete' based on your logic

    const request2 = pool.request();
    request2.input("Sql_String", sql.Text, sqlString);
    request2.input("ModuleName", sql.VarChar(100), moduleName);
    request2.input("EntryType", sql.VarChar(100), entryType);
    request2.input("EntryBy", sql.VarChar(100), EntryBy);

    console.log("Executing Stored Procedure: Usp_Insert_SQL");
    await request2.execute("Usp_Insert_SQL");
    
    console.log("Executing Stored Procedure: Usp_BillMR_Generate");
    const result = await request1.execute("Usp_BillMR_Generate");

    // Process Usp_BillMR_Generate response
    if (!result.recordset || result.recordset.length === 0) {
      return NextResponse.json(
        { status: false, message: "No response from stored procedure" },
        { status: 500 }
      );
    }

    const [status, message, mrsnoWithVoucher] = [
      result.recordset[0].Status,
      result.recordset[0].Message,
      result.recordset[0].MRSNO,
    ];
    const [mrsno, voucherno] = mrsnoWithVoucher.split("~");

    const data = {
      mrsno: mrsno === "NA" ? null : mrsno,
      voucherno: voucherno || null,
    };

    

    // Return response after both procedures are executed
    return NextResponse.json(
      {
        status: status === 1,
        message: message || "Bill MR generated successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
