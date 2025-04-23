
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

interface AuditCardProps {
  business: {
    name: string;
    city: string;
    slug: string;
    category: string;
    image: string;
    scores: {
      overall: number;
    };
    is_upgraded: boolean;
  };
}

const AuditCard: React.FC<AuditCardProps> = ({ business }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError || !business.image) {
      if (business.category === "Retail") {
        return "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
      } else if (business.category === "Hardware") {
        return "https://images.unsplash.com/photo-1591006698886-58236a3590b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
      } else if (business.category === "Garden") {
        return "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
      }
      return "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
    }
    return business.image;
  };

  return (
    <div className="card group hover:shadow-md transition-shadow border border-gray-100 rounded-lg p-4">
      <div className="relative mb-4">
        <img 
          src={getImageSrc()} 
          alt={`Screenshot of ${business.name}'s website`}
          className="w-full h-40 object-cover rounded-md"
          onError={handleImageError}
        />
        {business.is_upgraded && (
          <span className="absolute top-2 right-2 bg-civic-green text-white text-xs px-2 py-1 rounded-full">
            Upgraded
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-1 text-civic-gray-900">{business.name}</h3>
      <p className="text-civic-gray-500 text-sm mb-3">{business.city} · {business.category}</p>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Star className={`w-5 h-5 ${business.scores?.overall >= 80 ? 'text-civic-green' : business.scores?.overall >= 50 ? 'text-amber-500' : 'text-civic-red'}`} />
          <span className="ml-1 text-sm font-medium">{business.scores?.overall || 0}/100</span>
        </div>
        <NavLink 
          to={`/${business.city?.toLowerCase()}/${business.slug}`}
          className="text-civic-blue hover:text-civic-blue-600 text-sm font-medium flex items-center transition-colors"
        >
          View audit <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NavLink>
      </div>
    </div>
  );
};

export default AuditCard;
