import Link from "next/link";
import { Instagram, Mail, Twitter, MapPin, Phone } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerGrid}`}>

                {/* Brand Section */}
                <div className={styles.brandSection}>
                    <Link href="/" className={styles.brand}>
                        <span className="text-gradient">Disada</span> (Berbagi Opini bareng IKADA)
                    </Link>
                    <p className={styles.description}>
                        Platform tulisan, ruang berbagi opini dan info event paling relevan untuk IKADA. Berbagi pandangan, temukan inspirasi, dan perkuat silaturahmi.
                    </p>
                    <div className={styles.socials}>
                        <a href="https://www.instagram.com/ikada.jabodetabekbanten/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <Twitter size={20} />
                        </a>
                        <a href="mailto:ikadajabodetabek@gmail.com" aria-label="Email">
                            <Mail size={20} />
                        </a>
                    </div>
                </div>

                {/* Links Section */}
                <div className={styles.linksSection}>
                    <h4 className={styles.linkHeader}>Explore</h4>
                    <ul className={styles.linkList}>
                        <li><Link href="/writings">Writings</Link></li>
                        <li><Link href="/forums">Forums</Link></li>
                        <li><Link href="/events">Events</Link></li>
                    </ul>
                </div>

                <div className={styles.linksSection}>
                    <h4 className={styles.linkHeader}>Account</h4>
                    <ul className={styles.linkList}>
                        <li><Link href="/login">Sign In</Link></li>
                        <li><Link href="/register">Register</Link></li>
                        <li><Link href="/profile">My Profile</Link></li>
                    </ul>
                </div>

                <div className={styles.linksSection}>
                    <h4 className={styles.linkHeader}>Organization</h4>
                    <ul className={styles.linkList}>
                        <li><Link href="/about">About Us</Link></li>
                    </ul>
                </div>

                <div className={styles.linksSection}>
                    <h4 className={styles.linkHeader}>Contact</h4>
                    <ul className={styles.linkList}>
                        <li>
                            <a href="mailto:ikadajabodetabek@gmail.com" className={styles.contactLink}>
                                <Mail size={16} /> E-mail: ikadajabodetabek@gmail.com
                            </a>
                        </li>
                        <li>
                            <a href="tel:082197848818" className={styles.contactLink}>
                                <Phone size={16} /> Tlp: 082197848818
                            </a>
                        </li>
                        <li>
                            <a href="https://maps.app.goo.gl/FZk8nYX4oW8WJgDr9" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                <MapPin size={16} /> Lokasi Kami
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className="container">
                    <p>&copy; {currentYear} Disada (Berbagi Opini bareng IKADA). All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
