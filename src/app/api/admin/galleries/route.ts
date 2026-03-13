import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET() {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || session.role !== 'ADMIN') {
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

        if (!session.isLoggedIn || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const category = formData.get('category') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Save file
        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const filename = `${Date.now()}-${file.name}`;
        const filepath = path.join(uploadsDir, filename);
        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));

        // Save to database
        const gallery = await prisma.galleryItem.create({
            data: {
                url: `/uploads/${filename}`,
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

        if (!session.isLoggedIn || session.role !== 'ADMIN') {
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
