'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Activity, BookOpen, MessageSquare, Users, Calendar, Image as ImageIcon,
    TrendingUp, Clock, ArrowRight, RefreshCw, Download, FileText, Sheet
} from 'lucide-react';
import styles from './dashboard.module.css';

interface ActivityItem {
    id: string;
    type: 'article' | 'forum' | 'comment' | 'user' | 'event' | 'gallery';
    title: string;
    description: string;
    createdAt: string;
    date: string;
    author?: {
        id: string;
        name: string;
        username?: string;
        avatar?: string | null;
    } | null;
    category?: {
        id: string;
        name: string;
        color?: string | null;
    } | null;
    url: string;
    icon: string;
    commentsCount?: number;
    location?: string;
    eventDate?: string;
}

interface DashboardStats {
    articles: number;
    forums: number;
    users: number;
    comments: number;
    events: number;
    gallery: number;
}

export interface MyArticle {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    visibility: string;
    published: boolean;
    scheduledAt: string | null;
}

export interface MyForum {
    id: string;
    title: string;
    createdAt: string;
    commentsCount: number;
}

export interface MyComment {
    id: string;
    content: string;
    createdAt: string;
    article?: { id: string; title: string; slug: string } | null;
    forum?: { id: string; title: string } | null;
}

export interface DashboardContentProps {
    initialData: {
        activities: ActivityItem[];
        stats: DashboardStats;
        my: {
            articles: MyArticle[];
            forums: MyForum[];
            comments: MyComment[];
        };
        isAdmin: boolean;
        statsType: 'global' | 'personal';
    };
}

