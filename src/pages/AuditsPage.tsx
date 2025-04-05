
import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
import AuditCard from '@/components/ui/AuditCard';

const AuditsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  
  // Get unique categories and cities
  const categories = Array.from(new Set(businesses.map(b => b.category))).filter(Boolean);
  const cities = Array.from(new Set(businesses.map(b => b.city))).filter(Boolean);
  
  // Filter businesses based on search and filters
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || business.city === selectedCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <PageLayout>
      <div className="bg-civic-blue-600 py-12 text-white">
        <div className="container">
          <h1 className="text-3xl font-bold mb-4">Browse Website Audits</h1>
          <p className="text-xl text-civic-blue-100 max-w-2xl">
            Explore our collection of website audits for local businesses. Filter by category, city, or search for specific businesses.
          </p>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-civic-gray-400" />
                <Input 
                  placeholder="Search businesses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category || ''}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city, index) => (
                    <SelectItem key={index} value={city || ''}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((business) => (
              <AuditCard key={business.id} business={business} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">No audits found</h3>
              <p className="text-civic-gray-500 mb-4">Try adjusting your search or filters.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCity('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AuditsPage;
