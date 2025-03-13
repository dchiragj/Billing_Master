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


// // import { connectDB, sql } from "@/db";
// // import { NextResponse } from "next/server";
// // import { Builder } from "xml2js";
// // import multer from "multer";
// // import { Readable } from "stream";

// // // Configure Multer to use memory storage (since we just need the data)
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// //   fileFilter: (req, file, cb) => {
// //     const filetypes = /jpeg|jpg|png|pdf/;
// //     const extname = filetypes.test(file.originalname.toLowerCase());
// //     const mimetype = filetypes.test(file.mimetype);
    
// //     if (extname && mimetype) {
// //       cb(null, true);
// //     } else {
// //       cb(new Error("Only images and PDFs are allowed!"));
// //     }
// //   },
// // });

// // // Custom middleware to handle multer with Next.js App Router
// // async function runMulter(req) {
// //   return new Promise((resolve, reject) => {
// //     const multerMiddleware = upload.any(); // Use .any() to accept all files, or specify fields with .fields()
// //     multerMiddleware(req, {}, (err) => {
// //       if (err) return reject(err);
// //       resolve();
// //     });
// //   });
// // }

// // export async function POST(req) {
// //   try {
// //     // Run Multer middleware to parse the multipart form data
// //     await runMulter(req);

// //     // Extract JSON data from the form field named 'data'
// //     const dataField = req.body?.data;
// //     if (!dataField) {
// //       return NextResponse.json(
// //         { status: false, message: "No data field provided in the form" },
// //         { status: 400 }
// //       );
// //     }

// //     const parsedData = JSON.parse(dataField);
// //     const { IMst, ITaxDetail, IPriceDetail, ILocDetail, IImageData, Finyear, CompanyCode, ICode } = parsedData;

// //     // Validate required fields
// //     if (!IMst || !Finyear || !CompanyCode) {
// //       return NextResponse.json(
// //         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
// //         { status: 400 }
// //       );
// //     }

// //     // XML conversion function
// //     const convertToXml = (data, rootName) => {
// //       if (!data) return null;
// //       const builder = new Builder({ rootName: rootName, headless: true });
// //       const formattedData = Array.isArray(data) ? { [rootName]: data } : { [rootName]: data };
// //       return builder.buildObject(formattedData);
// //     };

// //     // Convert data to XML
// //     const IMstXML = convertToXml({ Item: IMst }, "Item");
// //     const ITaxDetailXML = convertToXml(ITaxDetail?.Taxdata, "Taxdata");
// //     const IPriceDetailXML = convertToXml(IPriceDetail?.PriceData, "PriceData");
// //     const ILocDetailXML = convertToXml(ILocDetail?.LocData, "LocData");

// //     // Handle uploaded files from Multer
// //     const files = req.files || [];
// //     const imageData = files.map(file => ({
// //       filename: file.originalname,
// //       mimetype: file.mimetype,
// //       size: file.size,
// //       buffer: file.buffer.toString('base64') // Convert buffer to base64 if needed
// //     }));
// //     const IImageDataXML = convertToXml(imageData, "Images");

// //     // Database connection and query
// //     const pool = await connectDB();
// //     let request = pool.request();

// //     request.input("IMst", sql.Text, IMstXML);
// //     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
// //     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
// //     request.input("ILocDetail", sql.Text, ILocDetailXML || null);
// //     request.input("IImageData", sql.Text, IImageDataXML || null);
// //     request.input("Finyear", sql.VarChar(10), Finyear);
// //     request.input("CompanyCode", sql.VarChar(20), CompanyCode);
// //     request.input("ICode", sql.VarChar(50), ICode || null);

// //     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
// //     const result = await request.execute("Usp_Insert_Item_Data");

