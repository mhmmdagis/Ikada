'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Loader } from 'lucide-react';
import styles from '../manage.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    color: string;
}

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', slug: '', color: '#6366f1' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [galleryCategories, setGalleryCategories] = useState<string[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(true);
    const [galleryNewName, setGalleryNewName] = useState('');
    const [galleryCreating, setGalleryCreating] = useState(false);
    const [galleryDeleting, setGalleryDeleting] = useState<string | null>(null);
    const [programCategories, setProgramCategories] = useState<string[]>([]);
    const [programLoading, setProgramLoading] = useState(true);
    const [programNewName, setProgramNewName] = useState('');
    const [programCreating, setProgramCreating] = useState(false);
    const [programDeleting, setProgramDeleting] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setCategories(await res.json());
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchGalleryCategories = async () => {
            try {
                const res = await fetch('/api/admin/gallery-categories');
                if (!res.ok) {
                    setGalleryCategories([]);
                    return;
                }
                const data = await res.json();
                if (data && Array.isArray(data.categories)) {
                    setGalleryCategories(data.categories as string[]);
                }
            } catch (error) {
                console.error('Failed to fetch gallery categories:', error);
            } finally {
                setGalleryLoading(false);
            }
        };

        const fetchProgramCategories = async () => {
            try {
                const res = await fetch('/api/admin/program-categories');
                if (!res.ok) {
                    setProgramCategories([]);
                    return;
                }
                const data = await res.json();
                if (data && Array.isArray(data.categories)) {
                    setProgramCategories(data.categories as string[]);
                }
            } catch (error) {
                console.error('Failed to fetch program categories:', error);
            } finally {
                setProgramLoading(false);
            }
        };

        fetchCategories();
        fetchGalleryCategories();
        fetchProgramCategories();
    }, [router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Category name required');
            return;
        }
        setError('');
        setCreating(true);

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (res.ok) {
                setCategories([...categories, data]);
                setForm({ name: '', slug: '', color: '#6366f1' });
                setShowForm(false);
            } else {
                setError(data.error || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setError('Failed to create category');
        } finally {
            setCreating(false);
        }
    };

    const handleCreateGalleryCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = galleryNewName.trim();
        if (!name) {
            setError('Gallery category name required');
            return;
        }
        setError('');
        setGalleryCreating(true);

        try {
            const res = await fetch('/api/admin/gallery-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();
            if (res.ok) {
                if (!galleryCategories.includes(name)) {
                    setGalleryCategories([...galleryCategories, name]);
                }
                setGalleryNewName('');
            } else {
                setError(data.error || 'Failed to create gallery category');
            }
        } catch (error) {
            console.error('Error creating gallery category:', error);
            setError('Failed to create gallery category');
        } finally {
            setGalleryCreating(false);
        }
    };

    const handleCreateProgramCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = programNewName.trim();
        if (!name) {
            setError('Program category name required');
            return;
        }
        setError('');
        setProgramCreating(true);

        try {
            const res = await fetch('/api/admin/program-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();
            if (res.ok) {
                if (!programCategories.includes(name)) {
                    setProgramCategories([...programCategories, name]);
                }
                setProgramNewName('');
            } else {
                setError(data.error || 'Failed to create program category');
            }
        } catch (error) {
            console.error('Error creating program category:', error);
            setError('Failed to create program category');
        } finally {
            setProgramCreating(false);
        }
    };

    const handleDeleteGalleryCategory = async (name: string) => {
        if (!confirm(`Delete gallery category "${name}"?`)) return;

        setGalleryDeleting(name);
        try {
            const res = await fetch('/api/admin/gallery-categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();
            if (res.ok) {
                setGalleryCategories(galleryCategories.filter(c => c !== name));
            } else {
                alert(data.error || 'Failed to delete gallery category');
            }
        } catch (error) {
            console.error('Error deleting gallery category:', error);
            alert('Failed to delete gallery category');
        } finally {
            setGalleryDeleting(null);
        }
    };

    const handleDeleteProgramCategory = async (name: string) => {
        if (!confirm(`Hapus kategori program "${name}" dari semua program?`)) return;

        setProgramDeleting(name);
        try {
            const res = await fetch('/api/admin/program-categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();
            if (res.ok) {
                setProgramCategories(programCategories.filter(c => c !== name));
            } else {
                alert(data.error || 'Failed to delete program category');
            }
        } catch (error) {
            console.error('Error deleting program category:', error);
            alert('Failed to delete program category');
        } finally {
            setProgramDeleting(null);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Delete this category?')) return;

        setDeleting(categoryId);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId }),
            });

            if (res.ok) {
                setCategories(categories.filter(c => c.id !== categoryId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1>Manage Categories</h1>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Article Categories
                <br />
                Gunakan kategori ini saat mengupload tulisan/artikel di halaman tulisan.
            </p>

            {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Add New Category
                </button>
            ) : (
                <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="cat-name">Category Name *</label>
                        <input
                            id="cat-name"
                            type="text"
                            className="form-input"
                            placeholder="e.g., Programming"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="cat-slug">Slug (optional)</label>
                        <input
                            id="cat-slug"
                            type="text"
                            className="form-input"
                            placeholder="auto-generated"
                            value={form.slug}
                            onChange={e => setForm({ ...form, slug: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="cat-color">Color</label>
                        <input
                            id="cat-color"
                            type="color"
                            value={form.color}
                            onChange={e => setForm({ ...form, color: e.target.value })}
                            style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? 'Creating...' : 'Create Category'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colName}>Name</div>
                        <div className={styles.colEmail}>Slug</div>
                        <div className={styles.colRole}>Color</div>
                        <div className={styles.colAction}>Action</div>
                    </div>

                    <div className={styles.tableBody}>
                        {categories.map(category => (
                            <div key={category.id} className={styles.tableRow}>
                                <div className={styles.colName}>
                                    <strong>{category.name}</strong>
                                </div>
                                <div className={styles.colEmail}>{category.slug}</div>
                                <div className={styles.colRole}>
                                    <div style={{ width: '24px', height: '24px', background: category.color, borderRadius: '4px' }} />
                                </div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        disabled={deleting === category.id}
                                        className={styles.deleteBtn}
                                    >
                                        {deleting === category.id ? (
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

            <p className={styles.info}>Total Article/Forum Categories: {categories.length}</p>

            <hr style={{ margin: '2rem 0' }} />

            <h2 style={{ marginBottom: '0.75rem' }}>Gallery Categories</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Gunakan kategori ini saat mengupload foto/video di halaman galeri.
            </p>

            <form onSubmit={handleCreateGalleryCategory} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Nama kategori galeri baru (mis. Event, Dokumentasi)"
                    value={galleryNewName}
                    onChange={e => setGalleryNewName(e.target.value)}
                    style={{ maxWidth: '320px' }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={galleryCreating}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {galleryCreating ? (
                        'Adding...'
                    ) : (
                        <>
                            <Plus size={18} /> Add Gallery Category
                        </>
                    )}
                </button>
            </form>

            {galleryLoading ? (
                <div className={styles.loading}>Loading gallery categories...</div>
            ) : galleryCategories.length === 0 ? (
                <p className={styles.info}>Belum ada kategori galeri.</p>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colName}>Name</div>
                        <div className={styles.colAction}>Action</div>
                    </div>
                    <div className={styles.tableBody}>
                        {galleryCategories.map(cat => (
                            <div key={cat} className={styles.tableRow}>
                                <div className={styles.colName}>
                                    <strong>{cat}</strong>
                                </div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleDeleteGalleryCategory(cat)}
                                        disabled={galleryDeleting === cat}
                                        className={styles.deleteBtn}
                                    >
                                        {galleryDeleting === cat ? (
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

            <p className={styles.info}>Total Gallery Categories: {galleryCategories.length}</p>

            <hr style={{ margin: '2rem 0' }} />

            <h2 style={{ marginBottom: '0.75rem' }}>Program Categories</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Kategori ini berasal dari field kategori pada setiap program. Menghapus kategori di sini akan menghapus
                kategori tersebut dari semua program yang menggunakannya (program tetap ada, hanya kategorinya yang dikosongkan).
            </p>

            <form onSubmit={handleCreateProgramCategory} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Nama kategori program baru (mis. Sosial, Edukasi)"
                    value={programNewName}
                    onChange={e => setProgramNewName(e.target.value)}
                    style={{ maxWidth: '320px' }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={programCreating}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {programCreating ? (
                        'Adding...'
                    ) : (
                        <>
                            <Plus size={18} /> Add Program Category
                        </>
                    )}
                </button>
            </form>

            {programLoading ? (
                <div className={styles.loading}>Loading program categories...</div>
            ) : programCategories.length === 0 ? (
                <p className={styles.info}>Belum ada kategori program.</p>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colName}>Name</div>
                        <div className={styles.colAction}>Action</div>
                    </div>
                    <div className={styles.tableBody}>
                        {programCategories.map(cat => (
                            <div key={cat} className={styles.tableRow}>
                                <div className={styles.colName}>
                                    <strong>{cat}</strong>
                                </div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleDeleteProgramCategory(cat)}
                                        disabled={programDeleting === cat}
                                        className={styles.deleteBtn}
                                    >
                                        {programDeleting === cat ? (
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

            <p className={styles.info}>Total Program Categories: {programCategories.length}</p>
        </div>
    );
}
