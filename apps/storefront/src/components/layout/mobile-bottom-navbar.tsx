"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    ShoppingBag,
    Search,
    User,
    Phone,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when search overlay opens
    useEffect(() => {
        if (searchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [searchOpen]);

    // Hide on product pages — AFTER all hooks
    if (pathname.startsWith('/product/')) {
        return null;
    }


    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        setSearchOpen(false);
        setSearchValue("");
    };

    const navItems = [
        {
            icon: Home,
            href: "/",
        },
        {
            icon: Search,
            href: "#search",
            isSearch: true,
        },
        {
            icon: ShoppingBag,
            href: "/search",
            isCenter: true,
        },
        {
            icon: User,
            href: "/account",
        },
        {
            icon: Phone,
            href: "/contact",
        },
    ];

    return (
        <>
            {/* Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSearchOpen(false)}
                    />
                    {/* Search Bar */}
                    <div className="absolute top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-2xl p-4 pt-safe animate-in slide-in-from-top duration-300">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="search"
                                    placeholder="Ne arıyorsunuz?"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Navbar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px] px-2 md:hidden">
                <div className="relative h-16 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] rounded-[32px] px-4 flex items-center justify-between">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        if (item.isCenter) {
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="relative flex items-center justify-center -mt-12 bg-primary text-primary-foreground h-16 w-16 rounded-full shadow-[0_8px_20px_rgba(var(--primary-rgb),0.4)] border-4 border-white dark:border-black transition-all duration-300 hover:scale-110 active:scale-95 group"
                                >
                                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Icon className="h-7 w-7 stroke-[2.5px]" />
                                </Link>
                            );
                        }

                        // Search button opens overlay instead of navigating
                        if (item.isSearch) {
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSearchOpen(true)}
                                    className={cn(
                                        "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 active:scale-90",
                                        searchOpen ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6 transition-all duration-300", searchOpen ? "stroke-[2.5px] scale-110" : "stroke-[1.8px]")} />
                                    {searchOpen && (
                                        <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                                    )}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 active:scale-90",
                                    isActive ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-6 w-6 transition-all duration-300", isActive ? "stroke-[2.5px] scale-110" : "stroke-[1.8px]")} />
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
