'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import styles from '../manage.module.css';

interface Gallery {
    id: string;
    url: string;
    category: string | null;
    uploadedById: string;
    createdAt: string;
    uploadedBy: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

export default function AdminGalleriesPage() {
    const router = useRouter();
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchGalleries();
        fetchCategories();
    }, []);

    const fetchGalleries = async () => {
        try {
            const res = await fetch('/api/admin/galleries');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setGalleries(data.galleries);
        } catch (error) {
            console.error('Failed to fetch galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/gallery-categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const file = formData.get('file') as File;

        if (!file) {
            alert('Please select a file');
            return;
        }

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('category', selectedCategory || newCategory);

            const res = await fetch('/api/admin/galleries', {
                method: 'POST',
                body: uploadFormData
            });

            if (res.ok) {
                fetchGalleries();
                if (newCategory && !categories.includes(newCategory)) {
                    setCategories([...categories, newCategory]);
                }
                form?.reset();
                setSelectedCategory('');
                setNewCategory('');
                alert('Gallery item uploaded successfully!');
            } else {
                alert('Failed to upload gallery item');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading gallery item');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this gallery item?')) return;

        try {
            const res = await fetch('/api/admin/galleries', {
                method: 'DELETE',
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                fetchGalleries();
                alert('Gallery item deleted successfully!');
            } else {
                alert('Failed to delete gallery item');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting gallery item');
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/admin" className={styles.backBtn}>
                <ArrowLeft size={20} /> Back to Admin
            </Link>

            <h1 className={styles.title}>Manage Galleries</h1>

            {/* Upload Form */}
            <div className={styles.section}>
                <h2>Upload New Gallery Item</h2>
                <form onSubmit={handleUpload} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Image/Video File *</label>
                        <input
                            type="file"
                            name="file"
                            accept="image/*,video/*"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <div className={styles.categoryInputGroup}>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setNewCategory('');
                                }}
                                className={styles.input}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="new">+ Add New Category</option>
                            </select>
                        </div>
                        {selectedCategory === 'new' && (
                            <input
                                type="text"
                                placeholder="Enter new category name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className={styles.input}
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className={styles.submitBtn}
                    >
                        {uploading ? <Loader size={18} /> : <Upload size={18} />}
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>

            {/* Gallery List */}
            <div className={styles.section}>
                <h2>Current Gallery Items ({galleries.length})</h2>
                {loading ? (
                    <p>Loading galleries...</p>
                ) : galleries.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No gallery items yet. Upload your first item above!</p>
                ) : (
                    <div className={styles.galleryGrid}>
                        {galleries.map((gallery) => (
                            <div key={gallery.id} className={styles.galleryItem}>
                                <div className={styles.galleryImage}>
                                    {gallery.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img src={gallery.url} alt="Gallery item" />
                                    ) : (
                                        <div className={styles.videoPlaceholder}>
                                            <ImageIcon size={40} />
                                            <span>Video</span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.galleryInfo}>
                                    {gallery.category && (
                                        <span className={styles.category}>{gallery.category}</span>
                                    )}
                                    <p className={styles.uploadedBy}>
                                        by {gallery.uploadedBy.name}
                                    </p>
                                    <small>{new Date(gallery.createdAt).toLocaleDateString()}</small>
                                    <button
                                        onClick={() => handleDelete(gallery.id)}
                                        className={styles.deleteBtn}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
