
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedServices from '@/components/home/FeaturedServices';

const Index: React.FC = () => {
  return (
    <div>
      <HeroSection
        title="Welcome to LuxMe Nails & Spa"
        subtitle="Discover Luxury, Embrace Beauty"
        ctaText="Book Now"
        ctaLink="/book"
        backgroundImage="/images/hero-background.jpg"
      />
      <FeaturedServices />
    </div>
  );
};

export default Index;
