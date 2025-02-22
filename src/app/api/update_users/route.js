import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("Received Body:", body);

    // Extract necessary fields explicitly
    const {
      UserId,
      UserType,
      UserPwd,
      LocationCode,
      UserName,
      Password,
      PasswordQues,
      PasswordAns,
      EmployeeId,
      ManagerId,
      EntryBy,
      EmailId,
      PhoneNo,
      ActiveTillDate,
      IsActive,
      MobileNo,
      Gender,
      Address,
      DateOfBirth,
      DateOfJoining,
      CompanyCode,
    } = body;

    // Validate required fields
    const requiredFields = [
      "UserId",
      "UserType",
      "Password",
      "LocationCode",
      "UserName",
      "EmailId",
      "PhoneNo",
      "IsActive",
      "EntryBy",
      "MobileNo",
      "Gender",
      "Address",
      "CompanyCode",
    ];

    const missingFields = requiredFields.filter((field) => !(field in body));
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status: false,
          message: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    let request = pool.request();

    // Explicitly map only required parameters to stored procedure
    request.input("UserId", sql.VarChar, UserId);
    request.input("UserType", sql.Int, UserType || null);
    request.input("UserPwd", sql.VarChar, UserPwd || "");
    request.input("LocationCode", sql.VarChar, LocationCode || "");
    request.input("UserName", sql.VarChar, UserName || "");
    request.input("PasswordQues", sql.VarChar, PasswordQues || "");
    request.input("PasswordAns", sql.VarChar, PasswordAns || "");
    request.input("EmployeeId", sql.VarChar, EmployeeId || "");
    request.input("ManagerId", sql.VarChar, ManagerId || "");
    request.input("EmailId", sql.VarChar, EmailId || "");
    request.input("PhoneNo", sql.VarChar, PhoneNo || "");
    request.input("EntryBy", sql.VarChar, EntryBy || "");
    request.input("ActiveTillDate", sql.DateTime, ActiveTillDate || null);
    request.input("IsActive", sql.Bit, IsActive || null);
    request.input("MobileNo", sql.VarChar, MobileNo || "");
    request.input("Gender", sql.VarChar, Gender || "");
    request.input("Address", sql.VarChar, Address || "");
    request.input("DateOfBirth", sql.DateTime, DateOfBirth || null);
    request.input("DateOfJoining", sql.DateTime, DateOfJoining || null);
    request.input("CompanyCode", sql.VarChar, CompanyCode || "");

    console.log("Executing Stored Procedure: USP_Master_Users_Update");

    const result = await request.execute("USP_Master_Users_Update");
    // console.log("Result:",result);

    return NextResponse.json(
      {
        status: result.recordset[0]?.Status === 1,
        message: result.recordset[0]?.Message || "Update successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error" },
      { status: 500 }
    );
  }
}
