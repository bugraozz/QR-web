import db from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcrypt';
import { serialize } from 'cookie';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, newPassword } = req.body;

    if (!username || typeof username !== 'string' || !newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    try {
        const hashedPassword = await hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password = $1 WHERE username = $2',
            [hashedPassword, 'admin']
        );

        res.setHeader(
            'Set-Cookie',
            serialize('authToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                expires: new Date(0),
            })
        );

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}