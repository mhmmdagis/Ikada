import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const comments = await prisma.comment.findMany({
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
                forum: {
                    select: { id: true, title: true },
                },
                article: {
                    select: { id: true, title: true, slug: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('[GET COMMENTS ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { commentId } = await req.json();

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        console.error('[DELETE COMMENT ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