// //     return NextResponse.json(
// //       {
// //         status: result.recordset[0]?.Status === 1,
// //         message: result.recordset[0]?.Message || "Unknown response from database",
// //       },
// //       { status: 200 }
// //     );
// //   } catch (error) {
// //     console.error("Error:", error);
// //     return NextResponse.json(
// //       { status: false, message: "Server error", error: error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // Disable Next.js body parser to allow multer to handle the request
// // export const config = {
// //   api: {
// //     bodyParser: false,
// //   },
// // };
// // import { connectDB, sql } from "@/db";
// // import { NextResponse } from "next/server";
// // import { Builder } from "xml2js";
// // import { writeFile } from "fs/promises";
// // import { join } from "path";
// // import fs from "fs";

// // // Function to parse request body (supports JSON)
// // async function parseRequest(req) {
// //   const contentType = req.headers.get("content-type") || "";
  
// //   if (contentType.includes("application/json")) {
// //     const jsonData = await req.json();
// //     return { jsonData, file: null };
// //   } else if (contentType.includes("multipart/form-data")) {
// //     const formData = await req.formData();
// //     const dataString = formData.get("data");
// //     if (!dataString) throw new Error("Missing JSON data in form submission.");

// //     const jsonData = JSON.parse(dataString);
// //     const file = formData.get("Images") || null;
// //     return { jsonData, file };
// //   } else {
// //     throw new Error("Unsupported content type");
// //   }
// // }

// // export async function POST(req) {
// //   try {
// //     const { jsonData, file } = await parseRequest(req);
// //     let { IMst, ITaxDetail, IPriceDetail, rackDetails,IImageData,  Finyear, CompanyCode, ICode } = jsonData;

// //     if (!IMst || !Finyear || !CompanyCode) {
// //       return NextResponse.json(
// //         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
// //         { status: 400 }
// //       );
// //     }

// //     // Save uploaded image if present
// //     if (file && file.name) {
// //       const uploadDir = join(process.cwd(), "public/uploads");
// //       await fs.promises.mkdir(uploadDir, { recursive: true });

// //       const filePath = join(uploadDir, file.name);
// //       await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

// //       IMst[0].Doc_Path = `/uploads/${file.name}`; // Store relative path in first IMst object
// //     }

// //     // Convert objects to XML
// //     const convertToXml = (data, rootName) => {
// //       if (!data || Object.keys(data).length === 0) return null;
// //       const builder = new Builder({ rootName: rootName, headless: true });
// //       return builder.buildObject({ [rootName]: data });
// //     };

// //     const IMstXML = convertToXml(IMst, "Item");
// //     const ITaxDetailXML = convertToXml(ITaxDetail?.Taxdata, "Taxdata");
// //     const IPriceDetailXML = convertToXml(IPriceDetail?.PriceData, "PriceData");
// //     const rackDetailsXML = convertToXml(rackDetails?.LocData, "LocData");
// //     const IImageDataXML = convertToXml(IImageData?.Images, "Images");


// //     // Connect to database
// //     const pool = await connectDB();
// //     let request = pool.request();

// //     request.input("IMst", sql.Text, IMstXML);
// //     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
// //     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
// //     request.input("ILocDetail", sql.Text, rackDetailsXML || null);
// //     request.input("IImageData", sql.Text, IImageDataXML || null);
// //     request.input("Finyear", sql.VarChar(10), Finyear);
// //     request.input("CompanyCode", sql.VarChar(20), CompanyCode);
// //     request.input("ICode", sql.VarChar(50), ICode || null);

// //     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
// //     const result = await request.execute("Usp_Insert_Item_Data");

// //     const dbResponse = result.recordset?.[0];

// //     return NextResponse.json(
// //       {
// //         status: dbResponse?.Status === 1,
// //         message: dbResponse?.Message || "Unknown response from database",
// //       },
// //       { status: 200 }
// //     );
// //   } catch (error) {
// //     console.error("Database error:", error);
// //     return NextResponse.json(
// //       { status: false, message: "Server error", error: error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { IMst, ITaxDetail, IPriceDetail, ILocDetail, IImageData, Finyear, CompanyCode, ICode } = body;

//     // Validate required fields
//     if (!IMst || !Finyear || !CompanyCode) {
//       return NextResponse.json(
//         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
//         { status: 400 }
//       );
//     }

