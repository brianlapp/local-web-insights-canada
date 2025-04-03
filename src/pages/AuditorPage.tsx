
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone, Globe, Calendar, Check, Twitter, Linkedin, Github, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ContactForm from '@/components/ui/ContactForm';
import PageLayout from '@/components/layout/PageLayout';
import { getAuditorBySlug, getBusinessesByAuditor } from '@/data';

const AuditorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const auditor = slug ? getAuditorBySlug(slug) : undefined;
  const auditorAudits = auditor ? getBusinessesByAuditor(auditor.id) : [];
  
  if (!auditor) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Auditor Not Found</h1>
          <p className="mb-8">The auditor profile you're looking for doesn't exist or may have been moved.</p>
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
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              src={auditor.avatar} 
              alt={auditor.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-sm"
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">{auditor.name}</h1>
              <p className="text-xl text-civic-blue-100 mb-3">{auditor.title}</p>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> 
                <span className="text-civic-blue-100">{auditor.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-civic-gray-700 whitespace-pre-line mb-6">{auditor.bio}</p>
              
              <h3 className="text-lg font-medium mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {auditor.specialties.map((specialty, index) => (
                  <Badge key={index} className="bg-civic-blue-50 text-civic-blue hover:bg-civic-blue-100">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              {auditorAudits.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Recent Audits</h3>
                  <div className="space-y-4">
                    {auditorAudits.map((audit) => (
                      <div key={audit.id} className="flex items-start bg-civic-gray-50 rounded-lg p-4">
                        <div className="mr-4">
                          <img 
                            src={audit.image} 
                            alt={audit.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{audit.name}</h4>
                            {audit.isUpgraded ? (
                              <Badge className="bg-civic-green text-white">
                                <Check className="w-3 h-3 mr-1" /> Upgraded
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-civic-gray-500">{audit.city} · {audit.category}</p>
                          <p className="text-sm text-civic-gray-600 mt-1">
                            Audited on {new Date(audit.auditDate).toLocaleDateString()}
                          </p>
                          <a 
                            href={`/${audit.city.toLowerCase()}/${audit.slug}`}
                            className="text-sm text-civic-blue hover:text-civic-blue-600 mt-2 inline-block"
                          >
                            View audit
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Contact {auditor.name}</h2>
              <ContactForm recipientName={auditor.name} recipientId={auditor.id} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-civic-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-civic-gray-500">Email</p>
                    <a href={`mailto:${auditor.email}`} className="text-civic-blue hover:text-civic-blue-600">
                      {auditor.email}
                    </a>
                  </div>
                </div>
                
                {auditor.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-civic-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-civic-gray-500">Phone</p>
                      <a href={`tel:${auditor.phone}`} className="text-civic-gray-900 hover:text-civic-blue">
                        {auditor.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {auditor.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-civic-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-civic-gray-500">Website</p>
                      <a href={auditor.website} target="_blank" rel="noopener noreferrer" className="text-civic-blue hover:text-civic-blue-600">
                        {auditor.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-4">Social Profiles</h3>
              <div className="space-y-4">
                {auditor.social.twitter && (
                  <a 
                    href={auditor.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-civic-gray-900 hover:text-civic-blue"
                  >
                    <Twitter className="w-5 h-5 text-civic-gray-500 mr-3" /> Twitter
                  </a>
                )}
                
                {auditor.social.linkedin && (
                  <a 
                    href={auditor.social.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-civic-gray-900 hover:text-civic-blue"
                  >
                    <Linkedin className="w-5 h-5 text-civic-gray-500 mr-3" /> LinkedIn
                  </a>
                )}
                
                {auditor.social.github && (
                  <a 
                    href={auditor.social.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-civic-gray-900 hover:text-civic-blue"
                  >
                    <Github className="w-5 h-5 text-civic-gray-500 mr-3" /> GitHub
                  </a>
                )}
              </div>
            </div>
            
            {auditor.hasCalendly && auditor.calendlyUrl && (
              <div className="bg-civic-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Schedule a Meeting</h3>
                <p className="text-civic-gray-600 mb-4">
                  Book a time with {auditor.name} to discuss your website audit needs.
                </p>
                <a 
                  href={auditor.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Open Calendar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AuditorPage;
