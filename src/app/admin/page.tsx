import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    FileText,
    MessageSquare,
    Zap,
    Calendar,
    Image,
    Layout,
} from 'lucide-react';
import styles from './admin.module.css';
import { getSession, isAdminRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminNav from './AdminNav';
import AdminActions from './AdminActions';

async function getStats() {
    const [users, articles, forums, comments, events, galleries, programs] = await Promise.all([
        prisma.user.count(),
        prisma.article.count(),
        prisma.forum.count(),
        prisma.comment.count(),
        prisma.event.count(),
        prisma.galleryItem.count(),
        prisma.program.count(),
    ]);

    const publishedArticles = await prisma.article.count({
        where: { published: true },
    });

    return {
        users,
        articles,
        publishedArticles,
        unpublishedArticles: articles - publishedArticles,
        forums,
        comments,
        events,
        galleries,
        programs,
    };
}

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session.isLoggedIn || !isAdminRole(session.role)) {
        redirect('/login');
    }

    const stats = await getStats();

    return (
        <div className={styles.container}>
            <AdminNav />

            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h1>Dashboard Admin</h1>
                    <p>Welcome back! Berikut ringkasan performa platform saat ini.</p>
                </div>

                <div className={styles.statsGrid}>
                    <Link href="/admin/users" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#3b82f6' }}>
                            <Users size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Total Pengguna</h3>
                            <p className={styles.statValue}>{stats.users}</p>
                        </div>
                    </Link>

                    <Link href="/admin/articles" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#8b5cf6' }}>
                            <FileText size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Artikel</h3>
                            <p className={styles.statValue}>{stats.articles}</p>
                            <small>
                                {stats.publishedArticles} terbit, {stats.unpublishedArticles} draft
                            </small>
                        </div>
                    </Link>

                    <Link href="/admin/forums" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#1b9aaa' }}>
                            <Zap size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Diskusi Forum</h3>
                            <p className={styles.statValue}>{stats.forums}</p>
                        </div>
                    </Link>

                    <Link href="/admin/comments" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#f59e0b' }}>
                            <MessageSquare size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Komentar</h3>
                            <p className={styles.statValue}>{stats.comments}</p>
                        </div>
                    </Link>

                    <Link href="/admin/events" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#10b981' }}>
                            <Calendar size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Acara</h3>
                            <p className={styles.statValue}>{stats.events}</p>
                        </div>
                    </Link>

                    <Link href="/admin/galleries" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#f97316' }}>
                            <Image size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Galeri</h3>
                            <p className={styles.statValue}>{stats.galleries}</p>
                        </div>
                    </Link>

                    <Link href="/admin/programs" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#ffd60a' }}>
                            <Layout size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Program</h3>
                            <p className={styles.statValue}>{stats.programs}</p>
                        </div>
                    </Link>
                </div>

                <AdminActions userRole={session.role || ''} />
            </main>
        </div>
    );
}
