import { getCollectionsWithChildren } from '@/lib/vendure/cached';
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
    Sparkles,
    ChevronRight
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
    const collections = await getCollectionsWithChildren();

    const targetSlugs = [
        'oyun-parklar',
        'softplay-oyun-grubu',
        'fitness-ekipmanlar',
        'peyzaj',
        'bahce-mobilyalar',
        'sosyal-tesisler',
        'oyuncak'
    ];

    const categoryList = collections.filter((c: any) => targetSlugs.includes(c.slug))
        .sort((a: any, b: any) => targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug));

    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className="text-sm font-bold h-10 px-4 py-2 hover:bg-black/5 rounded-lg transition-all">
                Kategoriler
            </NavigationMenuTrigger>

            <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-3 md:w-[500px] md:grid-cols-1 lg:w-[560px]">
                    {categoryList.map((collection: any) => {
                        const Icon = ICON_MAP[collection.slug] || Sparkles;
                        const hasChildren = collection.children && collection.children.length > 0;
                        return (
                            <li key={collection.slug} className="list-none group/cat relative">
                                <NavbarLink
                                    href={`/collection/${collection.slug}`}
                                    className={cn(
                                        "flex items-center gap-3.5 p-3 rounded-lg transition-colors",
                                        "hover:bg-slate-100 hover:text-slate-900 group"
                                    )}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-orange-500 shadow-sm transition-colors border border-slate-100">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 text-[13px] font-bold tracking-tight text-slate-700 group-hover:text-slate-950 transition-colors uppercase">
                                        {collection.name}
                                    </div>
                                    {hasChildren && (
                                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover/cat:text-orange-500 transition-colors" />
                                    )}
                                </NavbarLink>

                                {/* Subcategories flyout */}
                                {hasChildren && (
                                    <div className="invisible group-hover/cat:visible opacity-0 group-hover/cat:opacity-100 transition-all duration-200 absolute left-full top-0 ml-1 z-50">
                                        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 min-w-[240px]">
                                            {/* Parent link */}
                                            <NavbarLink
                                                href={`/collection/${collection.slug}`}
                                                className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-orange-500 hover:bg-orange-50 transition-colors mb-1 border-b border-slate-100 pb-3"
                                            >
                                                Tümünü Gör
                                            </NavbarLink>

                                            {/* Subcategory links */}
                                            {collection.children.map((child: any) => (
                                                <NavbarLink
                                                    key={child.slug}
                                                    href={`/collection/${child.slug}`}
                                                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group/sub"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/sub:bg-orange-500 transition-colors flex-shrink-0" />
                                                    <span className="text-[13px] font-semibold text-slate-600 group-hover/sub:text-slate-900 transition-colors">
                                                        {child.name}
                                                    </span>
                                                </NavbarLink>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}
