'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Loader, ChevronDown } from 'lucide-react';
import styles from '../manage.module.css';

interface Program {
    id: string;
    title: string;
    description: string;
    content: string | null;
    category: string | null;
    image: string | null;
    icon: string | null;
    status: string;
    createdAt: string;
    createdBy: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

export default function AdminProgramsPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        image: '',
        icon: '',
        status: 'ACTIVE'
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await fetch('/api/admin/programs');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setPrograms(data.programs);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImageFromDevice = () => {
        if (uploadingImage) return;
        imageInputRef.current?.click();
    };

    const handleUploadImage = async (file: File) => {
        setImageError('');
        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.url) {
                setImageError(data?.error || 'Upload gambar gagal.');
                return;
            }

            setFormData(prev => ({ ...prev, image: data.url as string }));
        } catch (error) {
            console.error('Upload program image error:', error);
            setImageError('Upload gambar gagal. Coba lagi.');
        } finally {
            setUploadingImage(false);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/admin/programs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchPrograms();
                setShowForm(false);
                setEditingId(null);
                setFormData({
                    title: '',
                    description: '',
                    content: '',
                    category: '',
                    image: '',
                    icon: '',
                    status: 'ACTIVE'
                });
                alert(editingId ? 'Program updated successfully!' : 'Program created successfully!');
            } else {
                alert('Failed to save program');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving program');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (program: Program) => {
        setFormData({
            title: program.title,
            description: program.description,
            content: program.content || '',
            category: program.category || '',
            image: program.image || '',
            icon: program.icon || '',
            status: program.status
        });
        setEditingId(program.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this program?')) return;

        try {
            const res = await fetch('/api/admin/programs', {
                method: 'DELETE',
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                fetchPrograms();
                alert('Program deleted successfully!');
            } else {
                alert('Failed to delete program');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting program');
        }
    };

    const cancelEdit = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            content: '',
            category: '',
            image: '',
            icon: '',
            status: 'ACTIVE'
        });
    };

    return (
        <div className={styles.container}>
            <Link href="/admin" className={styles.backBtn}>
                <ArrowLeft size={20} /> Back to Admin
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.title}>Manage Programs</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={styles.primaryBtn}
                >
                    <Plus size={18} /> {showForm ? 'Cancel' : 'Add Program'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className={styles.section}>
                    <h2>{editingId ? 'Edit Program' : 'Create New Program'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className={styles.textarea}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Content (Long Description)</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className={styles.textarea}
                                style={{ minHeight: '150px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., Sosial, Edukasi"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g., 🎯"
                                    className={styles.input}
                                    maxLength={2}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={styles.input}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Gambar Program (upload dari perangkat)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    value={formData.image}
                                    readOnly
                                    placeholder="Belum ada gambar. Upload dari perangkat."
                                    className={styles.input}
                                    style={{ flex: '1 1 220px', opacity: 0.9, cursor: 'not-allowed' }}
                                />
                                <button
                                    type="button"
                                    onClick={handlePickImageFromDevice}
                                    className={styles.primaryBtn}
                                    disabled={uploadingImage}
                                >
                                    {uploadingImage ? 'Mengupload...' : 'Pilih File'}
                                </button>
                            </div>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadImage(file);
                                }}
                            />
                            {imageError && (
                                <div style={{ marginTop: '0.25rem', color: '#fecaca', fontSize: '0.85rem' }}>
                                    {imageError}
                                </div>
                            )}
                            {formData.image && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '320px',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.3)'
                                    }}>
                                        <img
                                            src={formData.image}
                                            alt="Program preview"
                                            style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '200px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={styles.submitBtn}
                            >
                                {submitting ? <Loader size={18} /> : '+'}
                                {submitting ? 'Saving...' : editingId ? 'Update Program' : 'Create Program'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Programs List */}
            <div className={styles.section}>
                <h2>Programs ({programs.length})</h2>
                {loading ? (
                    <p>Loading programs...</p>
                ) : programs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No programs yet. Create your first program above!</p>
                ) : (
                    <div className={styles.list}>
                        {programs.map((program) => (
                            <div key={program.id} className={styles.listItem}>
                                <div className={styles.itemContent}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {program.icon && <span style={{ fontSize: '1.5rem' }}>{program.icon}</span>}
                                        <div>
                                            <h3>{program.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                {program.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                {program.category && (
                                                    <span className={styles.badge}>{program.category}</span>
                                                )}
                                                <span className={styles.badge} style={{
                                                    background: program.status === 'ACTIVE' ? '#10b98133' : '#9ca3af33'
                                                }}>
                                                    {program.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEdit(program)}
                                        className={styles.editBtn}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(program.id)}
                                        className={styles.deleteBtn}
                                    >
                                        <Trash2 size={16} />
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
