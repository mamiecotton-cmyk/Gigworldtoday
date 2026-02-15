import { MetadataRoute } from 'next';
import { getAllPlatforms } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const platforms = await getAllPlatforms();
  const baseUrl = 'https://gigworldtoday.com';

  const platformUrls = platforms.map((platform) => ({
    url: `${baseUrl}/platforms/${platform.slug}`,
    lastModified: new Date(platform.lastUpdated),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/platforms`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...platformUrls,
  ];
}
