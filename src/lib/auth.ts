import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionData {
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
    isLoggedIn?: boolean;
}

const sessionOptions = {
    password: process.env.SESSION_SECRET || 'disada-super-secret-key-2024-change-in-prod!',
    cookieName: 'disada_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export function isAdminRole(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdminRole(role?: string) {
    return role === 'SUPER_ADMIN';
}

export async function getSessionFromRequest(req: NextRequest): Promise<IronSession<SessionData>> {
    return getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
}
