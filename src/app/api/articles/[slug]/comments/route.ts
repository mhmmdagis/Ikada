import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
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
        include: {
            author: {
                select: { id: true, name: true, username: true, avatar: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
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
    const { content } = await req.json();

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

    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            authorId: session.userId!,
            articleId: article.id,
        },
        include: {
            author: {
                select: { id: true, name: true, username: true, avatar: true },
            },
        },
    });

    return NextResponse.json(comment, { status: 201 });
}
