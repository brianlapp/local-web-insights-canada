
import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { businesses } from '@/data';

const CitiesListPage = () => {
  // Get unique cities and count of businesses in each
  const cityData = businesses.reduce((acc, business) => {
    if (business.city) {
      if (!acc[business.city]) {
        acc[business.city] = {
          count: 1,
          image: business.image || '/placeholder.svg'
        };
      } else {
        acc[business.city].count += 1;
      }
    }
    return acc;
  }, {} as Record<string, { count: number, image: string }>);
  
  // Convert to array and sort by count
  const cities = Object.entries(cityData)
    .map(([name, data]) => ({ 
      name, 
      count: data.count,
      image: data.image
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <PageLayout>
      <div className="bg-civic-blue-600 py-12 text-white">
        <div className="container">
          <h1 className="text-3xl font-bold mb-4">Explore Cities</h1>
          <p className="text-xl text-civic-blue-100 max-w-2xl">
            Browse website audits by city. Discover how local businesses in different cities are performing online.
          </p>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link 
              key={city.name} 
              to={`/cities/${encodeURIComponent(city.name.toLowerCase())}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-civic-gray-200 relative">
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h2 className="text-white text-2xl font-bold">{city.name}</h2>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-civic-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{city.name}</span>
                  </div>
                  <span className="text-civic-blue font-medium">{city.count} {city.count === 1 ? 'audit' : 'audits'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default CitiesListPage;
