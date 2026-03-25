'use client';

import {ShoppingCart} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";


interface CartIconProps {
    cartItemCount: number;
}

export function CartIcon({cartItemCount}: CartIconProps) {
    return (
        <Button variant="ghost" size="icon" asChild className="relative transition-all hover:bg-black/5 hover:scale-110 active:scale-90">
            <Link href="/cart">
                <ShoppingCart className="h-6 w-6 text-foreground stroke-[2px]"/>
                {cartItemCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 bg-[#ff6000] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm border-2 border-white">
                        {cartItemCount}
                    </span>
                )}
                <span className="sr-only">Shopping Cart</span>
            </Link>
        </Button>
    );
}
