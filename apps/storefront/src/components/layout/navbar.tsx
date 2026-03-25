import Image from "next/image";
import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem
} from "@/components/ui/navigation-menu";
import { NavbarLink } from '@/components/layout/navbar/navbar-link';

import { NavbarBackground } from '@/components/layout/navbar/navbar-background';

export function Navbar() {
    return (
        <NavbarBackground>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo Section - Left */}
                    <div className="flex-1 flex items-center">
                        <Link href="/" className="relative flex items-center group transition-transform hover:scale-105 active:scale-95">
                            <Image
                                src="/logo.svg"
                                alt="ParkPicasso Logo"
                                width={180}
                                height={45}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Navigation Section - Center */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <Suspense fallback={<div className="w-64 h-8 bg-muted animate-pulse rounded-full" />}>
                            <NavigationMenu>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavbarLink href="/">Anasayfa</NavbarLink>
                                    </NavigationMenuItem>

                                    <Suspense>
                                        <NavbarCollections />
                                    </Suspense>

                                    <NavigationMenuItem>
                                        <NavbarLink href="/contact">İletişim</NavbarLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </Suspense>
                    </div>

                    {/* Actions Section - Right */}
                    <div className="flex-1 flex items-center justify-end gap-4">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput />
                            </Suspense>
                        </div>
                        <Suspense>
                            <NavbarCart />
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser />
                        </Suspense>
                    </div>
                </div>
            </div>
        </NavbarBackground>
    );
}