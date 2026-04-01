import React from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import styles from './program.module.css';

export default async function ProgramPage() {
    noStore();

    const programs = await prisma.program.findMany({
        where: { status: 'ACTIVE' },
        include: {
            createdBy: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Program Kerja IKADA</h1>
                <p>Dari kegiatan sosial hingga pengembangan profesional, kami merancang program yang relevan dan bermanfaat bagi semua anggota.</p>
            </div>

            <section className={styles.section}>
                {programs.length > 0 ? (
                    <div className={styles.grid}>
                        {programs.map(program => (
                            <div key={program.id} className={styles.card}>
                                {program.image && (
                                    <div className={styles.imageWrap}>
                                        <img
                                            src={program.image}
                                            alt={program.title}
                                            className={styles.image}
                                        />
                                    </div>
                                )}
                                <div className={styles.content}>
                                    <h3 className={styles.title}>{program.title}</h3>
                                    
                                    {program.category && (
                                        <div className={styles.badges}>
                                            <span className="badge badge-primary">{program.category}</span>
                                        </div>
                                    )}

                                    <p className={styles.description}>{program.description}</p>
                                    
                                    {program.content && (
                                        <div className={styles.excerpt}>
                                            {program.content.replace(/[#*]/g, '').substring(0, 150)}...
                                        </div>
                                    )}

                                    <div className={styles.footer}>
                                        <div className={styles.meta}>
                                            <span>Oleh {program.createdBy.name}</span>
                                            <span>{format(new Date(program.createdAt), 'dd MMM yyyy', { locale: id })}</span>
                                        </div>
                                        <Link
                                            href={`/program/${program.id}`}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Baca selengkapnya
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.empty}>Belum ada program yang tersedia saat ini.</p>
                )}
            </section>

            <p className={styles.bottomText}>Untuk informasi lebih lanjut tentang program kerja IKADA, tetap terhubung dengan komunitas kami.</p>
        </div>
    );
}