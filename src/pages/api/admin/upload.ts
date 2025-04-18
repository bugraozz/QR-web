import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure uploads directory exists
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

// Parse form data using formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Create uploads directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const productsDir = path.join(uploadsDir, "products");
  ensureDir(uploadsDir);
  ensureDir(productsDir);

  try {
    // Parse the incoming form data
    const { files } = await parseForm(req);

    // Log for debugging
    console.log("Form parsed:", { files });

    // Get the file object
    const file = files.file;

    // Check if file exists
    if (!file) {
      console.error("No file found in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Handle both single file and array of files
    const fileObj = Array.isArray(file) ? file[0] : file;

    // Log for debugging
    console.log("File object:", fileObj);

    if (!fileObj.filepath) {
      console.error("No filepath in file object");
      return res.status(400).json({ error: "Invalid file object" });
    }

    try {
      // Generate a unique filename
      const originalFilename = fileObj.originalFilename || "upload.jpg";
      const fileExt = path.extname(originalFilename);
      const newFilename = `${uuidv4()}${fileExt}`;
      const newFilepath = path.join(productsDir, newFilename);

      // Read the file from the temporary location
      const data = fs.readFileSync(fileObj.filepath);

      // Write it to the new location
      fs.writeFileSync(newFilepath, data);

      // Remove the temporary file
      fs.unlinkSync(fileObj.filepath);

      // Return the public URL
      const publicPath = `/uploads/products/${newFilename}`; // Ensure the public path is correct
      console.log("File saved at:", newFilepath); // Log the full file path
      console.log("Public path returned:", publicPath); // Log the public path returned to the client

      // Log for debugging
      console.log("File saved successfully:", { publicPath });

      return res.status(200).json({
        success: true,
        filePath: publicPath, // Ensure this matches the frontend's expectations
      });
    } catch (error) {
      console.error("Error processing file:", error);
      return res.status(500).json({ error: "Failed to process file" });
    }
  } catch (error) {
    console.error("Error in upload handler:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

