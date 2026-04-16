'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './new.module.css';

export default function NewForumPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // cek login
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => {
                if (!d.isLoggedIn) {
                    router.replace('/login?next=/forums/new');
                }
            })
            .catch(() => { });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('Judul dan isi wajib diisi.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/forums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Gagal mengirim opini baru.');
                return;
            }
            router.push(`/forums/${data.id}`);
        } catch {
            setError('Terjadi kesalahan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <section className={styles.headerSection}>
                <div className="container">
                    <Link href="/forums" className={styles.backLink}>
                        <ArrowLeft size={16} /> Kembali ke Berbagi Opini
                    </Link>
                    <div className={styles.titleWrapper}>
                        <h1>Bagikan Opinimu</h1>
                        <p className={styles.subtitle}>
                            Tulis pertanyaan, opini, atau topik yang ingin kamu bagikan bersama komunitas.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.contentSection}>
                <div className="container">
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="forum-title">Judul Opini *</label>
                            <input
                                id="forum-title"
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Pengalaman kerja pertama setelah lulus?"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={200}
                                required
                            />
                            <span className="form-hint">{title.length}/200 karakter</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="forum-content">Isi Opini *</label>
                            <textarea
                                id="forum-content"
                                className="form-textarea"
                                rows={8}
                                placeholder="Tulis detail topik, latar belakang, atau hal yang ingin kamu bagikan..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Mengirim...' : 'Publikasikan Opinimu'}
                            </button>
                            <Link href="/forums" className="btn btn-ghost">
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}