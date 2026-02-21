// Data fetching utilities for Gig World Today
import { Platform, Category } from './types';
import platformsData from '@/data/platforms.json';
import categoriesData from '@/data/categories.json';

/**
 * Returns all platforms that are currently active (not absorbed, merged, rebranded, or shut down),
 * unless a search query is present. Platforms with driverStatus of 'absorbed', 'merged', 'rebranded', or 'shut_down'
 * are excluded from the main list.
 */
export async function getAllPlatforms(): Promise<Platform[]> {
  const inactiveStatuses = [
    'absorbed',
    'merged',
    'rebranded',
    'shut_down',
    'shutdown',
    'permanently_closed',
    'no_longer_hiring',
    'not_hiring',
    'closed',
    'inactive',
    'defunct',
    'acquired',
    'out_of_business',
    'retired',
    'discontinued',
    'suspended',
    'paused',
    'terminated',
    'ended',
    'legacy',
    'archived'
  ];
  return (platformsData as Platform[]).filter(
    (p) => {
      const status = (p.driverStatus || '').toLowerCase();
      return !inactiveStatuses.includes(status);
    }
  );
}

export async function getPlatformBySlug(slug: string): Promise<Platform | null> {
  const platforms = await getAllPlatforms();
  return platforms.find(p => p.slug === slug) || null;
}

export async function getPlatformsByCategory(categoryId: string): Promise<Platform[]> {
  const platforms = await getAllPlatforms();
  return platforms.filter(p => p.categories.includes(categoryId));
}

export async function getAllCategories(): Promise<Category[]> {
  return categoriesData as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find(c => c.slug === slug) || null;
}

export async function searchPlatforms(query: string): Promise<Platform[]> {
  const platforms = await getAllPlatforms();
  const lowerQuery = query.toLowerCase();
  
  return platforms.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
}
