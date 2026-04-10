import { RefreshCw } from 'lucide-react';
import styles from './dashboard.module.css';

export default function Loading() {
    return (
        <div className={styles.loading}>
            <div className={styles.loadingContent}>
                <RefreshCw size={32} className={styles.loadingSpinner} />
                <p className={styles.loadingText}>Memuat dashboard...</p>
            </div>
        </div>
    );
}
