import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json();
    // console.log("request",req);
    
    const {
      CustomerCode,
      GroupCode,
      CustomerName,
      BillType,
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
      PriceType,
      CompanyCode,
      IsActive,
      IsBlackList,
      IsAllow_Trn,
      EntryBy,
    } = body;

    // Validate required fields
    if (
      !CustomerCode ||
      !GroupCode ||
      !CustomerName ||
      !CompanyCode 
      // !LocationId
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            "CustomerCode, GroupCode, CustomerName, CompanyCode are required",
        },
        { status: 400 }
      );
    }

    // console.log("Updating customer:", body);

    const pool = await connectDB();
    const request = pool.request();

    // Pass input parameters to the stored procedure
    request.input("CustomerCode", sql.VarChar(50), CustomerCode);
    request.input("GroupCode", sql.VarChar(20), GroupCode);
    request.input("CustomerName", sql.VarChar(100), CustomerName);
    request.input("BillType", sql.VarChar(50), BillType);
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

    // Second stored procedure: Usp_Insert_SQL
    const sqlString = `EXEC USP_Master_Customer_Update @CustomerCode='${CustomerCode}', @GroupCode='${GroupCode}', @CustomerName='${CustomerName}', @BillType='${BillType || ''}', @CustomerLocationId='${CustomerLocationId || ''}', @CrDays='${CrDays || ''}', @CRLimit='${CRLimit || ''}', @OverDue_Interest='${OverDue_Interest || ''}', @Address='${Address || ''}', @DeliveryAddress='${DeliveryAddress || ''}', @City='${City || ''}', @State='${State || ''}', @PhoneNo='${PhoneNo || ''}', @EmailId='${EmailId || ''}', @Pincode='${Pincode || ''}', @PanNo='${PanNo || ''}', @MobileNo='${MobileNo || ''}', @TaxType='${TaxType || ''}', @PriceType='${PriceType || ''}', @CompanyCode='${CompanyCode}', @IsActive=${IsActive ?? 0}, @IsBlackList=${IsBlackList ?? 0}, @IsAllow_Trn=${IsAllow_Trn ?? 0}, @EntryBy='${EntryBy || ''}'`;
    const moduleName = "CustomerUpdate"; // Customize as needed
    const entryType = "Update"; // This is an update operation

    const request2 = pool.request();
    request2.input("Sql_String", sql.Text, sqlString);
    request2.input("ModuleName", sql.VarChar(100), moduleName);
    request2.input("EntryType", sql.VarChar(100), entryType);
    request2.input("EntryBy", sql.VarChar(100), EntryBy);

    console.log("Executing Stored Procedure: Usp_Insert_SQL");
    await request2.execute("Usp_Insert_SQL");

    console.log("Executing Stored Procedure: USP_Master_Customer_Update");

    // Execute the stored procedure
    const result = await request.execute("USP_Master_Customer_Update");

    return NextResponse.json(
      {
        status: result.recordset[0].Status === 1,
        message: result.recordset[0].Message,
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
