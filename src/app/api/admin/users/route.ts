import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole, isSuperAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        articles: true,
                        forums: true,
                        comments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('[GET USERS ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || !isSuperAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized - super admin only' }, { status: 401 });
        }

        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
        }

        const username = name.trim().toLowerCase().replace(/\s+/g, '_');
        const hashedPassword = await bcrypt.hash(password, 12);

        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
            const updated = await prisma.user.update({
                where: { email },
                data: {
                    name,
                    username,
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Admin berhasil diperbarui.',
                user: {
                    id: updated.id,
                    name: updated.name,
                    email: updated.email,
                    role: updated.role,
                    bio: updated.bio,
                    createdAt: updated.createdAt,
                    _count: { articles: 0, forums: 0, comments: 0 },
                },
            });
        }

        const admin = await prisma.user.create({
            data: {
                username,
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Admin berhasil dibuat.',
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                bio: admin.bio,
                createdAt: admin.createdAt,
                _count: { articles: 0, forums: 0, comments: 0 },
            },
        });
    } catch (error) {
        console.error('[CREATE ADMIN ERROR]', error);
        return NextResponse.json({ error: 'Gagal membuat admin.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Prevent admin from deleting themselves
        if (userId === session.userId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Admin (non-super) cannot delete ADMIN/SUPER_ADMIN accounts
        if (targetUser.role === 'ADMIN' && !isSuperAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized to delete admin account' }, { status: 403 });
        }

        if (targetUser.role === 'SUPER_ADMIN' && !isSuperAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized to delete super admin account' }, { status: 403 });
        }

        // Delete user data
        await prisma.like.deleteMany({ where: { userId } });
        await prisma.comment.deleteMany({ where: { authorId: userId } });
        await prisma.article.deleteMany({ where: { authorId: userId } });
        await prisma.forum.deleteMany({ where: { authorId: userId } });
        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('[DELETE USER ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
