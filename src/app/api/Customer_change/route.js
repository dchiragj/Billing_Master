import { connectDB, sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const CustCd = searchParams.get("CustCd"); // Assuming CustCd as the primary input
    console.log("parameter",searchParams);
    
    // Validate required parameter
    if (!CustCd) {
      return NextResponse.json(
        { status: false, message: "CustCd is required." },
        { status: 400 }
      );
    }

    // Database connection and query execution
    const pool = await connectDB();
    const request = pool.request();

    // Input parameter for the stored procedure
    request.input("Code", sql.VarChar(50), CustCd);

    console.log("Executing Stored Procedure: USP_Invoice_Cust_Item_Location_Changed");
    const result = await request.execute("USP_Invoice_Cust_Item_Location_Changed");

    // Log result for debugging
    console.log("Database Result:", JSON.stringify(result, null, 2));

    // Check if there's a recordset and process the response
    if (!result.recordset || result.recordset.length === 0) {
      return NextResponse.json(
        { status: false, message: "No data returned from stored procedure" },
        { status: 404 }
      );
    } 

      return NextResponse.json(
        {
          status: result.recordsets[0][0]?.Status === 1,
          message: result.recordsets[0][0]?.Message,
          data: result.recordsets[0][0]?.Status==1?result.recordsets[1][0]:null
        },
        { status: 200 }
      );
   

    // // Split the concatenated string into individual fields
    // const [
    //   success, 
    //   CodeID, 
    //   CodeDesc, 
    //   ChargesDetails, 
    //   PriceType, 
    //   Price_ChargesDetails, 
    //   CRDAYS, 
    //   CRlimit, 
    //   overdue_interest, 
    //   OutStandingAmount, 
    //   Allow_Trn, 
    //   CustCat, 
    //   Dely_Address, 
    //   BlackList_Y_N, 
    //   Address, 
    //   TempCrLimit, 
    //   MobNo, 
    //   City, 
    //   State, 
    //   Pincode
    // ] = returnCode.split('@/');

    // // Construct the response object
    // const responseData = {
    //   success: success === "true",
    //   CodeID,
    //   CodeDesc,
    //   ChargesDetails,
    //   PriceType,
    //   Price_ChargesDetails,
    //   CRDAYS: parseInt(CRDAYS, 10) || 0,
    //   CRlimit: parseFloat(CRlimit) || 0,
    //   overdue_interest: parseFloat(overdue_interest) || 0,
    //   OutStandingAmount: parseFloat(OutStandingAmount) || 0,
    //   Allow_Trn,
    //   CustCat,
    //   Dely_Address,
    //   BlackList_Y_N,
    //   Address,
    //   TempCrLimit,
    //   MobNo,
    //   City,
    //   State,
    //   Pincode
    // };

    // return NextResponse.json(
    //   {
    //     status: true,
    //     message: "Data retrieved successfully",
    //     data: responseData
    //   },
    //   { status: 200 }
    // );

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}