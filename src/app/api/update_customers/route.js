import { db } from "@/db";
import sql from "mssql";

export async function PUT (req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { CustomerCode, ...updatedData } = req.body;

  if (!CustomerCode) {
    return res.status(400).json({ status: false, message: "CustomerCode is required" });
  }

  try {
    const pool = await db();
    let query = "UPDATE Master_Customer SET ";
    let request = pool.request();

    Object.keys(updatedData).forEach((key, index) => {
      query += `${key} = @${key}${index < Object.keys(updatedData).length - 1 ? "," : ""} `;
      request.input(key, sql.NVarChar, updatedData[key]);
    });

    query += "WHERE CustomerCode = @CustomerCode";
    request.input("CustomerCode", sql.Int, CustomerCode);

    await request.query(query);

    return res.status(200).json({ status: true, message: "Customer updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
}
