import type { Metadata } from 'next';
import { query } from '@/lib/vendure/api';
import { GetProductDetailQuery } from '@/lib/vendure/queries';
import { ProductImageCarousel } from '@/components/commerce/product-image-carousel';
import { ProductInfo } from '@/components/commerce/product-info';
import { RelatedProducts } from '@/components/commerce/related-products';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';
import {
    SITE_NAME,
    truncateDescription,
    buildCanonicalUrl,
    buildOgImages,
} from '@/lib/metadata';

async function getProductData(slug: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`product-${slug}`);

    return await query(GetProductDetailQuery, { slug });
}

export async function generateMetadata({
    params,
}: PageProps<'/product/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const result = await getProductData(slug);
    const product = result.data.product;

    if (!product) {
        return {
            title: 'Ürün Bulunamadı',
        };
    }

    const description = truncateDescription(product.description);
    const ogImage = product.assets?.[0]?.preview;

    return {
        title: product.name,
        description: description || `${product.name} ürününü ${SITE_NAME} üzerinde inceleyin.`,
        alternates: {
            canonical: buildCanonicalUrl(`/product/${product.slug}`),
        },
        openGraph: {
            title: product.name,
            description: description || `${product.name} ürününü ${SITE_NAME} üzerinde inceleyin.`,
            type: 'website',
            url: buildCanonicalUrl(`/product/${product.slug}`),
            images: buildOgImages(ogImage, product.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description || `${product.name} ürününü ${SITE_NAME} üzerinde inceleyin.`,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps<'/product/[slug]'>) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;

    const result = await getProductData(slug);
    const product = result.data.product;

    if (!product) {
        notFound();
    }

    // Cast customFields to include our new field
    const productForInfo = {
        ...product,
        customFields: product.customFields as { shortDescription?: string } | undefined
    };

    // Get the primary collection (prefer deepest nested / most specific)
    const primaryCollection = product.collections?.find(c => c.parent?.id) ?? product.collections?.[0];

    // Determine the selected variant based on searchParams
    let selectedVariant = null;
    if (typeof searchParamsResolved['variant'] === 'string') {
        selectedVariant = product.variants.find(v => v.id === searchParamsResolved['variant']);
    } else if (product.optionGroups.length > 0) {
        selectedVariant = product.variants.find(variant => {
            return product.optionGroups.every(group => {
                const paramValue = searchParamsResolved[group.code];
                if (!paramValue) return false;
                const option = variant.options.find(opt => opt.groupId === group.id);
                return option?.code === paramValue;
            });
        });
    }

    if (!selectedVariant && product.variants.length === 1) {
        selectedVariant = product.variants[0];
    }

    const variantAsset = selectedVariant?.featuredAsset;
    let displayAssets = product.assets;
    if (variantAsset) {
        const otherAssets = product.assets.filter(a => a.id !== variantAsset.id);
        displayAssets = [variantAsset, ...otherAssets];
    }

    return (
        <>
            <div className="container mx-auto px-4 pt-24 pb-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-6 text-sm overflow-x-auto no-scrollbar whitespace-nowrap py-1">
                    <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <HomeIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Anasayfa</span>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                        Mağaza
                    </Link>
                    {primaryCollection && (
                        <>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                            <Link href={`/collection/${primaryCollection.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                                {primaryCollection.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-none">
                        {product.name}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Image Carousel */}
                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <ProductImageCarousel images={displayAssets} />
                    </div>

                    {/* Right Column: Product Info */}
                    <div>
                        <ProductInfo product={productForInfo} searchParams={searchParamsResolved} />
                    </div>
                </div>
            </div>

            {/* Content Tabs Section */}
            <section className="py-6 md:py-12 bg-background border-t border-border/40">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="flex justify-start border-none h-12 p-1.5 bg-muted/50 rounded-2xl space-x-1 w-fit mb-4">
                            <TabsTrigger
                                value="description"
                                className="px-8 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm transition-all text-muted-foreground hover:text-foreground"
                            >
                                Açıklama
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="px-8 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm transition-all text-muted-foreground hover:text-foreground"
                            >
                                Değerlendirmeler (0)
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="py-8 animate-in fade-in duration-500">
                            <div
                                className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </TabsContent>
                        <TabsContent value="reviews" className="py-8 animate-in fade-in duration-500 text-center">
                            <p className="text-muted-foreground">Henüz bu ürün için değerlendirme yapılmamış.</p>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>




            {primaryCollection && (
                <RelatedProducts
                    collectionSlug={primaryCollection.slug}
                    currentProductId={product.id}
                />
            )}
            {/* Mobile Bottom Bar Spacer */}
            <div className="h-28 md:hidden" />
        </>
    );
}
