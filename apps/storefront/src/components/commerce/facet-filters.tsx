'use client';

import { use, useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ResultOf } from '@/graphql';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { SearchProductsQuery, GetTopCollectionsQuery, GetMaxPriceQuery, GetFacetValuesQuery } from "@/lib/vendure/queries";
import { X, Filter, LayoutGrid, Palette, ChevronRight, Coins, Sparkles } from "lucide-react";

interface FacetFiltersProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    allCollectionsPromise?: Promise<{
        data: ResultOf<typeof GetTopCollectionsQuery>;
    }>;
    maxPricePromise?: Promise<{
        data: ResultOf<typeof GetMaxPriceQuery>;
    }>;
    allFacetsPromise?: Promise<{
        data: ResultOf<typeof GetFacetValuesQuery>;
    }>;
}

// Renk isimlerini HEX kodlarına eşleyen çok daha geniş kapsamlı mapping
const COLOR_MAP: Record<string, string> = {
    // Standart Türkçe Renkler
    'Kırmızı': '#EF4444',
    'Mavi': '#3B82F6',
    'Yeşil': '#22C55E',
    'Sarı': '#EAB308',
    'Turuncu': '#F97316',
    'Siyah': '#000000',
    'Beyaz': '#FFFFFF',
    'Gri': '#6B7280',
    'Pembe': '#EC4899',
    'Mor': '#A855F7',
    'Bej': '#F5F5DC',
    'Antrasit': '#374151',
    'Kahverengi': '#78350F',
    'Turkuaz': '#06B6D4',
    'Lacivert': '#1E3A8A',
    'Bordo': '#7F1D1D',
    'Altın': '#D4AF37',
    'Gümüş': '#C0C0C0',
    'Koyu Yeşil': '#166534',
    'Koyu Mavi': '#1E3A8A',
    'Açık Mavi': '#60A5FA',
    'Lila': '#C084FC',
    'Vişne': '#9F1239',
    'Hardal': '#D97706',
    'Metal': '#94A3B8',
    'Ahşap': '#854D0E',
    'Meşe': '#A47551',
    'Ceviz': '#5D4037',
    'Akçaağaç': '#E9DCC9',
    
    // Yaygın RAL Kodları (Mobilya ve Park Alanları İçin)
    'RAL 6018': '#57A639', // Fıstık Yeşili
    'RAL 1023': '#F7B500', // Trafik Sarısı
    'RAL 3020': '#C1121C', // Trafik Kırmızısı
    'RAL 5015': '#2269B1', // Gök Mavisi
    'RAL 7016': '#383E42', // Antrasit Gri
    'RAL 9005': '#0E0E10', // Kapkara Siyah
    'RAL 9010': '#F7F9F2', // Saf Beyaz
    'RAL 2004': '#E75B12', // Saf Turuncu
    'RAL 8017': '#44322D', // Çikolata Kahve
    'RAL 6005': '#2F4538', // Yosun Yeşili
};

// Gizlenecek teknik/gereksiz fasetler
const HIDDEN_FACETS = ['vitrin'];

