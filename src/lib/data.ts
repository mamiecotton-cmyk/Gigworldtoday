// Data fetching utilities for Gig World Today
import { Platform, Category } from './types';
import platformsData from '@/data/platforms.json';
import categoriesData from '@/data/categories.json';

export async function getAllPlatforms(): Promise<Platform[]> {
  return platformsData as Platform[];
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
