import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const { id: forumId } = await params;

    const forum = await prisma.forum.findUnique({ where: { id: forumId }, select: { id: true } });
    if (!forum) return NextResponse.json({ error: 'Diskusi tidak ditemukan.' }, { status: 404 });

    const comments = await prisma.comment.findMany({
        where: { forumId },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            content: true,
            parentId: true,
            createdAt: true,
            author: { select: { id: true, name: true, username: true, avatar: true } },
            _count: { select: { likes: true } },
        },
    });

    const userId = session.isLoggedIn ? session.userId : undefined;
    if (!userId || comments.length === 0) {
        return NextResponse.json(comments.map(c => ({ ...c, likedByMe: false })));
    }

    const likes = await prisma.like.findMany({
        where: { userId, commentId: { in: comments.map(c => c.id) } },
        select: { commentId: true },
    });
    const likedSet = new Set(likes.map(l => l.commentId).filter(Boolean) as string[]);

    return NextResponse.json(comments.map(c => ({ ...c, likedByMe: likedSet.has(c.id) })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { id } = await params;
    const { content, parentId } = await req.json();

    if (!content?.trim()) {
        return NextResponse.json({ error: 'Komentar tidak boleh kosong.' }, { status: 400 });
    }

    if (parentId) {
        const parent = await prisma.comment.findUnique({
            where: { id: parentId },
            select: { id: true, forumId: true },
        });
        if (!parent || parent.forumId !== id) {
            return NextResponse.json({ error: 'Komentar induk tidak valid.' }, { status: 400 });
        }
    }

    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            authorId: session.userId!,
            forumId: id,
            parentId: parentId || null,
        },
        select: {
            id: true,
            content: true,
            parentId: true,
            createdAt: true,
            author: { select: { id: true, name: true, username: true, avatar: true } },
            _count: { select: { likes: true } },
        },
    });

    // Update forum updatedAt
    await prisma.forum.update({ where: { id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ ...comment, likedByMe: false }, { status: 201 });
}
