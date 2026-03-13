'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Loader, Edit } from 'lucide-react';
import styles from '../manage.module.css';

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

export default function EventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
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
            setError('Title, description, date, and location are required');
            return;
        }

        setError('');
        setCreating(true);

        try {
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (res.ok) {
                setEvents([...events, data]);
                resetForm();
                setShowForm(false);
            } else {
                setError(data.error || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            setError('Failed to create event');
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
            date: new Date(event.date).toISOString().slice(0, 16),
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
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
            setError('Title, description, date, and location are required');
            return;
        }

        if (!editingEvent) return;

        setError('');
        setUpdating(true);

        try {
            const res = await fetch('/api/admin/events', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, eventId: editingEvent.id }),
            });

            const data = await res.json();
            if (res.ok) {
                setEvents(events.map(e => e.id === editingEvent.id ? data : e));
                resetForm();
                setShowForm(false);
            } else {
                setError(data.error || 'Failed to update event');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Failed to update event');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('Delete this event?')) return;

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
                alert(data.error || 'Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
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
                alert(data.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1>Manage Events</h1>
            </div>

            {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {!showForm ? (
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Add New Event
                </button>
            ) : (
                <form onSubmit={editingEvent ? handleUpdate : handleCreate} style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="event-title">Title *</label>
                        <input
                            id="event-title"
                            type="text"
                            className="form-input"
                            placeholder="Event title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-description">Description *</label>
                        <textarea
                            id="event-description"
                            className="form-input"
                            placeholder="Event description"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-content">Content (optional)</label>
                        <textarea
                            id="event-content"
                            className="form-input"
                            placeholder="Detailed event content"
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            rows={5}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-date">Date & Time *</label>
                        <input
                            id="event-date"
                            type="datetime-local"
                            className="form-input"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-end-date">End Date & Time (optional)</label>
                        <input
                            id="event-end-date"
                            type="datetime-local"
                            className="form-input"
                            value={form.endDate}
                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-location">Location *</label>
                        <input
                            id="event-location"
                            type="text"
                            className="form-input"
                            placeholder="Event location or online link"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-image">Image (URL or uploaded file)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                id="event-image"
                                type="text"
                                className="form-input"
                                placeholder="/uploads/abc.jpg or https://... or upload below"
                                value={form.image}
                                onChange={e => setForm({ ...form, image: e.target.value })}
                                style={{ flex: 1 }}
                            />
                            <label 
                                htmlFor="image-upload" 
                                className="btn btn-secondary" 
                                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleImageUpload(file);
                                    }
                                }}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {form.image && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img 
                                    src={form.image} 
                                    alt="Preview" 
                                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }} 
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-type">Type</label>
                        <select
                            id="event-type"
                            className="form-input"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="ONLINE">Online</option>
                            <option value="OFFLINE">Offline</option>
                            <option value="HYBRID">Hybrid</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-status">Status</label>
                        <select
                            id="event-status"
                            className="form-input"
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="UPCOMING">Upcoming</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="ENDED">Ended</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-organizer">Organizer (optional)</label>
                        <input
                            id="event-organizer"
                            type="text"
                            className="form-input"
                            placeholder="Event organizer"
                            value={form.organizer}
                            onChange={e => setForm({ ...form, organizer: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="event-link">Registration Link (optional)</label>
                        <input
                            id="event-link"
                            type="url"
                            className="form-input"
                            placeholder="https://registration-link.com"
                            value={form.link}
                            onChange={e => setForm({ ...form, link: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={creating || updating}>
                            {creating ? 'Creating...' : updating ? 'Updating...' : editingEvent ? 'Update Event' : 'Create Event'}
                        </button>
                        <button type="button" onClick={() => {
                            setShowForm(false);
                            resetForm();
                        }} className="btn btn-ghost">
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
                        <div className={styles.colName}>Title</div>
                        <div className={styles.colEmail}>Date</div>
                        <div className={styles.colRole}>Type</div>
                        <div className={styles.colEmail}>Image</div>
                        <div className={styles.colAction}>Actions</div>
                    </div>

                    <div className={styles.tableBody}>
                        {events.map(event => (
                            <div key={event.id} className={styles.tableRow}>
                                <div className={styles.colName}>
                                    <strong>{event.title}</strong>
                                    <small style={{ color: '#666', display: 'block' }}>{event.description.slice(0, 50)}...</small>
                                </div>
                                <div className={styles.colEmail}>
                                    {new Date(event.date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                <div className={styles.colRole}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        background: event.type === 'ONLINE' ? '#dbeafe' : event.type === 'OFFLINE' ? '#fef3c7' : '#d1fae5',
                                        color: event.type === 'ONLINE' ? '#1e40af' : event.type === 'OFFLINE' ? '#92400e' : '#065f46'
                                    }}>
                                        {event.type}
                                    </span>
                                </div>
                                <div className={styles.colEmail}>
                                    {event.image ? (
                                        <img src={event.image} alt="thumb" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.75rem' }}>none</span>
                                    )}
                                </div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className={styles.editBtn}
                                        style={{ marginRight: '0.5rem' }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        disabled={deleting === event.id}
                                        className={styles.deleteBtn}
                                    >
                                        {deleting === event.id ? (
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

            <p className={styles.info}>Total Events: {events.length}</p>
        </div>
    );
}