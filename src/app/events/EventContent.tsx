'use client';

import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import styles from "./events.module.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    image?: string | null;
    link?: string | null;
}

interface EventContentProps {
    events: Event[];
}

export default function EventContent({ events }: EventContentProps) {
    // Separate upcoming and past events
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= now);
    const pastEvents = events.filter(e => new Date(e.date) < now);

    return (
        <div className={styles.pageContainer}>
            <section className={styles.headerSection}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} /> Kembali ke Beranda
                    </Link>
                    <div className={styles.titleWrapper}>
                        <h1>Jejak <span className="text-gradient">Karya</span></h1>
                        <p>Temukan acara, webinar, dan kompetisi terbaik untuk mengembangkan potensimu.</p>
                    </div>
                </div>
            </section>

            <section className={styles.contentSection}>
                <div className="container">

                    {/* Upcoming Events */}
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerIconWrapper}>
                            <CalendarIcon size={24} />
                        </div>
                        <h2>Acara Mendatang</h2>
                    </div>

                    <div className={styles.eventGrid}>
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                                <div key={event.id} className={styles.eventCard}>
                                    {event.image && (
                                        <div className={styles.eventImage}>
                                            <Image
                                                src={event.image}
                                                alt={event.title}
                                                fill
                                                className={styles.imgCover}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    <div className={styles.dateRibbon}>
                                        <span className={styles.month}>{format(new Date(event.date), 'MMM', { locale: id })}</span>
                                        <span className={styles.day}>{format(new Date(event.date), 'dd')}</span>
                                    </div>
                                    <div className={styles.eventContent}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        <p className={styles.eventDesc}>{event.description}</p>

                                        <div className={styles.eventDetails}>
                                            <div className={styles.detailItem}>
                                                <Clock size={16} />
                                                <span>{format(new Date(event.date), 'HH:mm')} WIB</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <MapPin size={16} />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>

                                        <button 
                                            className="btn btn-primary" 
                                            style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                                            onClick={() => {
                                                if (event.link) {
                                                    window.open(event.link, '_blank');
                                                } else {
                                                    alert('Link pendaftaran belum tersedia');
                                                }
                                            }}
                                        >
                                            Daftar Sekarang
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Belum ada acara mendatang yang dijadwalkan.</p>
                            </div>
                        )}
                    </div>

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <div className={styles.pastEventsSection}>
                            <h3>Acara Terdahulu</h3>
                            <div className={styles.pastEventList}>
                                {pastEvents.map((event) => (
                                    <div key={event.id} className={styles.pastEventCard}>
                                        <div className={styles.pastDate}>
                                            {format(new Date(event.date), 'dd MMMM yyyy', { locale: id })}
                                        </div>
                                        <div>
                                            <h4 className={styles.pastTitle}>{event.title}</h4>
                                            <p className={styles.pastLocation}><MapPin size={14} /> {event.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
}
