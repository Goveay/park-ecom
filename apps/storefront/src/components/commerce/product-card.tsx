'use client';

import Image from 'next/image';
import { FragmentOf, readFragment } from '@/graphql';
import { ProductCardFragment } from '@/lib/vendure/fragments';
import { Price } from '@/components/commerce/price';
import { Suspense, useState } from "react";
import Link from "next/link";
import { AddToCartButton } from './add-to-cart-button';

interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment> & { variants?: any[] };
}

export function ProductCard({ product: productProp }: ProductCardProps) {
    const product = readFragment(ProductCardFragment, productProp);

    const defaultImage = product.productAsset?.preview;
    const variantImage = product.productVariantAsset?.preview;

    // Sadece ana resimden (defaultImage) farklı resme sahip varyantları filtreleyelim
    const variantsWithImages = productProp.variants?.filter((v: any) =>
        v.featuredAsset?.preview && v.featuredAsset.preview !== defaultImage
    ) || [];

    // Eğer SearchResult üzerinden (productVariantAsset) ekstra bir resim geldiyse ve varyant dizisinde yoksa,
    // (fallback olarak) the old logic hala çalışsın
    const legacyVariantImage = product.productVariantAsset?.preview;
    const hasLegacyVariantImage = legacyVariantImage && legacyVariantImage !== defaultImage && variantsWithImages.length === 0;

    const [activeImage, setActiveImage] = useState<string | undefined>(defaultImage);
    const [activeLink, setActiveLink] = useState<string>(`/product/${product.slug}`);

    return (
        <div className="group relative flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
            <Link
                href={activeLink}
                className="flex-1 flex flex-col"
            >
                <div className="aspect-square relative bg-muted/30 overflow-hidden">
                    {activeImage ? (
                        <Image
                            src={activeImage}
                            alt={product.productName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}

                    {/* Variant Thumbnail Overlay */}
                    <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-2 pr-3">
                        {variantsWithImages.map((variant: any) => (
                            <div
                                key={variant.id}
                                className={`w-10 h-10 rounded-full border-2 overflow-hidden cursor-pointer transition-all duration-300 shadow-sm ${activeImage === variant.featuredAsset.preview ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white hover:border-primary/50'} bg-white`}
                                onMouseEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveImage(variant.featuredAsset.preview);
                                    setActiveLink(`/product/${product.slug}?variant=${variant.id}`);
                                }}
                                onMouseLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveImage(defaultImage);
                                    setActiveLink(`/product/${product.slug}`);
                                }}
                                onClick={(e) => {
                                    // Prevent the default link click if it bubbles, though Next.js Link handles it
                                }}
                            >
                                <Image
                                    src={variant.featuredAsset.preview}
                                    alt={variant.name}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ))}

                        {/* Fallback for the single variant search result */}
                        {hasLegacyVariantImage && (
                            <div
                                className={`w-10 h-10 rounded-full border-2 overflow-hidden cursor-pointer transition-all duration-300 shadow-sm ${activeImage === legacyVariantImage ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white hover:border-primary/50'} bg-white`}
                                onMouseEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveImage(legacyVariantImage);
                                    setActiveLink(`/product/${product.slug}?variant=${product.productVariantId}`);
                                }}
                                onMouseLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveImage(defaultImage);
                                    setActiveLink(`/product/${product.slug}`);
                                }}
                            >
                                <Image
                                    src={legacyVariantImage as string}
                                    alt="Variant"
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col space-y-2 flex-1">
                    <h3 className="font-bold text-[17px] leading-snug text-slate-800 line-clamp-2 min-h-[44px] group-hover:text-primary transition-colors">
                        {product.productName}
                    </h3>

                    <div className="flex items-end justify-between mt-auto">
                        <Suspense fallback={<div className="h-6 w-20 rounded bg-muted animate-pulse"></div>}>
                            {(() => {
                                const priceValue = product.priceWithTax.__typename === 'PriceRange'
                                    ? product.priceWithTax.min
                                    : product.priceWithTax.__typename === 'SinglePrice'
                                        ? product.priceWithTax.value
                                        : null;

                                if (priceValue === 0) {
                                    return (
                                        <div className="inline-flex items-center gap-1.5">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-500 shrink-0" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            <span className="text-sm font-bold text-emerald-600">Fiyat Sorunuz</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Fiyat</span>
                                        <div className="text-lg font-black text-slate-900">
                                            {product.priceWithTax.__typename === 'PriceRange' ? (
                                                <Price value={product.priceWithTax.min} />
                                            ) : product.priceWithTax.__typename === 'SinglePrice' ? (
                                                <Price value={product.priceWithTax.value} />
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })()}
                        </Suspense>
                    </div>
                </div>
            </Link>

            {/* Add to Cart Action */}
            <div className="absolute bottom-4 right-4 z-10">
                {product.productVariantId && (
                    <AddToCartButton variantId={product.productVariantId} />
                )}
            </div>
        </div>
    );
}
