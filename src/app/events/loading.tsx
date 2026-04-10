import { RefreshCw } from 'lucide-react';
import styles from './events.module.css';

export default function Loading() {
    return (
        <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
                <RefreshCw size={32} className={styles.loadingSpinner} />
                <p style={{ marginTop: '1rem' }}>Memuat acara...</p>
            </div>
        </div>
    );
}
