"use client";

import React from "react";
import { Minus, Plus, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Price } from "@/components/commerce/price";

interface ProductBottomBarProps {
    price: number;
    quantity: number;
    setQuantity: (qty: number) => void;
    onAddToCart: () => void;
    isPending: boolean;
    isAdded: boolean;
    disabled?: boolean;
}

export function ProductBottomBar({
    price,
    quantity,
    setQuantity,
    onAddToCart,
    isPending,
    isAdded,
    disabled
}: ProductBottomBarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[320px] px-2 md:hidden">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] rounded-[26px] p-1.5 flex items-center justify-between">
                {/* Quantity Selector - More Compact */}
                <div className="flex items-center bg-zinc-100/50 dark:bg-zinc-800/50 rounded-[20px] p-0.5 border border-zinc-200/50 dark:border-zinc-700/50 transition-all">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={disabled || quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all active:scale-90"
                    >
                        <Minus className="h-3.5 w-3.5 stroke-[3px]" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-foreground select-none">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={disabled}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all active:scale-90"
                    >
                        <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                    </button>
                </div>

                {/* Combined Price and Action Button - Professional Look */}
                <div className="flex items-center gap-2 pr-1 flex-1 justify-end">
                    <div className="text-right flex flex-col justify-center px-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold leading-none mb-1">Toplam</span>
                        <div className="text-sm font-black text-foreground leading-none">
                            <Price value={price * quantity} />
                        </div>
                    </div>

                    <Button
                        onClick={onAddToCart}
                        disabled={disabled || isPending}
                        className={cn(
                            "relative w-12 h-12 rounded-2xl p-0 transition-all duration-500 overflow-hidden active:scale-95",
                            isAdded
                                ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_8px_16px_rgba(34,197,94,0.3)]"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_16px_rgba(var(--primary-rgb),0.3)]"
                        )}
                    >
                        <div className="flex items-center justify-center w-full">
                            {isAdded ? (
                                <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                            ) : isPending ? (
                                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <ShoppingCart className="h-5 w-5 stroke-[2.5px]" />
                            )}
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
