'use client';

import { ProductCard } from "@/components/commerce/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { FragmentOf } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { useId } from "react";
import Image from "next/image";

import { SectionHeader } from "./section-header";

interface HighlightProductsProps {
    title: string;
    subtitle?: string;
    eyebrow?: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
    imageUrl?: string;
}

export function HighlightProducts({ title, subtitle, eyebrow, products, imageUrl }: HighlightProductsProps) {
    const id = useId();

    // Use environment variable for base URL, fallback to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL?.replace('/shop-api', '') || 'http://localhost:3000';
    const mascotImage = imageUrl || `${baseUrl}/assets/source/0b/parkpicasso-maskotv1.webp`;

    return (
        <section className="py-20 bg-gradient-to-b from-white to-orange-50/20">
            <div className="container mx-auto px-4">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 4000,
                        }),
                    ]}
                    className="w-full"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <SectionHeader 
                            title={title}
                            subtitle={subtitle}
                            eyebrow={eyebrow}
                            className="mb-0 flex-1"
                        />
                        <div className="flex items-center gap-4 pb-2">
                            <CarouselPrevious className="static translate-y-0 h-16 w-16 bg-white text-sky-500 border-4 border-sky-100 shadow-xl hover:bg-sky-50 transition-all hover:scale-110 active:scale-90 rounded-2xl" />
                            <CarouselNext className="static translate-y-0 h-16 w-16 bg-orange-500 text-white border-4 border-orange-200 shadow-xl hover:bg-orange-400 transition-all hover:scale-110 active:scale-90 rounded-2xl" />
                        </div>
                    </div>

                    {/* Main Content Grid - Fixed Height for both sides */}
                    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-stretch">

                        {/* Left Side - Image with Fixed Height */}
                        <div className="relative h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-50">
                            <Image
                                src={mascotImage}
                                alt="Park Picasso Maskot"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 400px"
                                priority
                            />
                        </div>

                        {/* Right Side - Product Carousel with Matching Height */}
                        <div className="h-[400px] lg:h-[500px]">
                            <CarouselContent className="-ml-2 md:-ml-4 h-full">
                                {products.map((product, i) => (
                                    <CarouselItem
                                        key={id + i}
                                        className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 xl:basis-1/3 h-full"
                                    >
                                        <div className="h-full">
                                            <ProductCard product={product} />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </div>
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
