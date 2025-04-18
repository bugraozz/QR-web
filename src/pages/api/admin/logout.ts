import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Clear the session cookie
    const cookie = serialize('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0, // Expire immediately
    });
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({ message: 'Logout successful' });
}
