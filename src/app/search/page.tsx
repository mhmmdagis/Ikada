'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthorLink from '@/components/AuthorLink';
import ArticleAuthor from '@/components/ArticleAuthor';
import {
    Search, BookOpen, MessageSquare, Users, Tag, Calendar,
    User, Clock, ArrowRight, Loader, AlertCircle
} from 'lucide-react';

interface SearchResult {
    articles: any[];
    forums: any[];
    users: any[];
    categories: any[];
    events: any[];
}

interface SearchCounts {
    articles: number;
    forums: number;
    users: number;
    categories: number;
    events: number;
}

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(query);
    const [results, setResults] = useState<SearchResult | null>(null);
    const [counts, setCounts] = useState<SearchCounts | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const truncateText = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '2rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <Search size={20} style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#64748b'
                            }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari artikel, diskusi, pengguna, kategori, event..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 3rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Loader size={32} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} className="animate-spin" />
                        <p style={{ color: '#64748b' }}>Mencari...</p>
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={20} style={{ color: '#dc2626' }} />
                        <span style={{ color: '#dc2626' }}>{error}</span>
                    </div>
                )}

                {results && counts && (
                    <div>
                        {/* Search Summary */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#1e293b',
                                marginBottom: '0.5rem'
                            }}>
                                Hasil pencarian untuk "{query}"
                            </h1>
                            <p style={{ color: '#64748b' }}>
                                Ditemukan {counts.articles + counts.forums + counts.users + counts.categories + counts.events} hasil
                            </p>
                        </div>

                        {/* Results by Category */}
                        <div style={{ display: 'grid', gap: '2rem' }}>

                            {/* Articles */}
                            {results.articles.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <BookOpen size={20} style={{ color: '#3b82f6' }} />
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: '#1e293b'
                                        }}>
                                            Artikel ({counts.articles})
                                        </h2>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {results.articles.map((article) => (
                                            <Link
                                                key={article.id}
                                                href={`/writings/${article.slug}`}
                                                style={{
                                                    display: 'block',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.5rem',
                                                    padding: '1.5rem',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#3b82f6';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <h3 style={{
                                                        fontSize: '1.125rem',
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                        margin: 0
                                                    }}>
                                                        {article.title}
                                                    </h3>
                                                    {article.category && (
                                                        <span style={{
                                                            background: article.category.color,
                                                            color: 'white',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.25rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {article.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                {article.excerpt && (
                                                    <p style={{
                                                        color: '#64748b',
                                                        margin: '0.5rem 0',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {truncateText(article.excerpt)}
                                                    </p>
                                                )}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#64748b'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <User size={14} />
                                                        <ArticleAuthor author={article.author} anonymous={article.anonymous} stopPropagation />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={14} />
                                                        <span>{formatDate(article.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Forums */}
                            {results.forums.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <MessageSquare size={20} style={{ color: '#10b981' }} />
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: '#1e293b'
                                        }}>
                                            Diskusi ({counts.forums})
                                        </h2>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {results.forums.map((forum) => (
                                            <Link
                                                key={forum.id}
                                                href={`/forums/${forum.id}`}
                                                style={{
                                                    display: 'block',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.5rem',
                                                    padding: '1.5rem',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#10b981';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <h3 style={{
                                                        fontSize: '1.125rem',
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                        margin: 0
                                                    }}>
                                                        {forum.title}
                                                    </h3>
                                                    {forum.category && (
                                                        <span style={{
                                                            background: forum.category.color,
                                                            color: 'white',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.25rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {forum.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{
                                                    color: '#64748b',
                                                    margin: '0.5rem 0',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {truncateText(forum.content.replace(/<[^>]*>/g, ''))}
                                                </p>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#64748b'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <User size={14} />
                                                        <AuthorLink href={`/profile/${forum.author.id}`} stopPropagation>
                                                            {forum.author.name}
                                                        </AuthorLink>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <MessageSquare size={14} />
                                                        <span>{forum._count.comments} komentar</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={14} />
                                                        <span>{formatDate(forum.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Users */}
                            {results.users.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <Users size={20} style={{ color: '#8b5cf6' }} />
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: '#1e293b'
                                        }}>
                                            Pengguna ({counts.users})
                                        </h2>
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {results.users.map((user) => (
                                            <Link
                                                key={user.id}
                                                href={`/profile/${user.id}`}
                                                style={{
                                                    display: 'block',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.5rem',
                                                    padding: '1.5rem',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '3rem',
                                                        height: '3rem',
                                                        borderRadius: '50%',
                                                        background: user.avatar ? `url(${user.avatar})` : '#e2e8f0',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {!user.avatar && (
                                                            <User size={20} style={{ color: '#64748b' }} />
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h3 style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: '#1e293b',
                                                            margin: 0
                                                        }}>
                                                            {user.name}
                                                        </h3>
                                                        <p style={{
                                                            color: '#64748b',
                                                            fontSize: '0.875rem',
                                                            margin: '0.25rem 0'
                                                        }}>
                                                            @{user.username}
                                                        </p>
                                                        {user.bio && (
                                                            <p style={{
                                                                color: '#64748b',
                                                                fontSize: '0.875rem',
                                                                margin: 0,
                                                                lineHeight: '1.4'
                                                            }}>
                                                                {truncateText(user.bio, 80)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {results.categories.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <Tag size={20} style={{ color: '#f59e0b' }} />
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: '#1e293b'
                                        }}>
                                            Kategori ({counts.categories})
                                        </h2>
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {results.categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/writings?category=${category.slug}`}
                                                style={{
                                                    display: 'block',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.5rem',
                                                    padding: '1.5rem',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = category.color;
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div style={{
                                                        width: '2rem',
                                                        height: '2rem',
                                                        borderRadius: '50%',
                                                        background: category.color
                                                    }}></div>
                                                    <h3 style={{
                                                        fontSize: '1.125rem',
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                        margin: 0
                                                    }}>
                                                        {category.name}
                                                    </h3>
                                                </div>
                                                <p style={{
                                                    color: '#64748b',
                                                    fontSize: '0.875rem',
                                                    margin: 0
                                                }}>
                                                    {category._count.articles} artikel • {category._count.forums} diskusi
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Events */}
                            {results.events.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <Calendar size={20} style={{ color: '#ef4444' }} />
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: '#1e293b'
                                        }}>
                                            Event ({counts.events})
                                        </h2>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {results.events.map((event) => (
                                            <Link
                                                key={event.id}
                                                href={`/events`}
                                                style={{
                                                    display: 'block',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.5rem',
                                                    padding: '1.5rem',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#ef4444';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <h3 style={{
                                                        fontSize: '1.125rem',
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                        margin: 0
                                                    }}>
                                                        {event.title}
                                                    </h3>
                                                    <span style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.25rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        Event
                                                    </span>
                                                </div>
                                                {event.description && (
                                                    <p style={{
                                                        color: '#64748b',
                                                        margin: '0.5rem 0',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {truncateText(event.description)}
                                                    </p>
                                                )}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#64748b'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <User size={14} />
                                                        <span>{event.organizer.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Calendar size={14} />
                                                        <span>{formatDate(event.date)}</span>
                                                    </div>
                                                    {event.location && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <span>📍 {event.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* No Results */}
                        {counts.articles === 0 && counts.forums === 0 && counts.users === 0 &&
                         counts.categories === 0 && counts.events === 0 && !loading && (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                background: 'white',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <Search size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#475569',
                                    margin: '0 0 0.5rem'
                                }}>
                                    Tidak ada hasil
                                </h3>
                                <p style={{ color: '#64748b', margin: 0 }}>
                                    Coba kata kunci yang berbeda atau periksa ejaan Anda.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!results && !loading && !error && query && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Search size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#475569',
                            margin: '0 0 0.5rem'
                        }}>
                            Mulai pencarian
                        </h3>
                        <p style={{ color: '#64748b', margin: 0 }}>
                            Masukkan minimal 2 karakter untuk mencari artikel, diskusi, pengguna, kategori, dan event.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader size={32} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} className="animate-spin" />
                    <p style={{ color: '#64748b' }}>Memuat halaman pencarian...</p>
                </div>
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}