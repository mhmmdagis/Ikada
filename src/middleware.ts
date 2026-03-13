import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/auth';

const sessionOptions = {
    password: process.env.SESSION_SECRET || 'disada-super-secret-key-2024-change-in-prod!',
    cookieName: 'disada_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const res = NextResponse.next();

    const session = await getIronSession<SessionData>(request, res, sessionOptions);

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/login?next=' + pathname, request.url));
        }
        return res;
    }

    // Protected user routes
    const protectedRoutes = ['/writings/new', '/forums/new', '/profile/edit'];
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!session.isLoggedIn) {
            return NextResponse.redirect(new URL('/login?next=' + pathname, request.url));
        }
        return res;
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/writings/new', '/forums/new', '/profile/edit'],
};
