import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search } from "lucide-react"

interface SearchTermProps {
    searchParams: Promise<{
        q?: string
    }>;
}

export async function SearchTerm({searchParams}: SearchTermProps) {
    const searchParamsResolved = await searchParams;
    const searchTerm = (searchParamsResolved.q as string) || '';

    return (
        <div className="mb-8 space-y-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Anasayfa</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Arama Sonuçları</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Search className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        {searchTerm ? `"${searchTerm}" için sonuçlar` : 'Ürün Ara'}
                    </h1>
                </div>
                {searchTerm && (
                    <p className="text-muted-foreground text-sm pl-11">
                        Kataloğumuzda aramanızla eşleşen en iyi ürünleri listeliyoruz.
                    </p>
                )}
            </div>
        </div>
    )
}

export function SearchTermSkeleton() {
    return (
        <div className="mb-8 space-y-4">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="h-9 w-64 bg-muted rounded animate-pulse" />
            </div>
        </div>
    )
}