export function FacetFilters({ productDataPromise, allCollectionsPromise, maxPricePromise, allFacetsPromise }: FacetFiltersProps) {
    const result = use(productDataPromise);
    const collectionsResult = allCollectionsPromise ? use(allCollectionsPromise) : null;
    const maxPriceResult = maxPricePromise ? use(maxPricePromise) : null;
    const allFacetsResult = allFacetsPromise ? use(allFacetsPromise) : null;
    
    const searchResult = (result as any).data.search;
    
    // Teknik fasetleri gizlemek için kara liste
    const BLACKLISTED_FACET_VALUES = ['vitrin', 'heroslider', 'vitrin', 'Koleksiyon'];

    // En pahalı ürünü bul (Dinamik Max Price - Search API'den)
    const maxPriceItem = maxPriceResult?.data.search.items?.[0];
    let dbMaxPrice = 50000;
    
    if (maxPriceItem?.priceWithTax) {
        if (maxPriceItem.priceWithTax.__typename === 'PriceRange') {
            dbMaxPrice = (maxPriceItem.priceWithTax as any).max;
        } else if (maxPriceItem.priceWithTax.__typename === 'SinglePrice') {
            dbMaxPrice = (maxPriceItem.priceWithTax as any).value;
        }
    }
    
    const initialMaxPrice = Math.ceil(dbMaxPrice / 100) * 100; // Yukarı yuvarla
    
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Renk bulma yardımcı fonksiyonu
    const getHexCode = (colorName: string) => {
        const normalized = colorName.toLowerCase();
        // Pembe/Pink özel kontrolü
        if (normalized.includes('pink') || normalized.includes('pembe')) return COLOR_MAP['Pembe'];

        // Tam eşleşme kontrolü
        if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];
        
        // Küçük harf/büyük harf duyarsız kontrol
        const entry = Object.entries(COLOR_MAP).find(
            ([key]) => key.toLowerCase() === normalized
        );
        if (entry) return entry[1];

        // İçerik kontrolü (Örn: "RAL 6018 - Yeşil" -> "RAL 6018")
        const partialEntry = Object.entries(COLOR_MAP).find(
            ([key]) => normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)
        );
        if (partialEntry) return partialEntry[1];

        return '#CCCCCC'; // Fallback gri
    };

    // Fiyat Aralığı States
    const minPrice = 0;
    const [priceRange, setPriceRange] = useState([
        Number(searchParams.get('minPrice')) || minPrice,
        Number(searchParams.get('maxPrice')) || initialMaxPrice
    ]);

    // Update priceRange if maxPrice changes from DB (initial load)
    useEffect(() => {
        if (!searchParams.has('maxPrice')) {
            setPriceRange(curr => [curr[0], initialMaxPrice]);
        }
    }, [initialMaxPrice]);
    // Group facet values by facet
    interface FacetGroup {
        id: string;
        name: string;
        values: Array<{ id: string; name: string; count: number }>;
    }

    const facetGroups = searchResult.facetValues.reduce((acc: Record<string, FacetGroup>, item) => {
        const facetName = item.facetValue.facet.name;
        
        // Sadece çok teknik/sistem fasetlerini gizle (Kategori fasetini de buraya ekledik çünkü onu yukarıda özel göstereceğiz)
        if (HIDDEN_FACETS.some(h => facetName.toLowerCase().includes(h.toLowerCase()))) return acc;
        if (facetName.toLowerCase() === 'category' || facetName === 'Kategori') return acc;

        if (!acc[facetName]) {
            acc[facetName] = {
                id: item.facetValue.facet.id,
                name: facetName,
                values: []
            };
        }
        acc[facetName].values.push({
            id: item.facetValue.id,
            name: item.facetValue.name,
            count: item.count
        });
        return acc;
    }, {});

    // Tüm Kategori facet değerlerini bul (ID mapping için)
    const categoryFacet = (allFacetsResult as any)?.data?.facets?.items?.find((f: any) => f.name.toLowerCase() === 'category' || f.name === 'Kategori');
    let categoryValues = (categoryFacet as any)?.values || [];

    // Vitrin, Heroslider gibi teknik fasetleri gizle
    categoryValues = categoryValues.filter((v: any) => 
        !BLACKLISTED_FACET_VALUES.some(b => v.name.toLowerCase().includes(b.toLowerCase()))
    );

    const selectedCollections = searchParams.getAll('collection');
    const selectedFacets = searchParams.getAll('facets');

    const toggleFacet = (facetId: string) => {
        const params = new URLSearchParams(searchParams);
        const current = params.getAll('facets');

        if (current.includes(facetId)) {
            params.delete('facets');
            current.filter(id => id !== facetId).forEach(id => params.append('facets', id));
        } else {
            params.append('facets', facetId);
        }

        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const toggleCollection = (collectionSlug: string) => {
        const params = new URLSearchParams(searchParams);
        const current = params.getAll('collection');

        if (current.includes(collectionSlug)) {
            params.delete('collection');
            current.filter(slug => slug !== collectionSlug).forEach(slug => params.append('collection', slug));
        } else {
            params.append('collection', collectionSlug);
        }

        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePriceChange = (values: number[]) => {
        setPriceRange(values);
        const params = new URLSearchParams(searchParams);
        params.set('minPrice', values[0].toString());
        params.set('maxPrice', values[1].toString());
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('facets');
        params.delete('collection');
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('page');
        setPriceRange([minPrice, initialMaxPrice]);
        router.push(`${pathname}?${params.toString()}`);
    };

    const hasActiveFilters = selectedFacets.length > 0 || selectedCollections.length > 0 || searchParams.has('minPrice');

    // Accordion'da varsayılan olarak açık kalacak bölümler
    const defaultOpenItems = ["categories"];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="p-2 rounded-xl bg-[#ff6000]/10 text-[#ff6000] shadow-inner relative z-10">
                            <Filter className="h-4 w-4" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse z-0 opacity-50" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce z-0 opacity-50" />
                    </div>
                    <h2 className="font-extrabold text-sm uppercase tracking-[0.2em] bg-gradient-to-r from-[#ff6000] to-blue-500 bg-clip-text text-transparent">Filtrele</h2>
                </div>
                {hasActiveFilters && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-[#ff6000] hover:bg-[#ff6000]/5 rounded-full transition-all"
                    >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Temizle
                    </Button>
                )}
            </div>

            <Accordion type="multiple" defaultValue={defaultOpenItems} className="w-full space-y-2">
                
                {/* Categories Filter */}
                <AccordionItem value="categories" className="border-none py-1">
                    <AccordionTrigger className="py-2 hover:no-underline group">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                                <LayoutGrid className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-foreground/70 group-hover:text-blue-500 transition-colors">Kategoriler</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                        <div className="grid grid-cols-1 gap-1.5 pl-1.5">
                            {categoryValues.length === 0 && (
                                <p className="text-xs text-muted-foreground px-3 py-2">Kategori bulunamadı</p>
                            )}
                            {categoryValues.map((item: any) => {
                                const isChecked = selectedFacets.includes(item.id);
                                const count = searchResult.facetValues.find((fv: any) => fv.facetValue.id === item.id)?.count || 0;
                                return (
                                    <div 
                                        key={item.id} 
                                        className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                            isChecked 
                                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-sm' 
                                                : 'hover:bg-blue-50/50 border-transparent hover:border-blue-100'
                                        }`}
                                        onClick={() => toggleFacet(item.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={isChecked}
                                                className={isChecked ? 'border-blue-500 bg-blue-500 text-white' : 'border-muted-foreground/30'}
                                                onCheckedChange={() => {}}
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-blue-600' : 'text-muted-foreground group-hover:text-blue-500'}`}>
                                                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/60">{count} Ürün</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Filter */}
                <AccordionItem value="price" className="border-none py-1">
                    <AccordionTrigger className="py-2 hover:no-underline group">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                <Coins className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-foreground/70 group-hover:text-emerald-500 transition-colors">Fiyat Aralığı</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-6 px-3">
                        <div className="space-y-6">
                            <Slider
                                defaultValue={[minPrice, initialMaxPrice]}
                                value={priceRange}
                                max={initialMaxPrice}
                                step={100}
                                onValueChange={setPriceRange}
                                onValueCommit={handlePriceChange}
                                className="my-8"
                            />
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                                    <span className="text-[10px] text-emerald-600 uppercase block font-bold">En Düşük</span>
                                    <span className="text-xs font-extrabold text-emerald-700">{priceRange[0].toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="h-px w-4 bg-emerald-200" />
                                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-right">
                                    <span className="text-[10px] text-emerald-600 uppercase block font-bold">En Yüksek</span>
                                    <span className="text-xs font-extrabold text-emerald-700">{priceRange[1].toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Facet Groups */}
                {Object.entries(facetGroups).map(([facetName, facet]: [string, any]) => {
                    const isColor = facetName.toLowerCase().includes('renk') || facetName.toLowerCase().includes('boya') || facetName.toLowerCase().includes('color');
                    
                    return (
                        <AccordionItem key={facet.id} value={facetName} className="border-none py-1">
                            <AccordionTrigger className="py-2 hover:no-underline group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg transition-all shadow-sm ${
                                        isColor 
                                            ? 'bg-pink-50 text-pink-500 group-hover:bg-pink-500 group-hover:text-white' 
                                            : 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                                    }`}>
                                        {isColor ? <Palette className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                    </div>
                                    <span className={`text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors ${
                                        isColor ? 'group-hover:text-pink-500' : 'group-hover:text-orange-500'
                                    }`}>
                                        {facetName === 'Facet' ? 'Gelişmiş Filtre' : facetName}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4">
                                <div className="grid grid-cols-1 gap-1.5 pl-1.5">
                                    {facet.values.map((value: any) => {
                                        const isChecked = selectedFacets.includes(value.id);
                                        
                                        if (isColor) {
                                            const hexCode = getHexCode(value.name);
                                            return (
                                                <div 
                                                    key={value.id} 
                                                    className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                                        isChecked 
                                                            ? 'bg-pink-500/10 text-pink-600 border-pink-500/20' 
                                                            : 'hover:bg-pink-50/50 border-transparent hover:border-pink-100'
                                                    }`}
                                                    onClick={() => toggleFacet(value.id)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div 
                                                            className="w-6 h-6 rounded-lg border border-black/10 shadow-sm transition-transform group-hover:scale-110"
                                                            style={{ backgroundColor: hexCode }}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-pink-600' : 'text-muted-foreground group-hover:text-pink-500'}`}>
                                                                {value.name}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/60">{value.count} Ürün</span>
                                                        </div>
                                                    </div>
                                                    <Checkbox
                                                        id={value.id}
                                                        checked={isChecked}
                                                        className={isChecked ? 'border-pink-500 bg-pink-500 text-white' : 'border-muted-foreground/30'}
                                                        onCheckedChange={() => {}} 
                                                    />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div 
                                                key={value.id} 
                                                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                                    isChecked 
                                                        ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-sm' 
                                                        : 'hover:bg-orange-50/50 border-transparent hover:border-orange-100'
                                                }`}
                                                onClick={() => toggleFacet(value.id)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={value.id}
                                                        checked={isChecked}
                                                        className={isChecked ? 'border-orange-500 bg-orange-500 text-white' : 'border-muted-foreground/30'}
                                                        onCheckedChange={() => {}} 
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-orange-600' : 'text-muted-foreground group-hover:text-orange-500'}`}>
                                                            {value.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/60">{value.count} Ürün</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
