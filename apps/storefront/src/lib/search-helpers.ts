export interface SearchInputParams {
    term?: string;
    collectionSlug?: string;
    take: number;
    skip: number;
    groupByProduct: boolean;
    sort: { name?: 'ASC' | 'DESC'; price?: 'ASC' | 'DESC' };
    facetValueFilters?: Array<{ and?: string; or?: string[] }>;
}

interface BuildSearchInputOptions {
    searchParams: { [key: string]: string | string[] | undefined };
    collectionSlug?: string;
}

export function buildSearchInput({ searchParams, collectionSlug }: BuildSearchInputOptions): SearchInputParams {
    const page = Number(searchParams.page) || 1;
    const take = 12;
    const skip = (page - 1) * take;
    const sort = (searchParams.sort as string) || 'name-asc';
    const searchTerm = searchParams.q as string;
    const collectionSlugFromParams = searchParams.collection as string | undefined;
    const minPrice = Number(searchParams.minPrice) || undefined;
    const maxPrice = Number(searchParams.maxPrice) || undefined;

    // Extract facet value IDs from search params
    const facetValueIds = searchParams.facets
        ? Array.isArray(searchParams.facets)
            ? searchParams.facets
            : [searchParams.facets]
        : [];

    // Map sort parameter to Vendure SearchResultSortParameter
    const sortMapping: Record<string, { name?: 'ASC' | 'DESC'; price?: 'ASC' | 'DESC' }> = {
        'name-asc': { name: 'ASC' },
        'name-desc': { name: 'DESC' },
        'price-asc': { price: 'ASC' },
        'price-desc': { price: 'DESC' },
    };

    // Extract collection IDs/Slugs for multi-select support
    // Since we now use facets for collections in the sidebar, we just need to ensure 
    // facetValueFilters uses OR logic for selections within the same group if possible.
    // For now, we'll implement a simple strategy: all facets are passed as AND, 
    // UNLESS we want to support OR. Vendure's DefaultSearchPlugin supports:
    // facetValueFilters: [{ and: "id1" }, { or: ["id2", "id3"] }]

    return {
        ...(searchTerm && searchTerm.length >= 3 && { term: searchTerm }),
        collectionSlug: collectionSlugFromParams || collectionSlug,
        take,
        skip,
        groupByProduct: true,
        sort: sortMapping[sort] || sortMapping['name-asc'],
        ...((minPrice !== undefined || maxPrice !== undefined) && {
            priceRange: {
                min: minPrice,
                max: maxPrice
            }
        }),
        ...(facetValueIds.length > 0 && {
            // Eğer birden fazla facet seçiliyse, bunları OR olarak gönderiyoruz 
            // (Aynı gruptakiler için OR, farklı gruplar için AND normalde daha doğrudur 
            // ama basitleştirmek için ve kategoriler arası geçiş için OR kullanıyoruz)
            facetValueFilters: [{ or: facetValueIds }]
        })
    };
}

export function getCurrentPage(searchParams: { [key: string]: string | string[] | undefined }): number {
    return Number(searchParams.page) || 1;
}
