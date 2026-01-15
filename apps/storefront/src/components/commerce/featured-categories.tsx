import Link from "next/link";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { query } from "@/lib/vendure/api";
import { GetTopCollectionsQuery } from "@/lib/vendure/queries";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const KIDS_COLORS = [
    { border: "border-[#FF6B6B]", bg: "bg-[#FF6B6B]/10", shadow: "shadow-[#FF6B6B]/20", text: "text-[#FF6B6B]" },
    { border: "border-[#4ECDC4]", bg: "bg-[#4ECDC4]/10", shadow: "shadow-[#4ECDC4]/20", text: "text-[#4ECDC4]" },
    { border: "border-[#FF9F43]", bg: "bg-[#FF9F43]/10", shadow: "shadow-[#FF9F43]/20", text: "text-[#FF9F43]" },
    { border: "border-[#A29BFE]", bg: "bg-[#A29BFE]/10", shadow: "shadow-[#A29BFE]/20", text: "text-[#A29BFE]" },
    { border: "border-[#55EFC4]", bg: "bg-[#55EFC4]/10", shadow: "shadow-[#55EFC4]/20", text: "text-[#55EFC4]" },
    { border: "border-[#FAB1A0]", bg: "bg-[#FAB1A0]/10", shadow: "shadow-[#FAB1A0]/20", text: "text-[#FAB1A0]" },
];

async function getFeaturedCategories() {
    "use cache";
    cacheLife("days");

    const result = await query(GetTopCollectionsQuery, {});
    return result.data.collections.items;
}

export async function FeaturedCategories() {
    const collections = await getFeaturedCategories();

    if (!collections || collections.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-16 bg-background overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase italic">
                            Harika Kategoriler
                        </h2>
                        <div className="h-1.5 w-24 bg-primary rounded-full" />
                    </div>
                    <Link href="/search" className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest">
                        Tümünü Gör
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full relative group"
                >
                    <CarouselContent className="-ml-6 py-8">
                        {collections.map((collection, index) => {
                            const color = KIDS_COLORS[index % KIDS_COLORS.length];
                            return (
                                <CarouselItem key={index} className="pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                                    <Link href={`/collection/${collection.slug}`} className="group/item block h-full">
                                        <div className={`relative h-full aspect-square rounded-[3rem] border-[6px] ${color.border} bg-card p-4 transition-all duration-500 hover:scale-105 hover:-rotate-2 hover:shadow-2xl ${color.shadow} flex flex-col items-center justify-center gap-3 text-center`}>

                                            {/* Playful background blob */}
                                            <div className={`absolute inset-4 rounded-full ${color.bg} opacity-50 scale-90 group-hover/item:scale-110 transition-transform duration-700`} />

                                            {collection.featuredAsset ? (
                                                <div className="relative w-full h-full flex items-center justify-center z-10">
                                                    <Image
                                                        src={collection.featuredAsset.preview}
                                                        alt={collection.name}
                                                        width={140}
                                                        height={140}
                                                        className="object-contain transition-transform duration-500 group-hover/item:scale-110 drop-shadow-xl"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center z-10">
                                                    <span className={`font-black text-2xl opacity-20 ${color.text}`}>?</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-x-4 bottom-6 z-20">
                                                <h3 className={`font-black text-xs md:text-sm tracking-tighter uppercase italic px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm border-2 ${color.border} ${color.text} shadow-sm transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground group-hover/item:border-primary`}>
                                                    {collection.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity left-0 bg-background/90 backdrop-blur-md border-4 border-primary text-primary hover:bg-primary hover:text-white -translate-x-1/2 h-12 w-12 rounded-2xl" />
                    <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity right-0 bg-background/90 backdrop-blur-md border-4 border-primary text-primary hover:bg-primary hover:text-white translate-x-1/2 h-12 w-12 rounded-2xl" />
                </Carousel>
            </div>
        </section>
    );
}
