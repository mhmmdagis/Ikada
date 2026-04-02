import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, isAdminRole } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';
import type { Prisma } from '@prisma/client';

function parseScheduledAt(value: unknown): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    if (typeof value !== 'string') return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date;
}

function ensureCanManageArticle(session: { isLoggedIn?: boolean; userId?: string; role?: string }, authorId: string) {
    if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }
    if (session.userId !== authorId && !isAdminRole(session.role)) {
        return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
    }
    return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    noStore();
    const { slug } = await params;

    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });

    // Allow public access untuk published articles
    if (!article.published) {
        const session = await getSession();
        if (!session.isLoggedIn || (session.userId !== article.authorId && !isAdminRole(session.role as string))) {
            return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
        }
    }

    return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const session = await getSession();
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });

    const guard = ensureCanManageArticle(session, existing.authorId);
    if (guard) return guard;

    const body = await req.json();

    const title = typeof body.title === 'string' ? body.title.trim() : undefined;
    const content = typeof body.content === 'string' ? body.content.trim() : undefined;
    const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : undefined;
    const thumbnail = typeof body.thumbnail === 'string' ? body.thumbnail : undefined;
    const visibility = typeof body.visibility === 'string' ? body.visibility : undefined;
    const allowComments = typeof body.allowComments === 'boolean' ? body.allowComments : undefined;
    const anonymous = typeof body.anonymous === 'boolean' ? body.anonymous : undefined;
    const metaTitle = typeof body.metaTitle === 'string' ? body.metaTitle.trim() : undefined;
    const metaDescription = typeof body.metaDescription === 'string' ? body.metaDescription.trim() : undefined;
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : body.categoryId === null ? null : undefined;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;
    const attachments = Array.isArray(body.attachments) ? body.attachments : undefined;
    const customSlug = typeof body.customSlug === 'string' ? body.customSlug : body.customSlug === null ? '' : undefined;
    const scheduledAt = parseScheduledAt(body.scheduledAt);

    if (title !== undefined && !title) {
        return NextResponse.json({ error: 'Judul wajib diisi.' }, { status: 400 });
    }
    if (content !== undefined && !content) {
        return NextResponse.json({ error: 'Isi wajib diisi.' }, { status: 400 });
    }

    const data: Prisma.ArticleUncheckedUpdateInput = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt || null;
    if (thumbnail !== undefined) data.thumbnail = thumbnail || null;
    if (visibility !== undefined) {
        data.visibility = visibility;
        // published = true jika PUBLIC atau UNLISTED
        // published = false jika DRAFT atau PRIVATE
        data.published = visibility === 'PUBLIC' || visibility === 'UNLISTED';
    }
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt;
    if (allowComments !== undefined) data.allowComments = allowComments;
    if (anonymous !== undefined) data.anonymous = anonymous;
    if (metaTitle !== undefined) data.metaTitle = metaTitle || null;
    if (metaDescription !== undefined) data.metaDescription = metaDescription || null;
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (tags !== undefined) data.tags = tags;
    if (attachments !== undefined) data.attachments = attachments;

    if (customSlug !== undefined) {
        const trimmed = customSlug.trim();
        data.customSlug = trimmed || null;
        if (trimmed && trimmed !== existing.slug) {
            data.slug = trimmed;
        }
    }

    try {
        const updated = await prisma.article.update({
            where: { id: existing.id },
            data,
        });
        return NextResponse.json(updated);
    } catch (error: unknown) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: unknown }).code === 'P2002'
        ) {
            return NextResponse.json({ error: 'Slug sudah digunakan.' }, { status: 409 });
        }
        console.error('[PATCH ARTICLE ERROR]', error);
        return NextResponse.json({ error: 'Gagal memperbarui artikel.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const session = await getSession();
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 });

    const guard = ensureCanManageArticle(session, article.authorId);
    if (guard) return guard;

    await prisma.article.delete({ where: { id: article.id } });
    return NextResponse.json({ success: true });
}
