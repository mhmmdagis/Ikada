import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Toggle like on article. POST = toggle (add if not liked, remove if liked) */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: 'Silakan login untuk menyukai.' }, { status: 401 });
    }

    const { slug } = await params;

    const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true, published: true },
    });

    if (!article || !article.published) {
        return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
        where: {
            userId_articleId: { userId: session.userId, articleId: article.id },
        },
    });

    if (existing) {
        await prisma.like.delete({
            where: { id: existing.id },
        });
        const count = await prisma.like.count({ where: { articleId: article.id } });
        return NextResponse.json({ liked: false, count });
    } else {
        await prisma.like.create({
            data: {
                userId: session.userId,
                articleId: article.id,
            },
        });
        const count = await prisma.like.count({ where: { articleId: article.id } });
        return NextResponse.json({ liked: true, count });
    }
}
