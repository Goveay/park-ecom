'use client';

import { useState, useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, CheckCircle2, Zap, MessageCircle } from 'lucide-react';
import { addToCart } from '@/app/product/[slug]/actions';
import { toast } from 'sonner';
import { Price } from '@/components/commerce/price';
import { ProductBottomBar } from '@/components/commerce/product-bottom-bar';
import { cn } from '@/lib/utils';
import { ShieldCheck, Truck, Wrench, Factory, Sparkles } from 'lucide-react';

// Türkçe ve İngilizce renk adları → CSS renk değerleri
const COLOR_MAP: Record<string, string> = {
    // Türkçe
    'turuncu': '#F97316',
    'mavi': '#3B82F6',
    'pembe': '#EC4899',
    'kırmızı': '#EF4444',
    'kirmizi': '#EF4444',
    'yeşil': '#22C55E',
    'yesil': '#22C55E',
    'sarı': '#EAB308',
    'sari': '#EAB308',
    'mor': '#A855F7',
    'beyaz': '#FFFFFF',
    'siyah': '#000000',
    'gri': '#6B7280',
    'kahverengi': '#92400E',
    'lacivert': '#1E3A8A',
    'açık mavi': '#7DD3FC',
    'acik mavi': '#7DD3FC',
    // İngilizce
    'orange': '#F97316',
    'blue': '#3B82F6',
    'pink': '#EC4899',
    'red': '#EF4444',
    'green': '#22C55E',
    'yellow': '#EAB308',
    'purple': '#A855F7',
    'white': '#FFFFFF',
    'black': '#000000',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'brown': '#92400E',
    'navy': '#1E3A8A',
    'light blue': '#7DD3FC',
    'cyan': '#06B6D4',
    'teal': '#14B8A6',
};

