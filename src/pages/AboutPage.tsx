
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Users, Award, CheckCircle, Globe, Map } from 'lucide-react';

const AboutPage = () => {
  return (
    <PageLayout>
      <div className="container py-8 md:py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-civic-blue">
              About LocalWebsiteAudit.ca
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-civic-gray-600">
                Welcome to LocalWebsiteAudit.ca, a community-focused initiative dedicated to helping small businesses 
                across Canada improve their online presence. We provide neutral, third-party audits and reviews 
                of local business websites, starting right here in Ottawa.
              </p>
            </div>
            <div className="flex justify-center py-4">
              <div className="w-24 h-1 bg-civic-green rounded-full"></div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="bg-civic-gray-100 rounded-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:w-1/4 flex justify-center">
                <div className="bg-white p-5 rounded-full shadow-md">
                  <Award size={64} className="text-civic-blue" />
                </div>
              </div>
              <div className="md:w-3/4">
                <h2 className="text-2xl md:text-3xl font-bold text-civic-blue mb-4">Our Mission</h2>
                <p className="text-civic-gray-600">
                  Our goal is simple: to offer transparent, constructive, and data-driven feedback to empower local 
                  businesses. We believe a strong online presence is crucial for success, and we're here to provide 
                  the insights and tools needed to achieve that. We aim to build a trustworthy resource for both 
                  businesses and the community.
                </p>
              </div>
            </div>
          </section>

          {/* What We Do Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-civic-blue mb-6 text-center">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-t-4 border-t-civic-blue">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-civic-blue/10 p-3 rounded-full">
                      <Globe className="text-civic-blue h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Website Audits</h3>
                      <p className="text-civic-gray-600">
                        We evaluate local business websites, providing scores and specific suggestions for improvement 
                        across areas like SEO, mobile-friendliness, and user design. Each business receives its own 
                        dedicated audit page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-civic-green">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-civic-green/10 p-3 rounded-full">
                      <Users className="text-civic-green h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Community Input</h3>
                      <p className="text-civic-gray-600">
                        We believe in the power of community feedback. Our platform allows community members to share 
                        their thoughts and even signal their desire for businesses to modernize their websites.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-civic-blue">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-civic-blue/10 p-3 rounded-full">
                      <CheckCircle className="text-civic-blue h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Free Tools</h3>
                      <p className="text-civic-gray-600">
                        To provide lasting value, we offer a suite of free tools designed specifically for small 
                        businesses, including a Website Speed Tester, Mobile Friendliness Checker, and more. 
                        These tools are easy to use and require no signup.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-civic-green">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-civic-green/10 p-3 rounded-full">
                      <Map className="text-civic-green h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Local Focus</h3>
                      <p className="text-civic-gray-600">
                        As a proud Canadian platform (.ca), we understand the local landscape. Our audits are conducted 
                        by local auditors, like Brian Lapp in Ottawa, who are familiar with the specific needs of the community.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="bg-gradient-to-r from-civic-blue/5 to-civic-green/5 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-civic-blue mb-6 text-center">Why Choose Us?</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-civic-gray-600 text-center">
                LocalWebsiteAudit.ca is designed to be a helpful, civic-minded resource. We provide genuinely useful 
                insights presented in a clear, actionable format. Whether you're a business owner looking to improve 
                or a community member wanting to support local establishments, we offer a transparent platform for 
                evaluation and positive change.
              </p>
            </div>
          </section>

          {/* Get Involved Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-civic-blue mb-6 text-center">Get Involved</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 border-b md:border-b-0 md:border-r border-civic-gray-200">
                  <h3 className="font-bold text-xl mb-3 text-civic-blue">Business Owners</h3>
                  <p className="text-civic-gray-600 mb-4">
                    See how your website performs. Contact our local auditor to respond to your audit or discuss improvements.
                  </p>
                  <a href="#" className="btn-primary inline-block">Request an Audit</a>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-civic-blue">Community Members</h3>
                  <p className="text-civic-gray-600 mb-4">
                    Browse audits, share your feedback, and use our free tools.
                  </p>
                  <a href="#" className="btn-secondary inline-block">Browse Audits</a>
                </div>
              </div>
            </div>
            <div className="text-center mt-6 text-civic-gray-600">
              <p>We are committed to fostering a stronger online community for Canadian small businesses, one audit at a time.</p>
            </div>
          </section>

          {/* SVG Wave Decoration */}
          <div className="relative h-24 mt-16 overflow-hidden">
            <svg className="absolute bottom-0 w-full h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="#f3f4f6" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,197.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
