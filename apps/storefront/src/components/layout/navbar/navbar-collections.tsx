import { cacheLife } from 'next/cache';
import { getTopCollections } from '@/lib/vendure/cached';
import {
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { NavbarLink } from '@/components/layout/navbar/navbar-link';
import { 
    Castle, 
    Dumbbell, 
    Trees, 
    Fence, 
    Boxes, 
    Building2, 
    Gamepad2,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
    'oyun-parklar': Castle,
    'softplay-oyun-grubu': Boxes,
    'fitness-ekipmanlar': Dumbbell,
    'peyzaj': Trees,
    'bahce-mobilyalar': Fence,
    'sosyal-tesisler': Building2,
    'oyuncak': Gamepad2,
};

export async function NavbarCollections() {
    "use cache";
    cacheLife('days');

    const collections = await getTopCollections();

    const targetSlugs = [
        'oyun-parklar',
        'softplay-oyun-grubu',
        'fitness-ekipmanlar',
        'peyzaj',
        'bahce-mobilyalar',
        'sosyal-tesisler',
        'oyuncak'
    ];

    const categoryList = collections.filter(c => targetSlugs.includes(c.slug))
        .sort((a, b) => targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug));

    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className="text-sm font-bold h-10 px-4 py-2 hover:bg-black/5 rounded-lg transition-all">
                Kategoriler
            </NavigationMenuTrigger>

            <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-3 md:w-[400px] md:grid-cols-1 lg:w-[450px]">
                    {categoryList.map((collection) => {
                        const Icon = ICON_MAP[collection.slug] || Sparkles;
                        return (
                            <li key={collection.slug} className="list-none">
                                <NavbarLink
                                    href={`/search?collection=${collection.slug}`}
                                    className={cn(
                                        "flex items-center gap-3.5 p-3 rounded-lg transition-colors",
                                        "hover:bg-slate-100 hover:text-slate-900 group"
                                    )}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-orange-500 shadow-sm transition-colors border border-slate-100">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-[13px] font-bold tracking-tight text-slate-700 group-hover:text-slate-950 transition-colors uppercase">
                                        {collection.name}
                                    </div>
                                </NavbarLink>
                            </li>
                        );
                    })}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}

// Added this internal Link import since it might be needed if NavbarLink doesn't support generic links
import Link from 'next/link';
