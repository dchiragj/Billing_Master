// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { IMst, ITaxDetail, IPriceDetail, ILocDetail, IImageData, Finyear, CompanyCode, ICode } = body;

//     if (!IMst || !Finyear || !CompanyCode) {
//       return NextResponse.json(
//         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
//         { status: 400 }
//       );
//     }

//     const convertToXml = (data, rootName, itemName) => {
//       if (!data) return null;
//       const builder = new Builder({ rootName: rootName, headless: true });
//       const formattedData = Array.isArray(data) ? { [rootName]: data } : { [rootName]: data };
//       return builder.buildObject(formattedData);
//     };

//     const IMstXML = convertToXml({ Item: IMst }, "Item");
//     const ITaxDetailXML = convertToXml(ITaxDetail?.Taxdata, "Taxdata");
//     const IPriceDetailXML = convertToXml(IPriceDetail?.PriceData, "PriceData");
//     const ILocDetailXML = convertToXml(ILocDetail?.LocData, "LocData");
//     const IImageDataXML = convertToXml(IImageData?.Images, "Images");

//     const pool = await connectDB();
//     let request = pool.request();

//     request.input("IMst", sql.Text, IMstXML);
//     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
//     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
//     request.input("ILocDetail", sql.Text, ILocDetailXML || null);
//     request.input("IImageData", sql.Text, IImageDataXML || null);
//     request.input("Finyear", sql.VarChar(10), Finyear);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);              
//     request.input("ICode", sql.VarChar(50), ICode||null);

//     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
//     const result = await request.execute("Usp_Insert_Item_Data");

//     return NextResponse.json(
//       {
//         status: result.recordset[0]?.Status === 1,
//         message: result.recordset[0]?.Message || "Unknown response from database",
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
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const IMst = JSON.parse(formData.get("IMst"));
    const ITaxDetail = JSON.parse(formData.get("ITaxDetail"));
    const IPriceDetail = JSON.parse(formData.get("IPriceDetail"));
    const ILocDetail = JSON.parse(formData.get("LocData"));
    const IImageData = JSON.parse(formData.get("IImageData"));
    const Finyear = formData.get("Finyear");
    const CompanyCode = formData.get("CompanyCode");
    const ICode = formData.get("ICode");

    const file = formData.get("file");
    if (file) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, file.name);
      const fileBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));

      IMst[0].Doc_Path = `/uploads/${file.name}`;
    }

    if (!IMst || !Finyear || !CompanyCode) {
      return NextResponse.json(
        { status: false, message: "IMst, Finyear, and CompanyCode are required." },
        { status: 400 }
      );
    }

    const convertToXml = (data, rootName, itemName) => {
      if (!data) return null;
      const builder = new Builder({ rootName: rootName, headless: true });
      const formattedData = Array.isArray(data) ? { [rootName]: data } : { [rootName]: data };
      return builder.buildObject(formattedData);
    };

    const IMstXML = convertToXml({ Item: IMst }, "Item");
    const ITaxDetailXML = convertToXml(ITaxDetail?.Taxdata, "Taxdata");
    const IPriceDetailXML = convertToXml(IPriceDetail?.PriceData, "PriceData");
    const ILocDetailXML = convertToXml(ILocDetail?.LocData, "LocData");
    const IImageDataXML = convertToXml(IImageData?.Images, "Images");

    const pool = await connectDB();
    let request = pool.request();

    request.input("IMst", sql.Text, IMstXML);
    request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
    request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
    request.input("ILocDetail", sql.Text, ILocDetailXML || null);
    request.input("IImageData", sql.Text, IImageDataXML || null);
    request.input("Finyear", sql.VarChar(10), Finyear);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);
    request.input("ICode", sql.VarChar(50), ICode || null);

    const  Sql_Test = "EXEC [Usp_Insert_Item_Data] '" + IMstXML + "','" + ITaxDetailXML + "','" + IPriceDetailXML + "','" 
    + ILocDetailXML + "','" + IImageDataXML + "','" + Finyear + "','" + CompanyCode + "','" + ICode || null + "'";
    
    let auditRequest = pool.request();
    auditRequest.input("Sql_String", sql.NVarChar, Sql_Test);
    auditRequest.input("ModuleName", sql.NVarChar, "add_item");
    auditRequest.input("EntryType", sql.NVarChar, "Insert");
    auditRequest.input("EntryBy", sql.NVarChar, "10001"); // You can modify this value as needed

    await auditRequest.execute("Usp_Insert_SQL");

    console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
    const result = await request.execute("Usp_Insert_Item_Data");

    console.log("Stored Procedure Result:", result);

    return NextResponse.json(
      {
        status: result.recordset[0]?.Status === 1,
        message: result.recordset[0]?.Message || "Unknown response from database",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}