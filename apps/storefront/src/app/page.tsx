import type { Metadata } from "next";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedProducts } from "@/components/commerce/featured-products";
import { CategoryBanners } from "@/components/commerce/category-banners";
import { FeaturedCategories } from "@/components/commerce/featured-categories";
import { SITE_NAME, SITE_URL, SITE_SLOGAN, buildCanonicalUrl } from "@/lib/metadata";
import { DesignParkBanner } from "@/components/commerce/design-park-banner";
import { ShieldCheck, Factory, Truck } from "lucide-react";
import { HighlightProductsServer } from "@/components/commerce/highlight-products-server";

export const metadata: Metadata = {
    title: {
        absolute: `${SITE_NAME} | ${SITE_SLOGAN}`,
    },
    description:
        "Park Picasso ile çocuk oyun parkları, açık hava spor ekipmanları ve bahçe mobilyalarında kaliteyi keşfedin. Her oyun, bir sanat eseri.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `${SITE_NAME} | ${SITE_SLOGAN}`,
        description:
            "Park Picasso ile çocuk oyun parkları, açık hava spor ekipmanları ve bahçe mobilyalarında kaliteyi keşfedin.",
        type: "website",
        url: SITE_URL,
    },
};

import { Suspense } from "react";
import { HeroSkeleton } from "@/components/layout/hero-skeleton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<HeroSkeleton />}>
                <HeroSection />
            </Suspense>
            <Suspense fallback={<div className="h-40 animate-pulse bg-muted/20" />}>
                <FeaturedCategories />
            </Suspense>
            <Suspense fallback={<div className="h-60 animate-pulse bg-muted/20" />}>
                <DesignParkBanner />
            </Suspense>
            <Suspense fallback={<div className="h-80 animate-pulse bg-muted/20" />}>
                <CategoryBanners />
            </Suspense>
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted/20" />}>
                <HighlightProductsServer />
            </Suspense>
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted/20" />}>
                <FeaturedProducts />
            </Suspense>

            <section className="py-20 bg-muted/10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Neden Parkpicasso?</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Sektördeki tecrübemiz ve kalite anlayışımızla projelerinize değer katıyoruz.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Quality & Safety */}
                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/60 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                            <div
                                className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 relative"
                                style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 60%, transparent 100%)' }}
                            >
                                <ShieldCheck className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform duration-300" style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.45))' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Üstün Kalite ve Güvenlik</h3>
                            <p className="text-muted-foreground leading-relaxed">Çocuklarınız ve sosyal alanlar için özenle tasarlanmış, test edilmiş, %100 memnuniyet garantili sertifikalı ürünler.</p>
                        </div>

                        {/* Best Price */}
                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/60 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                            <div
                                className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 relative"
                                style={{ background: 'radial-gradient(circle, rgba(156,163,175,0.15) 0%, rgba(156,163,175,0.05) 60%, transparent 100%)' }}
                            >
                                <Factory className="w-8 h-8 text-gray-500 group-hover:scale-110 transition-transform duration-300" style={{ filter: 'drop-shadow(0 0 8px rgba(156,163,175,0.45))' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Üreticiden En İyi Fiyat</h3>
                            <p className="text-muted-foreground leading-relaxed">Aracıları ortadan kaldırarak birinci sınıf ahşap ve metal işçiliğini bütçenizi sarsmadan doğrudan size ulaştırıyoruz.</p>
                        </div>

                        {/* Fast Shipping */}
                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/60 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                            <div
                                className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 relative"
                                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 60%, transparent 100%)' }}
                            >
                                <Truck className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.45))' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Güvenli ve Hızlı Nakliye</h3>
                            <p className="text-muted-foreground leading-relaxed">Kapsamlı teslimat ve montaj ağımızla Türkiye ve dünyanın her yerine güvenle siparişlerinizi teslim ediyoruz.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
