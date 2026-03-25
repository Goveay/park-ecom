'use client';

import { ProductCard } from "@/components/commerce/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FragmentOf } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { useId } from "react";
import { Sparkles } from "lucide-react";

interface ProductCarouselClientProps {
    title: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
}

export function ProductCarousel({ title, products }: ProductCarouselClientProps) {
    const id = useId();

    return (
        <section className="py-12 md:py-16 overflow-hidden group">
            <div className="container mx-auto px-4">
                <div className="flex flex-col gap-3 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-500 border border-sky-100 shadow-sm w-fit">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase">
                            Keşfetmeye Devam Et
                        </span>
                    </div>

                    <div className="relative inline-block pb-4 group/header w-fit">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-orange-500 leading-tight">
                            {title}
                        </h2>
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

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    autoplay={{
                        delay: 10000,
                        stopOnInteraction: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product, i) => (
                            <CarouselItem key={id + i}
                                className="pl-2 md:pl-4 basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <ProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex -left-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CarouselNext className="hidden md:flex -right-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Carousel>
            </div>
        </section>
    );
}
