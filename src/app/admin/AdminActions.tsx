'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download } from 'lucide-react';
import styles from './admin.module.css';

interface AdminActionsProps {
    userRole: string;
}

export default function AdminActions({ userRole }: AdminActionsProps) {
    const router = useRouter();

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

    return (
        <section className={styles.quickActions}>
            <h2>Aksi Cepat</h2>
            <div className={styles.actiongrid}>
                <Link href="/admin/users" className={styles.actionCard}>
                    Kelola Pengguna
                </Link>
                <Link href="/admin/articles" className={styles.actionCard}>
                    Kelola Artikel
                </Link>
                <Link href="/admin/forums" className={styles.actionCard}>
                    Kelola Berbagi Opini
                </Link>
                <Link href="/admin/comments" className={styles.actionCard}>
                    Kelola Komentar
                </Link>
                <Link href="/admin/categories" className={styles.actionCard}>
                    Kelola Kategori
                </Link>
                <Link href="/admin/events" className={styles.actionCard}>
                    Kelola Acara
                </Link>
                <Link href="/admin/galleries" className={styles.actionCard}>
                    Kelola Galeri
                </Link>
                <Link href="/admin/programs" className={styles.actionCard}>
                    Kelola Program
                </Link>
                
                {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                    <div 
                        className={styles.actionCard} 
                        onClick={() => handleExportData('xlsx')} 
                        style={{ cursor: 'pointer' }}
                    >
                        <Download size={16} style={{ marginRight: '8px' }} />
                        Ekspor Data (XLSX)
                    </div>
                )}
            </div>
        </section>
    );
}

// Named export for AdminNav to use if needed, but we can also just define the function inside AdminNav or here.
export async function logoutAction() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
}
