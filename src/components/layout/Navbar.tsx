'use client';

import Link from 'next/link';
import AuthorLink from '@/components/AuthorLink';
import ArticleAuthor from '@/components/ArticleAuthor';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
    Menu, X, Search, BookOpen, MessageSquare, Calendar, Sun, Moon,
    User, Users, LogOut, Settings, ChevronDown, Flame, PenSquare, ArrowRight, Activity, Image, Camera, Star
} from 'lucide-react';
import styles from './Navbar.module.css';

interface SessionUser {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [user, setUser] = useState<SessionUser | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <Activity size={16} /> },
        { name: 'Tentang', path: '/about', icon: <Users size={16} /> },
        { name: 'Program', path: '/program', icon: <Star size={16} /> },
        { name: 'Tulisan', path: '/writings', icon: <BookOpen size={16} /> },
        { name: 'Berbagi Opini', path: '/forums', icon: <MessageSquare size={16} /> },
        { name: 'Event', path: '/events', icon: <Calendar size={16} /> },
        { name: 'Galeri', path: '/gallery', icon: <Image size={16} /> },
    ];

    const fetchUser = () => {
        fetch('/api/auth/me').then(r => r.json()).then(d => {
            if (d.isLoggedIn) setUser(d.user);
            else setUser(null);
        }).catch(() => { });
    };

    useEffect(() => {
        fetchUser();

        // Refetch when profile is updated (e.g. avatar changed)
        const onProfileUpdate = () => fetchUser();
        window.addEventListener('profile-updated', onProfileUpdate);
        return () => window.removeEventListener('profile-updated', onProfileUpdate);
    }, [pathname]);

    useEffect(() => {
        // Restore theme - safe localStorage for iOS private mode
        try {
            const saved = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
            setTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        } catch (e) {
            // Fallback untuk private browsing mode di iOS
            setTheme('light');
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // Scroll listener
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);
    // Focus search input when opened
    useEffect(() => {
        if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
    }, [searchOpen]);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        try {
            localStorage.setItem('theme', next);
        } catch (e) {
            // Private mode di iOS - silently fail
            console.warn('localStorage tidak tersedia (private mode)');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setDropdownOpen(false);
        router.push('/');
        router.refresh();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
            setSearchResults(null);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);

        // Clear previous timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Clear results if query is too short
        if (value.length < 2) {
            setSearchResults(null);
            setSearchLoading(false);
            return;
        }

        // Set loading state
        setSearchLoading(true);

        // Debounce search
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        setDebounceTimer(timer);
    };

    const handleResultClick = (result: any, type: string) => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults(null);

        // Navigate based on type
        switch (type) {
            case 'article':
                router.push(`/writings/${result.slug}`);
                break;
            case 'forum':
                router.push(`/forums/${result.id}`);
                break;
            case 'user':
                router.push(`/profile/${result.id}`);
                break;
            case 'category':
                router.push(`/writings?category=${result.slug}`);
                break;
            case 'event':
                router.push('/events');
                break;
            default:
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const AvatarDisplay = ({ className }: { className?: string }) => (
        user?.avatar ? (
            <img src={user.avatar} alt="" className={className} />
        ) : (
            <span>{initials}</span>
        )
    );

    return (
        <>
            {/* Search Modal Overlay */}
            {searchOpen && (
                <div className={styles.searchOverlay} onClick={() => setSearchOpen(false)}>
                    <div className={styles.searchModal} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <Search size={20} className={styles.searchIcon} />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearchInput(e.target.value)}
                                placeholder="Cari tulisan, opini, event..."
                                className={styles.searchInput}
                            />
                            <button type="button" onClick={() => setSearchOpen(false)} className={styles.searchClose}>
                                <X size={18} />
                            </button>
                        </form>

                        {/* Search Results */}
                        {searchQuery.length >= 2 && (
                            <div className={styles.searchResults}>
                                {searchLoading ? (
                                    <div className={styles.searchLoading}>
                                        <div className={styles.searchSpinner}></div>
                                        <span>Mencari...</span>
                                    </div>
                                ) : searchResults ? (
                                    <>
                                        {/* Articles */}
                                        {searchResults.results.articles.slice(0, 3).map((article: any) => (
                                            <div
                                                key={`article-${article.id}`}
                                                className={styles.searchResult}
                                                onClick={() => handleResultClick(article, 'article')}
                                            >
                                                <BookOpen size={16} className={styles.resultIcon} />
                                                <div className={styles.resultContent}>
                                                    <div className={styles.resultTitle}>{article.title}</div>
                                                    <div className={styles.resultMeta}>
                                                        Artikel • <ArticleAuthor author={article.author} anonymous={article.anonymous} stopPropagation />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Forums */}
                                        {searchResults.results.forums.slice(0, 3).map((forum: any) => (
                                            <div
                                                key={`forum-${forum.id}`}
                                                className={styles.searchResult}
                                                onClick={() => handleResultClick(forum, 'forum')}
                                            >
                                                <MessageSquare size={16} className={styles.resultIcon} />
                                                <div className={styles.resultContent}>
                                                    <div className={styles.resultTitle}>{forum.title}</div>
                                                    <div className={styles.resultMeta}>
                                                        Berbagi Opini • <AuthorLink href={`/profile/${forum.author.id}`} stopPropagation>{forum.author.name}</AuthorLink>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Users */}
                                        {searchResults.results.users.slice(0, 2).map((user: any) => (
                                            <div
                                                key={`user-${user.id}`}
                                                className={styles.searchResult}
                                                onClick={() => handleResultClick(user, 'user')}
                                            >
                                                <User size={16} className={styles.resultIcon} />
                                                <div className={styles.resultContent}>
                                                    <div className={styles.resultTitle}>{user.name}</div>
                                                    <div className={styles.resultMeta}>
                                                        Pengguna • @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Show all results link */}
                                        {(searchResults.counts.articles > 3 || searchResults.counts.forums > 3 ||
                                            searchResults.counts.users > 2 || searchResults.counts.categories > 0 ||
                                            searchResults.counts.events > 0) && (
                                                <div
                                                    className={styles.searchShowAll}
                                                    onClick={() => {
                                                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                        setSearchOpen(false);
                                                        setSearchQuery('');
                                                        setSearchResults(null);
                                                    }}
                                                >
                                                    <ArrowRight size={16} />
                                                    <span>Lihat semua hasil ({searchResults.total})</span>
                                                </div>
                                            )}
                                    </>
                                ) : (
                                    <div className={styles.searchEmpty}>
                                        <Search size={24} />
                                        <span>Tidak ada hasil ditemukan</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className={styles.searchHint}>Tekan Enter untuk mencari • Esc untuk tutup</p>
                    </div>
                </div>
            )}

            <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
                <div className={`container ${styles.navWrap}`}>
                    {/* Brand */}
                    <Link href="/" className={styles.brand}>
                        <div className={styles.brandIcon}>
                            <img src="/ikada-logo.png" alt="Disada Logo" draggable="false" />
                        </div>
                        <span>
                            <span className="text-gradient">Disada</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className={styles.nav}>
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                href={link.path}
                                title={link.name}
                                aria-label={link.name}
                                className={`${styles.navLink} ${pathname.startsWith(link.path) ? styles.active : ''}`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className={styles.actions}>
                        {user ? (
                            <>
                                <div className={styles.desktopControls}>
                                    <button
                                        className={`icon-btn ${styles.navIconBtn}`}
                                        onClick={() => setSearchOpen(!searchOpen)}
                                        aria-label="Search"
                                    >
                                        <Search size={20} />
                                    </button>

                                    <button
                                        className={`icon-btn ${styles.navIconBtn}`}
                                        onClick={toggleTheme}
                                        aria-label="Toggle theme"
                                    >
                                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                    </button>
                                </div>

                                {/* Tulis Button — desktop only, logged-in only */}
                                <Link
                                    href="/writings/new"
                                    className={`btn btn-accent btn-sm ${styles.writeBtnNav}`}
                                    aria-label="Buat tulisan baru"
                                >
                                    <PenSquare size={15} />
                                    <span>Tulis</span>
                                </Link>

                                {/* User Dropdown */}
                                <div className={styles.userDropdownWrap} ref={dropdownRef}>
                                    <button
                                        className={styles.avatarBtn}
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        aria-label="Menu pengguna"
                                    >
                                        <div className={styles.avatar}><AvatarDisplay /></div>
                                        <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.open : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className={styles.dropdown}>
                                            <div className={styles.dropdownHeader}>
                                                <div className={styles.dropdownAvatar}><AvatarDisplay /></div>
                                                <div>
                                                    <div className={styles.dropdownName}>{user.name}</div>
                                                    <div className={styles.dropdownEmail}>{user.email}</div>
                                                </div>
                                            </div>
                                            <hr className="divider" style={{ margin: '0.5rem 0' }} />
                                            <Link href={`/profile/${user.id}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                                <User size={15} /> Profil Saya
                                            </Link>
                                            <Link href="/writings/new" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                                <PenSquare size={15} /> Buat Tulisan
                                            </Link>
                                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                                <Link href="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                                    <Settings size={15} /> Admin Panel
                                                </Link>
                                            )}
                                            <hr className="divider" style={{ margin: '0.5rem 0' }} />
                                            <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={handleLogout}>
                                                <LogOut size={15} /> Keluar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.navActions}>
                                {/* Desktop-only Search & Theme */}
                                <div className={styles.desktopControls}>
                                    <button
                                        className={`icon-btn ${styles.navIconBtn}`}
                                        onClick={() => setSearchOpen(!searchOpen)}
                                        aria-label="Search"
                                    >
                                        <Search size={18} />
                                    </button>

                                    <button
                                        className={`icon-btn ${styles.navIconBtn}`}
                                        onClick={toggleTheme}
                                        aria-label="Toggle theme"
                                    >
                                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                    </button>
                                </div>
                                <div className={styles.authBtns}>
                                    <Link href="/login" className={styles.masukLink}>Masuk</Link>
                                    <Link href="/register" className="btn btn-accent btn-sm">Daftar</Link>
                                </div>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            className={`icon-btn ${styles.mobileToggle}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menu"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu - OUTSIDE header untuk avoid z-index stacking context */}
            {menuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileControls}>
                        <button className={styles.mobileControlBtn} onClick={() => { setSearchOpen(true); setMenuOpen(false); }}>
                            <Search size={20} /> Cari
                        </button>
                        <button className={styles.mobileControlBtn} onClick={toggleTheme}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} Tema
                        </button>
                    </div>

                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={`${styles.mobileLink} ${pathname.startsWith(link.path) ? styles.mobileActive : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.icon} {link.name}
                        </Link>
                    ))}
                    <hr className="divider" />
                    {user ? (
                        <>
                            <Link href={`/profile/${user.id}`} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                                <User size={16} /> Profil Saya
                            </Link>
                            <Link href="/writings/new" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                                <PenSquare size={16} /> Buat Tulisan
                            </Link>
                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                <Link href="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                                    <Settings size={16} /> Admin Panel
                                </Link>
                            )}
                            <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={handleLogout}>
                                <LogOut size={16} /> Keluar
                            </button>
                        </>
                    ) : (
                        <div className={styles.mobileAuthBtns}>
                            <Link href="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Masuk</Link>
                            <Link href="/register" className="btn btn-accent" onClick={() => setMenuOpen(false)}>Daftar</Link>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
