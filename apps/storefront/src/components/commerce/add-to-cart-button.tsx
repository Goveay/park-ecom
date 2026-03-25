'use client';

import { useTransition } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { addToCart } from '@/app/product/[slug]/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
    variantId: string;
    className?: string;
}

export function AddToCartButton({ variantId, className }: AddToCartButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startTransition(async () => {
            const result = await addToCart(variantId, 1);
            if (result.success) {
                toast.success('Ürün sepete eklendi');
            } else {
                toast.error(result.error || 'Ürün sepete eklenemedi');
            }
        });
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isPending}
            className={cn(
                // Base tf-btn-2 styles
                "relative inline-flex items-center justify-center transition-all duration-300 ease-in-out",
                // Specific tf-btn-2.style-icon styles derived from user CSS
                "p-[5px] rounded-[12px] border",
                "border-[rgba(255,87,0,0.06)]", // borderColor
                "bg-[rgba(255,87,0,0.04)]",     // backgroundColor

                // Content styling & Dimensions
                "w-11 h-11 text-[#FF5700]", // Icon color matches the theme orange

                // Hover Effects (Inferred standard Amoda behavior: Fill Orange, Text White)
                "hover:bg-[#FF5700] hover:border-[#FF5700] hover:text-white",
                "hover:shadow-[0_5px_15px_rgba(255,87,0,0.3)]",
                "hover:-translate-y-0.5",

                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            title="Sepete Ekle"
        >
            {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <ShoppingBag className="w-5 h-5" />
            )}
            <span className="sr-only">Sepete Ekle</span>
        </button>
    );
}
