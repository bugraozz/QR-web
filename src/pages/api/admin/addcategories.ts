import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

async function ensureCategoriesTableExists() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_path VARCHAR(255)
      )
    `, []);
  } catch (error) {
    console.error("Error ensuring categories table exists:", error);
    throw new Error("Failed to ensure categories table exists");
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure the categories table exists before handling any requests
    await ensureCategoriesTableExists();
  } catch (error) {
    return res.status(500).json({ error: "Failed to initialize database" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.query(
        'SELECT id, category_name , slug, created_at, image_path FROM categories ORDER BY created_at DESC',
        []
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, slug, image_path } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const existingCategory = await db.query("SELECT * FROM categories WHERE slug = $1", [slug]);
      if (existingCategory.rows.length > 0) {
        return res.status(409).json({ error: "Slug already exists" });
      }

      const result = await db.query(
        "INSERT INTO categories (category_name, slug, image_path) VALUES ($1, $2, $3) RETURNING *",
        [name, slug, image_path || null]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error adding category:", error);
      return res.status(500).json({ error: "Failed to add category" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

