import CategoryGrid from '@/components/CategoryGrid';
import categoriesData from '@/data/categories.json';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Categories</h1>
          <CategoryGrid categories={categoriesData} />
        </div>
      </div>
    </div>
  );
}
