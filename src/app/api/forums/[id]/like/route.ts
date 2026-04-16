import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Toggle like on forum. POST = toggle (add if not liked, remove if liked) */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: 'Silakan login untuk menyukai.' }, { status: 401 });
    }

    const { id: forumId } = await params;

    const forum = await prisma.forum.findUnique({
        where: { id: forumId },
        select: { id: true },
    });

    if (!forum) {
        return NextResponse.json({ error: 'Opini tidak ditemukan.' }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
        where: {
            userId_forumId: { userId: session.userId, forumId: forum.id },
        },
        select: { id: true },
    });

    if (existing) {
        await prisma.like.delete({
            where: { id: existing.id },
        });
        const count = await prisma.like.count({ where: { forumId: forum.id } });
        return NextResponse.json({ liked: false, count });
    } else {
        await prisma.like.create({
            data: {
                userId: session.userId,
                forumId: forum.id,
            },
        });
        const count = await prisma.like.count({ where: { forumId: forum.id } });
        return NextResponse.json({ liked: true, count });
    }
}
