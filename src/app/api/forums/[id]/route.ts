import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    noStore();
    const { id } = await params;

    const forum = await prisma.forum.findUnique({
        where: { id },
        include: {
            author: true,
            category: true,
            _count: { select: { comments: true, likes: true } },
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!forum) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });
    return NextResponse.json(forum);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const forum = await prisma.forum.findUnique({ where: { id } });
    if (!forum) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });

    if (forum.authorId !== session.userId && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
    }

    await prisma.forum.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
