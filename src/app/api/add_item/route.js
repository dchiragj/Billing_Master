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
import multer from "multer";
import { Readable } from "stream";

// Configure Multer to use memory storage (since we just need the data)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed!"));
    }
  },
});

// Custom middleware to handle multer with Next.js App Router
async function runMulter(req) {
  return new Promise((resolve, reject) => {
    const multerMiddleware = upload.any(); // Use .any() to accept all files, or specify fields with .fields()
    multerMiddleware(req, {}, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function POST(req) {
  try {
    // Run Multer middleware to parse the multipart form data
    await runMulter(req);

    // Extract JSON data from the form field named 'data'
    const dataField = req.body?.data;
    if (!dataField) {
      return NextResponse.json(
        { status: false, message: "No data field provided in the form" },
        { status: 400 }
      );
    }

    const parsedData = JSON.parse(dataField);
    const { IMst, ITaxDetail, IPriceDetail, ILocDetail, IImageData, Finyear, CompanyCode, ICode } = parsedData;

    // Validate required fields
    if (!IMst || !Finyear || !CompanyCode) {
      return NextResponse.json(
        { status: false, message: "IMst, Finyear, and CompanyCode are required." },
        { status: 400 }
      );
    }

    // XML conversion function
    const convertToXml = (data, rootName) => {
      if (!data) return null;
      const builder = new Builder({ rootName: rootName, headless: true });
      const formattedData = Array.isArray(data) ? { [rootName]: data } : { [rootName]: data };
      return builder.buildObject(formattedData);
    };

    // Convert data to XML
    const IMstXML = convertToXml({ Item: IMst }, "Item");
    const ITaxDetailXML = convertToXml(ITaxDetail?.Taxdata, "Taxdata");
    const IPriceDetailXML = convertToXml(IPriceDetail?.PriceData, "PriceData");
    const ILocDetailXML = convertToXml(ILocDetail?.LocData, "LocData");

    // Handle uploaded files from Multer
    const files = req.files || [];
    const imageData = files.map(file => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64') // Convert buffer to base64 if needed
    }));
    const IImageDataXML = convertToXml(imageData, "Images");

    // Database connection and query
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

    console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
    const result = await request.execute("Usp_Insert_Item_Data");

    return NextResponse.json(
      {
        status: result.recordset[0]?.Status === 1,
        message: result.recordset[0]?.Message || "Unknown response from database",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Disable Next.js body parser to allow multer to handle the request
export const config = {
  api: {
    bodyParser: false,
  },
};
