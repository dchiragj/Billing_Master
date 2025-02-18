import { db } from "@/db";
import sql from "mssql";

export async function POST(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: false, message: "No data provided" });
  }

  try {
    const pool = await db();
    const fields = Object.keys(req.body);
    const columns = fields.join(", ");
    const values = fields.map((field) => `@${field}`).join(", ");
    const query = `INSERT INTO Master_Customer (${columns}) VALUES (${values})`;

    let request = pool.request();
    fields.forEach((field) => {
      request.input(field, sql.NVarChar, req.body[field] || null);
    });

    await request.query(query);

    return res.status(200).json({ status: true, message: "Customer added successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
}
