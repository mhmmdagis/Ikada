import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Toggle like on comment. POST = toggle (add if not liked, remove if liked) */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: 'Silakan login untuk menyukai.' }, { status: 401 });
    }

    const { id: commentId } = await params;

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, article: { select: { published: true } }, forumId: true },
    });

    if (!comment) {
        return NextResponse.json({ error: 'Komentar tidak ditemukan.' }, { status: 404 });
    }

    if (comment.article && !comment.article.published) {
        return NextResponse.json({ error: 'Komentar tidak ditemukan.' }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
        where: {
            userId_commentId: { userId: session.userId, commentId: comment.id },
        },
        select: { id: true },
    });

    if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        const count = await prisma.like.count({ where: { commentId: comment.id } });
        return NextResponse.json({ liked: false, count });
    }

    await prisma.like.create({
        data: {
            userId: session.userId,
            commentId: comment.id,
        },
    });
    const count = await prisma.like.count({ where: { commentId: comment.id } });
    return NextResponse.json({ liked: true, count });
}

