import prisma from '@/lib/prisma';
import EventContent from './EventContent';

export const metadata = {
    title: 'Events - Disada',
    description: 'Temukan acara, webinar, dan kompetisi terbaik di Disada',
};

// Revalidate every 1 hour
export const revalidate = 3600;

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        orderBy: { date: 'asc' },
    });

    const serializedEvents = events.map(event => ({
        ...event,
        date: event.date.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
    }));

    return <EventContent events={serializedEvents} />;
}
