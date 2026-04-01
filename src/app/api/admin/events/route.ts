import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error('[GET EVENTS ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();

        // Only admins can create events
        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 });
        }

        const { title, description, content, date, endDate, location, image, type, status, organizer, link } = await req.json();

        if (!title?.trim() || !description?.trim() || !date || !location?.trim()) {
            return NextResponse.json({ error: 'Title, description, date, and location are required' }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                content: content?.trim() || null,
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : null,
                location: location.trim(),
                image: image?.trim() || null,
                type: type || 'ONLINE',
                status: status || 'UPCOMING',
                organizer: organizer?.trim() || null,
                link: link?.trim() || null,
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('[CREATE EVENT ERROR]', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 });
        }

        const { eventId, title, description, content, date, endDate, location, image, type, status, organizer, link } = await req.json();

        if (!eventId || !title?.trim() || !description?.trim() || !date || !location?.trim()) {
            return NextResponse.json({ error: 'Event ID, title, description, date, and location are required' }, { status: 400 });
        }

        const event = await prisma.event.update({
            where: { id: eventId },
            data: {
                title: title.trim(),
                description: description.trim(),
                content: content?.trim() || null,
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : null,
                location: location.trim(),
                image: image?.trim() || null,
                type: type || 'ONLINE',
                status: status || 'UPCOMING',
                organizer: organizer?.trim() || null,
                link: link?.trim() || null,
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error('[UPDATE EVENT ERROR]', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isLoggedIn || !isAdminRole(session.role)) {
            return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 });
        }

        const { eventId } = await req.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        await prisma.event.delete({
            where: { id: eventId },
        });

        return NextResponse.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        console.error('[DELETE EVENT ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}