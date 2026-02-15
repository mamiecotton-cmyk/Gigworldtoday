import { Search } from 'lucide-react';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find Gig Apps Hiring
            <span className="text-primary-600"> Near You</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover 30+ gig economy platforms. Compare requirements, pay, and availability 
            for food delivery, catering, rideshare, and more.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Enter your city or ZIP code..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              🔍 Find platforms accepting new workers in your area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
