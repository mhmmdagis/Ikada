'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminNav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo}>
                Disada Admin
            </Link>
            <button
                className={styles.menuToggle}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Buka/Tutup menu"
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
                <Link href="/admin/users" onClick={() => setMenuOpen(false)}>Pengguna</Link>
                <Link href="/admin/articles" onClick={() => setMenuOpen(false)}>Artikel</Link>
                <Link href="/admin/forums" onClick={() => setMenuOpen(false)}>Berbagi Opini</Link>
                <Link href="/admin/comments" onClick={() => setMenuOpen(false)}>Komentar</Link>
                <Link href="/admin/categories" onClick={() => setMenuOpen(false)}>Kategori</Link>
                <Link href="/admin/events" onClick={() => setMenuOpen(false)}>Acara</Link>
                <Link href="/admin/galleries" onClick={() => setMenuOpen(false)}>Galeri</Link>
                <Link href="/admin/programs" onClick={() => setMenuOpen(false)}>Program</Link>
                <button 
                    onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                    }} 
                    className={styles.logoutBtn}
                >
                    <LogOut size={18} /> Keluar
                </button>
            </nav>
        </header>
    );
}
