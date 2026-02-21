'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useMemo } from 'react';
import SmartSearchBar from './SmartSearchBar';
import platformsData from '@/data/platforms.json';

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(60);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Memoize all unique 'City, State' strings from platforms
  const allLocations = useMemo(() => {
    const platforms = Array.isArray(platformsData) ? platformsData : [];
    return Array.from(new Set(
      platforms
        .filter((p: any) => p.city && p.state)
        .map((p: any) => `${p.city}, ${p.state}`)
    ));
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    setSuggestions(
      allLocations.filter(loc => loc.toLowerCase().includes(q)).slice(0, 5)
    );
  }, [query, allLocations]);

  const handleSearch = useCallback((searchValue?: string) => {
    const q = typeof searchValue === 'string' ? searchValue : query;
    if (q.trim()) {
      router.push(`/platforms?search=${encodeURIComponent(q)}&radius=${radius}`);
    }
  }, [query, radius, router]);

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
            <SmartSearchBar
              value={query}
              onChange={setQuery}
              radius={radius}
              onRadiusChange={setRadius}
              suggestions={suggestions}
              // Handle Enter key
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              // Handle suggestion click
              onSuggestionSelect={handleSearch}
            />
            <p className="mt-4 text-sm text-gray-500">
              🔍 Find platforms accepting new workers in your area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
