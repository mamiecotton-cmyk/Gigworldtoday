import Link from 'next/link';
import { Category } from '@/lib/types';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600">
            Explore gig opportunities across different industries
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/platforms?category=${category.slug}`}
              className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
