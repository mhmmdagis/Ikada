import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth';

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
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
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
        // add security headers for protected route responses
        res.headers.set('X-Frame-Options', 'DENY');
        res.headers.set('X-Content-Type-Options', 'nosniff');
        res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.headers.set('X-XSS-Protection', '1; mode=block');
        res.headers.set('Permissions-Policy', "geolocation=(), microphone=()");
        // Content Security Policy - adjust as needed
        res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:;");
        if (process.env.NODE_ENV === 'production') {
            res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        return res;
    }

    // Add security headers for all other responses
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Permissions-Policy', "geolocation=(), microphone=()");
    res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:;");
    if (process.env.NODE_ENV === 'production') {
        res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/writings/new', '/forums/new', '/profile/edit'],
};
