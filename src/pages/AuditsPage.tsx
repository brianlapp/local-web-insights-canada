
import React, { useState } from 'react';
import { Filter, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { businesses } from '@/data';

const categories = [...new Set(businesses.map(b => b.category))];
const cities = [...new Set(businesses.map(b => b.city).filter(Boolean))];

// Add default score to business type if it's missing
const businessesWithScore = businesses.map(business => ({
  ...business,
  score: business.score || Math.floor(Math.random() * 40) + 60, // Random score between 60-100 if not provided
  isUpgraded: business.isUpgraded || false
}));

const AuditsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  
  const filteredBusinesses = businessesWithScore.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? business.category === categoryFilter : true;
    const matchesCity = cityFilter ? business.city === cityFilter : true;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <PageLayout>
      <div className="bg-civic-blue-600 py-12 text-white">
        <div className="container">
          <h1 className="text-3xl font-bold mb-4">Website Audit Directory</h1>
          <p className="text-xl text-civic-blue-100 max-w-2xl">
            Browse through our comprehensive collection of website audits for local businesses across Canada.
          </p>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-civic-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Link 
              key={business.id || business.slug} 
              to={`/${business.city?.toLowerCase()}/${business.slug}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-civic-gray-200 relative">
                <img 
                  src={business.image || '/placeholder.svg'} 
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
                {business.isUpgraded && (
                  <div className="absolute top-2 right-2 bg-civic-blue text-white text-xs px-2 py-1 rounded">
                    Premium
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{business.name}</h3>
                <div className="flex items-center text-civic-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{business.city}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-civic-gray-600">{business.category}</span>
                  <div className={`px-2 py-1 rounded text-white text-sm ${
                    business.score >= 90 ? 'bg-green-500' : 
                    business.score >= 70 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}>
                    Score: {business.score}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default AuditsPage;