//     // Ensure IMst is an array and update Doc_Path if needed
//     if (Array.isArray(IMst)) {
//       IMst.forEach((item) => {
//         if (!item.Doc_Path) {
//           item.Doc_Path = ""; // Set a default value if Doc_Path is missing
//         }
//       });
//     }

//     // Convert data to XML
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

//     // Connect to the database
//     const pool = await connectDB();
//     let request = pool.request();

//     // Add inputs to the request
//     request.input("IMst", sql.Text, IMstXML);
//     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
//     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
//     request.input("ILocDetail", sql.Text, ILocDetailXML || null);
//     request.input("IImageData", sql.Text, IImageDataXML || null);
//     request.input("Finyear", sql.VarChar(10), Finyear);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);
//     request.input("ICode", sql.VarChar(50), ICode || null);

//     // Execute the stored procedure
//     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
//     const result = await request.execute("Usp_Insert_Item_Data");

//     // Return the response
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

// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";
// import multer from "multer";
// import fs from "fs";
// import path from "path";

// // Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true }); // Create the uploads directory if it doesn't exist
//     }
//     cb(null, uploadDir); // Save files in the "uploads" directory
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname); // Rename the file to avoid conflicts
//   },
// });

// const upload = multer({ storage: storage });

// export async function POST(req) {
//   try {
//     // Parse the request body (form-data)
//     const formData = await req.formData();
//     const body = Object.fromEntries(formData.entries());

//     // Extract fields from the form data
//     const { IMst, ITaxDetail, IPriceDetail, ILocDetail, IImageData, Finyear, CompanyCode, ICode } = body;

//     // Validate required fields
//     if (!IMst || !Finyear || !CompanyCode) {
//       return NextResponse.json(
//         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
//         { status: 400 }
//       );
//     }

//     // Parse JSON fields
//     const parsedIMst = JSON.parse(IMst);
//     const parsedITaxDetail = JSON.parse(ITaxDetail || "{}");
//     const parsedIPriceDetail = JSON.parse(IPriceDetail || "{}");
//     const parsedILocDetail = JSON.parse(ILocDetail || "{}");
//     const parsedIImageData = JSON.parse(IImageData || "{}");

//     // Handle file uploads
//     const files = formData.getAll("files"); // Get all uploaded files
//     const savedFilePaths = [];

//     for (const file of files) {
//       if (file instanceof File) {
//         const buffer = await file.arrayBuffer(); // Convert file to buffer
//         const fileName = Date.now() + "-" + file.name; // Generate a unique file name
//         const filePath = path.join(process.cwd(), "uploads", fileName); // Define the file path

//         // Save the file to the uploads directory
//         fs.writeFileSync(filePath, Buffer.from(buffer));
//         savedFilePaths.push(filePath); // Save the file path
//       }
//     }

//     // Update the Doc_Path field in IMst with the file path(s)
//     if (Array.isArray(parsedIMst)) {
//       parsedIMst.forEach((item, index) => {
//         if (savedFilePaths[index]) {
//           item.Doc_Path = savedFilePaths[index]; // Update Doc_Path with the file path
//         }
//       });
//     }

//     // Convert data to XML
//     const convertToXml = (data, rootName, itemName) => {
//       if (!data) return null;
//       const builder = new Builder({ rootName: rootName, headless: true });
//       const formattedData = Array.isArray(data) ? { [rootName]: data } : { [rootName]: data };
//       return builder.buildObject(formattedData);
//     };

//     const IMstXML = convertToXml({ Item: parsedIMst }, "Item");
//     const ITaxDetailXML = convertToXml(parsedITaxDetail?.Taxdata, "Taxdata");
//     const IPriceDetailXML = convertToXml(parsedIPriceDetail?.PriceData, "PriceData");
//     const ILocDetailXML = convertToXml(parsedILocDetail?.LocData, "LocData");
//     const IImageDataXML = convertToXml(parsedIImageData?.Images, "Images");

