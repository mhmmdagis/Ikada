import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const forums = await prisma.forum.findMany({
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(forums);
    } catch (error) {
        console.error('[GET FORUMS ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch forums' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { forumId } = await req.json();

        if (!forumId) {
            return NextResponse.json({ error: 'Forum ID required' }, { status: 400 });
        }

        // Delete comments first
        await prisma.comment.deleteMany({
            where: { forumId },
        });

        // Delete forum
        await prisma.forum.delete({
            where: { id: forumId },
        });

        return NextResponse.json({ success: true, message: 'Forum deleted' });
    } catch (error) {
        console.error('[DELETE FORUM ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete forum' }, { status: 500 });
    }
}
