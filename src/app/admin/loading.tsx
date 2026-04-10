import styles from './admin.module.css';

export default function AdminLoading() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo} style={{ opacity: 0.5 }}>Disada Admin</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ width: '60px', height: '24px', background: 'var(--bg-secondary)', borderRadius: '12px' }} />
                    ))}
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <div style={{ width: '250px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '0.5rem' }} />
                    <div style={{ width: '350px', height: '20px', background: 'var(--bg-secondary)', borderRadius: '4px' }} />
                </div>

                <div className={styles.statsGrid}>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className={styles.statCard} style={{ opacity: 0.6, height: '100px' }}>
                            <div style={{ width: '56px', height: '56px', background: 'var(--bg-secondary)', borderRadius: '12px' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ width: '60%', height: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '8px' }} />
                                <div style={{ width: '40%', height: '32px', background: 'var(--bg-secondary)', borderRadius: '8px' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <section className={styles.quickActions} style={{ opacity: 0.6 }}>
                    <div style={{ width: '150px', height: '24px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '1.5rem' }} />
                    <div className={styles.actiongrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className={styles.actionCard} style={{ height: '50px', background: 'var(--bg-secondary)', border: 'none' }} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
