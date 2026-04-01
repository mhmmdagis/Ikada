import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProfileContent from './ProfileContent';

interface Params {
    params: { id: string } | Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Params) {
    // in some Next versions params may be a Promise, unwrap it
    const unwrapped = (await params) as { id: string };
    const { id } = unwrapped;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            bio: true,
            major: true,
            batch: true,
            avatar: true,
            role: true,
            instagram: true,
            twitter: true,
            linkedin: true,
            createdAt: true,
            _count: {
                select: { articles: true, forums: true, comments: true },
            },
        },
    });

    if (!user) {
        notFound();
    }

    return (
        <ProfileContent
            userId={user.id}
            username={user.username}
            avatar={user.avatar || undefined}
            name={user.name}
            email={user.email}
            bio={user.bio || undefined}
            major={user.major || undefined}
            batch={user.batch || undefined}
            role={user.role}
            instagram={user.instagram || undefined}
            twitter={user.twitter || undefined}
            linkedin={user.linkedin || undefined}
            articlesCount={user._count.articles}
            forumsCount={user._count.forums}
            commentsCount={user._count.comments}
            joinedDate={new Date(user.createdAt).toDateString()}
        />
    );
}
