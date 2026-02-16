import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import PlatformCard from '@/components/PlatformCard';
import { getAllCategories, getAllPlatforms } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const categories = await getAllCategories();
  const platforms = await getAllPlatforms();
  const featuredPlatforms = platforms.slice(0, 3);

  return (
    <div>
      <Hero />
      <CategoryGrid categories={categories} />
      
      {/* Featured Platforms Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Platforms
              </h2>
              <p className="text-gray-600">
                Popular gig opportunities accepting new workers
              </p>
            </div>
            <Link 
              href="/platforms"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View all platforms
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlatforms.map((platform) => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {platforms.length}+
              </div>
              <div className="text-gray-600">Platforms</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                50+
              </div>
              <div className="text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                Daily
              </div>
              <div className="text-gray-600">Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
