
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import AuditCard from '@/components/ui/AuditCard';
import { getBusinessesByCity } from '@/data';

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  
  const businesses = city ? getBusinessesByCity(city) : [];
  
  // Ensure businesses have scores for AuditCard
  const businessesWithScore = businesses.map(business => ({
    ...business,
    score: business.score || Math.floor(Math.random() * 40) + 60, // Random score between 60-100 if not provided
    isUpgraded: business.isUpgraded || false
  }));
  
  if (!city || businessesWithScore.length === 0) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">City Not Found</h1>
          <p className="mb-8">We couldn't find any audits for this city or the city doesn't exist.</p>
          <Button onClick={() => navigate('/cities')} className="bg-civic-blue text-white">
            Browse All Cities
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-civic-blue-600 py-6 text-white">
        <div className="container">
          <button 
            onClick={() => navigate('/cities')} 
            className="flex items-center text-civic-blue-100 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cities
          </button>
          
          <div className="flex items-center">
            <MapPin className="w-6 h-6 mr-2" />
            <h1 className="text-3xl font-bold">{city}</h1>
          </div>
          
          <p className="text-civic-blue-100 mt-2">
            Exploring website audits for local businesses in {city}
          </p>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Latest Website Audits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessesWithScore.map((business) => (
              <AuditCard key={business.id || business.slug} business={business} />
            ))}
          </div>
        </div>
        
        <div className="bg-civic-gray-50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium mb-3">Is your {city} business missing?</h3>
          <p className="text-civic-gray-600 mb-4">
            Get a free website audit for your local business and join our directory.
          </p>
          <Button className="bg-civic-blue text-white">
            Request Your Free Audit
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default CityPage;
