import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json();
    
    const {
      LocationCode,
      LocationId,
      CompanyCode,
      LocationName,
      LevelId,
      ReportLocationId,
      ReportLevelId,
      Address,
      State,
      City,
      Pincode,
      STDCode,
      PhoneNo,
      FaxNo,
      MobileNo,
      EmailId,
      AccountLocationId,
      IsActive,
      EntryBy,
    } = body;

    // Validate required fields
    if (!LocationCode || !CompanyCode) {
      return NextResponse.json(
        { status: false, message: "LocationCode and CompanyCode are required" },
        { status: 400 }
      );
    }

    // console.log("Updating location:", body);

    const pool = await connectDB();
    const request = pool.request();

    // Pass input parameters to the stored procedure
    request.input("LocationCode", sql.VarChar(100), LocationCode);
    request.input("LocationId", sql.VarChar(100), LocationId.toString());
    request.input("CompanyCode", sql.VarChar(100), CompanyCode);
    request.input("LocationName", sql.VarChar(100), LocationName);
    request.input("LevelId", sql.Int, LevelId);
    request.input("ReportLocationId", sql.VarChar(25), ReportLocationId);
    request.input("ReportLevelId", sql.Int, ReportLevelId);
    request.input("Address", sql.VarChar(500), Address);
    request.input("State", sql.VarChar(50), State);
    request.input("City", sql.VarChar(50), City);
    request.input("Pincode", sql.VarChar(6), Pincode);
    request.input("STDCode", sql.VarChar(10), STDCode);
    request.input("PhoneNo", sql.VarChar(50), PhoneNo);
    request.input("FaxNo", sql.VarChar(50), FaxNo);
    request.input("MobileNo", sql.VarChar(15), MobileNo);
    request.input("EmailId", sql.VarChar(50), EmailId);
    request.input("AccountLocationId", sql.VarChar(25), AccountLocationId);
    request.input("IsActive", sql.Bit, IsActive);
    request.input("EntryBy", sql.VarChar(50), EntryBy);

    const sqlString = `EXEC USP_Location_Update @LocationCode='${LocationCode}', @LocationId='${LocationId?.toString() || ''}', @CompanyCode='${CompanyCode}', @LocationName='${LocationName || ''}', @LevelId=${LevelId ?? 'NULL'}, @ReportLocationId='${ReportLocationId || ''}', @ReportLevelId=${ReportLevelId ?? 'NULL'}, @Address='${Address || ''}', @State='${State || ''}', @City='${City || ''}', @Pincode='${Pincode || ''}', @STDCode='${STDCode || ''}', @PhoneNo='${PhoneNo || ''}', @FaxNo='${FaxNo || ''}', @MobileNo='${MobileNo || ''}', @EmailId='${EmailId || ''}', @AccountLocationId='${AccountLocationId || ''}', @IsActive=${IsActive ?? 0}, @EntryBy='${EntryBy || ''}'`;
    const moduleName = "LocationUpdate"; // Customize as needed
    const entryType = "Update"; // This is an update operation

    const request2 = pool.request();
    request2.input("Sql_String", sql.Text, sqlString);
    request2.input("ModuleName", sql.VarChar(100), moduleName);
    request2.input("EntryType", sql.VarChar(100), entryType);
    request2.input("EntryBy", sql.VarChar(100), EntryBy);

    console.log("Executing Stored Procedure: Usp_Insert_SQL");
    await request2.execute("Usp_Insert_SQL");

    console.log("Executing Stored Procedure: USP_Location_Update");

    // Execute the stored procedure
    const result = await request.execute("USP_Location_Update");

    return NextResponse.json(
      { status: result.recordset[0].Status === 1, message: result.recordset[0].Message },
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
