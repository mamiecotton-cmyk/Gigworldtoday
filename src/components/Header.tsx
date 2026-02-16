import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">
                Gig World Today
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/platforms" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Browse Platforms
            </Link>
            <Link 
              href="/platforms" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Categories
            </Link>
            <Link 
              href="/platforms" 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Find Gigs
            </Link>
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-primary-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
