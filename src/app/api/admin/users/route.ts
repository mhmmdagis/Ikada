import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
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

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
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

        // Delete all user's data
        await prisma.like.deleteMany({ where: { userId } });
        // comments use authorId in schema
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
