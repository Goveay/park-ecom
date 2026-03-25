import { ProductCarousel } from "@/components/commerce/product-carousel";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/vendure/api";
import { GetCollectionProductsQuery, GetProductDetailQuery } from "@/lib/vendure/queries";
import { readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";

interface RelatedProductsProps {
    collectionSlug: string;
    currentProductId: string;
}

async function getRelatedProducts(collectionSlug: string, currentProductId: string) {
    'use cache'
    cacheLife('hours')
    cacheTag(`related-products-${collectionSlug}`)

    const result = await query(GetCollectionProductsQuery, {
        slug: collectionSlug,
        input: {
            collectionSlug: collectionSlug,
            take: 13, // Fetch extra to account for filtering out current product
            skip: 0,
            groupByProduct: true
        }
    });

    // Filter out the current product and limit to 12
    const filteredItems = result.data.search.items
        .filter(item => {
            const product = readFragment(ProductCardFragment, item);
            return product.productId !== currentProductId;
        })
        .slice(0, 12);

    // Fetch variants for these related products
    const itemsWithVariants = await Promise.all(
        filteredItems.map(async (item) => {
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

export async function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
    const products = await getRelatedProducts(collectionSlug, currentProductId);

    if (products.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            title="Bunları da Beğenebilirsiniz"
            products={products}
        />
    );
}
