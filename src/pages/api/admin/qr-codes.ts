import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

async function ensureTableExists() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id SERIAL PRIMARY KEY,
        menu_url TEXT NOT NULL,
        size INTEGER NOT NULL,
        color VARCHAR(7) NOT NULL,
        bg_color VARCHAR(7) NOT NULL,
        error_correction CHAR(1) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `, []);
    console.log("Table 'qr_codes' ensured to exist.");
  } catch (error) {
    console.error("Error ensuring 'qr_codes' table exists:", error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await ensureTableExists(); // Ensure the table exists before handling requests
  } catch (error) {
    return res.status(500).json({ error: "Failed to ensure database table exists" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.query("SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 1", []);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No QR code configuration found" });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching QR code configuration:", error);
      return res.status(500).json({ error: "Failed to fetch QR code configuration" });
    }
  }

  if (req.method === "POST") {
    const { menu_url, size, color, bg_color, error_correction } = req.body;

    if (!menu_url || !size || !color || !bg_color || !error_correction) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await db.query(
        `INSERT INTO qr_codes (menu_url, size, color, bg_color, error_correction) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [menu_url, size, color, bg_color, error_correction]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error saving QR code configuration:", error);
      return res.status(500).json({ error: "Failed to save QR code configuration" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
