'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PenSquare, Send, AlertCircle, Loader, ImageUp, Link2, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './new.module.css';

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

interface GalleryItem {
    id: string;
    url: string;
    category?: string | null;
}

export default function NewWritingPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);
    const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState<ArticleFormState>(() => ({
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
    }));

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
                const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
                const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
                const [thumbnailMode, setThumbnailMode] = useState<'url' | 'upload'>('url');
                const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

                useEffect(() => {
                    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => { });
                }, []);

                // load draft from localStorage on client
                useEffect(() => {
                    if (typeof window === 'undefined') return;
                    const saved = localStorage.getItem('draft-article');
                    if (!saved) return;
                    try {
                        const parsed = JSON.parse(saved) as ArticleFormState;
                        setForm((prev) => ({
                            title: parsed?.title ?? prev.title ?? '',
                            excerpt: parsed?.excerpt ?? prev.excerpt ?? '',
                            content: parsed?.content ?? prev.content ?? '',
                            categoryId: parsed?.categoryId ?? prev.categoryId ?? '',
                            tags: parsed?.tags ?? prev.tags ?? '',
                            thumbnail: parsed?.thumbnail ?? prev.thumbnail ?? '',
                            visibility: (parsed?.visibility ?? prev.visibility ?? 'PUBLIC') as 'PUBLIC' | 'DRAFT' | 'UNLISTED' | 'PRIVATE',
                            scheduledAt: parsed?.scheduledAt ?? prev.scheduledAt ?? '',
                            allowComments: parsed?.allowComments ?? prev.allowComments ?? true,
                            anonymous: parsed?.anonymous ?? prev.anonymous ?? false,
                            metaTitle: parsed?.metaTitle ?? prev.metaTitle ?? '',
                            metaDescription: parsed?.metaDescription ?? prev.metaDescription ?? '',
                            customSlug: parsed?.customSlug ?? prev.customSlug ?? '',
                            attachments: Array.isArray(parsed?.attachments) ? parsed.attachments : (prev.attachments ?? []),
                        }));
                    } catch {
                        // ignore malformed localStorage
                    }
                }, []);

                // auto save draft every 5 seconds
                useEffect(() => {
                    if (typeof window === 'undefined') return;
                    const interval = setInterval(() => {
                        localStorage.setItem('draft-article', JSON.stringify(form));
                    }, 5000);
                    return () => clearInterval(interval);
                }, [form]);



                const handleSubmit = async (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!form.title.trim() || !form.content.trim()) {
                        setError('Judul dan isi artikel wajib diisi.');
                        return;
                    }
                    setError('');
                    setLoading(true);
                    try {
                        const res = await fetch('/api/articles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: form.title,
                                excerpt: form.excerpt,
                                content: form.content,
                                categoryId: form.categoryId,
                                tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                                thumbnail: form.thumbnail,
                                visibility: form.visibility,
                                scheduledAt: form.scheduledAt || null,
                                allowComments: form.allowComments,
                                anonymous: form.anonymous,
                                metaTitle: form.metaTitle,
                                metaDescription: form.metaDescription,
                                customSlug: form.customSlug,
                                attachments: form.attachments,
                            }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                            setError(data.error || 'Gagal membuat artikel.');
                            return;
                        }
                        localStorage.removeItem('draft-article');
                        router.push(`/writings/${data.slug}`);
                    } catch {
                        setError('Terjadi kesalahan. Coba lagi.');
                    } finally {
                        setLoading(false);
                    }
                };

                const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
                const readTime = Math.max(1, Math.ceil(wordCount / 200));
                
                // Ensure thumbnail value is always a string
                const thumbnailValue = useMemo(() => {
                    if (form.thumbnail === null || form.thumbnail === undefined) return '';
                    return String(form.thumbnail);
                }, [form.thumbnail]);

                const insertMarkdown = (before: string, after: string = '') => {
                    const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
                    if (!textarea) return;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    setForm((prev) => {
                        const selected = (prev.content || '').substring(start, end);
                        const newContent =
                            (prev.content || '').substring(0, start) +
                            before +
                            selected +
                            after +
                            (prev.content || '').substring(end);
                        // update selection after DOM updates
                        setTimeout(() => {
                            textarea.selectionStart = start + before.length;
                            textarea.selectionEnd = start + before.length + selected.length;
                            textarea.focus();
                        }, 0);
                        return { ...prev, content: newContent };
                    });
                };

                const insertImageMarkdown = (url: string, alt: string = 'image') => {
                    const safeAlt = (alt || 'image').replace(/\]/g, '').trim() || 'image';
                    insertMarkdown(`![${safeAlt}](`, `${url})`);
                };

                const openFilePicker = () => {
                    if (uploadingInlineImage) return;
                    uploadInputRef.current?.click();
                };

                const handleUploadInlineImage = async (file: File) => {
                    setError('');
                    setUploadingInlineImage(true);
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        const data = await res.json().catch(() => ({}));

                        if (!res.ok) {
                            setError(data?.error || 'Upload gagal. Silakan login terlebih dahulu.');
                            return;
                        }

                        if (!data?.url) {
                            setError('Upload berhasil, tapi URL tidak ditemukan.');
                            return;
                        }

                        insertImageMarkdown(data.url, file.name);
                    } catch (e) {
                        console.error(e);
                        setError('Upload gagal. Coba lagi.');
                    } finally {
                        setUploadingInlineImage(false);
                        if (uploadInputRef.current) uploadInputRef.current.value = '';
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

                return (
                    <div className={styles.page}>
                        <div className="container">
                            <Link href="/writings" className={styles.backLink}>
                                <ArrowLeft size={15} /> Kembali ke Tulisan
                            </Link>

                            <div className={styles.layout}>
                                {/* Main Form */}
                                <main className={styles.main}>
                                    <div className={styles.formHeader}>
                                        <div className={styles.formHeaderIcon}><PenSquare size={20} /></div>
                                        <div>
                                            <h1 className={styles.formTitle}>Buat Tulisan Baru</h1>
                                            <p className={styles.formSub}>Ekspresikan ide, opini, dan ceritamu untuk komunitas Disada.</p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className={styles.errorAlert}>
                                            <AlertCircle size={16} /><span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className={styles.form}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-title">Judul Artikel *</label>
                                            <input
                                                id="article-title"
                                                type="text"
                                                className="form-input"
                                                placeholder="Judul yang menarik perhatian..."
                                                value={form.title}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                                required
                                                maxLength={200}
                                            />
                                            <span className="form-hint">{form.title.length}/200 karakter</span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-excerpt">Ringkasan (opsional)</label>
                                            <input
                                                id="article-excerpt"
                                                type="text"
                                                className="form-input"
                                                placeholder="Tuliskan ringkasan singkat artikel kamu..."
                                                value={form.excerpt ?? ''}
                                                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                                maxLength={300}
                                            />
                                            <span className="form-hint">Tampil sebagai preview di halaman daftar tulisan</span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-content">Isi Artikel *</label>
                                            <p className="form-hint" style={{marginBottom: '0.5rem'}}>
                                                Format: <strong>Markdown</strong> | <a href="#" onClick={(e) => { e.preventDefault(); setShowMarkdownHelp(!showMarkdownHelp); }} style={{cursor:'pointer', color:'var(--brand-primary)'}}>Lihat Bantuan</a>
                                            </p>

                                            {showMarkdownHelp && (
                                                <div className={styles.markdownHelp}>
                                                    <strong>Markdown Formatting:</strong>
                                                    <ul>
                                                        <li><code>**teks**</code> = <strong>Bold</strong></li>
                                                        <li><code>*teks*</code> = <em>Italic</em></li>
                                                        <li><code>## Heading</code> = Heading 2</li>
                                                        <li><code>### Heading</code> = Heading 3</li>
                                                        <li><code>- item</code> = Bullet list</li>
                                                        <li><code>1. item</code> = Numbered list</li>
                                                        <li><code>&gt; quote</code> = Blockquote</li>
                                                        <li><code>`code`</code> = Inline code</li>
                                                        <li><code>```\ncode\n```</code> = Code block</li>
                                                        <li><code>[link](url)</code> = Link</li>
                                                        <li><code>![alt](url)</code> = Image</li>
                                                    </ul>
                                                </div>
                                            )}

                                            <div className={styles.editorToolbar}>
                                                <button type="button" title="Bold" onClick={() => insertMarkdown('**', '**')} className={styles.toolbarBtn}>
                                                    <strong>B</strong>
                                                </button>
                                                <button type="button" title="Italic" onClick={() => insertMarkdown('*', '*')} className={styles.toolbarBtn}>
                                                    <em>I</em>
                                                </button>
                                                <div className={styles.toolbarSeparator} />
                                                <button type="button" title="Heading 2" onClick={() => insertMarkdown('## ', '\n')} className={styles.toolbarBtn}>
                                                    H2
                                                </button>
                                                <button type="button" title="Heading 3" onClick={() => insertMarkdown('### ', '\n')} className={styles.toolbarBtn}>
                                                    H3
                                                </button>
                                                <div className={styles.toolbarSeparator} />
                                                <button type="button" title="Bullet List" onClick={() => insertMarkdown('- ', '')} className={styles.toolbarBtn}>
                                                    • List
                                                </button>
                                                <button type="button" title="Quote" onClick={() => insertMarkdown('> ', '')} className={styles.toolbarBtn}>
                                                    &quot;
                                                </button>
                                                <div className={styles.toolbarSeparator} />
                                                <button type="button" title="Link" onClick={() => insertMarkdown('[teks](', ')')} className={styles.toolbarBtn}>
                                                🔗 Link
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Upload gambar dari perangkat"
                                                    onClick={openFilePicker}
                                                    className={styles.toolbarBtn}
                                                    disabled={uploadingInlineImage}
                                                >
                                                    {uploadingInlineImage ? <Loader size={16} className={styles.spin} /> : <ImageUp size={16} />}
                                                    <span className={styles.toolbarBtnText}>Upload</span>
                                                </button>
                                                <button type="button" title="Code Block" onClick={() => insertMarkdown('```\n', '\n```')} className={styles.toolbarBtn}>
                                                    &lt;&gt;
                                                </button>
                                            </div>

                                            <input
                                                ref={uploadInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUploadInlineImage(file);
                                                }}
                                            />

                                            <textarea
                                                id="article-content"
                                                className="form-textarea"
                                                placeholder="Tulis artikel kamu di sini menggunakan Markdown... Gunakan [link](url) dan ![alt](url) untuk gambar"
                                                value={form.content}
                                                onChange={e => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                                required
                                                rows={18}
                                                style={{ minHeight: '380px', fontFamily: 'monospace' }}
                                            />
                                            <div className={styles.textareaFooter}>
                                                <span className="form-hint">{wordCount} kata · ~{readTime} menit baca</span>
                                            </div>

                                            {/* preview area */}
                                            <div className={styles.previewSection}>
                                                <h4>Pratinjau</h4>
                                                <div className={styles.markdownPreview}>
                                                    <ReactMarkdown
                                                        components={{
                                                            img: ({node, ...props}) =>
                                                                props.src ? <img {...props} /> : null,
                                                        }}
                                                    >
                                                        {form.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.formActions}>
                                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                                {loading ? 'Memproses...' : (<><Send size={17} /> Publikasikan Tulisan</>)}
                                            </button>
                                            <Link href="/writings" className="btn btn-ghost btn-lg">Batal</Link>
                                        </div>
                                    </form>
                                </main>

                                {/* Sidebar */}
                                <aside className={styles.sidebar}>
                                    <div className={styles.sideCard}>
                                        <h3 className={styles.sideTitle}>Pengaturan</h3>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-category">Kategori</label>
                                            <select
                                                id="article-category"
                                                className="form-select"
                                                value={form.categoryId}
                                                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                            >
                                                <option value="">Tanpa Kategori</option>
                                                {categories.length > 0 ? (
                                                    categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))
                                                ) : (
                                                    <option disabled>Belum ada kategori (hubungi admin)</option>
                                                )}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-tags">Tags (pisahkan koma)</label>
                                            <input
                                                id="article-tags"
                                                type="text"
                                                className="form-input"
                                                placeholder="programming, javascript, ..."
                                                value={form.tags ?? ''}
                                                onChange={e => setForm({ ...form, tags: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-thumbnail">
                                                Thumbnail (opsional)
                                            </label>

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
                                                        key="thumbnail-url-input"
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

                                                    <span className="form-hint">File akan diupload dan disimpan sebagai URL otomatis</span>
                                                </>
                                            )}
                                            
                                            {form.thumbnail && (
                                                <div style={{
                                                    marginTop: '1rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    overflow: 'hidden',
                                                    aspectRatio: '16/9',
                                                    backgroundColor: '#f6f6f6',
                                                    minHeight: '160px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
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
                                                            console.error('Thumbnail image failed to load:', form.thumbnail);
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                        onLoad={() => {
                                                            console.log('✓ Thumbnail preview loaded:', form.thumbnail);
                                                        }}
                                                    />
                                                </div>
                                            )}
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
                                            <span className="form-hint">Artikel akan tampil, tapi identitas penulis disembunyikan (ditampilkan sebagai &quot;Anonim&quot;)</span>
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

                                        <hr />
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="article-attachments">Attachment (url)</label>
                                            <input
                                                id="article-attachments"
                                                type="text"
                                                className="form-input"
                                                placeholder="pisahkan dengan koma"
                                                value={Array.isArray(form.attachments) ? form.attachments.join(',') : form.attachments}
                                                onChange={e => setForm({ ...form, attachments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            />
                                            <span className="form-hint">PDF, gambar, dataset, dll.</span>
                                        </div>
                                    </div>

                                    <div className={styles.sideCard}>
                                        <h3 className={styles.sideTitle}>Tips Menulis</h3>
                                        <ul className={styles.tipsList}>
                                            <li>✍️ Gunakan judul yang kuat dan deskriptif</li>
                                            <li>💡 Struktur: pembuka → isi → penutup</li>
                                            <li>🎯 Satu paragraf = satu ide pokok</li>
                                            <li>📖 Baca ulang sebelum mempublikasikan</li>
                                            <li>🌟 Artikel minimal 200 kata lebih disukai</li>
                                        </ul>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </div>
                );
            }
