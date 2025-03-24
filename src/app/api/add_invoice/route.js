import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";
import { Builder } from "xml2js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      InvMst,          // Invoice Master data
      Invdet,          // Invoice Details data
      Finyear,         // Financial year
      CompanyCode,     // Company code
      Brcd,            // Branch code
      InvType,         // Invoice type (T/R)
      TrnType          // Transaction type (E)
    } = body;

    const invMstData = InvMst; 
    const invDetData = Invdet; 

    // Validate required fields
    if (!invMstData || !Finyear || !CompanyCode ) {
      return NextResponse.json(
        { status: false, message: "InvMst, Finyear, CompanyCode, and Brcd are required." },
        { status: 400 }
      );
    }
    // console.log("invDetData111:", invDetData);

    // XML conversion helper function
    const convertToXml = (data, rootName) => {
      if (!data) return '';
      const builder = new Builder({ rootName: "root", headless: true });
      return builder.buildObject({ [rootName]: data });
    };

    // Convert data to XML with proper root elements
    const InvMstXML = convertToXml(invMstData, "InvMst");
    const InvdetXML = convertToXml(invDetData, "Invdet");

    // Log XML for debugging
    // console.log("InvMstXML:", InvMstXML);
    // console.log("InvdetXML:", InvdetXML);

    // Database connection and query execution
    const pool = await connectDB();
    let request = pool.request();

    const InvType1=InvType || 'T';
    const TrnType1=TrnType || 'E';

    // Input parameters matching the stored procedure
    request.input("InvMst", sql.Text, InvMstXML);
    request.input("Invdet", sql.Text, InvdetXML || '');
    request.input("Billno", sql.Text, ''); // Empty as per examples
    request.input("InvType", sql.Char(1), InvType1); // Default to 'T' if not provided
    request.input("TrnType", sql.Char(1), TrnType1); // Default to 'E' if not provided
    request.input("Brcd", sql.VarChar(10), Brcd);
    request.input("Finyear", sql.VarChar(10), Finyear);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);

    const  Sql_Test = "EXEC [Usp_Insert_Invoice_Data_New] '" + InvMstXML + "','" + InvdetXML + "','','" + InvType1 + "','" 
    + TrnType1 + "','" + Brcd + "','" + Finyear + "','" + CompanyCode + "'";
    
    let auditRequest = pool.request();
    auditRequest.input("Sql_String", sql.NVarChar, Sql_Test);
    auditRequest.input("ModuleName", sql.NVarChar, "add_invoice");
    auditRequest.input("EntryType", sql.NVarChar, "Insert");
    auditRequest.input("EntryBy", sql.NVarChar, "10001"); // You can modify this value as needed

    await auditRequest.execute("Usp_Insert_SQL");

    console.log("Executing Stored Procedure: Usp_Insert_Invoice_Data");
    const result = await request.execute("Usp_Insert_Invoice_Data");
    // console.log("Result:", result); 

    // Process database response
    return NextResponse.json(
      {
        status: result.recordset[0]?.Status === 1,
        message: result.recordset[0]?.Message || "Invoice data inserted successfully",
        billNo: result.recordset[0]?.Billno // Include BillNo if returned
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


