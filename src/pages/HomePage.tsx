
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Search, BarChart, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuditCard from '@/components/ui/AuditCard';
import PageLayout from '@/components/layout/PageLayout';
import { getRecentBusinesses } from '@/data/businesses';

const HomePage = () => {
  const recentAudits = getRecentBusinesses(6);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-civic-blue-600 to-civic-blue py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            We help communities improve local websites
          </h1>
          <p className="text-xl text-civic-blue-50 mb-8 max-w-2xl mx-auto">
            Providing website audits, community feedback, and resources to help local businesses succeed online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-civic-blue hover:bg-civic-blue-50 text-lg py-6 px-8">
              Find Local Audits
            </Button>
            <Button className="bg-civic-green hover:bg-civic-green-600 text-white text-lg py-6 px-8">
              Request an Audit
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-civic-gray-900 text-center mb-12">
            Free Tools for Better Websites
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-civic-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-civic-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Checker</h3>
              <p className="text-civic-gray-600 mb-4">
                Analyze your website's search engine optimization and get actionable recommendations.
              </p>
              <Button variant="outline" className="border-civic-blue text-civic-blue hover:bg-civic-blue-50">
                Coming Soon
              </Button>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-civic-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-civic-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Analyzer</h3>
              <p className="text-civic-gray-600 mb-4">
                Test your website's speed and performance to ensure visitors have a smooth experience.
              </p>
              <Button variant="outline" className="border-civic-blue text-civic-blue hover:bg-civic-blue-50">
                Coming Soon
              </Button>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-civic-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-civic-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accessibility Checker</h3>
              <p className="text-civic-gray-600 mb-4">
                Ensure your website is accessible to all users, including those with disabilities.
              </p>
              <Button variant="outline" className="border-civic-blue text-civic-blue hover:bg-civic-blue-50">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Audits Section */}
      <section className="section bg-civic-gray-50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-civic-gray-900 mb-4 md:mb-0">
              Latest Audit Highlights
            </h2>
            <NavLink to="/audits" className="text-civic-blue hover:text-civic-blue-600 font-medium flex items-center">
              View all audits <ChevronRight className="ml-1 w-5 h-5" />
            </NavLink>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAudits.map((business) => (
              <AuditCard key={business.id} business={{
                name: business.name,
                city: business.city,
                slug: business.slug,
                category: business.category,
                image: business.image,
                score: business.scores.overall,
                isUpgraded: business.isUpgraded
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-civic-blue-600 text-white">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Help improve the web presence of your community
          </h2>
          <p className="text-civic-blue-50 mb-8 max-w-2xl mx-auto">
            Join our initiative to upgrade local business websites and strengthen your community's digital foundation.
          </p>
          <Button className="bg-white text-civic-blue hover:bg-civic-blue-50">
            Get Involved
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default HomePage;
