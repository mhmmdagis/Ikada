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
                <div className={styles.header}>
                    <h1 className={styles.title}>Galeri Foto &amp; Video</h1>
                    <p className={styles.subtitle}>Koleksi media alumni IKADA Jabodetabek-Banten.</p>
                </div>

                {galleryCategories.length > 0 && (
                    <div className={styles.controls}>
                        <span>Filter kategori:</span>
                        <select
                            className={styles.select}
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Semua Foto/Video</option>
                            {galleryCategories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {filteredFiles.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Belum ada media galeri yang tersedia.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredFiles.map((item, idx) => {
                            const url = item.url;
                            const cat = item.category;
                            const ext = url.split('.').pop()?.toLowerCase();
                            return (
                                <div key={idx} className={styles.mediaCard}>
                                    {cat && (
                                        <span className={styles.badge}>{cat}</span>
                                    )}
                                    {ext && ['mp4', 'webm', 'ogg'].includes(ext) ? (
                                        <video src={url} controls className={styles.mediaItem} />
                                    ) : (
                                        <img src={url} alt="gallery item" className={styles.mediaItem} loading="lazy" />
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