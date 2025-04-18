import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { category } = req.query;
      let query = `
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.price, 
          CAST(p.category AS INTEGER) AS category_id, 
          p.images, 
          p.status, 
          p.created_at, 
          c.category_name AS category_name
        FROM products p
        INNER JOIN categories c ON CAST(p.category AS INTEGER) = c.id
      `;

      const params: any[] = [];
      if (category) {
        query += ` WHERE c.slug = $1`;
        params.push(String(category)); // category parametresini string olarak işleyelim
      }

      query += " ORDER BY p.created_at DESC";

      console.log("Executing query:", query, "with params:", params);
      const result = await db.query(query, params);

      console.log("Query result:", result.rows);

      // Görselleri doğru şekilde işleyelim
      const products = result.rows.map((product) => {
        let imagePath = "/placeholder.svg"; // Varsayılan görsel

        try {
          const images = JSON.parse(product.images || "[]"); // Görseller JSON formatında
          if (Array.isArray(images) && images.length > 0) {
            imagePath = images[0]; // İlk resmi al
          }
        } catch (error) {
          console.error("Image parsing error:", error);
        }

        return {
          ...product,
          category: product.category_name, // Kategori adını frontend için uygun hale getir
          image_path: imagePath, // İlk görseli kullan
        };
      });

      console.log("Query result with categories:", products);
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    try {
      // Önce ürüne ait bilgileri al (var mı yok mu kontrol edelim)
      const productResult = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Ürünü sil
      await db.query(`DELETE FROM products WHERE id = $1`, [id]);

      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ error: "Failed to delete product" });
    }
  }

  // Desteklenmeyen HTTP metodları için hata döndür
  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
