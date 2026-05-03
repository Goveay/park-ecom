import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { query } from '@/lib/vendure/api';
import { SearchProductsQuery, GetCollectionProductsQuery } from '@/lib/vendure/queries';
import { ProductGrid } from '@/components/commerce/product-grid';
import { FacetFilters } from '@/components/commerce/facet-filters';
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton';
import { buildSearchInput, getCurrentPage } from '@/lib/search-helpers';
import { cacheLife, cacheTag } from 'next/cache';
import {
    SITE_NAME,
    truncateDescription,
    buildCanonicalUrl,
    buildOgImages,
} from '@/lib/metadata';
import { ChevronRight } from 'lucide-react';

async function getCollectionProducts(slug: string, searchParams: { [key: string]: string | string[] | undefined }) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-${slug}`);

    return query(SearchProductsQuery, {
        input: buildSearchInput({
            searchParams,
            collectionSlug: slug
        })
    });
}

async function getCollectionMetadata(slug: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-meta-${slug}`);

    return query(GetCollectionProductsQuery, {
        slug,
        input: { take: 0, collectionSlug: slug, groupByProduct: true },
    });
}

export async function generateMetadata({
    params,
}: PageProps<'/collection/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const result = await getCollectionMetadata(slug);
    const collection = result.data.collection;

    if (!collection) {
        return {
            title: 'Koleksiyon Bulunamadı',
        };
    }

    const description =
        truncateDescription(collection.description) ||
        `${collection.name} koleksiyonundaki ürünleri ${SITE_NAME} güvencesiyle keşfedin.`;

    return {
        title: collection.name,
        description,
        alternates: {
            canonical: buildCanonicalUrl(`/collection/${collection.slug}`),
        },
        openGraph: {
            title: collection.name,
            description,
            type: 'website',
            url: buildCanonicalUrl(`/collection/${collection.slug}`),
            images: buildOgImages(collection.featuredAsset?.preview, collection.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: collection.name,
            description,
            images: collection.featuredAsset?.preview
                ? [collection.featuredAsset.preview]
                : undefined,
        },
    };
}

export default async function CollectionPage({params, searchParams}: PageProps<'/collection/[slug]'>) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const [productDataPromise, collectionMeta] = await Promise.all([
        getCollectionProducts(slug, searchParamsResolved),
        getCollectionMetadata(slug),
    ]);

    const collection = collectionMeta.data.collection;
    const children = (collection as any)?.children || [];
    const parent = (collection as any)?.parent;
    // Vendure root collection has slug '__root_collection__', skip it
    const hasParent = parent && parent.slug && parent.slug !== '__root_collection__';

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            {/* Breadcrumb */}
            {(hasParent || children.length > 0) && (
                <nav className="mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <li>
                            <Link href="/" className="hover:text-foreground transition-colors">
                                Ana Sayfa
                            </Link>
                        </li>
                        <ChevronRight className="h-3.5 w-3.5" />
                        {hasParent && (
                            <>
                                <li>
                                    <Link
                                        href={`/collection/${parent.slug}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {parent.name}
                                    </Link>
                                </li>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </>
                        )}
                        <li className="font-semibold text-foreground">
                            {collection?.name}
                        </li>
                    </ol>
                </nav>
            )}

            {/* Collection Title */}
            {collection && (
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                            {collection.description.replace(/<[^>]*>/g, '').substring(0, 200)}
                        </p>
                    )}
                </div>
            )}

            {/* Subcategory Navigation */}
            {children.length > 0 && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/collection/${slug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold bg-primary text-primary-foreground shadow-sm transition-all hover:shadow-md"
                        >
                            Tümü
                        </Link>
                        {children.map((child: any) => (
                            <Link
                                key={child.slug}
                                href={`/collection/${child.slug}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary border border-slate-200 hover:border-primary/30 transition-all hover:shadow-sm"
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Sibling subcategories when viewing a subcategory */}
            {hasParent && children.length === 0 && (
                <SubcategorySiblings parentSlug={parent.slug} currentSlug={slug} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                        <FacetFilters productDataPromise={Promise.resolve(productDataPromise)} />
                    </Suspense>
                </aside>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid productDataPromise={Promise.resolve(productDataPromise)} currentPage={page} take={12} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

/**
 * Shows sibling subcategories when viewing a child collection
 */
async function SubcategorySiblings({ parentSlug, currentSlug }: { parentSlug: string; currentSlug: string }) {
    const parentResult = await query(GetCollectionProductsQuery, {
        slug: parentSlug,
        input: { take: 0, collectionSlug: parentSlug, groupByProduct: true },
    });

    const parentCollection = parentResult.data.collection;
    const siblings = (parentCollection as any)?.children || [];

    if (siblings.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex flex-wrap gap-2">
                <Link
                    href={`/collection/${parentSlug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary border border-slate-200 hover:border-primary/30 transition-all hover:shadow-sm"
                >
                    ← {(parentCollection as any)?.name || 'Tümü'}
                </Link>
                {siblings.map((sibling: any) => (
                    <Link
                        key={sibling.slug}
                        href={`/collection/${sibling.slug}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-sm ${
                            sibling.slug === currentSlug
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary border border-slate-200 hover:border-primary/30'
                        }`}
                    >
                        {sibling.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}