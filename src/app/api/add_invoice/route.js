import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";
import { Builder } from "xml2js";
import jwt from "jsonwebtoken";  // Add this import

export async function POST(req) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: "Authentication token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    // Verify and decode the token
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { status: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get UserId from decoded token
    const userId = decodedToken.id;
  
    const body = await req.json();
    const { 
      InvMst,
      Invdet,
      Finyear,
      CompanyCode,
      Brcd,
      InvType,
      TrnType
    } = body;

    const invMstData = InvMst; 
    const invDetData = Invdet;

    if (!invMstData || !Finyear || !CompanyCode) {
      return NextResponse.json(
        { status: false, message: "InvMst, Finyear, CompanyCode are required." },
        { status: 400 }
      );
    }

    const convertToXml = (data, rootName) => {
      if (!data) return '';
      const builder = new Builder({ rootName: "root", headless: true });
      return builder.buildObject({ [rootName]: data });
    };

    const InvMstXML = convertToXml(invMstData, "InvMst");
    const InvdetXML = convertToXml(invDetData, "Invdet");

    const pool = await connectDB();
    let request = pool.request();

    const InvType1 = InvType || 'T';
    const TrnType1 = TrnType || 'E';

    request.input("InvMst", sql.Text, InvMstXML);
    request.input("Invdet", sql.Text, InvdetXML || '');
    request.input("Billno", sql.Text, '');
    request.input("InvType", sql.Char(1), InvType1);
    request.input("TrnType", sql.Char(1), TrnType1);
    request.input("Brcd", sql.VarChar(10), Brcd);
    request.input("Finyear", sql.VarChar(10), Finyear);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);
    request.input("EntryBy", sql.NVarChar, userId); // Use dynamic userId here instead of "10001"


    const Sql_Test = "EXEC [Usp_Insert_Invoice_Data] '" + InvMstXML + "','" + InvdetXML + "','','" + InvType1 + "','" 
      + TrnType1 + "','" + Brcd + "','" + Finyear + "','" + CompanyCode + "','" + userId + "'";
    
    let auditRequest = pool.request();
    auditRequest.input("Sql_String", sql.NVarChar, Sql_Test);
    auditRequest.input("ModuleName", sql.NVarChar, "add_invoice");
    auditRequest.input("EntryType", sql.NVarChar, "Insert");
    auditRequest.input("EntryBy", sql.NVarChar, userId); // Use dynamic userId here instead of "10001"

    await auditRequest.execute("Usp_Insert_SQL");

    console.log("Executing Stored Procedure: Usp_Insert_Invoice_Data");
    const result = await request.execute("Usp_Insert_Invoice_Data");

    return NextResponse.json(
      {
        status: result.recordset[0]?.Status === 1,
        message: result.recordset[0]?.Message || "Invoice data inserted successfully",
        billNo: result.recordset[0]?.Billno
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