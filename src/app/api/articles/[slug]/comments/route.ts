import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getSession();
    const { slug } = await params;

    const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true, published: true, allowComments: true },
    });

    if (!article || !article.published) {
        return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
        where: { articleId: article.id },
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { slug } = await params;
    const { content, parentId } = await req.json();

    if (!content?.trim()) {
        return NextResponse.json({ error: 'Komentar tidak boleh kosong.' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true, published: true, allowComments: true },
    });

    if (!article || !article.published) {
        return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    if (!article.allowComments) {
        return NextResponse.json({ error: 'Komentar dinonaktifkan untuk artikel ini.' }, { status: 403 });
    }

    if (parentId) {
        const parent = await prisma.comment.findUnique({
            where: { id: parentId },
            select: { id: true, articleId: true },
        });
        if (!parent || parent.articleId !== article.id) {
            return NextResponse.json({ error: 'Komentar induk tidak valid.' }, { status: 400 });
        }
    }

    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            authorId: session.userId!,
            articleId: article.id,
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

    return NextResponse.json({ ...comment, likedByMe: false }, { status: 201 });
}
