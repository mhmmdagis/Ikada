import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const programs = await prisma.program.findMany({
            include: {
                createdBy: {
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

        return NextResponse.json({ success: true, programs });
    } catch (error) {
        console.error('[ADMIN PROGRAMS GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, content, category, image, icon, status } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const program = await prisma.program.create({
            data: {
                title,
                description,
                content: content || '',
                category: category || null,
                image: image || null,
                icon: icon || null,
                status: status || 'ACTIVE',
                createdById: session.userId!
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error('[ADMIN PROGRAMS POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, description, content, category, image, icon, status } = body;

        const program = await prisma.program.update({
            where: { id },
            data: {
                title,
                description,
                content,
                category,
                image,
                icon,
                status
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error('[ADMIN PROGRAMS PUT ERROR]', error);
        return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json();

        const program = await prisma.program.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, program });
    } catch (error) {
        console.error('[ADMIN PROGRAMS DELETE ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
    }
}
