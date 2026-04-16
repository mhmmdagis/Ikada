import React from 'react';
import styles from './about.module.css';
import { Info, Target, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    Sejarah, Tujuan, dan Nilai IKADA
                </h1>
                <p className={styles.heroSubtitle}>
                    Mengenal lebih dekat Ikatan Keluarga Alumni Darussalam Jabodetabek-Banten
                </p>
            </div>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>
                    <Info size={24} /> Profil IKADA JABODETABEK-BANTEN
                </h2>
                <div className={styles.content}>
                    <p className={styles.paragraph}>
                        Ikatan Keluarga Alumni Darussalam (IKADA) Jabodetabek-Banten adalah organisasi resmi yang menjadi wadah pemersatu bagi ribuan alumni Pondok Pesantren Darussalam Ciamis yang tersebar di wilayah Jabodetabek dan Banten. Kami adalah keluarga besar yang terikat oleh kenangan, nilai-nilai, dan semangat yang sama dari almamater tercinta.
                    </p>
                    <p className={styles.paragraph}>
                        Organisasi ini didirikan sebagai realisasi dari keinginan kuat para alumni untuk memiliki sebuah &quot;rumah&quot; tempat kembali, berbagi cerita, dan saling mendukung dalam perjalanan hidup masing-masing.
                    </p>
                </div>
            </section>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>
                    <Target size={24} /> Landasan dan Tujuan
                </h2>
                <p className={styles.paragraph}>
                    Berlandaskan Pancasila, UUD 1945, Al-Qur&apos;an, Hadits, serta Anggaran Dasar organisasi, IKADA memiliki tujuan yang jelas dan mulia:
                </p>
                <ul className={styles.list}>
                    <li className={styles.listItem}>
                        <strong>Mempererat Tali Silaturahmi:</strong> Menjalin dan menjaga hubungan persaudaraan antar alumni dari berbagai angkatan dan latar belakang.
                    </li>
                    <li className={styles.listItem}>
                        <strong>Membangun Rasa Memiliki:</strong> Menumbuhkan rasa cinta dan kepedulian, baik terhadap sesama alumni maupun kepada almamater.
                    </li>
                    <li className={styles.listItem}>
                        <strong>Mewujudkan Ta&apos;awun (Saling Membantu):</strong> Bekerja sama dalam berbagai hal positif untuk meraih kesuksesan bersama, baik di bidang profesional, sosial, maupun spiritual.
                    </li>
                </ul>
            </section>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>
                    <Users size={24} /> Sifat dan Budaya Organisasi
                </h2>
                <p className={styles.paragraph}>
                    IKADA adalah organisasi yang bersifat kekeluargaan. Setiap keputusan dan langkah organisasi diambil melalui jalan musyawarah untuk mufakat. Kami percaya bahwa dengan semangat kebersamaan, setiap tantangan dapat diatasi dan setiap tujuan dapat tercapai.
                </p>
            </section>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>
                    <MapPin size={24} /> Sekretariat
                </h2>
                <p className={styles.paragraph}>Anda dapat mengunjungi kami di:</p>
                <div className={styles.addressBox}>
                    <address>
                        Jl. H. Maung RT. 09 RW. 18, <br />
                        Kelurahan Kedaung, Kecamatan Pamulang, <br />
                        Kota Tangerang Selatan, Banten 15415.
                    </address>
                </div>
            </section>
        </div>
    );
}