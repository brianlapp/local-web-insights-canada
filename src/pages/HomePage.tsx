import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Search, BarChart, Code, Users, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuditCard from '@/components/ui/AuditCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HomePage = () => {
  // Fetch total number of businesses
  const { data: businessCount } = useQuery({
    queryKey: ['total-businesses'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch unique cities count
  const { data: citiesCount } = useQuery({
    queryKey: ['cities-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('city');
      
      if (error) throw error;
      const uniqueCities = new Set(data?.map(b => b.city?.toLowerCase()).filter(Boolean));
      return uniqueCities.size;
    }
  });

  // Fetch average score
  const { data: averageScore } = useQuery({
    queryKey: ['average-score'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('scores');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const scores = data
        .map(b => b.scores?.overall || 0)
        .filter(score => score > 0);
      
      if (scores.length === 0) return 0;
      
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  });

  // Fetch recent businesses
  const { data: recentAudits } = useQuery({
    queryKey: ['recent-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center py-24 md:py-32" style={{
        backgroundImage: 'url("/lovable-uploads/bddb191c-4706-40b6-a8b3-e83ca94b3816.png")'
      }}>
        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-civic-blue-600/80 to-civic-blue/80"></div>
        <div className="container relative z-10 text-center">
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

      {/* Community Metrics Section */}
      <section className="bg-civic-blue-50 py-2">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-civic-blue mb-2">
                {businessCount || '0'}+
              </p>
              <p className="text-civic-gray-600">Businesses Helped</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-civic-blue mb-2">
                {citiesCount || '0'}
              </p>
              <p className="text-civic-gray-600">Communities Served</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-civic-blue mb-2">
                {averageScore || '0'}%
              </p>
              <p className="text-civic-gray-600">Implementation Rate</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-civic-blue mb-2">
                {Math.ceil((businessCount || 0) / 10)}
              </p>
              <p className="text-civic-gray-600">Volunteer Auditors</p>
            </div>
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
            {recentAudits?.map(business => (
              <AuditCard 
                key={business.id} 
                business={{
                  name: business.name,
                  city: business.city,
                  slug: business.slug,
                  category: business.category,
                  image: business.image,
                  score: business.scores?.overall || 0,
                  isUpgraded: business.is_upgraded
                }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-civic-gray-900 text-center mb-8">
            Community Impact
          </h2>
          <p className="text-center text-civic-gray-600 max-w-2xl mx-auto mb-12">
            Hear from local business owners and community volunteers who are part of our initiative
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" alt="Maria Garcia" className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <h3 className="font-semibold text-civic-gray-900">Maria Garcia</h3>
                  <p className="text-sm text-civic-gray-500">Riverside Café Owner</p>
                </div>
              </div>
              <p className="text-civic-gray-600 mb-4">
                "The audit highlighted issues I never knew existed on my website. After implementing the changes, we've seen a 30% increase in online orders. The community support has been amazing!"
              </p>
              <div className="flex text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" alt="James Wilson" className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <h3 className="font-semibold text-civic-gray-900">James Wilson</h3>
                  <p className="text-sm text-civic-gray-500">Volunteer Auditor</p>
                </div>
              </div>
              <p className="text-civic-gray-600 mb-4">
                "Being able to use my web development skills to help small businesses in Ottawa has been incredibly rewarding. Seeing the impact of our work on the community makes it all worthwhile."
              </p>
              <div className="flex text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" alt="Michael Lee" className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <h3 className="font-semibold text-civic-gray-900">Michael Lee</h3>
                  <p className="text-sm text-civic-gray-500">Oakwood Hardware Owner</p>
                </div>
              </div>
              <p className="text-civic-gray-600 mb-4">
                "Our website was outdated and barely functional. The audit revealed critical issues we needed to fix. Now we have a modern site that actually brings in customers instead of turning them away."
              </p>
              <div className="flex text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Website Transformations Section */}
      <section className="section bg-civic-gray-50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-civic-gray-900 text-center mb-8">
            Website Transformations
          </h2>
          <p className="text-center text-civic-gray-600 max-w-2xl mx-auto mb-12">
            See the impact of our community-driven website improvements through these before and after examples
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-xl font-semibold text-civic-gray-900 mb-2">Jane's Florist</h3>
              <p className="text-civic-gray-600 mb-4">
                The upgraded website led to a 45% increase in online inquiries and improved mobile conversion rates.
              </p>
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center bg-civic-green-50 px-3 py-1 rounded-full">
                  <Award className="text-civic-green w-4 h-4 mr-1" />
                  <span className="text-sm text-civic-green-600">73/100 Score</span>
                </div>
                <span className="text-civic-gray-400">•</span>
                <span className="text-civic-gray-600 text-sm">Ottawa</span>
              </div>
              <Button className="bg-civic-blue text-white hover:bg-civic-blue-600">
                View Full Audit
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1467533003447-e295ff1b0435?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Jane's Florist Website - After" className="rounded-md shadow-md w-full" />
                <div className="absolute top-3 right-3 bg-civic-green text-white text-xs px-2 py-1 rounded-full">
                  After
                </div>
              </div>
              <div className="relative opacity-70">
                <img src="https://images.unsplash.com/photo-1511184118505-2d5cf3f86dc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Jane's Florist Website - Before" className="rounded-md border border-civic-gray-300 w-full" />
                <div className="absolute top-3 right-3 bg-civic-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  Before
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <NavLink to="/audits" className="text-civic-blue hover:text-civic-blue-600 font-medium inline-flex items-center">
              See more transformations <ChevronRight className="ml-1 w-5 h-5" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative bg-cover bg-center py-16 md:py-24" style={{
        backgroundImage: 'url("/lovable-uploads/bddb191c-4706-40b6-a8b3-e83ca94b3816.png")'
      }}>
        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-civic-blue-600/90 to-civic-blue/90"></div>
        <div className="container relative z-10 text-white">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Help improve the web presence of your community
            </h2>
            <p className="text-civic-blue-50 mb-8">
              Join our initiative to upgrade local business websites and strengthen your community's digital foundation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-civic-blue-500/80 backdrop-blur-sm p-6 rounded-lg text-center shadow-lg">
              <div className="w-12 h-12 bg-civic-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Volunteer</h3>
              <p className="text-civic-blue-50 text-sm mb-4">
                Contribute your skills to help local businesses improve their online presence.
              </p>
              <Button className="bg-white text-civic-blue hover:bg-civic-blue-50 w-full">
                Join as Volunteer
              </Button>
            </div>
            
            <div className="bg-civic-blue-500/80 backdrop-blur-sm p-6 rounded-lg text-center shadow-lg">
              <div className="w-12 h-12 bg-civic-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Spread the Word</h3>
              <p className="text-civic-blue-50 text-sm mb-4">
                Share our initiative with local business owners who could benefit from our services.
              </p>
              <Button className="bg-white text-civic-blue hover:bg-civic-blue-50 w-full">
                Share Resources
              </Button>
            </div>
            
            <div className="bg-civic-blue-500/80 backdrop-blur-sm p-6 rounded-lg text-center shadow-lg">
              <div className="w-12 h-12 bg-civic-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sponsor a Business</h3>
              <p className="text-civic-blue-50 text-sm mb-4">
                Help fund website improvements for businesses that need financial assistance.
              </p>
              <Button className="bg-white text-civic-blue hover:bg-civic-blue-50 w-full">
                Learn About Sponsorship
              </Button>
            </div>
          </div>
          
          <div className="max-w-xl mx-auto">
            <div className="bg-civic-blue-500/60 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-center">Stay Connected</h3>
              <p className="text-civic-blue-50 text-sm text-center mb-4">
                Subscribe to our newsletter for community updates, success stories, and volunteer opportunities
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 rounded-md text-civic-gray-900 focus:outline-none focus:ring-2 focus:ring-civic-green" />
                <Button className="bg-civic-green hover:bg-civic-green-600 text-white whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SVG Wave Decoration */}
      <div className="relative h-24 mt-16 overflow-hidden">
        <svg className="absolute bottom-0 w-full h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#f3f4f6" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,197.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>
    </>
  );
};

export default HomePage;
