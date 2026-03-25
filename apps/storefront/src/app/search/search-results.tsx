import {Suspense} from "react";
import {FacetFilters} from "@/components/commerce/facet-filters";
import {ProductGridSkeleton} from "@/components/shared/product-grid-skeleton";
import {ProductGrid} from "@/components/commerce/product-grid";
import {buildSearchInput, getCurrentPage} from "@/lib/search-helpers";
import {query} from "@/lib/vendure/api";
import {SearchProductsQuery, GetTopCollectionsQuery, GetMaxPriceQuery, GetFacetValuesQuery} from "@/lib/vendure/queries";

interface SearchResultsProps {
    searchParams: Promise<{
        page?: string
    }>
}

export async function SearchResults({searchParams}: SearchResultsProps) {
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = query(SearchProductsQuery, {
        input: buildSearchInput({searchParams: searchParamsResolved})
    });

    const allCollectionsPromise = query(GetTopCollectionsQuery);
    const maxPricePromise = query(GetMaxPriceQuery);
    const allFacetsPromise = query(GetFacetValuesQuery, {});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
                <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg border border-primary/20"/>}>
                    <FacetFilters 
                        productDataPromise={productDataPromise as any} 
                        allCollectionsPromise={allCollectionsPromise as any}
                        maxPricePromise={maxPricePromise as any}
                        allFacetsPromise={allFacetsPromise as any}
                    />
                </Suspense>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">
                <Suspense fallback={<ProductGridSkeleton/>}>
                    <ProductGrid productDataPromise={productDataPromise as any} currentPage={page} take={12}/>
                </Suspense>
            </div>
        </div>
    )
}