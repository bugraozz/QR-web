import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Category ID is required and must be a string" });
  }

  if (req.method === "GET") {
    try {
      console.log("Fetching category with ID:", id);

      const result = await db.query("SELECT * FROM categories WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  if (req.method === "DELETE") {
    try {
      console.log("Deleting category with ID:", id);

      const result = await db.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ error: "Failed to delete category" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { category_name, slug, image_path } = req.body;

      if (!category_name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const existingCategory = await db.query(
        "SELECT * FROM categories WHERE category_name = $1 AND slug = $2 AND id != $3",
        [category_name, slug, id]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(409).json({ error: "Slug already exists for another category" });
      }

      const result = await db.query(
        "UPDATE categories SET category_name = $1, slug = $2, image_path = $3 WHERE id = $4 RETURNING *",
        [category_name, slug, image_path, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({ error: "Failed to update category" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

