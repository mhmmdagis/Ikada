'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader } from 'lucide-react';
import styles from '../manage.module.css';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    bio?: string;
    createdAt: string;
    _count: {
        articles: number;
        forums: number;
        comments: number;
    };
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                setUsers(await res.json());
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        setDeleting(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        } finally {
            setDeleting(null);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setCreating(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin),
            });
            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error || 'Gagal membuat admin.');
            } else {
                setUsers([data.user, ...users]);
                setNewAdmin({ name: '', email: '', password: '' });
            }
        } catch (error) {
            console.error('Failed to create admin:', error);
            setFormError('Gagal membuat admin. Silakan coba lagi.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1>Manage Users</h1>
                <Link href="/admin/categories" className={styles.manageBtn}>
                    Manage Categories
                </Link>
            </div>

            <div className={styles.formSection} style={{ marginBottom: '1rem', padding: '.8rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                <h2 style={{ margin: '0 0 .5rem', fontSize: '1rem' }}>Tambah Admin Baru (Super Admin)</h2>
                <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Nama"
                        value={newAdmin.name}
                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        required
                        style={{ flex: '1 1 150px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newAdmin.email}
                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        required
                        style={{ flex: '1 1 200px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newAdmin.password}
                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        required
                        style={{ flex: '1 1 180px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" className={styles.manageBtn} disabled={creating} style={{ flex: '0 0 auto', padding: '.45rem 1rem' }}>
                        {creating ? 'Menyimpan...' : 'Buat Admin'}
                    </button>
                </form>
                {formError && <p style={{ color: 'red', marginTop: '.4rem' }}>{formError}</p>}
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colName}>Name</div>
                        <div className={styles.colEmail}>Email</div>
                        <div className={styles.colRole}>Role</div>
                        <div className={styles.colStats}>Stats</div>
                        <div className={styles.colAction}>Action</div>
                    </div>

                    <div className={styles.tableBody}>
                        {users.map(user => (
                            <div key={user.id} className={styles.tableRow}>
                                <div className={styles.colName}>
                                    <strong>{user.name}</strong>
                                </div>
                                <div className={styles.colEmail}>{user.email}</div>
                                <div className={styles.colRole}>
                                    <span className={`${styles.badge} ${styles[user.role.toLowerCase()]}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className={styles.colStats}>
                                    <small>
                                        {(user._count?.articles ?? 0)} articles • {(user._count?.forums ?? 0)} forums • {(user._count?.comments ?? 0)} comments
                                    </small>
                                </div>
                                <div className={styles.colAction}>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={deleting === user.id}
                                        className={styles.deleteBtn}
                                    >
                                        {deleting === user.id ? (
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

            <p className={styles.info}>Total Users: {users.length}</p>
        </div>
    );
}
