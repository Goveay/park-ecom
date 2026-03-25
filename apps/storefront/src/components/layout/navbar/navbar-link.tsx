'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { ComponentProps } from 'react';
import Link from 'next/link';
import {
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function NavbarLink({ href, ...rest }: ComponentProps<typeof Link>) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
    const isActive = pathname === href;

    return (
        <NavigationMenuLink asChild active={isActive}>
            <Link
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                    "px-4 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2",
                    "hover:bg-black/5 hover:scale-105 active:scale-95",
                    isActive ? "text-[#ff6000] bg-orange-500/10" : "text-foreground"
                )}
                href={href}
                {...rest}
            >
                {rest.children}
            </Link>
        </NavigationMenuLink>
    );
}