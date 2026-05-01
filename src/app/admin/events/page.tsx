'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, Trash2, Plus, Loader, Edit, 
    Calendar, MapPin, Globe, Users, 
    X, Info, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import styles from '../manage.module.css';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Event {
    id: string;
    title: string;
    description: string;
    content?: string;
    date: string;
    endDate?: string;
    location: string;
    image?: string;
    type: string;
    status: string;
    organizer?: string;
    link?: string;
    createdAt: string;
    updatedAt: string;
}

type FilterStatus = 'ALL' | 'UPCOMING' | 'ONGOING' | 'ENDED';

export default function EventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [filter, setFilter] = useState<FilterStatus>('ALL');
    
    const [form, setForm] = useState({
        title: '',
        description: '',
        content: '',
        date: '',
        endDate: '',
        location: '',
        image: '',
        type: 'ONLINE',
        status: 'UPCOMING',
        organizer: '',
        link: ''
    });
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/admin/events');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setEvents(await res.json());
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [router]);

    const getEventStatus = (event: Event): FilterStatus => {
        const now = new Date();
        const start = new Date(event.date);
        const end = event.endDate ? new Date(event.endDate) : start;

        if (now < start) return 'UPCOMING';
        if (now >= start && now <= end) return 'ONGOING';
        return 'ENDED';
    };

    const filteredEvents = useMemo(() => {
        if (filter === 'ALL') return events;
        return events.filter(e => getEventStatus(e) === filter);
    }, [events, filter]);

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            content: '',
            date: '',
            endDate: '',
            location: '',
            image: '',
            type: 'ONLINE',
            status: 'UPCOMING',
            organizer: '',
            link: ''
        });
        setEditingEvent(null);
        setError('');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
            setError('Judul, deskripsi, tanggal, dan lokasi wajib diisi.');
            return;
        }

        setError('');
        setCreating(true);

        try {
            const payload = {
                ...form,
                date: new Date(form.date).toISOString(),
                endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
            };
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
                setEvents([...events, data]);
                resetForm();
                setShowForm(false);
            } else {
                setError(data.error || 'Gagal membuat acara');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            setError('Gagal membuat acara');
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setForm({
            title: event.title,
            description: event.description,
            content: event.content || '',
            date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
            endDate: event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : '',
            location: event.location,
            image: event.image || '',
            type: event.type,
            status: event.status,
            organizer: event.organizer || '',
            link: event.link || ''
        });
        setShowForm(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
            setError('Judul, deskripsi, tanggal, dan lokasi wajib diisi.');
            return;
        }

        if (!editingEvent) return;

        setError('');
        setUpdating(true);

        try {
            const payload = {
                ...form,
                eventId: editingEvent.id,
                date: new Date(form.date).toISOString(),
                endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
            };
            const res = await fetch('/api/admin/events', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
                setEvents(events.map(e => e.id === editingEvent.id ? data : e));
                resetForm();
                setShowForm(false);
            } else {
                setError(data.error || 'Gagal memperbarui acara');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Gagal memperbarui acara');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('Hapus acara ini?')) return;

        setDeleting(eventId);
        try {
            const res = await fetch('/api/admin/events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });

            if (res.ok) {
                setEvents(events.filter(e => e.id !== eventId));
            } else {
                const data = await res.json();
                alert(data.error || 'Gagal menghapus acara');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Gagal menghapus acara');
        } finally {
            setDeleting(null);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setForm({ ...form, image: data.url });
            } else {
                alert(data.error || 'Gagal mengupload gambar');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Gagal mengupload gambar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn} style={{ marginBottom: 0 }}>
                    <ArrowLeft size={18} /> Kembali
                </Link>
                <h1>Kelola Acara</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className={styles.primaryBtn}
                    style={{ marginLeft: 'auto' }}
                >
                    <Plus size={18} /> Tambah Acara
                </button>
            </div>

            <div className={styles.filterTabs}>
                {(['ALL', 'UPCOMING', 'ONGOING', 'ENDED'] as FilterStatus[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`${styles.filterTab} ${filter === s ? styles.activeTab : ''}`}
                    >
                        {s === 'ALL' ? 'Semua' : s === 'UPCOMING' ? 'Mendatang' : s === 'ONGOING' ? 'Sedang Berlangsung' : 'Selesai'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <Loader className={styles.spinning} /> Memuat data...
                </div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colTitle}>Acara</div>
                        <div className={styles.colEmail}>Waktu</div>
                        <div className={styles.colEmail}>Lokasi</div>
                        <div className={styles.colStatus}>Status</div>
                        <div className={styles.colAction}>Aksi</div>
                    </div>

                    <div className={styles.tableBody}>
                        {filteredEvents.length > 0 ? filteredEvents.map(event => {
                            const status = getEventStatus(event);
                            return (
                                <div key={event.id} className={styles.tableRow}>
                                    <div className={styles.colTitle}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div className={styles.thumbnailCell}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                                    {event.image ? (
                                                        <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : <ImageIcon size={20} style={{ opacity: 0.3 }} />}
                                                </div>
                                                {event.image && (
                                                    <div className={styles.thumbnailPreview}>
                                                        <img src={event.image} alt="Preview" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <strong>{event.title}</strong>
                                                <small className={styles.badge} style={{ marginTop: '0.25rem', height: 'auto', padding: '1px 6px', fontSize: '0.65rem' }}>
                                                    {event.type}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.colEmail}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: 500 }}>
                                                {format(new Date(event.date), 'dd MMM yyyy', { locale: id })}
                                            </div>
                                            <div style={{ opacity: 0.6 }}>
                                                {format(new Date(event.date), 'HH:mm')} WIB
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.colEmail}>
                                        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                            {event.type === 'ONLINE' ? <Globe size={14} /> : <MapPin size={14} />}
                                            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.colStatus}>
                                        <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
                                            {status === 'UPCOMING' ? 'Mendatang' : status === 'ONGOING' ? 'Berjalan' : 'Selesai'}
                                        </span>
                                    </div>
                                    <div className={styles.colAction}>
                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(event)} className={styles.editBtn} title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(event.id)} 
                                                disabled={deleting === event.id} 
                                                className={styles.deleteBtn} 
                                                title="Hapus"
                                            >
                                                {deleting === event.id ? <Loader size={16} className={styles.spinning} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className={styles.empty}>Tidak ada acara ditemukan.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}</h2>
                            <button onClick={() => setShowForm(false)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={editingEvent ? handleUpdate : handleCreate}>
                            <div className={styles.modalBody}>
                                {error && (
                                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <Info size={18} /> {error}
                                    </div>
                                )}

                                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                    <label>Judul Acara *</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Contoh: Webinar Kesiapan Kerja"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                    <label>Deskripsi Singkat *</label>
                                    <textarea
                                        className={styles.textarea}
                                        placeholder="Berikan ringkasan menarik tentang acara ini..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows={2}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label>Tanggal & Waktu Mulai *</label>
                                        <input
                                            type="datetime-local"
                                            className={styles.input}
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Waktu Selesai (Opsional)</label>
                                        <input
                                            type="datetime-local"
                                            className={styles.input}
                                            value={form.endDate}
                                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label>Tipe Acara</label>
                                        <select
                                            className={styles.select}
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="ONLINE">Online</option>
                                            <option value="OFFLINE">Offline</option>
                                            <option value="HYBRID">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Lokasi / Tautan Zoom *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Gedung A / Zoom Meeting"
                                            value={form.location}
                                            onChange={e => setForm({ ...form, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                    <label>Gambar Banner</label>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="URL Gambar atau upload"
                                            value={form.image}
                                            onChange={e => setForm({ ...form, image: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                        <label className={styles.primaryBtn} style={{ cursor: 'pointer', margin: 0 }}>
                                            {uploading ? <Loader size={18} className={styles.spinning} /> : <ImageIcon size={18} />}
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                                        </label>
                                    </div>
                                    {form.image && (
                                        <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', width: 'fit-content' }}>
                                            <img src={form.image} alt="Preview" style={{ maxHeight: '120px', display: 'block' }} />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Penyelenggara & Tautan Pendaftaran</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="IKADA / Disada"
                                            value={form.organizer}
                                            onChange={e => setForm({ ...form, organizer: e.target.value })}
                                        />
                                        <input
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://link-daftar.com"
                                            value={form.link}
                                            onChange={e => setForm({ ...form, link: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                                    Batal
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={creating || updating}>
                                    {(creating || updating) ? <Loader size={18} className={styles.spinning} /> : <Plus size={18} />}
                                    {editingEvent ? 'Simpan Perubahan' : 'Buat Acara'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}