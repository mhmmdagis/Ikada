'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Hash, Filter, Check } from 'lucide-react';
import styles from '@/app/writings/writings.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

interface CategoryDropdownProps {
    categories: Category[];
    activeCat?: string;
}

export default function CategoryDropdown({ categories, activeCat }: CategoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Get current category object
    const currentCategory = activeCat 
        ? categories.find(c => c.slug === activeCat) 
        : null;

    // Handle selection
    const handleSelect = (slug?: string) => {
        setIsOpen(false);
        if (slug) {
            router.push(`/writings?cat=${slug}`);
        } else {
            router.push('/writings');
        }
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.dropdownOuter} ref={dropdownRef}>
            <div className={styles.catLabel}>
                <Filter size={14} /> <span>Pilih Kategori</span>
            </div>
            
            <button 
                className={`${styles.dropdownToggle} ${isOpen ? styles.dropdownToggleActive : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className={styles.dropdownToggleContent}>
                    <Hash size={16} className={styles.hashIcon} />
                    <span className={styles.currentName}>
                        {currentCategory ? currentCategory.name : 'Semua Kategori'}
                    </span>
                </div>
                <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.chevronRotate : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <button 
                        className={`${styles.dropdownItem} ${!activeCat ? styles.dropdownItemActive : ''}`}
                        onClick={() => handleSelect()}
                    >
                        <span>Semua Kategori</span>
                        {!activeCat && <Check size={16} />}
                    </button>
                    
                    {categories.map((c) => (
                        <button 
                            key={c.id}
                            className={`${styles.dropdownItem} ${activeCat === c.slug ? styles.dropdownItemActive : ''}`}
                            onClick={() => handleSelect(c.slug)}
                        >
                            <div className={styles.itemMain}>
                                <div 
                                    className={styles.colorDot} 
                                    style={{ backgroundColor: c.color || 'var(--brand-primary)' }} 
                                />
                                <span>{c.name}</span>
                            </div>
                            {activeCat === c.slug && <Check size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
