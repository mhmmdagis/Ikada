import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
        return NextResponse.json({ error: 'Komentar tidak boleh kosong.' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            authorId: session.userId!,
            forumId: id,
        },
        include: { author: true },
    });

    // Update forum updatedAt
    await prisma.forum.update({ where: { id }, data: { updatedAt: new Date() } });

    return NextResponse.json(comment, { status: 201 });
}