// WhatsApp numarası — başında + işareti ve ülke kodu ile
const WHATSAPP_NUMBER = '905538865598';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        slug: string;
        description: string;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
        customFields?: {
            shortDescription?: string;
        };
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductInfo({ product, searchParams }: ProductInfoProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Initialize selected options from URL
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};

        // If a specific variant ID is provided in the URL, use its options
        const variantParam = searchParams['variant'];
        if (typeof variantParam === 'string') {
            const variant = product.variants.find(v => v.id === variantParam);
            if (variant) {
                variant.options.forEach(opt => {
                    initialOptions[opt.groupId] = opt.id;
                });
                return initialOptions;
            }
        }

        // Initialize options: priority to URL params, fallback to first option of each group
        product.optionGroups.forEach((group) => {
            const paramValue = searchParams[group.code];
            if (typeof paramValue === 'string') {
                const option = group.options.find((opt) => opt.code === paramValue);
                if (option) {
                    initialOptions[group.id] = option.id;
                    return;
                }
            }

            // Fallback: select the first option by default if nothing in URL
            if (group.options.length > 0) {
                initialOptions[group.id] = group.options[0].id;
            }
        });

        return initialOptions;
    });

    // Find the matching variant based on selected options
    const selectedVariant = useMemo(() => {
        if (product.variants.length === 1) {
            return product.variants[0];
        }

        // If not all option groups have a selection, return null
        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        // Find variant that matches all selected options
        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupId]: optionId,
        }));

        // Find the option group and option to get their codes
        const group = product.optionGroups.find((g) => g.id === groupId);
        const option = group?.options.find((opt) => opt.id === optionId);

        if (group && option) {
            // Update URL with option code
            const params = new URLSearchParams(currentSearchParams);
            params.set(group.code, option.code);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        startTransition(async () => {
            const result = await addToCart(selectedVariant.id, quantity);

            if (result.success) {
                setIsAdded(true);
                toast.success('Added to cart', {
                    description: `${product.name} has been added to your cart`,
                });

                // Reset the added state after 2 seconds
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                toast.error('Error', {
                    description: result.error || 'Failed to add item to cart',
                });
            }
        });
    };

    const isInStock = selectedVariant && selectedVariant.stockLevel !== 'OUT_OF_STOCK';
    const canAddToCart = selectedVariant && isInStock;

    const handleBuyNow = async () => {
        if (!selectedVariant) return;
        startTransition(async () => {
            const result = await addToCart(selectedVariant.id, quantity);
            if (result.success) {
                router.push('/checkout');
            } else {
                toast.error('Hata', {
                    description: result.error || 'Ürün sepete eklenemedi',
                });
            }
        });
    };

    const buildWhatsAppUrl = () => {
        const productUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/product/${product.slug}`
            : `/product/${product.slug}`;
        const message = `Merhaba! Bu ürünün detaylarını öğrenmek istiyorum ${productUrl} .`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Product Title & Price */}
            <div className="space-y-4">
                <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-500 border border-sky-100 shadow-sm w-fit">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase">
                            Ürün Detayı
                        </span>
                    </div>
                    
                    <div className="relative inline-block pb-4 group/header w-fit">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-orange-500 leading-tight">
                            {product.name}
                        </h1>
                        {/* Wavy Slider Underline SVG - Refined Path and Stroke */}
                        <svg className="absolute bottom-1 left-0 w-full h-3 text-orange-300 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path 
                                d="M0 10 C 20 0, 30 20, 50 10 C 70 0, 80 20, 100 10" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                            />
                        </svg>
                    </div>
                </div>
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    {selectedVariant && (
                        <p className="text-2xl font-bold text-primary">
                            <Price value={selectedVariant.priceWithTax} />
                        </p>
                    )}
                    {selectedVariant && (
                        <span className="text-xs text-muted-foreground font-medium">
                            SKU: {selectedVariant.sku}
                        </span>
                    )}
                </div>
            </div>

            {/* Product Description with Read More */}
            <div className="space-y-2">
                <div
                    className={cn(
                        "prose prose-sm max-w-none text-muted-foreground leading-relaxed transition-all duration-500 overflow-hidden relative",
                        !isDescriptionExpanded && "max-h-32"
                    )}
                >
                    <div dangerouslySetInnerHTML={{ __html: product.customFields?.shortDescription || product.description }} />
                    {!isDescriptionExpanded && (
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    )}
                </div>
                {(product.customFields?.shortDescription || product.description).length > 200 && (
                    <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-sm font-bold text-primary hover:underline transition-all flex items-center gap-1"
                    >
                        {isDescriptionExpanded ? 'Daha Az Gör' : 'Devamını Gör'}
                    </button>
                )}
            </div>

            <div className="h-px bg-border/40 my-4" />

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-4">
                    {product.optionGroups.map((group) => {
                        const isColorGroup = ['renk', 'color', 'colour', 'renkler'].includes(
                            group.code.toLowerCase()
                        ) || ['renk', 'color', 'colour', 'renkler'].includes(
                            group.name.toLowerCase()
                        );

                        return (
                            <div key={group.id} className="space-y-3">
                                {!isColorGroup && (
                                    <Label className="text-base font-semibold">
                                        {group.name}
                                    </Label>
                                )}
                                <RadioGroup
                                    value={selectedOptions[group.id] || ''}
                                    onValueChange={(value) => handleOptionChange(group.id, value)}
                                >
                                    {isColorGroup ? (
                                        <div className="space-y-2">
                                            <p className="text-sm">
                                                <span className="font-bold text-foreground">{group.name}:</span>{' '}
                                                <span className="text-muted-foreground">
                                                    {group.options.find(o => o.id === selectedOptions[group.id])?.name ?? ''}
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.options.map((option) => {
                                                    const cssColor = COLOR_MAP[option.name.toLowerCase()] || option.name.toLowerCase();
                                                    const isSelected = selectedOptions[group.id] === option.id;
                                                    return (
                                                        <div key={option.id}>
                                                            <RadioGroupItem
                                                                value={option.id}
                                                                id={option.id}
                                                                className="sr-only"
                                                            />
                                                            <Label
                                                                htmlFor={option.id}
                                                                title={option.name}
                                                                className="cursor-pointer block"
                                                            >
                                                                <span
                                                                    className="block rounded-lg transition-all duration-150"
                                                                    style={{
                                                                        backgroundColor: cssColor,
                                                                        width: '42px',
                                                                        height: '42px',
                                                                        outline: isSelected
                                                                            ? '2px solid hsl(var(--primary))'
                                                                            : '2px solid transparent',
                                                                        outlineOffset: '2px',
                                                                        boxShadow: '0 0 0 1px hsl(var(--border))',
                                                                    }}
                                                                />
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {group.options.map((option) => (
                                                <div key={option.id}>
                                                    <RadioGroupItem
                                                        value={option.id}
                                                        id={option.id}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={option.id}
                                                        className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                                                    >
                                                        {option.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </RadioGroup>
                            </div>
                        );
                    })}
                    <div className="h-px bg-border/50 my-2" />
                </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
                <div className="text-sm">
                    {isInStock ? (
                        <span className="text-green-600 font-medium">In Stock</span>
                    ) : (
                        <span className="text-destructive font-medium">Out of Stock</span>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
                {/* Row: Sepete Ekle + Hemen Satın Al */}
                <div className="flex gap-4">
                    {/* Sepete Ekle */}
                    <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 h-14 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-bold rounded-xl active:scale-95 group overflow-hidden"
                        disabled={!canAddToCart || isPending}
                        onClick={handleAddToCart}
                    >
                        <div className="flex items-center justify-center gap-2 group-active:translate-y-[-2px] transition-transform">
                            {isAdded ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-300" />
                                    <span className="text-green-600">Eklendi!</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-5 w-5 group-hover:rotate-[-12deg] transition-transform duration-300" />
                                    <span>
                                        {isPending
                                            ? 'Ekleniyor...'
                                            : !selectedVariant && product.optionGroups.length > 0
                                                ? 'Seçenek Seçin'
                                                : !isInStock
                                                    ? 'Stokta Yok'
                                                    : 'Sepete Ekle'}
                                    </span>
                                </>
                            )}
                        </div>
                    </Button>

                    {/* Hemen Satın Al */}
                    <Button
                        size="lg"
                        className="flex-1 h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl active:scale-95 flex items-center justify-center gap-2 group"
                        disabled={!canAddToCart || isPending}
                        onClick={handleBuyNow}
                    >
                        <Zap className="h-5 w-5 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-active:translate-y-[-2px] transition-transform">
                            {isPending
                                ? 'Lütfen Bekleyin...'
                                : !selectedVariant && product.optionGroups.length > 0
                                    ? 'Seçenek Seçin'
                                    : !isInStock
                                        ? 'Stokta Yok'
                                        : 'Hemen Satın Al'}
                        </span>
                    </Button>
                </div>

                <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-border/60"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Veya Sorunuz Varsa</span>
                    <div className="flex-grow border-t border-border/60"></div>
                </div>

                {/* WhatsApp Butonu */}
                <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full h-14 rounded-xl px-6 font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97] group overflow-hidden relative"
                    style={{ backgroundColor: '#25D366' }}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageCircle className="h-5 w-5 fill-white group-hover:scale-110 group-hover:rotate-[15deg] transition-transform duration-300 relative z-10" />
                    <span className="relative z-10 group-active:translate-y-[-2px] transition-transform">WhatsApp ile İletişime Geç</span>
                </a>

                {/* Micro Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                        <div
                            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(156,163,175,0.15) 0%, rgba(156,163,175,0.05) 60%, transparent 100%)' }}
                        >
                            <Factory className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(156,163,175,0.45))' }} />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase leading-tight">Üreticiden En İyi Fiyat</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                        <div
                            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 60%, transparent 100%)' }}
                        >
                            <ShieldCheck className="w-4 h-4 text-green-500" style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.45))' }} />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase leading-tight">100% Memnuniyet Garantisi"</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                        <div
                            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 60%, transparent 100%)' }}
                        >
                            <Truck className="w-4 h-4 text-blue-500" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.45))' }} />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase leading-tight">Güvenli & Hızlı Nakliye</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                        <div
                            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 60%, transparent 100%)' }}
                        >
                            <Wrench className="w-4 h-4 text-orange-500" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.45))' }} />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase leading-tight">Kurulum & Montaj Desteği</span>
                    </div>
                </div>
            </div>



            {/* Product Bottom Action Bar */}
            {selectedVariant && (
                <ProductBottomBar
                    price={selectedVariant.priceWithTax}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    onAddToCart={handleAddToCart}
                    isPending={isPending}
                    isAdded={isAdded}
                    disabled={!canAddToCart}
                />
            )}
        </div>
    );
}
