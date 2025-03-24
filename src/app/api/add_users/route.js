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

    const sqlString = `EXEC USP_Master_Users_Insert @UserId='${body.UserId}', @UserType='${body.UserType}', @Password='${body.Password}', @LocationCode='${body.LocationCode}', @UserName='${body.UserName}', @PasswordQues='${body.PasswordQues || ''}', @PasswordAns='${body.PasswordAns || ''}', @EmployeeId='${body.EmployeeId || ''}', @ManagerId='${body.ManagerId}', @EmailId='${body.EmailId}', @PhoneNo='${body.PhoneNo}', @ActiveTillDate=${body.ActiveTillDate ? `'${body.ActiveTillDate}'` : 'NULL'}, @PwdLastChangeOn=${body.PwdLastChangeOn ? `'${body.PwdLastChangeOn}'` : 'NULL'}, @LastPwd='${body.LastPwd || ''}', @IsActive=${body.IsActive || 0}, @EntryBy='${body.EntryBy}', @MobileNo='${body.MobileNo}', @Gender='${body.Gender}', @Address='${body.Address}', @DateOfBirth=${body.DateOfBirth ? `'${body.DateOfBirth}'` : 'NULL'}, @DateOfJoining=${body.DateOfJoining ? `'${body.DateOfJoining}'` : 'NULL'}, @CompanyCode='${body.CompanyCode}'`;
    const moduleName = "UserInsert"; // Customize as needed
    const entryType = "Insert"; // Adjust based on operation type

    let request2 = pool.request();
    request2.input("Sql_String", sql.Text, sqlString);
    request2.input("ModuleName", sql.VarChar(100), moduleName);
    request2.input("EntryType", sql.VarChar(100), entryType);
    request2.input("EntryBy", sql.VarChar(100), body.EntryBy);

    console.log("Executing Stored Procedure: Usp_Insert_SQL");
    await request2.execute("Usp_Insert_SQL");

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
