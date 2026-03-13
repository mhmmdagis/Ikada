import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import styles from "./forums.module.css";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";

export default async function ForumsPage() {
    noStore();
    const [forums, session] = await Promise.all([
        prisma.forum.findMany({
            include: {
                author: true,
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
        }),
        getSession(),
    ]);

    const isLoggedIn = !!session.isLoggedIn;

    return (
        <div className={styles.pageContainer}>
            <section className={styles.headerSection}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} /> Kembali ke Beranda
                    </Link>
                    <div className={styles.headerContent}>
                        <div className={styles.titleWrapper}>
                            <h1>Ruang <span className="text-gradient">Diskusi</span></h1>
                            <p>Bertukar pikiran, bagikan opinimu, dan temukan perspektif baru bersama komunitas Disada.</p>
                        </div>
                        {isLoggedIn ? (
                            <Link href="/forums/new" className="btn btn-primary">
                                <Plus size={18} /> Buat Diskusi Baru
                            </Link>
                        ) : (
                            <Link href="/login?next=/forums" className="btn btn-outline">
                                Masuk untuk Buat Diskusi
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.contentSection}>
                <div className="container">
                    <div className={styles.forumList}>
                        {forums.length > 0 ? (
                            forums.map((forum) => (
                                <Link href={`/forums/${forum.id}`} key={forum.id} className={styles.forumCard}>
                                    <div className={styles.forumMain}>
                                        <h3 className={styles.forumTitle}>{forum.title}</h3>
                                        <p className={styles.forumExcerpt}>
                                            {forum.content.substring(0, 100)}...
                                        </p>
                                        <div className={styles.forumMeta}>
                                            <span className={styles.author}>{forum.author.name}</span>
                                            <span className={styles.dot}>•</span>
                                            <span className={styles.time}>
                                                {formatDistanceToNow(new Date(forum.createdAt), { addSuffix: true, locale: id })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.forumStats}>
                                        <div className={styles.statBadge}>
                                            <MessageSquare size={16} />
                                            <span>{forum._count.comments} Komentar</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <MessageSquare size={48} className={styles.emptyIcon} />
                                <h3>Belum ada diskusi</h3>
                                <p>Jadilah yang pertama untuk memulai percakapan menarik.</p>
                                {isLoggedIn ? (
                                    <Link href="/forums/new" className="btn btn-outline">Buat Topik Baru</Link>
                                ) : (
                                    <Link href="/login?next=/forums" className="btn btn-outline">Masuk untuk Buat Diskusi</Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
