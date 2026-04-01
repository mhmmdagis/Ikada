'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    FileText,
    MessageSquare,
    Zap,
    Calendar,
    LogOut,
    Menu,
    X,
    Image,
    Layout,
    Download
} from 'lucide-react';
import styles from './admin.module.css';

interface Stats {
    users: number;
    articles: number;
    publishedArticles: number;
    unpublishedArticles: number;
    forums: number;
    comments: number;
    events: number;
    galleries: number;
    programs: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setStats(await res.json());
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserRole = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const userData = await res.json();
                const role = userData.user?.role || '';
                console.log('🔍 Admin Dashboard - API Response:', res.status, userData);
                console.log('🔍 Admin Dashboard - User Role:', role);
                setUserRole(role);
            } catch (error) {
                console.error('❌ Failed to fetch user role:', error);
            }
        };

        fetchStats();
        fetchUserRole();
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const handleExportData = async (format: string = 'xlsx') => {
        try {
            const response = await fetch(`/api/dashboard/export?format=${format}&type=all`);
            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `disada-data-export.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal export data. Pastikan Anda adalah admin.');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!stats) {
        return (
            <div className={styles.error}>
                <p>Failed to load stats</p>
                <button onClick={() => router.push('/')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>
                    Disada Admin
                </Link>
                <button
                    className={styles.menuToggle}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
                    <Link href="/admin/users">Users</Link>
                    <Link href="/admin/articles">Articles</Link>
                    <Link href="/admin/forums">Forums</Link>
                    <Link href="/admin/comments">Comments</Link>
                    <Link href="/admin/categories">Categories</Link>
                    <Link href="/admin/events">Events</Link>
                    <Link href="/admin/galleries">Galleries</Link>
                    <Link href="/admin/programs">Programs</Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h1>Dashboard Admin</h1>
                    <p>Welcome back! Here's your platform overview.</p>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <Link href="/admin/users" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#3b82f6' }}>
                            <Users size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Total Users</h3>
                            <p className={styles.statValue}>{stats.users}</p>
                        </div>
                    </Link>

                    <Link href="/admin/articles" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#8b5cf6' }}>
                            <FileText size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Articles</h3>
                            <p className={styles.statValue}>{stats.articles}</p>
                            <small>
                                {stats.publishedArticles} published, {stats.unpublishedArticles} draft
                            </small>
                        </div>
                    </Link>

                    <Link href="/admin/forums" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#1b9aaa' }}>
                            <Zap size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Forum Discussions</h3>
                            <p className={styles.statValue}>{stats.forums}</p>
                        </div>
                    </Link>

                    <Link href="/admin/comments" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#f59e0b' }}>
                            <MessageSquare size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Comments</h3>
                            <p className={styles.statValue}>{stats.comments}</p>
                        </div>
                    </Link>

                    <Link href="/admin/events" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#10b981' }}>
                            <Calendar size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Events</h3>
                            <p className={styles.statValue}>{stats.events}</p>
                        </div>
                    </Link>

                    <Link href="/admin/galleries" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#f97316' }}>
                            <Image size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Galleries</h3>
                            <p className={styles.statValue}>{stats.galleries}</p>
                        </div>
                    </Link>

                    <Link href="/admin/programs" className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#ffd60a' }}>
                            <Layout size={32} color="white" />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Programs</h3>
                            <p className={styles.statValue}>{stats.programs}</p>
                        </div>
                    </Link>
                </div>

                {/* Quick Actions */}
                <section className={styles.quickActions}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actiongrid}>
                        <Link href="/admin/users" className={styles.actionCard}>
                            Manage Users
                        </Link>
                        <Link href="/admin/articles" className={styles.actionCard}>
                            Manage Articles
                        </Link>
                        <Link href="/admin/forums" className={styles.actionCard}>
                            Manage Forums
                        </Link>
                        <Link href="/admin/comments" className={styles.actionCard}>
                            Manage Comments
                        </Link>
                        <Link href="/admin/categories" className={styles.actionCard}>
                            Manage Categories
                        </Link>
                        <Link href="/admin/events" className={styles.actionCard}>
                            Manage Events
                        </Link>
                        <Link href="/admin/galleries" className={styles.actionCard}>
                            Manage Galleries
                        </Link>
                        <Link href="/admin/programs" className={styles.actionCard}>
                            Manage Programs
                        </Link>
                        {(() => {
                            console.log('🎯 Rendering export button check - userRole:', userRole, 'is ADMIN?', userRole === 'ADMIN');
                            return (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                                <div className={styles.actionCard} onClick={() => handleExportData('xlsx')} style={{ cursor: 'pointer' }}>
                                    <Download size={16} style={{ marginRight: '8px' }} />
                                    Export Data (XLSX)
                                </div>
                            );
                        })()}
                    </div>
                </section>
            </main>
        </div>
    );
}
