import { HighlightProducts } from "@/components/commerce/highlight-products";
import { cacheLife } from "next/cache";
import { query } from "@/lib/vendure/api";
import { GetCollectionProductsQuery, GetProductDetailQuery } from "@/lib/vendure/queries";
import { readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";

async function getHighlightProducts() {
    'use cache'
    cacheLife('days')

    // Fetch products from the same collection as featured products
    // You can change this to a different collection slug if needed
    const result = await query(GetCollectionProductsQuery, {
        slug: "vitrin",
        input: {
            collectionSlug: "vitrin",
            take: 12,
            skip: 0,
            groupByProduct: true
        }
    });

    const items = (result.data as any)?.search?.items || [];

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

export async function HighlightProductsServer() {
    const products = await getHighlightProducts();

    return (
        <HighlightProducts
            title="Parkın Yıldızları"
            subtitle="Park Picasso'nun en sevilen, en renkli ve en heyecan verici tasarımları!"
            eyebrow="Çok Sevilenler"
            products={products}
        />
    );
}
