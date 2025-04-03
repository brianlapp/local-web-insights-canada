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

export const businesses: Business[] = [
  {
    id: "1",
    name: "Mario's Pizza",
    city: "Ottawa",
    slug: "marios-pizza",
    category: "Restaurant",
    description: "Family-owned authentic Italian pizzeria serving Ottawa since 1985.",
    website: "https://mariospizza.example.com",
    address: "123 Bank Street, Ottawa, ON",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    mobileScreenshot: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    desktopScreenshot: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    scores: {
      seo: 45,
      performance: 32,
      accessibility: 28,
      design: 40,
      overall: 36
    },
    suggestedImprovements: [
      "Add proper meta descriptions and title tags",
      "Optimize images to improve loading speed",
      "Improve mobile responsiveness",
      "Add alt text to all images for accessibility",
      "Implement proper heading structure"
    ],
    isUpgraded: false,
    auditorId: "1",
    auditDate: "2024-03-15"
  },
  {
    id: "2",
    name: "Jane's Florist",
    city: "Ottawa",
    slug: "janes-florist",
    category: "Retail",
    description: "Boutique florist specializing in custom arrangements for all occasions.",
    website: "https://janesflorist.example.com",
    address: "456 Elgin Street, Ottawa, ON",
    image: "https://images.unsplash.com/photo-1467533003447-e295ff1b0435?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    mobileScreenshot: "https://images.unsplash.com/photo-1467533003447-e295ff1b0435?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    desktopScreenshot: "https://images.unsplash.com/photo-1467533003447-e295ff1b0435?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    scores: {
      seo: 70,
      performance: 65,
      accessibility: 75,
      design: 82,
      overall: 73
    },
    suggestedImprovements: [
      "Add structured data for local business",
      "Implement a contact form that works properly",
      "Add customer testimonials",
      "Improve site navigation",
      "Enhance product gallery with zoom functionality"
    ],
    isUpgraded: true,
    auditorId: "1",
    auditDate: "2024-03-20"
  },
  {
    id: "3",
    name: "Riverside Cafe",
    city: "Ottawa",
    slug: "riverside-cafe",
    category: "Cafe",
    description: "Cozy cafe overlooking the Rideau Canal with locally-sourced ingredients.",
    website: "https://riversidecafe.example.com",
    address: "789 Queen Elizabeth Drive, Ottawa, ON",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    mobileScreenshot: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    desktopScreenshot: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    scores: {
      seo: 55,
      performance: 48,
      accessibility: 40,
      design: 60,
      overall: 51
    },
    suggestedImprovements: [
      "Update menu page with current offerings",
      "Add online ordering functionality",
      "Optimize website for mobile devices",
      "Improve page load speed",
      "Add alt text to menu images"
    ],
    isUpgraded: false,
    auditorId: "2",
    auditDate: "2024-02-28"
  },
  {
    id: "4",
    name: "Oakwood Hardware",
    city: "Ottawa",
    slug: "oakwood-hardware",
    category: "Retail",
    description: "Family-run hardware store serving the community for over 40 years.",
    website: "https://oakwoodhardware.example.com",
    address: "101 Wellington Street, Ottawa, ON",
    image: "https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    mobileScreenshot: "https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    desktopScreenshot: "https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    scores: {
      seo: 35,
      performance: 42,
      accessibility: 30,
      design: 25,
      overall: 33
    },
    suggestedImprovements: [
      "Create a modern responsive design",
      "Add product categories and search functionality",
      "Implement proper SEO meta tags",
      "Add business hours and contact information",
      "Create a Google Business Profile and link it to the website"
    ],
    isUpgraded: false,
    auditorId: "2",
    auditDate: "2024-03-05"
  }
];

export const getBusinessBySlug = (city: string, slug: string): Business | undefined => {
  return businesses.find(
    business => business.city.toLowerCase() === city.toLowerCase() && business.slug === slug
  );
};

export const getBusinessesByCity = (city: string): Business[] => {
  return businesses.filter(
    business => business.city.toLowerCase() === city.toLowerCase()
  );
};

export const getRecentBusinesses = (limit: number = 6): Business[] => {
  return [...businesses]
    .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime())
    .slice(0, limit);
};

export const getUpgradedBusinesses = (limit: number = 6): Business[] => {
  return businesses
    .filter(business => business.isUpgraded)
    .slice(0, limit);
};
