'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader } from 'lucide-react';
import styles from '../manage.module.css';

interface Author {
    id: string;
    name: string;
    email: string;
}

interface Forum {
    id: string;
    title: string;
    excerpt?: string;
    author: Author;
    createdAt: string;
    _count: {
        comments: number;
    };
}

export default function ForumsPage() {
    const router = useRouter();
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const fetchForums = async () => {
            try {
                const res = await fetch('/api/admin/forums');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setForums(await res.json());
            } catch (error) {
                console.error('Failed to fetch forums:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForums();
    }, [router]);

    const handleDelete = async (forumId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus opini ini dan semua komentarnya?'))
            return;

        setDeleting(forumId);
        try {
            const res = await fetch('/api/admin/forums', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forumId }),
            });

            if (res.ok) {
                setForums(forums.filter(f => f.id !== forumId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete forum');
            }
        } catch (error) {
            console.error('Error deleting forum:', error);
            alert('Failed to delete forum');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Kembali
                </Link>
                <h1>Kelola Berbagi Opini</h1>
            </div>

            {loading ? (
                <div className={styles.loading}>Memuat...</div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colTitle}>Judul</div>
                        <div className={styles.colAuthor}>Penulis</div>
                        <div className={styles.colComments}>Komentar</div>
                        <div className={styles.colAction}>Aksi</div>
                    </div>

                    <div className={styles.tableBody}>
                        {forums.map(forum => (
                            <div key={forum.id} className={styles.tableRow}>
                                <div className={styles.colTitle}>
                                    <strong>{forum.title}</strong>
                                    {forum.excerpt && <small>{forum.excerpt}</small>}
                                </div>
                                <div className={styles.colAuthor}>
                                    <div>{forum.author.name}</div>
                                    <small>{forum.author.email}</small>
                                </div>
                                <div className={styles.colComments}>
                                    <span className={styles.badge}>{forum._count.comments}</span>
                                </div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleDelete(forum.id)}
                                        disabled={deleting === forum.id}
                                        className={styles.deleteBtn}
                                    >
                                        {deleting === forum.id ? (
                                            <Loader size={18} className={styles.spinning} />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className={styles.info}>Total Opini: {forums.length}</p>
        </div>
    );
}
