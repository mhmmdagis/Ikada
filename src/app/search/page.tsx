'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthorLink from '@/components/AuthorLink';
import ArticleAuthor from '@/components/ArticleAuthor';
import {
    Search, BookOpen, MessageSquare, Users, Calendar,
    User, Clock, ArrowRight, Loader, AlertCircle, Hash, Image as ImageIcon
} from 'lucide-react';
import styles from './search.module.css';

interface SearchResult {
    articles: any[];
    forums: any[];
    users: any[];
    events: any[];
}

interface SearchCounts {
    articles: number;
    forums: number;
    users: number;
    events: number;
}

type TabType = 'all' | 'articles' | 'forums' | 'users' | 'events';

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(query);
    const [results, setResults] = useState<SearchResult | null>(null);
    const [counts, setCounts] = useState<SearchCounts | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim() || searchTerm.length < 2) {
            setResults(null);
            setCounts(null);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();

            if (data.success) {
                setResults(data.results);
                setCounts(data.counts);
            } else {
                setError(data.error || 'Terjadi kesalahan saat mencari.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const truncateText = (text: string, maxLength: number = 80) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const tabs = useMemo(() => [
        { id: 'all', label: 'Semua', icon: Hash, count: counts ? (counts.articles + counts.forums + counts.users + counts.events) : 0 },
        { id: 'articles', label: 'Artikel', icon: BookOpen, count: counts?.articles || 0 },
        { id: 'forums', label: 'Berbagi Opini', icon: MessageSquare, count: counts?.forums || 0 },
        { id: 'users', label: 'Pengguna', icon: Users, count: counts?.users || 0 },
        { id: 'events', label: 'Event', icon: Calendar, count: counts?.events || 0 },
    ], [counts]);

    return (
        <div className={styles.searchPage}>
            {/* Background Decorations */}
            <div className={styles.bgBlob1} />
            <div className={styles.bgBlob2} />

            {/* Header Sticky (Glassmorphism) */}
            <div className={styles.stickyHeader}>
                <div className="container">
                    <div className={styles.searchFormWrapper}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <Search size={24} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari inspirasi, tulisan, atau opini..."
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            {results && (
                <div className={styles.tabBar}>
                    <div className="container">
                        <div className={styles.tabList}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                >
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && <span className={styles.tabBadge}>{tab.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Results */}
            <div className="container">
                <div className={styles.resultsArea}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                            <Loader size={48} className="animate-spin" style={{ color: 'var(--brand-primary)', margin: '0 auto 2rem' }} />
                            <h3 style={{ color: 'var(--text-secondary)' }}>Sedang mencari untuk Anda...</h3>
                        </div>
                    )}

                    {error && (
                        <div className={styles.emptyContainer} style={{ borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
                            <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                            <h3>Ops! Terjadi kesalahan</h3>
                            <p>{error}</p>
                        </div>
                    )}

                    {results && !loading && (
                        <>
                            <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 900 }}>
                                    Hasil untuk <span className="text-gradient">"{query}"</span>
                                </h1>
                            </div>

                            {/* Articles Grid Section */}
                            {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
                                <section style={{ marginBottom: '4rem' }}>
                                    <div className={styles.sectionTitle}>
                                        <BookOpen size={24} color="var(--brand-primary)" />
                                        <h2>Artikel Pilihan</h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                        {results.articles.map((article, i) => (
                                            <Link key={article.id} href={`/writings/${article.slug}`} className={`${styles.articleCard} reveal-fade-up`} style={{ '--reveal-delay': `${i * 50}ms` } as any}>
                                                <div className={styles.cardImgWrap}>
                                                    {article.thumbnail ? (
                                                        <img src={article.thumbnail} alt={article.title} className={styles.thumbnailImg} />
                                                    ) : (
                                                        <div className={styles.placeholderImg}>
                                                            <ImageIcon size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.cardBody}>
                                                    {article.category && (
                                                        <span className={styles.cardCategory} style={{ color: article.category.color }}>
                                                            {article.category.name}
                                                        </span>
                                                    )}
                                                    <h3 className={styles.cardTitle}>{article.title}</h3>
                                                    <p className={styles.cardExcerpt}>
                                                        {truncateText(article.excerpt || '')}
                                                    </p>
                                                    <div className={styles.cardFooter}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div className={styles.authorAvatarMini}>
                                                                {article.author.avatar ? <img src={article.author.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} />}
                                                            </div>
                                                            <ArticleAuthor author={article.author} anonymous={article.anonymous} stopPropagation />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatDate(article.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Discussions Section */}
                            {(activeTab === 'all' || activeTab === 'forums') && results.forums.length > 0 && (
                                <section style={{ marginBottom: '4rem' }}>
                                    <div className={styles.sectionTitle}>
                                        <MessageSquare size={24} color="#10b981" />
                                        <h2>Berbagi Opini Terkini</h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                        {results.forums.map((forum, i) => (
                                            <Link key={forum.id} href={`/forums/${forum.id}`} className={`${styles.articleCard} reveal-fade-up`} style={{ '--reveal-delay': `${i * 50}ms` } as any}>
                                                <div className={styles.cardImgPlaceholder}>
                                                    <div className={styles.meshPattern} />
                                                    <MessageSquare size={40} className={styles.meshIcon} />
                                                </div>
                                                <div className={styles.cardBody}>
                                                    {forum.category && (
                                                        <span className={styles.cardCategory} style={{ color: forum.category.color }}>
                                                            {forum.category.name}
                                                        </span>
                                                    )}
                                                    <h3 className={styles.cardTitle}>{forum.title}</h3>
                                                    <p className={styles.cardExcerpt}>{truncateText(forum.content.replace(/<[^>]*>/g, ''))}</p>
                                                    <div className={styles.cardFooter}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <User size={14} color="var(--text-tertiary)" />
                                                            <AuthorLink href={`/profile/${forum.author.id}`} stopPropagation>
                                                                {forum.author.name}
                                                            </AuthorLink>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                                            <MessageSquare size={14} />
                                                            <span>{forum._count.comments}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Users Grid Section */}
                            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                                <section style={{ marginBottom: '4rem' }}>
                                    <div className={styles.sectionTitle}>
                                        <Users size={24} color="#8b5cf6" />
                                        <h2>Kreator & Penulis</h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                        {results.users.map((user, i) => (
                                            <Link key={user.id} href={`/profile/${user.id}`} className={`${styles.userCard} reveal-fade-up`} style={{ '--reveal-delay': `${i * 40}ms` } as any}>
                                                <div 
                                                    className={styles.userAvatar}
                                                    style={{ backgroundImage: user.avatar ? `url(${user.avatar})` : 'none', backgroundColor: 'var(--bg-secondary)' }}
                                                >
                                                    {!user.avatar && <User size={32} color="var(--text-muted)" />}
                                                </div>
                                                <div>
                                                    <div className={styles.userName}>{user.name}</div>
                                                    <div className={styles.userUsername}>@{user.username}</div>
                                                </div>
                                                <div className="badge badge-primary" style={{ marginTop: '0.5rem' }}>Profil</div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Events Section (Visual) */}
                            {(activeTab === 'all' || activeTab === 'events') && results.events.length > 0 && (
                                <section style={{ marginBottom: '4rem' }}>
                                    <div className={styles.sectionTitle}>
                                        <Calendar size={24} color="#ef4444" />
                                        <h2>Agenda & Event</h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                        {results.events.map((event, i) => (
                                            <Link key={event.id} href={`/events`} className={`${styles.articleCard} reveal-fade-up`} style={{ '--reveal-delay': `${i * 50}ms` } as any}>
                                                <div className={styles.cardImgWrap}>
                                                    {event.image ? (
                                                        <img src={event.image} alt={event.title} className={styles.thumbnailImg} />
                                                    ) : (
                                                        <div className={styles.placeholderImg}>
                                                            <Calendar size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className="badge" style={{ marginBottom: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Event</div>
                                                    <h3 className={styles.cardTitle}>{event.title}</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Clock size={16} />
                                                            <span>{formatDate(event.date)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <User size={16} />
                                                            <span>By {event.organizer || 'Disada'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Global No Results handling */}
                            {results && (results.articles.length + results.forums.length + results.users.length + results.events.length) === 0 && (
                                <div className={styles.emptyContainer}>
                                    <Search size={64} className={styles.emptyIcon} />
                                    <h3>Kami Tidak Menemukan "{query}"</h3>
                                    <p>Mungkin coba kata kunci lain atau cek ejaan Anda? Jangan menyerah!</p>
                                    <button onClick={() => setSearchQuery('')} className="btn btn-primary" style={{ marginTop: '2rem' }}>Bersihkan Pencarian</button>
                                </div>
                            )}
                        </>
                    )}

                    {!results && !loading && !error && (
                        <div className={styles.emptyContainer}>
                            <Search size={80} className={styles.emptyIcon} />
                            <h2 style={{ fontWeight: 800 }}>Mulai Petualangan Anda</h2>
                            <p style={{ maxWidth: '400px', margin: '0 auto' }}>Temukan artikel mendalam, opini hangat, dan komunitas yang menginspirasi di seluruh platform Disada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 2rem' }} />
                    <p style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>Menyiapkan mesin pencari...</p>
                </div>
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}