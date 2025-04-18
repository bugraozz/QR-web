import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { admin_session } = req.cookies;

    if (admin_session === 'true') {
        return res.status(200).json({ authenticated: true });
    } else {
        return res.status(401).json({ authenticated: false });
    }
}
