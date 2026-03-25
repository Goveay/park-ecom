'use client';

import { useState, useEffect } from 'react';

export function NavbarBackground({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling down
                    setIsVisible(false);
                } else {
                    // Scrolling up
                    setIsVisible(true);
                }
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform 
                ${isVisible ? 'translate-y-0' : '-translate-y-full'} 
                bg-white border-b border-border shadow-md text-slate-900`}
        >
            {children}
            {/* Authentic Segmented Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
                <div className="h-full bg-[#ff9e67]" style={{ width: '25%' }} />
                <div className="h-full bg-[#5eb4ff]" style={{ width: '25%' }} />
                <div className="h-full bg-[#c084fc]" style={{ width: '25%' }} />
                <div className="h-full bg-[#4cc38a]" style={{ width: '25%' }} />
            </div>
        </header>
    );
}
