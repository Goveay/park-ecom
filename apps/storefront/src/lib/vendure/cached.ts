import {query} from './api';
import {GetActiveChannelQuery, GetAvailableCountriesQuery, GetTopCollectionsQuery, GetCollectionsWithChildrenQuery} from './queries';

/**
 * Get the active channel.
 */
export async function getActiveChannelCached() {
    const result = await query(GetActiveChannelQuery);
    return (result.data as any)?.activeChannel;
}

/**
 * Get available countries.
 */
export async function getAvailableCountriesCached() {
    const result = await query(GetAvailableCountriesQuery);
    return (result.data as any)?.availableCountries || [];
}

/**
 * Get top-level collections.
 */
export async function getTopCollections() {
    const result = await query(GetTopCollectionsQuery);
    return (result.data as any)?.collections?.items ?? [];
}

/**
 * Get top-level collections with their children (subcollections).
 */
export async function getCollectionsWithChildren() {
    const result = await query(GetCollectionsWithChildrenQuery);
    return (result.data as any)?.collections?.items ?? [];
}