//     // Connect to the database
//     const pool = await connectDB();
//     let request = pool.request();

//     // Add inputs to the request
//     request.input("IMst", sql.Text, IMstXML);
//     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
//     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
//     request.input("ILocDetail", sql.Text, ILocDetailXML || null);
//     request.input("IImageData", sql.Text, IImageDataXML || null);
//     request.input("Finyear", sql.VarChar(10), Finyear);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);
//     request.input("ICode", sql.VarChar(50), ICode || null);

//     // Execute the stored procedure
//     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
//     const result = await request.execute("Usp_Insert_Item_Data");

//     // Return the response
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


// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";
// import fs from "fs";
// import path from "path";

// export async function POST(req) {
//   try {
//     // Parse the request body (form-data)
//     const formData = await req.formData();
//     const body = Object.fromEntries(formData.entries());

//     // Extract fields from the form data
//     // const { IMst, ITaxDetail, IPriceDetail, rackDetails, IImageData, Finyear, CompanyCode } = body;
//         const { IMst, ITaxDetail, IPriceDetail, ILocDetail, IImageData, Finyear, CompanyCode, ICode } = body;


//     // Validate required fields
//     if (!IMst || !Finyear || !CompanyCode) {
//       return NextResponse.json(
//         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
//         { status: 400 }
//       );
//     }

//     // Parse JSON fields
//     const parsedIMst = JSON.parse(IMst);
//     const parsedITaxDetail = JSON.parse(ITaxDetail || "{}");
//     const parsedIPriceDetail = JSON.parse(IPriceDetail || "{}");
//     const parsedRackDetails = JSON.parse(ILocDetail || "{}");
//     const parsedIImageData = JSON.parse(IImageData || "{}");

//     // Handle file uploads
//     const file = formData.get("file"); // Get the uploaded file
//     let savedFilePath = null;

//     if (file) {
//       const buffer = await file.arrayBuffer(); // Convert file to buffer
//       const fileName = Date.now() + "-" + file.name; // Generate a unique file name
//       const filePath = path.join(process.cwd(), "public/uploads", fileName); // Define the file path

//       // Save the file to the uploads directory
//       fs.writeFileSync(filePath, Buffer.from(buffer));
//       savedFilePath = filePath; // Save the file path
//     }

//     // Update the Doc_Path field in IMst with the file path
//     if (Array.isArray(parsedIMst)) {
//       parsedIMst.forEach((item) => {
//         if (savedFilePath) {
//           item.Doc_Path = savedFilePath; // Update Doc_Path with the file path
//         }
//       });
//     }

//     // Convert data to XML
//     const convertToXml = (data, rootName, itemName) => {
//       if (!data) return null;
//       const builder = new Builder({ rootName: rootName, headless: true });
//       const formattedData = Array.isArray(data) ? { [rootName]: data } : { [rootName]: data };
//       return builder.buildObject(formattedData);
//     };

//     const IMstXML = convertToXml({ Item: parsedIMst }, "Item");
//     const ITaxDetailXML = convertToXml(parsedITaxDetail?.Taxdata, "Taxdata");
//     const IPriceDetailXML = convertToXml(parsedIPriceDetail?.PriceData, "PriceData");
//     const rackDetailsXML = convertToXml(parsedRackDetails?.LocData, "LocData");
//     const IImageDataXML = convertToXml(parsedIImageData?.Images, "Images");

//     // Connect to the database
//     const pool = await connectDB();
//     let request = pool.request();

//     // Add inputs to the request
//     request.input("IMst", sql.Text, IMstXML);
//     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
//     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
//     request.input("ILocDetail", sql.Text, rackDetailsXML || null);
//     request.input("IImageData", sql.Text, IImageDataXML || null);
//     request.input("Finyear", sql.VarChar(10), Finyear);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);

//     // Execute the stored procedure
//     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
//     const result = await request.execute("Usp_Insert_Item_Data");

//     // Return the response
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


// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";
// import fs from "fs";
// import path from "path";

