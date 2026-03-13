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
                                        {user._count.articles} articles • {user._count.forums} forums • {user._count.comments} comments
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
