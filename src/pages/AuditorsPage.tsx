
import React from 'react';
import { Award, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuditorsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Hero Section */}
      <div className="bg-civic-blue-600 text-white">
        <div className="container py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Auditors</h1>
          <p className="text-lg md:text-xl text-civic-blue-100 max-w-2xl">
            Local specialists who understand your business needs and community context.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Auditors Cards */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                  alt="Brian Lapp"
                  className="w-24 h-24 rounded-full object-cover border-2 border-civic-blue"
                />
                <div>
                  <CardTitle className="text-xl font-bold">Brian Lapp</CardTitle>
                  <CardDescription className="text-civic-gray-600">
                    <Badge className="bg-civic-blue mb-2">Ottawa</Badge> Local Website Auditor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-700 mb-4">
                "I work with small businesses in Ottawa to evaluate and improve their online presence with constructive, data-driven feedback."
              </p>
              <div className="flex items-center text-civic-gray-600 mb-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                <a href="mailto:brian@localwebsiteaudit.ca" className="hover:text-civic-blue transition-colors">
                  brian@localwebsiteaudit.ca
                </a>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-civic-blue text-civic-blue hover:bg-civic-blue hover:text-white"
                onClick={() => navigate('/auditor/brian-lapp')}
              >
                View Profile
              </Button>
              <Button 
                className="w-full sm:w-auto bg-civic-blue text-white hover:bg-civic-blue-600"
                onClick={() => navigate('/contact?auditor=brian-lapp')}
              >
                Contact
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                  alt="Cory Arsic"
                  className="w-24 h-24 rounded-full object-cover border-2 border-civic-blue"
                />
                <div>
                  <CardTitle className="text-xl font-bold">Cory Arsic</CardTitle>
                  <CardDescription className="text-civic-gray-600">
                    <Badge className="bg-civic-blue mb-2">Guelph</Badge> Local Website Auditor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-700 mb-4">
                "Helping Guelph businesses take control of their digital image through transparent, local-first web audits."
              </p>
              <div className="flex items-center text-civic-gray-600 mb-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                <a href="mailto:cory@localwebsiteaudit.ca" className="hover:text-civic-blue transition-colors">
                  cory@localwebsiteaudit.ca
                </a>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-civic-blue text-civic-blue hover:bg-civic-blue hover:text-white"
                onClick={() => navigate('/auditor/cory-arsic')}
              >
                View Profile
              </Button>
              <Button 
                className="w-full sm:w-auto bg-civic-blue text-white hover:bg-civic-blue-600"
                onClick={() => navigate('/contact?auditor=cory-arsic')}
              >
                Contact
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Our Approach Section */}
        <div className="mt-12 md:mt-16 bg-civic-gray-50 rounded-xl p-6 md:p-8">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-civic-blue mr-3" />
            <h2 className="text-2xl font-bold">Our Approach</h2>
          </div>
          
          <p className="text-civic-gray-700 mb-6">
            We are committed to expanding our team with local auditors in more Canadian cities. 
            Each auditor works to build trust within their community and provide valuable, 
            location-specific insights to help businesses improve their digital footprint.
          </p>
          
          <div className="bg-white p-5 rounded-lg border border-civic-gray-200 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-medium text-lg mb-1">Want to get in touch with your local auditor?</h3>
              <p className="text-civic-gray-600">Use the contact information provided above.</p>
            </div>
            <div className="flex gap-3">
              <Button 
                className="bg-civic-blue text-white hover:bg-civic-blue-600"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
        
        {/* Join Our Team CTA */}
        <div className="mt-12 md:mt-16 relative rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-civic-blue-600 to-civic-blue-800 p-8 md:p-10 text-white">
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <Award className="w-8 h-8 text-civic-blue-100 mr-3" />
                <h2 className="text-2xl font-bold">Join Our Team</h2>
              </div>
              <p className="text-civic-blue-100 mb-6 max-w-2xl">
                Are you passionate about helping local businesses improve their online presence? 
                We're looking for auditors in more Canadian cities to join our team.
              </p>
              <Button 
                className="bg-white text-civic-blue hover:bg-civic-blue-50"
                onClick={() => navigate('/join-team')}
              >
                Learn More
              </Button>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 opacity-10">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90.2,-16.3,88.1,-1.2C86,13.9,79,27.8,70.8,41.7C62.5,55.7,53,69.6,39.7,77.4C26.4,85.3,9.2,87,-8.6,87.5C-26.4,88,-52.8,87.3,-66.6,75.3C-80.4,63.4,-81.7,40.2,-83.3,19.7C-84.9,-0.8,-86.8,-19.6,-80.3,-35.1C-73.7,-50.7,-58.7,-63,-43,-71.9C-27.2,-80.7,-10.9,-86.1,3.2,-91.5C17.3,-96.9,30.5,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditorsPage;
