import React from 'react';

export default function AboutPage() {
    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-6">Tentang IKADA Jabodetabek-Banten: Sejarah, Tujuan, dan Nilai-Nilai Kami</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Siapa Kami?</h2>
                <p className="mb-4">
                    Ikatan Keluarga Alumni Darussalam (IKADA) Jabodetabek-Banten adalah organisasi resmi yang menjadi wadah pemersatu bagi ribuan alumni Pondok Pesantren Darussalam Ciamis yang tersebar di wilayah Jabodetabek dan Banten. Kami adalah keluarga besar yang terikat oleh kenangan, nilai-nilai, dan semangat yang sama dari almamater tercinta.
                </p>
                <p className="mb-4">
                    Organisasi ini didirikan sebagai realisasi dari keinginan kuat para alumni untuk memiliki sebuah "rumah" tempat kembali, berbagi cerita, dan saling mendukung dalam perjalanan hidup masing-masing.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Landasan dan Tujuan Mulia Kami</h2>
                <p>Berlandaskan Pancasila, UUD 1945, Al-Qur'an, Hadits, serta Anggaran Dasar organisasi, IKADA memiliki tujuan yang jelas dan mulia:</p>
                <ul className="list-disc list-inside mt-2 ml-4">
                    <li>Mempererat Tali Silaturahmi: Menjalin dan menjaga hubungan persaudaraan antar alumni dari berbagai angkatan dan latar belakang.</li>
                    <li>Membangun Rasa Memiliki: Menumbuhkan rasa cinta dan kepedulian, baik terhadap sesama alumni maupun kepada almamater.</li>
                    <li>Mewujudkan Ta'awun (Saling Membantu): Bekerja sama dalam berbagai hal positif untuk meraih kesuksesan bersama, baik di bidang profesional, sosial, maupun spiritual.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Sifat dan Budaya Organisasi</h2>
                <p>IKADA adalah organisasi yang bersifat kekeluargaan. Setiap keputusan dan langkah organisasi diambil melalui jalan musyawarah untuk mufakat. Kami percaya bahwa dengan semangat kebersamaan, setiap tantangan dapat diatasi dan setiap tujuan dapat tercapai.</p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Sekretariat Kami</h2>
                <p>Anda dapat mengunjungi kami di:</p>
                <address className="not-italic">
                    Jl. H. Maung RT. 09 RW. 18, Kelurahan Kedaung, Kecamatan Pamulang, Kota Tangerang Selatan, Banten 15415.
                </address>
            </section>
        </div>
    );
}