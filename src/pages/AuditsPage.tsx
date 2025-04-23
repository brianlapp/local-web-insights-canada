
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin } from 'lucide-react';
import AuditCard from '@/components/ui/AuditCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AuditsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const { data: businesses, isLoading: isLoadingBusinesses, error: businessError } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      console.log('Fetching businesses...');
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }
      
      console.log('Fetched businesses:', data);
      return data || [];
    }
  });

  const uniqueCategories = businesses 
    ? [...new Set(businesses.map(b => b.category).filter(Boolean))]
    : [];
  
  const uniqueCities = businesses
    ? [...new Set(businesses.map(b => b.city).filter(Boolean))]
    : [];

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = 
      !searchQuery || 
      business.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    const matchesCity = !selectedCity || (business.city && business.city.toLowerCase() === selectedCity.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  if (businessError) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load businesses. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-civic-gray-900 mb-4">
            Browse Website Audits
          </h1>
          <p className="text-lg text-civic-gray-600 max-w-2xl mx-auto">
            Explore our collection of local business website audits and see how we're helping improve online presence across communities.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-civic-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search businesses..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-civic-gray-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Category:</span>
              </div>
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-civic-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">City:</span>
              </div>
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          {isLoadingBusinesses ? (
            <div className="h-6">
              <Skeleton className="h-6 w-48" />
            </div>
          ) : (
            <p className="text-civic-gray-600">
              Showing <span className="font-semibold">{filteredBusinesses?.length || 0}</span> of{' '}
              <span className="font-semibold">{businesses?.length || 0}</span> website audits
            </p>
          )}
        </div>
        
        {isLoadingBusinesses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : businesses && businesses.length > 0 ? (
          filteredBusinesses && filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map(business => (
                <AuditCard 
                  key={business.id} 
                  business={{
                    name: business.name || 'Unnamed Business',
                    city: business.city || 'Unknown location',
                    slug: business.slug || '',
                    category: business.category || 'Uncategorized',
                    image: business.image || '',
                    score: business.scores?.overall || 0,
                    isUpgraded: business.is_upgraded || false
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-civic-gray-50 rounded-lg">
              <p className="text-civic-gray-600 mb-4">No audits found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="border-civic-blue text-civic-blue hover:bg-civic-blue-50"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedCity('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-civic-gray-50 rounded-lg">
            <p className="text-civic-gray-600 mb-4">No business audits found in the database.</p>
            <Button 
              className="bg-civic-green hover:bg-civic-green-600 text-white px-6 py-2" 
              asChild
            >
              <a href="/audit">Request Your Free Audit</a>
            </Button>
          </div>
        )}
        
        <div className="mt-16 bg-civic-blue-50 rounded-lg p-6 md:p-8 text-center">
          <h2 className="text-2xl font-semibold text-civic-gray-900 mb-3">
            Don't see your business here?
          </h2>
          <p className="text-civic-gray-600 mb-6 max-w-2xl mx-auto">
            Request a free website audit for your local business and join our community of improved online experiences.
          </p>
          <Button className="bg-civic-green hover:bg-civic-green-600 text-white px-6 py-2" asChild>
            <a href="/audit">Request Your Free Audit</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditsPage;