// export async function POST(req) {
//   try {
//     // Parse the request body (form-data)
//     const formData = await req.formData();
//     console.log(formData, "formData formData");
//     const body = Object.fromEntries(formData.entries());

//     // Extract fields from the form data
//     const { IMst, ITaxDetail, IPriceDetail, rackDetails, IImageData, Finyear, CompanyCode } = body;

//     // Validate required fields
//     if (!IMst || !Finyear || !CompanyCode) {
//       return NextResponse.json(
//         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
//         { status: 400 }
//       );
//     }

//     // Parse JSON fields
//     const parsedIMst = JSON.parse(IMst);
//     const parsedITaxDetail = JSON.parse(ITaxDetail || "{}");
//     const parsedIPriceDetail = JSON.parse(IPriceDetail || "{}");
//     const parsedRackDetails = JSON.parse(rackDetails || "{}");
//     const parsedIImageData = JSON.parse(IImageData || "{}");

//     // Handle file uploads
//     const file = formData.get("file"); // Get the uploaded file
//     let savedFilePath = null;

//     if (file) {
//       const buffer = await file.arrayBuffer(); // Convert file to buffer
//       const fileName = Date.now() + "-" + file.name; // Generate a unique file name

//       const uploadDir = path.join(process.cwd(), "public/uploads"); // Define the upload directory
//       const filePath = path.join(uploadDir, fileName); // Define the file path

//       // ✅ Ensure the uploads directory exists
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       // Save the file to the uploads directory
//       fs.writeFileSync(filePath, Buffer.from(buffer));
//       savedFilePath = `/uploads/${fileName}`; // Use relative path for public access
//     }

//     // Update the Doc_Path field in IMst with the file path
//     if (Array.isArray(parsedIMst)) {
//       parsedIMst.forEach((item) => {
//         if (savedFilePath) {
//           item.Doc_Path = savedFilePath; // Update Doc_Path with the file path
//         }
//       });
//     }

//     // Convert data to XML
//     const convertToXml = (data, rootName) => {
//       if (!data) return null;
//       const builder = new Builder({ rootName: rootName, headless: true });
//       return builder.buildObject({ [rootName]: data });
//     };

//     const IMstXML = convertToXml(parsedIMst, "Item");
//     const ITaxDetailXML = convertToXml(parsedITaxDetail?.Taxdata, "Taxdata");
//     const IPriceDetailXML = convertToXml(parsedIPriceDetail?.PriceData, "PriceData");
//     const rackDetailsXML = convertToXml(parsedRackDetails?.LocData, "LocData");
//     const IImageDataXML = convertToXml(parsedIImageData?.Images, "Images");

//     // Connect to the database
//     const pool = await connectDB();
//     let request = pool.request();

//     console.log(IMstXML,"IMstXML IMstXML");

//     // Add inputs to the request
//     request.input("IMst", sql.Text, IMstXML);
//     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
//     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
//     request.input("ILocDetail", sql.Text, rackDetailsXML || null);
//     request.input("IImageData", sql.Text, IImageDataXML || null);
//     request.input("Finyear", sql.VarChar(10), Finyear);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);

//     // Execute the stored procedure
//     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
//     const result = await request.execute("Usp_Insert_Item_Data");
// // console.log(result,"result result");

//     // Return the response
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








// ========================================================================






// import { connectDB, sql } from "@/db";
// import { NextResponse } from "next/server";
// import { Builder } from "xml2js";
// import fs from "fs";
// import path from "path";

