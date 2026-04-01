'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ImageUp, Link2, Loader, Save, Upload } from 'lucide-react';
import styles from '../../new/new.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ArticleFormState {
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tags: string;
    thumbnail: string;
    visibility: 'PUBLIC' | 'DRAFT' | 'UNLISTED' | 'PRIVATE';
    scheduledAt: string;
    allowComments: boolean;
    anonymous: boolean;
    metaTitle: string;
    metaDescription: string;
    customSlug: string;
    attachments: string[];
}

function toDatetimeLocalValue(value: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditWritingPage() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const slug = useMemo(() => params?.slug, [params]);
    const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState<ArticleFormState>({
        title: '',
        excerpt: '',
        content: '',
        categoryId: '',
        tags: '',
        thumbnail: '',
        visibility: 'PUBLIC',
        scheduledAt: '',
        allowComments: true,
        anonymous: false,
        metaTitle: '',
        metaDescription: '',
        customSlug: '',
        attachments: [],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [thumbnailMode, setThumbnailMode] = useState<'url' | 'upload'>('url');
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setError(data.error || 'Gagal memuat artikel.');
                    return;
                }
                if (cancelled) return;
                setForm({
                    title: (data.title || '') as string,
                    excerpt: (data.excerpt || '') as string,
                    content: (data.content || '') as string,
                    categoryId: (data.categoryId || '') as string,
                    tags: (Array.isArray(data.tags) ? data.tags.join(', ') : '') as string,
                    thumbnail: (data.thumbnail || '') as string,
                    visibility: (data.visibility || 'PUBLIC') as ArticleFormState['visibility'],
                    scheduledAt: toDatetimeLocalValue(data.scheduledAt || null) as string,
                    allowComments: (data.allowComments !== undefined ? !!data.allowComments : true) as boolean,
                    anonymous: (!!data.anonymous) as boolean,
                    metaTitle: (data.metaTitle || '') as string,
                    metaDescription: (data.metaDescription || '') as string,
                    customSlug: (data.customSlug || '') as string,
                    attachments: (Array.isArray(data.attachments) ? data.attachments : []) as string[],
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug) return;
        
        const titleTrimmed = form.title?.trim() || '';
        const contentTrimmed = form.content?.trim() || '';
        
        if (!titleTrimmed || !contentTrimmed) {
            setError('Judul dan isi artikel wajib diisi.');
            // Scroll error into view
            setTimeout(() => {
                const errorBox = document.querySelector('[class*="errorBox"]');
                errorBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleTrimmed,
                    excerpt: form.excerpt ?? '',
                    content: contentTrimmed,
                    categoryId: form.categoryId ?? '',
                    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                    thumbnail: form.thumbnail ?? '',
                    visibility: form.visibility,
                    scheduledAt: form.scheduledAt || null,
                    allowComments: form.allowComments,
                    anonymous: form.anonymous,
                    metaTitle: form.metaTitle ?? '',
                    metaDescription: form.metaDescription ?? '',
                    customSlug: form.customSlug ?? '',
                    attachments: form.attachments,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const errorMsg = data.error || 'Gagal menyimpan perubahan.';
                setError(errorMsg);
                // Scroll error into view
                setTimeout(() => {
                    const errorBox = document.querySelector('[class*="errorBox"]');
                    errorBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);
                return;
            }
            router.push(`/writings/${data.slug || slug}`);
            router.refresh();
        } catch (err) {
            console.error('Form submission error:', err);
            setError('Terjadi kesalahan server. Coba lagi.');
            setTimeout(() => {
                const errorBox = document.querySelector('[class*="errorBox"]');
                errorBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
        } finally {
            setSaving(false);
        }
    };

    const openThumbnailPicker = () => {
        if (uploadingThumbnail) return;
        thumbnailFileInputRef.current?.click();
    };

    const handleUploadThumbnail = async (file: File) => {
        setError('');
        setUploadingThumbnail(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.error || 'Upload thumbnail gagal. Silakan login terlebih dahulu.');
                return;
            }

            if (!data?.url) {
                setError('Upload berhasil, tapi URL tidak ditemukan.');
                return;
            }

            setForm((prev) => ({ ...prev, thumbnail: data.url }));
        } catch (e) {
            console.error(e);
            setError('Upload thumbnail gagal. Coba lagi.');
        } finally {
            setUploadingThumbnail(false);
            if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
        }
    };

    // Ensure thumbnail value is always a string
    const thumbnailValue = useMemo(() => {
        if (form.thumbnail === null || form.thumbnail === undefined) return '';
        return String(form.thumbnail);
    }, [form.thumbnail]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container" style={{ padding: '3rem 0' }}>
                    <div className="empty-state">
                        <Loader className="spin" />
                        <p>Memuat artikel…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href={slug ? `/writings/${slug}` : '/writings'} className={styles.backLink}>
                    <ArrowLeft size={16} /> Kembali
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>Edit Artikel</h1>
                    <p className={styles.subtitle}>Perbarui tulisanmu dan simpan perubahan.</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.main}>
                        <div className={styles.formCard}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="article-title">Judul</label>
                                <input
                                    id="article-title"
                                    type="text"
                                    className="form-input"
                                    value={form.title ?? ''}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-excerpt">Ringkasan (opsional)</label>
                                <textarea
                                    id="article-excerpt"
                                    className="form-textarea"
                                    rows={3}
                                    value={form.excerpt ?? ''}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-content">Isi</label>
                                <textarea
                                    id="article-content"
                                    className="form-textarea"
                                    rows={16}
                                    value={form.content ?? ''}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <aside className={styles.sidebar}>
                        <div className={styles.sideCard}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="article-category">Kategori</label>
                                <select
                                    id="article-category"
                                    className="form-select"
                                    value={form.categoryId}
                                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                >
                                    <option value="">Tanpa kategori</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-tags">Tag (pisahkan koma)</label>
                                <input
                                    id="article-tags"
                                    type="text"
                                    className="form-input"
                                    value={form.tags ?? ''}
                                    onChange={e => setForm({ ...form, tags: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-thumbnail">Thumbnail</label>

                                <div className={styles.thumbnailMode}>
                                    <button
                                        type="button"
                                        className={`${styles.thumbnailModeBtn} ${thumbnailMode === 'url' ? styles.thumbnailModeBtnActive : ''}`}
                                        onClick={() => setThumbnailMode('url')}
                                    >
                                        <Link2 size={16} /> URL
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.thumbnailModeBtn} ${thumbnailMode === 'upload' ? styles.thumbnailModeBtnActive : ''}`}
                                        onClick={() => setThumbnailMode('upload')}
                                    >
                                        <Upload size={16} /> Upload
                                    </button>
                                </div>

                                {thumbnailMode === 'url' ? (
                                    <>
                                        <input
                                            key="thumbnail-url-input-edit"
                                            id="article-thumbnail"
                                            type="text"
                                            className="form-input"
                                            placeholder="https://..."
                                            value={thumbnailValue}
                                            onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                                        />
                                        <span className="form-hint">Masukkan link gambar (recommended: 1200x630px)</span>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            ref={thumbnailFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadThumbnail(file);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.thumbnailUploadBtn}
                                            onClick={openThumbnailPicker}
                                            disabled={uploadingThumbnail}
                                        >
                                            {uploadingThumbnail ? <Loader size={16} className={styles.spin} /> : <ImageUp size={16} />}
                                            <span>{uploadingThumbnail ? 'Mengupload…' : 'Pilih dari galeri (perangkat)'}</span>
                                        </button>
                                    </>
                                )}

                                {form.thumbnail ? (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        aspectRatio: '16/9',
                                        backgroundColor: '#f6f6f6',
                                        minHeight: '140px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={form.thumbnail}
                                            alt="thumbnail preview"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-visibility">Visibilitas</label>
                                <select
                                    id="article-visibility"
                                    className="form-select"
                                    value={form.visibility}
                                    onChange={e => setForm({ ...form, visibility: e.target.value as ArticleFormState['visibility'] })}
                                >
                                    <option value="PUBLIC">Publik</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="UNLISTED">Unlisted</option>
                                    <option value="PRIVATE">Pribadi</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-schedule">Jadwalkan Publikasi</label>
                                <input
                                    id="article-schedule"
                                    type="datetime-local"
                                    className="form-input"
                                    value={form.scheduledAt ?? ''}
                                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-allow-comments">
                                    <input
                                        id="article-allow-comments"
                                        type="checkbox"
                                        checked={form.allowComments}
                                        onChange={e => setForm({ ...form, allowComments: e.target.checked })}
                                    />{' '}
                                    Izinkan komentar
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-anonymous">
                                    <input
                                        id="article-anonymous"
                                        type="checkbox"
                                        checked={!!form.anonymous}
                                        onChange={e => setForm({ ...form, anonymous: e.target.checked })}
                                    />{' '}
                                    Publikasikan sebagai Anonim
                                </label>
                            </div>

                            <hr />
                            <p className="form-subheading">SEO &amp; Metadata</p>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-meta-title">Meta Title</label>
                                <input
                                    id="article-meta-title"
                                    type="text"
                                    className="form-input"
                                    value={form.metaTitle ?? ''}
                                    onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-meta-desc">Meta Description</label>
                                <textarea
                                    id="article-meta-desc"
                                    className="form-textarea"
                                    value={form.metaDescription ?? ''}
                                    onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-custom-slug">URL Slug Khusus</label>
                                <input
                                    id="article-custom-slug"
                                    type="text"
                                    className="form-input"
                                    placeholder="opsional, tanpa spasi"
                                    value={form.customSlug ?? ''}
                                    onChange={e => setForm({ ...form, customSlug: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="article-attachments">Attachment (url)</label>
                                <input
                                    id="article-attachments"
                                    type="text"
                                    className="form-input"
                                    placeholder="pisahkan dengan koma"
                                    value={Array.isArray(form.attachments) ? form.attachments.join(',') : ''}
                                    onChange={e => setForm({ ...form, attachments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%' }}>
                                <Save size={18} /> {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}

