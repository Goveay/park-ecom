import { Product } from '../types';

export const VENDURE_API_URL = (import.meta as any).env.VITE_VENDURE_API_URL || 'http://localhost:3000/shop-api';

export interface VendureProductItem {
  productId: string;
  productName: string;
  description: string;
  slug: string;
  productAsset?: {
    id: string;
    preview: string;
  };
  priceWithTax: {
    value?: number;
    min?: number;
    max?: number;
  };
  // search result typically doesn't have collections array by default, but let's keep it if we can find it
}

const SearchProductsQuery = `
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productId
        productName
        slug
        description
        priceWithTax {
          ... on PriceRange {
            min
            max
          }
          ... on SinglePrice {
            value
          }
        }
        productAsset {
          id
          preview
        }
      }
    }
  }
`;

export const vendureApi = {
  /**
   * Fetch products from Vendure Shop API
   */
  async getProducts(searchTerm = '', skip = 0, take = 50): Promise<VendureProductItem[]> {
    try {
      const response = await fetch(VENDURE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'vendure-token': '__default_channel__'
        },
        body: JSON.stringify({
          query: SearchProductsQuery,
          variables: {
            input: {
              term: searchTerm,
              skip,
              take,
              groupByProduct: true
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Vendure API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.search.items || [];
    } catch (error) {
      console.error('Failed to fetch from Vendure:', error);
      throw error;
    }
  },

  /**
   * Convert Vendure product format to Management Product format
   */
  convertToLocalProduct(vProduct: VendureProductItem): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
    // Extract price (handle both SinglePrice and PriceRange)
    let price = 0;
    if (vProduct.priceWithTax?.value !== undefined) {
      price = vProduct.priceWithTax.value / 100; // Convert cents to liras
    } else if (vProduct.priceWithTax?.min !== undefined) {
      price = vProduct.priceWithTax.min / 100;
    }

    // Default stock to 10 for simplicity during import
    const stock = 10;
    
    // Default category to 'İthal' since we don't have collection names in search result easily
    const category = 'İthal';

    return {
      name: vProduct.productName,
      description: vProduct.description || vProduct.productName,
      price: price,
      stock: stock,
      category: category,
      sku: vProduct.slug,
      image: vProduct.productAsset?.preview || '',
      vendureId: vProduct.productId,
      vendureSlug: vProduct.slug,
      unit: 'adet'
    };
  }
};
