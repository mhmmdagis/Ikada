import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function GET() {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const galleries = await prisma.galleryItem.findMany({
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, galleries });
    } catch (error) {
        console.error('[ADMIN GALLERIES GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const category = formData.get('category') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const filename = `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${file.name.substring(file.name.lastIndexOf('.') + 1)}`;
        const blob = await put(filename, file, {
            access: 'public',
        });

        // Save to database
        const gallery = await prisma.galleryItem.create({
            data: {
                url: blob.url,
                category: category || null,
                uploadedById: session.userId!
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, gallery });
    } catch (error) {
        console.error('[ADMIN GALLERIES POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to upload gallery' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json();

        const gallery = await prisma.galleryItem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, gallery });
    } catch (error) {
        console.error('[ADMIN GALLERIES DELETE ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 });
    }
}
