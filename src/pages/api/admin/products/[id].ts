import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const result = await db.query(
        `SELECT id, name, description, price, category, images, status FROM products WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = result.rows[0];

      try {
        product.images = JSON.parse(product.images || "[]");
      } catch {
        product.images = [];
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  if (req.method === "PUT") {
    const { name, description, price, category, images, status } = req.body;

    if (!name || !price || !category || !status) {
      return res.status(400).json({ error: "Name, price, category, and status are required" });
    }

    try {
      const formattedImages = JSON.stringify(images);

      const result = await db.query(
        `UPDATE products SET name = $1, description = $2, price = $3, category = $4, images = $5, status = $6 WHERE id = $7 RETURNING *`,
        [name, description, price, category, formattedImages, status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json({ message: "Product updated successfully", product: result.rows[0] });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ error: "Failed to update product" });
    }
  }

  // ✅ DELETE METODUNU EKLEYELİM (Görsel Silme)
  if (req.method === "DELETE") {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image path is required" });
    }

    try {
      const productResult = await db.query(
        `SELECT images FROM products WHERE id = $1`,
        [id]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      // ✅ Mevcut görselleri al ve silineni çıkar
      const currentImages = JSON.parse(productResult.rows[0].images || "[]");
      const updatedImages = currentImages.filter((img: string) => img !== image);

      // ✅ Veritabanında güncelle
      await db.query(
        `UPDATE products SET images = $1 WHERE id = $2`,
        [JSON.stringify(updatedImages), id]
      );

      return res.status(200).json({ message: "Image removed successfully" });
    } catch (error) {
      console.error("Error removing image:", error);
      return res.status(500).json({ error: "Failed to remove image" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
