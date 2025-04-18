import db from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { compare } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = result.rows[0];
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Set a session cookie
        const cookie = serialize('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });
        res.setHeader('Set-Cookie', cookie);

        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Database query error', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return res.status(500).json({ message: 'Internal server error', details: errorMessage });
    }
}