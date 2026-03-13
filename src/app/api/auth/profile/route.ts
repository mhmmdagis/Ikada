import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, bio, email, username, avatar, instagram, twitter, linkedin, password } = await req.json();

        // Validate input
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        if (!username || username.trim().length === 0) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // Check unique email if changed
        if (email && email !== session.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        // Check unique username if changed
        const currentUser = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { username: true },
        });
        if (username && currentUser && username !== currentUser.username) {
            const existingUser2 = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUser2 && existingUser2.id !== session.userId) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
            }
        }

        const updateData: any = {
            name: name.trim(),
            bio: bio ? bio.trim() : null,
            email: email?.trim() || session.email,
            username: username.trim(),
            avatar: avatar?.trim() || null,
            instagram: instagram?.trim() || null,
            twitter: twitter?.trim() || null,
            linkedin: linkedin?.trim() || null,
        };

        if (password && password.length > 0) {
            const hashed = await bcrypt.hash(password, 10);
            updateData.password = hashed;
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatar: true,
                username: true,
                instagram: true,
                twitter: true,
                linkedin: true,
            },
        });

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error('[UPDATE PROFILE ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
