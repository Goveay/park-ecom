import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { query } from "@/lib/vendure/api";
import { GetHeroSliderAssetsQuery } from "@/lib/vendure/queries";

const FALLBACK_SLIDES: { id: string; image: string; alt: string; focalPoint?: { x: number; y: number } }[] = [
    {
        id: '1',
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        alt: "Hero Slide 1"
    },
    {
        id: '2',
        image: "https://images.unsplash.com/photo-1472851294608-41531268f4e9?q=80&w=2070&auto=format&fit=crop",
        alt: "Hero Slide 2"
    },
    {
        id: '3',
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
        alt: "Hero Slide 3"
    }
];

// --- MANUEL EŞLEŞTİRME AYARI ---
// Eğer otomatik eşleştirme çalışmazsa, buraya ID'leri yazabilirsiniz.
// Örn: { "1": { desktop: "74", mobile: "70" } }
const MANUAL_MAPPING: Record<string, { desktop: string; mobile: string }> = {
    // Örnek: "1": { desktop: "74", mobile: "70" }
};

export async function HeroSection() {
    let slides = FALLBACK_SLIDES;

    try {
        const { data } = await query(GetHeroSliderAssetsQuery, {}, { fetch: { next: { revalidate: 3600 } } });

        if ((data as any)?.heroSliderImages && (data as any).heroSliderImages.length > 0) {
            const rawAssets = (data as any).heroSliderImages as any[];
            const slidesMap: Record<string, any> = {};
            let coverImageAsset: any = null;

            // 1. Manuel eşleştirmeleri işle
            Object.entries(MANUAL_MAPPING).forEach(([key, mapping]) => {
                const desktopAsset = rawAssets.find(a => a.id === mapping.desktop);
                const mobileAsset = rawAssets.find(a => a.id === mapping.mobile);

                if (desktopAsset || mobileAsset) {
                    slidesMap[key] = {
                        id: key,
                        name: key,
                        desktop: desktopAsset ? {
                            id: desktopAsset.id,
                            image: (desktopAsset.source || desktopAsset.preview).replaceAll('\\', '/'),
                            focalPoint: desktopAsset.focalPoint
                        } : null,
                        mobile: mobileAsset ? {
                            id: mobileAsset.id,
                            image: (mobileAsset.source || mobileAsset.preview).replaceAll('\\', '/'),
                            focalPoint: mobileAsset.focalPoint
                        } : null
                    };
                }
            });

            // 2. Kalanları işle (Slaytlar ve Sabit Resim)
            rawAssets.forEach((asset: any) => {
                const tags = asset.tags?.map((t: any) => t.value.trim().toLowerCase()) || [];

                // Kapak resmi kontrolü
                if (tags.includes('herocover')) {
                    coverImageAsset = {
                        image: (asset.source || asset.preview).replaceAll('\\', '/'),
                        focalPoint: asset.focalPoint
                    };
                    return;
                }

                // Slayt eşleştirme (Manuel listede değilse)
                if (Object.values(MANUAL_MAPPING).some(m => m.desktop === asset.id || m.mobile === asset.id)) return;

                const isMobile = tags.includes('heroslider-mobile');

                // Gruplama ANAHTARI (slide-1 tagı varsa onu kullan, yoksa dosya adının başı)
                let groupKey = tags.find((t: string) => t.replace(/[\s-]/g, '').startsWith('slide'));
                if (!groupKey) {
                    groupKey = asset.name.split('.')[0].split('-')[0].toLowerCase();
                }

                if (!slidesMap[groupKey]) {
                    slidesMap[groupKey] = { id: asset.id, name: groupKey };
                }

                const assetData = {
                    id: asset.id,
                    image: (asset.source || asset.preview).replaceAll('\\', '/'),
                    focalPoint: asset.focalPoint
                };

                if (isMobile) {
                    slidesMap[groupKey].mobile = assetData;
                } else {
                    slidesMap[groupKey].desktop = assetData;
                }
            });

            const fetchedSlides = Object.values(slidesMap)
                .map((slide: any) => ({
                    id: slide.id,
                    alt: slide.name,
                    desktop: slide.desktop || slide.mobile,
                    mobile: slide.mobile || slide.desktop
                }))
                .sort((a, b) => a.alt.localeCompare(b.alt, undefined, { numeric: true, sensitivity: 'base' }));

            if (fetchedSlides.length > 0) {
                slides = fetchedSlides as any;
            }

            // Kapak resmi ataması
            if (coverImageAsset) {
                (HeroSection as any).coverImage = coverImageAsset;
            }
        }
    } catch (error) {
        // console.warn("Failed to fetch hero slider images:", error);
    }

    // Helper to get cover image with fallback
    const coverImage = (HeroSection as any).coverImage?.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop";
    const coverFocalPoint = (HeroSection as any).coverImage?.focalPoint;

    return (
        <section className="z-10 relative pt-24 pb-4 md:pt-32 md:pb-6">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px] md:h-[650px]">
                    {/* Left Side: 75% - Slider */}
                    <div className="lg:col-span-3 relative h-full rounded-2xl overflow-hidden shadow-2xl group">
                        <Carousel 
                            className="w-full h-full" 
                            opts={{ loop: true }}
                            autoplay={{ delay: 5000 }}
                        >
                            <CarouselContent className="h-full ml-0">
                                {slides.map((slide: any) => (
                                    <CarouselItem key={slide.id} className="pl-0 h-full relative">
                                        {/* Desktop Image */}
                                        <div className="hidden md:block absolute inset-0">
                                            <Image
                                                src={slide.desktop?.image || (slide as any).image}
                                                alt={slide.alt}
                                                fill
                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                style={{
                                                    objectPosition: slide.desktop?.focalPoint
                                                        ? `${slide.desktop.focalPoint.x * 100}% ${slide.desktop.focalPoint.y * 100}%`
                                                        : undefined
                                                }}
                                                priority={slide.id === slides[0].id}
                                            />
                                        </div>
                                        {/* Mobile Image */}
                                        <div className="block md:hidden absolute inset-0">
                                            <Image
                                                src={slide.mobile?.image || slide.desktop?.image || (slide as any).image}
                                                alt={slide.alt}
                                                fill
                                                className="object-cover"
                                                style={{
                                                    objectPosition: slide.mobile?.focalPoint
                                                        ? `${slide.mobile.focalPoint.x * 100}% ${slide.mobile.focalPoint.y * 100}%`
                                                        : '65% center' // Default mobile shift if no focal point
                                                }}
                                                priority={slide.id === slides[0].id}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-6 bg-white/10 backdrop-blur-md border-transparent text-white hover:bg-white/20 hover:text-white" />
                            <CarouselNext className="right-6 bg-white/10 backdrop-blur-md border-transparent text-white hover:bg-white/20 hover:text-white" />
                        </Carousel>

                        {/* Hero Content Overlay 
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-6 md:p-12 pointer-events-none">
                            <div className="pointer-events-auto space-y-6 animate-in fade-in zoom-in-95 duration-700">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg leading-tight">
                                    E-Commerce <br /> <span className="text-primary-foreground/90">Starter Template</span>
                                </h1>
                                <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto drop-shadow-md font-medium">
                                    Powered by Vendure and Next.js
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                    <Button asChild size="lg" className="min-w-[180px] h-12 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                        <Link href="/search">
                                            Shop Now
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="min-w-[180px] h-12 text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                        <a href="https://github.com/vendure-ecommerce/nextjs-starter-vendure" target="_blank"
                                            rel="noopener noreferrer">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1024 1024" className="mr-2 h-5 w-5">
                                                <path fill="currentColor" fillRule="evenodd"
                                                    d="M512 0C229.12 0 0 229.12 0 512c0 226.56 146.56 417.92 350.08 485.76 25.6 4.48 35.2-10.88 35.2-24.32 0-12.16-.64-52.48-.64-95.36-128.64 23.68-161.92-31.36-172.16-60.16-5.76-14.72-30.72-60.16-52.48-72.32-17.92-9.6-43.52-33.28-.64-33.92 40.32-.64 69.12 37.12 78.72 52.48 46.08 77.44 119.68 55.68 149.12 42.24 4.48-33.28 17.92-55.68 32.64-68.48-113.92-12.8-232.96-56.96-232.96-252.8 0-55.68 19.84-101.76 52.48-137.6-5.12-12.8-23.04-65.28 5.12-135.68 0 0 42.88-13.44 140.8 52.48 40.96-11.52 84.48-17.28 128-17.28 43.52 0 87.04 5.76 128 17.28 97.92-66.56 140.8-52.48 140.8-52.48 28.16 70.4 10.24 122.88 5.12 135.68 32.64 35.84 52.48 81.28 52.48 137.6 0 196.48-119.68 240-233.6 252.8 18.56 16 34.56 46.72 34.56 94.72 0 68.48-.64 123.52-.64 140.8 0 13.44 9.6 29.44 35.2 24.32C877.44 929.92 1024 737.92 1024 512 1024 229.12 794.88 0 512 0Z"
                                                    clipRule="evenodd" />
                                            </svg>
                                            View on GitHub
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>*/}
                    </div>

                    {/* Right Side: 25% - Static Image - Hidden on mobile, visible on lg */}
                    <div className="hidden lg:block lg:col-span-1 relative h-full rounded-2xl overflow-hidden shadow-2xl group">
                        {/*<div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500 z-10" />*/}
                        <Image
                            src={coverImage}
                            alt="featured-collection"
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            style={{
                                objectPosition: coverFocalPoint
                                    ? `${coverFocalPoint.x * 100}% ${coverFocalPoint.y * 100}%`
                                    : undefined
                            }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-center z-20 text-white bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-2xl font-bold mb-3 tracking-wide">Ürün Kataloğumuz</h3>
                            <Link href="/search?sort=latest" className="inline-flex items-center text-sm font-semibold uppercase tracking-wider hover:text-primary-foreground transition-colors group/link">
                                Görüntüle
                                <svg className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
