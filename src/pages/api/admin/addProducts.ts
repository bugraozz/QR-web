import db from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, description, price, category, images, status } = req.body;

    console.log("Incoming request payload:", { name, description, price, category, images, status });

    if (!name || !price || !category || !status || !images || images.length === 0) {
        console.error("Validation failed: Missing required fields");
        return res.status(400).json({ message: 'Name, price, category, status, and images are required' });
    }

    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price NUMERIC(10, 2) NOT NULL,
                category VARCHAR(255) NOT NULL,
                images TEXT, -- Resimler JSON string formatında saklanacak
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, []);

        const imagesJson = JSON.stringify(images);

        const result = await db.query(
            `INSERT INTO products (name, description, price, category, images, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, description, price, category, imagesJson, status]
        );

        return res.status(201).json({ message: 'Product added successfully', product: result.rows[0] });
    } catch (error) {
        console.error('Database query error', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
