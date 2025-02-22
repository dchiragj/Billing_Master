import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      "UserId", "UserType", "Password", "LocationCode", "UserName",
       "ManagerId", "EmailId",
      "PhoneNo", "IsActive",
      "EntryBy", "MobileNo", "Gender", "Address",
       "CompanyCode"
    ];

    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { status: false, message: `Missing fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    let request = pool.request();

    // Map parameters to stored procedure
    request.input("UserId", sql.VarChar(20), body.UserId);
    request.input("UserType", sql.VarChar(5), body.UserType);
    request.input("Password", sql.VarChar(500), body.Password);
    request.input("LocationCode", sql.VarChar(10), body.LocationCode);
    request.input("UserName", sql.VarChar(50), body.UserName);
    request.input("PasswordQues", sql.VarChar(150), body.PasswordQues);
    request.input("PasswordAns", sql.VarChar(150), body.PasswordAns);
    request.input("EmployeeId", sql.VarChar(20), body.EmployeeId);
    request.input("ManagerId", sql.VarChar(20), body.ManagerId);
    request.input("EmailId", sql.VarChar(50), body.EmailId);
    request.input("PhoneNo", sql.VarChar(20), body.PhoneNo);
    request.input("ActiveTillDate", sql.DateTime, body.ActiveTillDate);
    request.input("PwdLastChangeOn", sql.DateTime, body.PwdLastChangeOn);
    request.input("LastPwd", sql.VarChar(500), body.LastPwd);
    request.input("IsActive", sql.Bit, body.IsActive);
    request.input("EntryBy", sql.VarChar(50), body.EntryBy);
    request.input("MobileNo", sql.VarChar(15), body.MobileNo);
    request.input("Gender", sql.VarChar(1), body.Gender);
    request.input("Address", sql.VarChar(250), body.Address);
    request.input("DateOfBirth", sql.DateTime, body.DateOfBirth);
    request.input("DateOfJoining", sql.DateTime, body.DateOfJoining);
    request.input("CompanyCode", sql.VarChar(50), body.CompanyCode);

    console.log("Executing Stored Procedure: USP_Master_Users_Insert");

    const result = await request.execute("USP_Master_Users_Insert");
    // console.log(result);
    

    return NextResponse.json(
      { status: result.recordset[0]?.Status === 1, message: result.recordset[0]?.Message },
      { status: result.recordset[0]?.Status === 1 ? 201 : 400 }
    );

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
