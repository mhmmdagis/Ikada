import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { SessionData } from '@/lib/auth';

const sessionOptions = {
    password: process.env.SESSION_SECRET || 'disada-super-secret-key-2024-change-in-prod!',
    cookieName: 'disada_session',
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
        }

        if (!user.emailVerified) {
            return NextResponse.json({ error: 'Silakan verifikasi email Anda terlebih dahulu.' }, { status: 401 });
        }

        const res = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        });

        const session = await getIronSession<SessionData>(req, res, sessionOptions);
        session.userId = user.id;
        session.name = user.name;
        session.email = user.email;
        session.role = user.role;
        session.isLoggedIn = true;
        await session.save();

        return res;
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }
}
