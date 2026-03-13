'use client';

import { useState, useEffect } from 'react';
import styles from './gallery.module.css';

export default function GalleryPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [galleryCategories, setGalleryCategories] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState('');

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/gallery');
            const data = await res.json();
            if (Array.isArray(data)) {
                setFiles(data);
                const cats = Array.from(
                    new Set(
                        data
                            .map((item: any) => item.category)
                            .filter((c: string | null) => !!c)
                    )
                ) as string[];
                setGalleryCategories(cats);
            }
        } catch (err) {
            console.error('Failed to fetch gallery', err);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const filteredFiles = filterCategory
        ? files.filter(item => item.category === filterCategory)
        : files;

    return (
        <div className={styles.galleryPage}>
            <div className="container">
                <h1>Galeri Foto &amp; Video</h1>
                <p>Koleksi media alumni IKADA Jabodetabek-Banten.</p>

                {galleryCategories.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>Filter kategori:</span>
                        <select
                            className="input input-bordered input-sm"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Semua</option>
                            {galleryCategories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {filteredFiles.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Belum ada galeri.</p>
                ) : (
                    <div className={styles.grid}>
                        {filteredFiles.map((item, idx) => {
                            const url = item.url;
                            const cat = item.category;
                            const ext = url.split('.').pop()?.toLowerCase();
                            return (
                                <div key={idx} className="relative">
                                    {ext && ['mp4', 'webm', 'ogg'].includes(ext) ? (
                                        <video src={url} controls className={styles.mediaItem} />
                                    ) : (
                                        <img src={url} alt="gallery item" className={styles.mediaItem} />
                                    )}
                                    {cat && (
                                        <span className="badge badge-sm badge-secondary absolute top-2 left-2">{cat}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}