import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { unstable_noStore as noStore } from 'next/cache';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import ForumComments from './ForumComments';
import LikeButton from '@/components/LikeButton';
import styles from './forum.module.css';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ForumDetailPage({ params }: Props) {
    noStore();
    const { id: forumId } = await params;

    const forum = await prisma.forum.findUnique({
        where: { id: forumId },
        include: {
            author: true,
            _count: { select: { comments: true, likes: true } },
            comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        },
    });

    if (!forum) notFound();

    const session = await getSession();
    let initialLiked = false;
    if (session.isLoggedIn && session.userId) {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_forumId: { userId: session.userId, forumId: forum.id },
            },
        });
        initialLiked = !!existingLike;
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.headerSection}>
                <div className="container">
                    <Link href="/forums" className={styles.backLink}>
                        <ArrowLeft size={16} /> Kembali ke Diskusi
                    </Link>
                    <div className={styles.titleWrapper}>
                        <h1>{forum.title}</h1>
                        <div className={styles.meta}>
                            <Link href={`/profile/${forum.author.id}`} className={styles.metaAuthor}>{forum.author.name}</Link>
                            <span className={styles.dot}>•</span>
                            <span className={styles.metaTime}>
                                {formatDistanceToNow(new Date(forum.createdAt), { addSuffix: true, locale: id })}
                            </span>
                            <span className={styles.dot}>•</span>
                            <LikeButton
                                targetId={forum.id}
                                type="forum"
                                initialCount={forum._count.likes}
                                initialLiked={initialLiked}
                                className={styles.likeButton}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.contentSection}>
                <div className="container">
                    <article className={styles.forumContent}>
                        <p>{forum.content}</p>
                    </article>

                    <ForumComments forumId={forum.id} />
                </div>
            </section>
        </div>
    );
}