import { ProductGrid } from "@/components/commerce/product-grid";
import { cacheLife } from "next/cache";
import { query } from "@/lib/vendure/api";
import { SearchProductsQuery, GetProductDetailQuery } from "@/lib/vendure/queries";
import { readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";

async function getLatestProducts() {
    'use cache'
    cacheLife('days')

    // Fetch latest 8 products
    const result = await query(SearchProductsQuery, {
        input: {
            take: 8,
            skip: 0,
            groupByProduct: true,
            // Vendure usually sorts by relevance or ID by default. 
            // If the plugin supports it, id: DESC would be better.
        }
    });

    const items = result.data.search.items;

    // Fetch full product details to get variants and their images
    const itemsWithVariants = await Promise.all(
        items.map(async (item: any) => {
             const parsedItem = readFragment(ProductCardFragment, item);
             const productDetail = await query(GetProductDetailQuery, { slug: parsedItem.slug });
             return {
                 ...item,
                 variants: productDetail.data.product?.variants || []
             };
         })
    );

    return itemsWithVariants;
}

export async function FeaturedProducts() {
    const products = await getLatestProducts();

    return (
        <ProductGrid
            title="Oyun Başlasın!"
            subtitle="Hayal gücünü geliştiren, en eğlenceli ve güvenli oyun parklarımız burada!"
            eyebrow="Yeni Maceralar"
            products={products}
            viewAllLink="/search"
            viewAllText="Hepsini Keşfet"
        />
    )
}