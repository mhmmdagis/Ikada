import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/auth';

const sessionOptions = {
    password: process.env.SESSION_SECRET || 'disada-super-secret-key-2024-change-in-prod!',
    cookieName: 'disada_session',
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

export async function POST(req: NextRequest) {
    const res = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.destroy();
    return res;
}
