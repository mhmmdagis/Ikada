import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, isAdminRole } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    noStore();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const commentPage = parseInt(searchParams.get('commentPage') || '1');
    const commentLimit = parseInt(searchParams.get('commentLimit') || '20');
    const commentSkip = (commentPage - 1) * commentLimit;

    const [forum, comments, commentCount] = await Promise.all([
        prisma.forum.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                views: true,
                pinned: true,
                createdAt: true,
                updatedAt: true,
                author: { select: { id: true, name: true, avatar: true } },
                category: { select: { id: true, name: true, slug: true, color: true } },
                _count: { select: { comments: true, likes: true } },
            },
        }),
        prisma.comment.findMany({
            where: { forumId: id },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                author: { select: { id: true, name: true, avatar: true } },
                _count: { select: { likes: true } }
            },
            orderBy: { createdAt: 'asc' },
            take: commentLimit,
            skip: commentSkip,
        }),
        prisma.comment.count({ where: { forumId: id } })
    ]);

    if (!forum) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });
    
    return NextResponse.json({
        ...forum,
        comments,
        commentPagination: {
            page: commentPage,
            limit: commentLimit,
            total: commentCount,
            pages: Math.ceil(commentCount / commentLimit)
        }
    });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const forum = await prisma.forum.findUnique({ where: { id } });
    if (!forum) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });

    if (forum.authorId !== session.userId && !isAdminRole(session.role)) {
        return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
    }

    await prisma.forum.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
