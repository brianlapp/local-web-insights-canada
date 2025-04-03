
export interface Auditor {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  location: string;
  avatar: string;
  email: string;
  phone?: string;
  website?: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  specialties: string[];
  hasCalendly: boolean;
  calendlyUrl?: string;
}

export const auditors: Auditor[] = [
  {
    id: "1",
    name: "Brian Lapp",
    slug: "brian-lapp",
    title: "Web Accessibility Specialist",
    bio: "Brian is a seasoned web developer and accessibility advocate with over 10 years of experience in creating inclusive digital experiences. He specializes in helping local businesses make their websites more accessible and user-friendly.",
    location: "Ottawa, Ontario",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    email: "brian@localwebsiteaudit.ca",
    phone: "+1 (613) 555-1234",
    website: "https://brianlapp.example.com",
    social: {
      twitter: "https://twitter.com/brianlapp",
      linkedin: "https://linkedin.com/in/brianlapp",
      github: "https://github.com/brianlapp"
    },
    specialties: ["Accessibility", "SEO", "User Experience", "Performance Optimization"],
    hasCalendly: true,
    calendlyUrl: "https://calendly.com/brianlapp"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    slug: "sarah-johnson",
    title: "SEO & Content Strategist",
    bio: "Sarah helps local businesses improve their online visibility through strategic SEO and content planning. With a background in digital marketing, she provides practical solutions that drive real results for small businesses.",
    location: "Ottawa, Ontario",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    email: "sarah@localwebsiteaudit.ca",
    social: {
      twitter: "https://twitter.com/sarahjohnson",
      linkedin: "https://linkedin.com/in/sarahjohnson"
    },
    specialties: ["SEO", "Content Strategy", "Local Business Marketing", "Analytics"],
    hasCalendly: false
  }
];

export const getAuditorBySlug = (slug: string): Auditor | undefined => {
  return auditors.find(auditor => auditor.slug === slug);
};

export const getAuditorById = (id: string): Auditor | undefined => {
  return auditors.find(auditor => auditor.id === id);
};
