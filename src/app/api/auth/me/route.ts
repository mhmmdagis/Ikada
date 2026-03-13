import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        console.log('🔍 /api/auth/me - Session:', {
            isLoggedIn: session.isLoggedIn,
            userId: session.userId,
            role: session.role
        });

        if (!session.isLoggedIn || !session.userId) {
            console.log('🔍 /api/auth/me - Not logged in or no userId');
            return NextResponse.json({ isLoggedIn: false, user: null });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                bio: true,
                avatar: true,
                instagram: true,
                twitter: true,
                linkedin: true,
                role: true,
            },
        });

        console.log('🔍 /api/auth/me - User from DB:', user);

        if (!user) {
            console.log('🔍 /api/auth/me - User not found in DB');
            return NextResponse.json({ isLoggedIn: false, user: null });
        }

        const response = {
            isLoggedIn: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                instagram: user.instagram,
                twitter: user.twitter,
                linkedin: user.linkedin,
                role: user.role,
            },
        };

        console.log('🔍 /api/auth/me - Response:', response);
        return NextResponse.json(response);
    } catch (error) {
        console.error('❌ /api/auth/me - Error:', error);
        return NextResponse.json({ isLoggedIn: false, user: null });
    }
}
