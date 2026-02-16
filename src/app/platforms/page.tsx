import { Metadata } from 'next';
import PlatformsClient from './platforms-client';
import { getAllPlatforms, getAllCategories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Browse All Platforms',
  description: 'Explore all gig economy platforms. Filter by category, location, requirements, and more.',
};

export default async function PlatformsPage() {
  const platforms = await getAllPlatforms();
  const categories = await getAllCategories();

  return (
    <PlatformsClient platforms={platforms} categories={categories} />
  );
}