export default function DashboardContent({ initialData }: DashboardContentProps) {
    const [activities, setActivities] = useState<ActivityItem[]>(initialData.activities);
    const [stats, setStats] = useState<DashboardStats>(initialData.stats);
    const [my, setMy] = useState(initialData.my);
    const [isAdmin, setIsAdmin] = useState(initialData.isAdmin);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [activeMyTab, setActiveMyTab] = useState<'articles' | 'forums' | 'comments'>('articles');
    const mySectionRef = useRef<HTMLDivElement | null>(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard?limit=30');
            const data = await res.json();

            if (data.success) {
                setActivities(data.activities);
                setStats(data.stats);
                setMy(data.my);
                setIsAdmin(data.isAdmin);
            } else {
                setError(data.error || 'Gagal memuat dashboard');
            }
        } catch {
            setError('Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
        try {
            setExporting(true);
            const response = await fetch(`/api/dashboard/export?format=${format}&type=all`);
            
            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentElement?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setShowExportMenu(false);
        } catch {
            alert('Gagal mengekspor data');
        } finally {
            setExporting(false);
        }
    };

    const focusMyTab = (tab: 'articles' | 'forums' | 'comments') => {
        setActiveMyTab(tab);
        requestAnimationFrame(() => {
            mySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const formatDate = (date: string) => {
        const now = new Date();
        const activityDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Baru saja';
        if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

        return activityDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'article': return '#3b82f6';
            case 'forum': return '#10b981';
            case 'comment': return '#8b5cf6';
            case 'user': return '#f59e0b';
            case 'event': return '#ef4444';
            case 'gallery': return '#f97316';
            default: return '#6b7280';
        }
    };

    const getActivityTypeLabel = (type: string) => {
        switch (type) {
            case 'article': return 'Artikel';
            case 'forum': return 'Diskusi';
            case 'comment': return 'Komentar';
            case 'user': return 'Pengguna Baru';
            case 'event': return 'Event';
            case 'gallery': return 'Galeri';
            default: return 'Aktivitas';
        }
    };

    const myTabTitle = useMemo(() => {
        switch (activeMyTab) {
            case 'articles': return 'Artikel Saya';
            case 'forums': return 'Diskusi Saya';
            case 'comments': return 'Komentar Saya';
        }
    }, [activeMyTab]);

    const myTabItemsCount = useMemo(() => {
        if (!my) return 0;
        if (activeMyTab === 'articles') return my.articles.length;
        if (activeMyTab === 'forums') return my.forums.length;
        return my.comments.length;
    }, [activeMyTab, my]);

    const getArticleVisibilityLabel = (visibility: string, published: boolean) => {
        if (visibility === 'PUBLIC') return published ? 'Publik' : 'Draft';
        if (visibility === 'DRAFT') return 'Draft';
        if (visibility === 'UNLISTED') return 'Unlisted';
        return 'Pribadi';
    };

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.dashboardHeader}>
                <div className={styles.dashboardHeaderInner}>
                    <div className={styles.dashboardHeaderContent}>
                        <div>
                            <h1 className={styles.dashboardTitle}>
                                <Activity size={28} className={styles.dashboardTitleIcon} />
                                Dashboard Aktivitas {isAdmin ? '(Admin)' : '(Saya)'}
                            </h1>
                            <p className={styles.dashboardSubtitle}>
                                {isAdmin 
                                    ? 'Semua aktivitas sistem di platform Disada' 
                                    : 'Aktivitas pribadi Anda di platform Disada'
                                }
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                            <button
                                onClick={fetchDashboard}
                                className={styles.refreshButton}
                                disabled={loading}
                            >
                                <RefreshCw size={16} className={loading ? styles.loadingSpinner : ''} />
                                {loading ? 'Memuat...' : 'Refresh'}
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className={styles.refreshButton}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                                {showExportMenu && (
                                    <div className={styles.exportMenu}>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            disabled={exporting}
                                            className={styles.exportMenuBtn}
                                        >
                                            <FileText size={16} />
                                            CSV
                                        </button>
                                        <button
                                            onClick={() => handleExport('xlsx')}
                                            disabled={exporting}
                                            className={styles.exportMenuBtn}
                                        >
                                            <Sheet size={16} />
                                            Excel
                                        </button>
                                        <button
                                            onClick={() => handleExport('json')}
                                            disabled={exporting}
                                            className={styles.exportMenuBtn}
                                        >
                                            <FileText size={16} />
                                            JSON
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.dashboardContainer}>
                {error && (
                    <div className={styles.errorAlert} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <button type="button" className={styles.statCard} onClick={() => focusMyTab('articles')}>
                        <BookOpen size={24} style={{ color: '#3b82f6' }} className={styles.statIcon} />
                        <div>
                            <div className={styles.statValue}>
                                {stats.articles.toLocaleString()}
                            </div>
                            <div className={styles.statLabel}>{isAdmin ? 'Artikel' : 'Artikel Saya'}</div>
                        </div>
                    </button>

                    <button type="button" className={styles.statCard} onClick={() => focusMyTab('forums')}>
                        <MessageSquare size={24} style={{ color: '#10b981' }} className={styles.statIcon} />
                        <div>
                            <div className={styles.statValue}>
                                {stats.forums.toLocaleString()}
                            </div>
                            <div className={styles.statLabel}>{isAdmin ? 'Diskusi' : 'Diskusi Saya'}</div>
                        </div>
                    </button>

                    <button type="button" className={styles.statCard} onClick={() => focusMyTab('comments')}>
                        <Activity size={24} style={{ color: '#8b5cf6' }} className={styles.statIcon} />
                        <div>
                            <div className={styles.statValue}>
                                {stats.comments.toLocaleString()}
                            </div>
                            <div className={styles.statLabel}>{isAdmin ? 'Komentar' : 'Komentar Saya'}</div>
                        </div>
                    </button>

                    {isAdmin && (
                        <>
                            <div className={`${styles.statCard} ${styles.statCardStatic}`} role="group" aria-label="Total Pengguna">
                                <Users size={24} style={{ color: '#6366f1' }} className={styles.statIcon} />
                                <div>
                                    <div className={styles.statValue}>
                                        {stats.users.toLocaleString()}
                                    </div>
                                    <div className={styles.statLabel}>Total Pengguna</div>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.statCardStatic}`} role="group" aria-label="Total Event">
                                <Calendar size={24} style={{ color: '#ef4444' }} className={styles.statIcon} />
                                <div>
                                    <div className={styles.statValue}>
                                        {stats.events.toLocaleString()}
                                    </div>
                                    <div className={styles.statLabel}>Total Event</div>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.statCardStatic}`} role="group" aria-label="Item Galeri">
                                <ImageIcon size={24} style={{ color: '#f97316' }} className={styles.statIcon} />
                                <div>
                                    <div className={styles.statValue}>
                                        {stats.gallery.toLocaleString()}
                                    </div>
                                    <div className={styles.statLabel}>Item Galeri</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* My Content (grouped) */}
                <div className={styles.myCard} ref={mySectionRef}>
                    <div className={styles.myHeader}>
                        <div>
                            <h2 className={styles.myTitle}>{myTabTitle}</h2>
                            <p className={styles.mySubtitle}>
                                Menampilkan {myTabItemsCount} item terbaru (klik kartu statistik untuk berpindah cepat).
                            </p>
                        </div>
                        <div className={styles.myTabs} role="tablist" aria-label="Konten Saya">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeMyTab === 'articles'}
                                className={`${styles.myTabBtn} ${activeMyTab === 'articles' ? styles.myTabActive : ''}`}
                                onClick={() => setActiveMyTab('articles')}
                            >
                                Artikel Saya
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeMyTab === 'forums'}
                                className={`${styles.myTabBtn} ${activeMyTab === 'forums' ? styles.myTabActive : ''}`}
                                onClick={() => setActiveMyTab('forums')}
                            >
                                Diskusi Saya
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeMyTab === 'comments'}
                                className={`${styles.myTabBtn} ${activeMyTab === 'comments' ? styles.myTabActive : ''}`}
                                onClick={() => setActiveMyTab('comments')}
                            >
                                Komentar Saya
                            </button>
                        </div>
                    </div>

                    <div className={styles.myBody}>
                        {!my ? (
                            <div className={styles.myEmpty}>
                                <p>Data konten belum tersedia.</p>
                            </div>
                        ) : activeMyTab === 'articles' ? (
                            my.articles.length === 0 ? (
                                <div className={styles.myEmpty}>
                                    <p>Belum ada artikel. Mulai menulis di <Link href="/writings/new">/writings/new</Link>.</p>
                                </div>
                            ) : (
                                <div className={styles.myList}>
                                    {my.articles.map((a) => (
                                        <Link key={a.id} href={`/writings/${a.slug}`} className={styles.myItem}>
                                            <div className={styles.myItemMain}>
                                                <div className={styles.myItemTitle}>{a.title}</div>
                                                <div className={styles.myItemMeta}>
                                                    <span className={styles.myBadge}>
                                                        {getArticleVisibilityLabel(a.visibility, a.published)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatDate(a.createdAt)}</span>
                                                    {a.scheduledAt && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Terjadwal</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className={styles.myArrow} />
                                        </Link>
                                    ))}
                                </div>
                            )
                        ) : activeMyTab === 'forums' ? (
                            my.forums.length === 0 ? (
                                <div className={styles.myEmpty}>
                                    <p>Belum ada diskusi. Buat topik baru di <Link href="/forums/new">/forums/new</Link>.</p>
                                </div>
                            ) : (
                                <div className={styles.myList}>
                                    {my.forums.map((f) => (
                                        <Link key={f.id} href={`/forums/${f.id}`} className={styles.myItem}>
                                            <div className={styles.myItemMain}>
                                                <div className={styles.myItemTitle}>{f.title}</div>
                                                <div className={styles.myItemMeta}>
                                                    <span className={styles.myBadge}>{f.commentsCount} komentar</span>
                                                    <span>•</span>
                                                    <span>{formatDate(f.createdAt)}</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className={styles.myArrow} />
                                        </Link>
                                    ))}
                                </div>
                            )
                        ) : my.comments.length === 0 ? (
                            <div className={styles.myEmpty}>
                                <p>Belum ada komentar.</p>
                            </div>
                        ) : (
                            <div className={styles.myList}>
                                {my.comments.map((c) => {
                                    const targetUrl = c.article
                                        ? `/writings/${c.article.slug}#comment-${c.id}`
                                        : c.forum
                                            ? `/forums/${c.forum.id}#comment-${c.id}`
                                            : '/dashboard';
                                    const location = c.article
                                        ? `Artikel: ${c.article.title}`
                                        : c.forum
                                            ? `Diskusi: ${c.forum.title}`
                                            : 'Konten';
                                    return (
                                        <Link key={c.id} href={targetUrl} className={styles.myItem}>
                                            <div className={styles.myItemMain}>
                                                <div className={styles.myItemTitle}>{location}</div>
                                                <div className={styles.myItemMeta}>
                                                    <span className={styles.myCommentPreview}>
                                                        {c.content.length > 120 ? c.content.slice(0, 120) + '…' : c.content}
                                                    </span>
                                                </div>
                                                <div className={styles.myItemMeta}>
                                                    <span>{formatDate(c.createdAt)}</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className={styles.myArrow} />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Activities Feed */}
                <div className={styles.activitiesCard}>
                    <div className={styles.activitiesHeader}>
                        <TrendingUp size={20} style={{ color: '#3b82f6' }} />
                        <h2 className={styles.activitiesTitle}>
                            {isAdmin ? 'Aktivitas Sistem' : 'Aktivitas Saya'}
                        </h2>
                    </div>

                    {activities.length === 0 ? (
                        <div className={styles.activitiesEmpty}>
                            <Activity size={48} className={styles.activitiesEmptyIcon} />
                            <p>Belum ada aktivitas untuk ditampilkan</p>
                        </div>
                    ) : (
                        <div>
                            {activities.map((activity) => (
                                <Link
                                    key={activity.id}
                                    href={activity.url}
                                    className={styles.activityItem}
                                >
                                    <div className={styles.activityContent}>
                                        {/* Activity Icon */}
                                        <div
                                            className={styles.activityIcon}
                                            style={{ backgroundColor: getActivityColor(activity.type) + '20' }}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>{activity.icon}</span>
                                        </div>

                                        {/* Activity Content */}
                                        <div className={styles.activityDetails}>
                                            <div className={styles.activityHeader}>
                                                <h3 className={styles.activityTitle}>
                                                    {activity.title}
                                                </h3>
                                                <span
                                                    className={styles.activityType}
                                                    style={{ backgroundColor: getActivityColor(activity.type) }}
                                                >
                                                    {getActivityTypeLabel(activity.type)}
                                                </span>
                                            </div>

                                            <p className={styles.activityDescription}>
                                                {activity.description}
                                            </p>

                                            <div className={styles.activityMeta}>
                                                {activity.author && (
                                                    <div className={styles.activityAuthor}>
                                                        <div
                                                            className={styles.activityAvatar}
                                                            style={{
                                                                backgroundImage: activity.author.avatar ? `url(${activity.author.avatar})` : undefined
                                                            }}
                                                        ></div>
                                                        <span>{activity.author.name}</span>
                                                    </div>
                                                )}

                                                {activity.category && (
                                                    <span
                                                        className={styles.activityCategory}
                                                        style={{ backgroundColor: activity.category.color ?? undefined }}
                                                    >
                                                        {activity.category.name}
                                                    </span>
                                                )}

                                                {activity.commentsCount !== undefined && (
                                                    <div className={styles.activityComments}>
                                                        <MessageSquare size={12} />
                                                        <span>{activity.commentsCount} komentar</span>
                                                    </div>
                                                )}

                                                {activity.location && (
                                                    <div className={styles.activityLocation}>
                                                        <span>📍 {activity.location}</span>
                                                    </div>
                                                )}

                                                <div className={styles.activityTime}>
                                                    <Clock size={12} />
                                                    <span>{formatDate(activity.date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ArrowRight size={16} className={styles.activityArrow} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
