
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

interface AuditCardProps {
  business: {
    name: string;
    city: string;
    slug: string;
    category: string;
    image: string;
    score: number;
    isUpgraded: boolean;
  };
}

const AuditCard: React.FC<AuditCardProps> = ({ business }) => {
  return (
    <div className="card group hover:shadow-md transition-shadow">
      <div className="relative mb-4">
        <img 
          src={business.image} 
          alt={`Screenshot of ${business.name}'s website`}
          className="w-full h-40 object-cover rounded-md"
        />
        {business.isUpgraded && (
          <span className="absolute top-2 right-2 bg-civic-green text-white text-xs px-2 py-1 rounded-full">
            Upgraded
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-1 text-civic-gray-900">{business.name}</h3>
      <p className="text-civic-gray-500 text-sm mb-3">{business.city} · {business.category}</p>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Star className={`w-5 h-5 ${business.score >= 80 ? 'text-civic-green' : business.score >= 50 ? 'text-amber-500' : 'text-civic-red'}`} />
          <span className="ml-1 text-sm font-medium">{business.score}/100</span>
        </div>
        <NavLink 
          to={`/${business.city.toLowerCase()}/${business.slug}`}
          className="text-civic-blue hover:text-civic-blue-600 text-sm font-medium flex items-center transition-colors"
        >
          View audit <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NavLink>
      </div>
    </div>
  );
};

export default AuditCard;
