import { 
  getBusinessBySlug, 
  getBusinessesByCity, 
  getRecentBusinesses, 
  getUpgradedBusinesses 
} from '@/services/businessService';

export interface Business {
  id: string;
  name: string;
  city: string;
  slug: string;
  category: string;
  description: string;
  website: string;
  address: string;
  image: string;
  mobileScreenshot: string;
  desktopScreenshot: string;
  scores: {
    seo: number;
    performance: number;
    accessibility: number;
    design: number;
    overall: number;
  };
  suggestedImprovements: string[];
  isUpgraded: boolean;
  auditorId: string;
  auditDate: string;
}

export { 
  getBusinessBySlug,
  getBusinessesByCity,
  getRecentBusinesses,
  getUpgradedBusinesses
};