// // Disable Next.js body parsing to handle multipart/form-data
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req) {
//   try {
//     // Read the request as a stream
//     const formData = await req.formData();

//     // Extract form fields
//     const IMst = JSON.parse(formData.get("IMst"));
//     const ITaxDetail = JSON.parse(formData.get("ITaxDetail"));
//     const IPriceDetail = JSON.parse(formData.get("IPriceDetail"));
//     const ILocDetail = JSON.parse(formData.get("ILocDetail"));
//     const IImageData = JSON.parse(formData.get("IImageData"));
//     const Finyear = formData.get("Finyear");
//     const CompanyCode = formData.get("CompanyCode");
//     const ICode = formData.get("ICode");

//     // Extract the uploaded file
//     const file = formData.get("file");
//     if (file) {
//       // Save the file to the "public/uploads" directory
//       const uploadDir = path.join(process.cwd(), "public/uploads");
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const filePath = path.join(uploadDir, file.name);
//       const fileBuffer = await file.arrayBuffer();
//       fs.writeFileSync(filePath, Buffer.from(fileBuffer));

//       // Update IMst with the file path
//       IMst[0].Doc_Path = `/uploads/${file.name}`;
//     }

//     // Validate required fields
//     if (!IMst || !Finyear || !CompanyCode) {
//       return NextResponse.json(
//         { status: false, message: "IMst, Finyear, and CompanyCode are required." },
//         { status: 400 }
//       );
//     }

//     // Convert data to XML
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

//     // Connect to the database
//     const pool = await connectDB();
//     let request = pool.request();

//     // Add inputs to the SQL request
//     request.input("IMst", sql.Text, IMstXML);
//     request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
//     request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
//     request.input("ILocDetail", sql.Text, ILocDetailXML || null);
//     request.input("IImageData", sql.Text, IImageDataXML || null);
//     request.input("Finyear", sql.VarChar(10), Finyear);
//     request.input("CompanyCode", sql.VarChar(20), CompanyCode);
//     request.input("ICode", sql.VarChar(50), ICode || null);
    

//     // Execute the stored procedure
//     console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
//     const result = await request.execute("Usp_Insert_Item_Data");

//     // Return the response
//     return NextResponse.json(
//       {
//         status: result.recordset[0]?.Status === 1,
//         message: result.recordset[0]?.Message || "Unknown response from database",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error processing request:", error);
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

// Disable Next.js body parsing to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    // Read the request as a stream
    const formData = await req.formData();

    // Extract form fields
    const IMst = JSON.parse(formData.get("IMst"));
    const ITaxDetail = JSON.parse(formData.get("ITaxDetail"));
    const IPriceDetail = JSON.parse(formData.get("IPriceDetail"));
    const ILocDetail = JSON.parse(formData.get("ILocDetail"));
    const IImageData = JSON.parse(formData.get("IImageData"));
    const Finyear = formData.get("Finyear");
    const CompanyCode = formData.get("CompanyCode");
    const ICode = formData.get("ICode");

    // Log the received ICode
    console.log("ICode received:", ICode);

    // Extract the uploaded file (if provided)
    const file = formData.get("file");
    if (file) {
      // Save the file to the "public/uploads" directory
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, file.name);
      const fileBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));

      // Update IMst with the file path only if a file is provided
      IMst[0].Doc_Path = `/uploads/${file.name}`;
    }

    // Validate required fields
    if (!IMst || !Finyear || !CompanyCode) {
      return NextResponse.json(
        { status: false, message: "IMst, Finyear, and CompanyCode are required." },
        { status: 400 }
      );
    }

    // Convert data to XML
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

    // Connect to the database
    const pool = await connectDB();
    let request = pool.request();

    // Add inputs to the SQL request
    request.input("IMst", sql.Text, IMstXML);
    request.input("ITaxDetail", sql.Text, ITaxDetailXML || null);
    request.input("IPriceDetail", sql.Text, IPriceDetailXML || null);
    request.input("ILocDetail", sql.Text, ILocDetailXML || null);
    request.input("IImageData", sql.Text, IImageDataXML || null);
    request.input("Finyear", sql.VarChar(10), Finyear);
    request.input("CompanyCode", sql.VarChar(20), CompanyCode);
    request.input("ICode", sql.VarChar(50), ICode || null);

    // Execute the stored procedure
    console.log("Executing Stored Procedure: Usp_Insert_Item_Data");
    const result = await request.execute("Usp_Insert_Item_Data");

    // Log the result
    console.log("Stored Procedure Result:", result);

    // Return the response
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