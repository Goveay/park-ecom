import type {Metadata} from 'next';
import {Suspense} from 'react';
import {SearchResults} from "@/app/search/search-results";
import {SearchTerm, SearchTermSkeleton} from "@/app/search/search-term";
import {SearchResultsSkeleton} from "@/components/shared/skeletons/search-results-skeleton";
import {SITE_NAME, noIndexRobots} from '@/lib/metadata';

export async function generateMetadata({
    searchParams,
}: PageProps<'/search'>): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const searchQuery = resolvedParams.q as string | undefined;

    const title = searchQuery
        ? `"${searchQuery}" için arama sonuçları`
        : 'Ürün Ara';

    return {
        title,
        description: searchQuery
            ? `"${searchQuery}" ile ilgili ürünleri ${SITE_NAME} üzerinde keşfedin.`
            : `${SITE_NAME} ürün kataloğunda arama yapın.`,
        robots: noIndexRobots(),
    };
}

export default async function SearchPage({searchParams}: PageProps<'/search'>) {
    return (
        <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pt-24 md:pt-32">
            <div className="container mx-auto px-4 pb-12 md:pb-20">
                <Suspense fallback={<SearchTermSkeleton/>}>
                    <SearchTerm searchParams={searchParams}/>
                </Suspense>
                <div className="mt-8">
                    <Suspense fallback={<SearchResultsSkeleton />}>
                        <SearchResults searchParams={searchParams}/>
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
