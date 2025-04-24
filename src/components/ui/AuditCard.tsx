
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Star, ArrowRight, Activity } from 'lucide-react';

interface AuditCardProps {
  business: {
    name: string;
    city: string;
    slug: string;
    category: string;
    image: string;
    scores: {
      overall: number;
      performance?: number;
      seo?: number;
      accessibility?: number;
      bestPractices?: number;
    };
    is_upgraded: boolean;
    audit_date?: string;
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

  // Ensure we have a valid overall score
  const overallScore = business.scores?.overall || 0;
  
  // Format audit date if available
  const formattedDate = business.audit_date 
    ? new Date(business.audit_date).toLocaleDateString() 
    : 'Not audited yet';
  
  console.log(`Rendering AuditCard for ${business.name} with score: ${overallScore}`);

  // Get the performance score if available for secondary display
  const performanceScore = business.scores?.performance || 0;

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
          <Star className={`w-5 h-5 ${overallScore >= 80 ? 'text-civic-green' : overallScore >= 50 ? 'text-amber-500' : 'text-civic-red'}`} />
          <span className="ml-1 text-sm font-medium">{overallScore}/100</span>
          
          {performanceScore > 0 && (
            <div className="ml-3 flex items-center">
              <Activity className={`w-4 h-4 ${performanceScore >= 80 ? 'text-civic-green' : performanceScore >= 50 ? 'text-amber-500' : 'text-civic-red'}`} />
              <span className="ml-1 text-xs">{performanceScore}</span>
            </div>
          )}
        </div>
        
        <NavLink 
          to={`/${business.city?.toLowerCase()}/${business.slug}`}
          className="text-civic-blue hover:text-civic-blue-600 text-sm font-medium flex items-center transition-colors"
        >
          View audit <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NavLink>
      </div>
      
      <div className="text-xs text-gray-500">
        Last Updated: {formattedDate}
      </div>
    </div>
  );
};

export default AuditCard;
