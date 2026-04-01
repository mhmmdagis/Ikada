'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './reading.module.css';

export default function OwnerActions({ slug }: { slug: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Hapus artikel ini? Tindakan ini tidak bisa dibatalkan.')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.error || 'Gagal menghapus artikel.');
                return;
            }
            router.push('/writings');
            router.refresh();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <span className={styles.ownerActions}>
            <Link href={`/writings/${encodeURIComponent(slug)}/edit`} className="btn btn-outline btn-sm">
                Edit
            </Link>
            <button type="button" className={`${styles.deleteBtn} btn btn-outline btn-sm`} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Menghapus…' : 'Hapus'}
            </button>
        </span>
    );
}

