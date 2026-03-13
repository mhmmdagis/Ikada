'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Activity, BookOpen, MessageSquare, Users, Calendar, Image,
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
    author?: any;
    category?: any;
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

interface DashboardResponse {
    success: boolean;
    activities: ActivityItem[];
    stats: DashboardStats;
    isAdmin: boolean;
    statsType: 'global' | 'personal';
    error?: string;
}

export default function DashboardPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [statsType, setStatsType] = useState<'global' | 'personal'>('personal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard?limit=30');
            const data: DashboardResponse = await res.json();

            if (data.success) {
                setActivities(data.activities);
                setStats(data.stats);
                setIsAdmin(data.isAdmin);
                setStatsType(data.statsType);
            } else {
                setError(data.error || 'Gagal memuat dashboard');
            }
        } catch (err) {
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
        } catch (err) {
            alert('Gagal mengekspor data');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

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

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingContent}>
                    <RefreshCw size={32} className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <div className={styles.errorContent}>
                    <Activity size={48} className={styles.errorIcon} />
                    <h2 className={styles.errorTitle}>Gagal Memuat Dashboard</h2>
                    <p className={styles.errorText}>{error}</p>
                    <button
                        onClick={fetchDashboard}
                        className={styles.errorButton}
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

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
                            >
                                <RefreshCw size={16} />
                                Refresh
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
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '0.5rem',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.375rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        zIndex: 10,
                                        minWidth: '150px',
                                        overflow: 'hidden'
                                    }}>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            disabled={exporting}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: 'none',
                                                background: 'white',
                                                color: '#475569',
                                                cursor: exporting ? 'not-allowed' : 'pointer',
                                                opacity: exporting ? 0.6 : 1,
                                                textAlign: 'left',
                                                fontSize: '0.875rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!exporting) e.currentTarget.style.background = '#f1f5f9';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'white';
                                            }}
                                        >
                                            <FileText size={16} />
                                            CSV
                                        </button>
                                        <button
                                            onClick={() => handleExport('xlsx')}
                                            disabled={exporting}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: 'none',
                                                background: 'white',
                                                color: '#475569',
                                                cursor: exporting ? 'not-allowed' : 'pointer',
                                                opacity: exporting ? 0.6 : 1,
                                                textAlign: 'left',
                                                fontSize: '0.875rem',
                                                transition: 'background 0.2s',
                                                borderTop: '1px solid #e2e8f0'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!exporting) e.currentTarget.style.background = '#f1f5f9';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'white';
                                            }}
                                        >
                                            <Sheet size={16} />
                                            Excel
                                        </button>
                                        <button
                                            onClick={() => handleExport('json')}
                                            disabled={exporting}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: 'none',
                                                background: 'white',
                                                color: '#475569',
                                                cursor: exporting ? 'not-allowed' : 'pointer',
                                                opacity: exporting ? 0.6 : 1,
                                                textAlign: 'left',
                                                fontSize: '0.875rem',
                                                transition: 'background 0.2s',
                                                borderTop: '1px solid #e2e8f0'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!exporting) e.currentTarget.style.background = '#f1f5f9';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'white';
                                            }}
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
                {/* Stats Cards */}
                {stats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <BookOpen size={24} style={{ color: '#3b82f6' }} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>
                                    {stats.articles.toLocaleString()}
                                </div>
                                <div className={styles.statLabel}>{isAdmin ? 'Artikel' : 'Artikel Saya'}</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <MessageSquare size={24} style={{ color: '#10b981' }} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>
                                    {stats.forums.toLocaleString()}
                                </div>
                                <div className={styles.statLabel}>{isAdmin ? 'Diskusi' : 'Diskusi Saya'}</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <Users size={24} style={{ color: '#8b5cf6' }} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>
                                    {stats.users.toLocaleString()}
                                </div>
                                <div className={styles.statLabel}>Total Pengguna</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <Calendar size={24} style={{ color: '#ef4444' }} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>
                                    {stats.events.toLocaleString()}
                                </div>
                                <div className={styles.statLabel}>Total Event</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <Image size={24} style={{ color: '#f97316' }} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>
                                    {stats.gallery.toLocaleString()}
                                </div>
                                <div className={styles.statLabel}>{isAdmin ? 'Galeri' : 'Item Galeri'}</div>
                            </div>
                        </div>
                    </div>
                )}

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
                            {activities.map((activity, index) => (
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
                                            {activity.icon}
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
                                                        style={{ backgroundColor: activity.category.color }}
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