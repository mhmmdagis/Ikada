'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, Trash2, Loader, Plus, Search, 
    Filter, UserPlus, X, Shield, User, 
    MessageSquare, BookOpen, Activity 
} from 'lucide-react';
import styles from './users.module.css';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();
                setUsers(data.data || []);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const handleDelete = async (userId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

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
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to create admin:', error);
            setFormError('Gagal membuat admin. Silakan coba lagi.');
        } finally {
            setCreating(false);
        }
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header Section */}
                <header className={styles.header}>
                    <div className={styles.topBar}>
                        <div className={styles.titleArea}>
                            <h1 className={`${styles.title} animate-fade-in`}>Manajemen Pengguna</h1>
                            <p className={`${styles.subtitle} animate-fade-in delay-1`}>
                                Kelola akses, peran, dan pantau aktivitas pengguna di platform Disada.
                            </p>
                        </div>
                        <div className={`${styles.actions} animate-fade-in delay-2`}>
                            <Link href="/admin" className={styles.backBtn}>
                                <ArrowLeft size={18} /> Dashboard
                            </Link>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className={styles.addBtn}
                            >
                                <UserPlus size={18} /> Tambah Admin
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className={`${styles.controls} animate-fade-up delay-2 shadow-sm`}>
                        <div className={styles.searchWrapper}>
                            <Search className={styles.searchIcon} size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari berdasarkan nama atau email..." 
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterWrapper}>
                            <Filter size={18} className={styles.filterIcon} />
                            <select 
                                className={styles.filterSelect}
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="ALL">Semua Peran</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="USER">User</option>
                            </select>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Loader className={`${styles.spinning} text-brand`} size={48} />
                        <p>Sinkronisasi Data Pengguna...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className={`${styles.tableContainer} animate-scale-in delay-3`}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Pengguna</th>
                                        <th>Peran</th>
                                        <th>Kontribusi</th>
                                        <th style={{ textAlign: 'right' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className={styles.tableRow}>
                                                <td>
                                                    <div className={styles.userInfo}>
                                                        <div 
                                                            className={styles.avatar}
                                                            style={{ backgroundColor: getAvatarColor(user.name) }}
                                                        >
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <div className={styles.userDetails}>
                                                            <span className={styles.userName}>{user.name}</span>
                                                            <span className={styles.userEmail}>{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`
                                                        ${styles.badge} 
                                                        ${user.role === 'SUPER_ADMIN' ? styles.badgeSuperAdmin : 
                                                          user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}
                                                    `}>
                                                        <span className={`${styles.statusDot} ${user.role === 'SUPER_ADMIN' ? styles.pulse : ''}`}></span>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.statsGrid}>
                                                        <div className={styles.statItem} title="Artikel">
                                                            <span className={styles.statValue}>{user._count?.articles ?? 0}</span>
                                                            <span className={styles.statLabel}>Art</span>
                                                        </div>
                                                        <div className={styles.statItem} title="Opini">
                                                            <span className={styles.statValue}>{user._count?.forums ?? 0}</span>
                                                            <span className={styles.statLabel}>Opn</span>
                                                        </div>
                                                        <div className={styles.statItem} title="Komentar">
                                                            <span className={styles.statValue}>{user._count?.comments ?? 0}</span>
                                                            <span className={styles.statLabel}>Kom</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={deleting === user.id}
                                                            className={styles.deleteBtn}
                                                            title="Hapus Pengguna"
                                                        >
                                                            {deleting === user.id ? (
                                                                <Loader size={18} className={styles.spinning} />
                                                            ) : (
                                                                <Trash2 size={18} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className={styles.noData}>
                                                Tidak ada pengguna yang sesuai dengan kriteria pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className={styles.mobileCards}>
                            {filteredUsers.map((user) => (
                                <div key={user.id} className={styles.mobileCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.userInfo}>
                                            <div 
                                                className={styles.avatar}
                                                style={{ backgroundColor: getAvatarColor(user.name) }}
                                            >
                                                {getInitials(user.name)}
                                            </div>
                                            <div className={styles.userDetails}>
                                                <span className={styles.userName}>{user.name}</span>
                                                <span className={styles.userEmail}>{user.email}</span>
                                            </div>
                                        </div>
                                        <span className={`
                                            ${styles.badge} 
                                            ${user.role === 'SUPER_ADMIN' ? styles.badgeSuperAdmin : 
                                              user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}
                                        `}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className={styles.statsGrid}>
                                        <div className={styles.statItem}>
                                            <BookOpen size={14} />
                                            <span className={styles.statValue}>{user._count?.articles ?? 0}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <MessageSquare size={14} />
                                            <span className={styles.statValue}>{user._count?.forums ?? 0}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <Activity size={14} />
                                            <span className={styles.statValue}>{user._count?.comments ?? 0}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deleting === user.id}
                                            className={styles.deleteBtn}
                                        >
                                            <Trash2 size={18} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <p className={styles.summaryInfo}>
                    Menampilkan <strong>{filteredUsers.length}</strong> pengguna dari total <strong>{users.length}</strong> terdaftar.
                </p>
            </div>

            {/* Add Admin Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Tambah Administrator Baru</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin}>
                            <div className={styles.modalBody}>
                                <p className={styles.modalSubtitle}>
                                    Membuat akun dengan otoritas penuh (Super Admin). Pastikan data yang dimasukkan valid.
                                </p>
                                <div className={styles.formGroup}>
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="Contoh: Ahmad Fauzi"
                                        value={newAdmin.name}
                                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Alamat Email</label>
                                    <input
                                        type="email"
                                        className={styles.inputField}
                                        placeholder="admin@disada.id"
                                        value={newAdmin.email}
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        className={styles.inputField}
                                        placeholder="Minimal 8 karakter"
                                        value={newAdmin.password}
                                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        required
                                    />
                                </div>
                                {formError && <p className={styles.formError}>{formError}</p>}
                            </div>
                            <div className={styles.modalFooter}>
                                <button 
                                    type="button" 
                                    className={styles.backBtn} 
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.submitBtn}
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <><Loader size={18} className={styles.spinning} /> Menyimpan...</>
                                    ) : (
                                        'Buat Akun Admin'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

