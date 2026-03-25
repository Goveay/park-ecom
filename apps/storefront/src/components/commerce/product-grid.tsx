import { ProductCard } from "@/components/commerce/product-card";
import { readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { FragmentOf } from "@/graphql";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeader } from "./section-header";

interface ProductGridProps {
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    products?: Array<FragmentOf<typeof ProductCardFragment>>;
    productDataPromise?: Promise<any>; // For search page
    currentPage?: number;
    take?: number;
    viewAllLink?: string;
    viewAllText?: string;
}

export async function ProductGrid({ 
    title, 
    subtitle,
    eyebrow,
    products, 
    productDataPromise, 
    viewAllLink, 
    viewAllText = "Tümünü Gör" 
}: ProductGridProps) {
    let displayProducts = products;

    if (productDataPromise) {
        const productData = await productDataPromise;
        displayProducts = productData?.data?.search?.items || [];
    }

    if (!displayProducts || displayProducts.length === 0) {
        return null;
    }

    return (
        <section className={title ? "py-16 md:py-24" : ""}>
            <div className="container mx-auto px-4">
                {title && (
                    <SectionHeader 
                        title={title}
                        subtitle={subtitle}
                        eyebrow={eyebrow}
                        viewAllLink={viewAllLink}
                        viewAllText={viewAllText}
                    />
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {displayProducts.map((p, i) => {
                        const product = readFragment(ProductCardFragment, p);
                        return (
                            <div key={product.productId} className="h-full">
                                <ProductCard product={p} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
