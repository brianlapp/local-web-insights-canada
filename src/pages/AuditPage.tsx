
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Calendar, Check, AlertTriangle, ExternalLink, ArrowLeft, Search, BarChart, Code, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ScoreCard from '@/components/ui/ScoreCard';
import CommentForm from '@/components/ui/CommentForm';
import PetitionForm from '@/components/ui/PetitionForm';
import PageLayout from '@/components/layout/PageLayout';
import { getBusinessBySlug, getAuditorById, type Business } from '@/data';

export function AuditPage() {
  const { city, slug } = useParams<{ city: string; slug: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [auditor, setAuditor] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!city || !slug) return;
      
      try {
        setIsLoading(true);
        const businessData = await getBusinessBySlug(city, slug);
        setBusiness(businessData);
        
        if (businessData?.auditorId) {
          const auditorData = getAuditorById(businessData.auditorId);
          setAuditor(auditorData);
        }
      } catch (err) {
        console.error("Failed to load business data:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [city, slug]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Loading audit data...</h1>
        </div>
      </PageLayout>
    );
  }

  if (error || !business) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Audit Not Found</h1>
          <p className="mb-8">The audit you're looking for doesn't exist or may have been moved.</p>
          <Button onClick={() => navigate('/')} className="bg-civic-blue text-white">
            Return to Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-civic-blue-600 py-6 text-white">
        <div className="container">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-civic-blue-100 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-civic-blue-100">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" /> {business.address}
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" /> 
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" /> Audited on {new Date(business.auditDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {business.isUpgraded ? (
              <Badge className="bg-civic-green hover:bg-civic-green text-white text-sm px-3 py-1">
                <Check className="w-4 h-4 mr-1" /> Upgraded
              </Badge>
            ) : (
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-sm px-3 py-1">
                <AlertTriangle className="w-4 h-4 mr-1" /> Needs Improvement
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Website Overview</h2>
              <p className="text-civic-gray-700 mb-6">{business.description}</p>
              
              <h3 className="text-lg font-medium mb-3">Website Screenshots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-civic-gray-500 mb-2">Desktop View</p>
                  <img 
                    src={business.desktopScreenshot} 
                    alt={`${business.name} website on desktop`}
                    className="w-full rounded-md border border-civic-gray-200"
                  />
                </div>
                <div>
                  <p className="text-sm text-civic-gray-500 mb-2">Mobile View</p>
                  <img 
                    src={business.mobileScreenshot} 
                    alt={`${business.name} website on mobile`}
                    className="w-full rounded-md border border-civic-gray-200"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Website Scores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <ScoreCard 
                  label="SEO" 
                  score={business.scores.seo} 
                  icon={<Search className="w-5 h-5" />}
                  description="Search engine optimization score"
                />
                <ScoreCard 
                  label="Performance" 
                  score={business.scores.performance} 
                  icon={<BarChart className="w-5 h-5" />}
                  description="Website loading speed and performance"
                />
                <ScoreCard 
                  label="Accessibility" 
                  score={business.scores.accessibility} 
                  icon={<Code className="w-5 h-5" />}
                  description="Compliance with accessibility standards"
                />
                <ScoreCard 
                  label="Design" 
                  score={business.scores.design} 
                  icon={<Palette className="w-5 h-5" />}
                  description="Visual design and user experience"
                />
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Suggested Improvements</h3>
                <ul className="list-disc pl-5 space-y-2 text-civic-gray-700">
                  {business.suggestedImprovements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">About the Auditor</h3>
                {auditor ? (
                  <div className="flex items-center">
                    <img 
                      src={auditor.avatar} 
                      alt={auditor.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-medium">{auditor.name}</p>
                      <p className="text-sm text-civic-gray-500">{auditor.title}</p>
                      <a 
                        href={`/auditor/${auditor.slug}`}
                        className="text-sm text-civic-blue hover:text-civic-blue-600 flex items-center mt-1"
                      >
                        View profile <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-civic-gray-500">Auditor information not available</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <Tabs defaultValue="petition">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="petition">Sign Petition</TabsTrigger>
                  <TabsTrigger value="comments">Community Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="petition">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">Help Improve This Website</h3>
                    <p className="text-civic-gray-600">
                      Show your support for helping {business.name} improve their web presence. 
                      Your signature can make a difference in encouraging local businesses to enhance their online experience.
                    </p>
                  </div>
                  <PetitionForm businessId={business.id} businessName={business.name} />
                </TabsContent>
                <TabsContent value="comments">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">Community Feedback</h3>
                    <p className="text-civic-gray-600">
                      Share your thoughts about {business.name}'s website. Your constructive feedback can help them improve.
                    </p>
                  </div>
                  <CommentForm businessId={business.id} businessName={business.name} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Overall Score</h3>
              <div className="flex items-center justify-center py-4">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                  business.scores.overall >= 80 ? 'border-civic-green text-civic-green' : 
                  business.scores.overall >= 50 ? 'border-amber-500 text-amber-500' : 
                  'border-civic-red text-civic-red'
                }`}>
                  <span className="text-4xl font-bold">{business.scores.overall}</span>
                </div>
              </div>
              <p className="text-center text-civic-gray-600 mt-2">
                {business.scores.overall >= 80 ? 'Excellent' : 
                business.scores.overall >= 50 ? 'Needs Some Improvement' : 
                'Needs Significant Improvement'}
              </p>
            </div>
            
            <div className="bg-civic-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Take Action</h3>
              
              <div className="space-y-4">
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary w-full justify-center flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Visit Website
                </a>
                
                <Button className="w-full bg-civic-green hover:bg-civic-green-600 text-white">
                  Request an Audit
                </Button>
                
                <Button variant="outline" className="w-full border-civic-blue text-civic-blue hover:bg-civic-blue-50">
                  Share This Audit
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-sm text-civic-gray-600">
                <p className="mb-2">
                  <strong>Category:</strong> {business.category}
                </p>
                <p className="mb-2">
                  <strong>Audit Date:</strong> {new Date(business.auditDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {business.isUpgraded ? 'Upgraded' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default AuditPage;
