import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      GroupCode,
      CustomerName,
      BillType,
      LocationId,
      CustomerLocationId,
      CrDays,
      CRLimit,
      OverDue_Interest,
      Address,
      DeliveryAddress,
      City,
      State,
      PhoneNo,
      EmailId,
      Pincode,
      PanNo,
      MobileNo,
      TaxType,
      FinYear,
      PriceType,
      CompanyCode,
      IsActive,
      IsBlackList,
      IsAllow_Trn,
      EntryBy,
    } = body;

    // Validate required fields
    if (!GroupCode || !CustomerName || !CompanyCode || !LocationId) {
      return NextResponse.json(
        { status: false, message: "GroupCode, CustomerName, CompanyCode, and LocationId are required" },
        { status: 400 }
      );
    }

    console.log("Inserting new customer:", body);

    const pool = await connectDB();
    const request = pool.request();

    // Pass input parameters to the stored procedure
    request.input("GroupCode", sql.VarChar(20), GroupCode);
    request.input("CustomerName", sql.VarChar(100), CustomerName);
    request.input("BillType", sql.VarChar(50), BillType);
    request.input("LocationId", sql.VarChar(100), LocationId);
    request.input("CustomerLocationId", sql.VarChar(100), CustomerLocationId);
    request.input("CrDays", sql.VarChar(50), CrDays);
    request.input("CRLimit", sql.VarChar(150), CRLimit);
    request.input("OverDue_Interest", sql.VarChar(150), OverDue_Interest);
    request.input("Address", sql.VarChar(500), Address);
    request.input("DeliveryAddress", sql.VarChar(500), DeliveryAddress);
    request.input("City", sql.VarChar(50), City);
    request.input("State", sql.VarChar(50), State);
    request.input("PhoneNo", sql.VarChar(50), PhoneNo);
    request.input("EmailId", sql.VarChar(100), EmailId);
    request.input("Pincode", sql.VarChar(500), Pincode);
    request.input("PanNo", sql.VarChar(50), PanNo);
    request.input("MobileNo", sql.VarChar(15), MobileNo);
    request.input("TaxType", sql.VarChar(50), TaxType);
    request.input("PriceType", sql.VarChar(50), PriceType);
    request.input("CompanyCode", sql.VarChar(50), CompanyCode);
    request.input("IsActive", sql.Bit, IsActive);
    request.input("IsBlackList", sql.Bit, IsBlackList);
    request.input("IsAllow_Trn", sql.Bit, IsAllow_Trn);
    request.input("EntryBy", sql.VarChar(50), EntryBy);
    request.input("FinYear", sql.VarChar(50), FinYear);

    console.log("Executing Stored Procedure: USP_Master_Customer_Insert");

    // Execute the stored procedure
    const result = await request.execute("USP_Master_Customer_Insert");
    console.log(result);
    
    return NextResponse.json(
      { status: result.recordset[0].Status === 1?true:false, message: result.recordset[0].Message },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
