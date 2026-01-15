import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
    return (
        <section className="relative overflow-hidden pt-24 pb-8 md:pt-32 md:pb-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px] md:h-[650px]">
                    {/* Left Side Skeleton */}
                    <div className="lg:col-span-3 h-full rounded-2xl overflow-hidden shadow-2xl">
                        <Skeleton className="w-full h-full" />
                    </div>
                    {/* Right Side Skeleton */}
                    <div className="hidden lg:block lg:col-span-1 h-full rounded-2xl overflow-hidden shadow-2xl">
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
