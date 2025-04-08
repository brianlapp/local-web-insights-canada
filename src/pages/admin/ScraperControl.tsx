
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScraper } from '@/hooks/useScraper';
import ScraperForm from '@/components/scraper/ScraperForm';
import BusinessList from '@/components/scraper/BusinessList';
import JobList from '@/components/scraper/JobList';

export default function ScraperControl() {
  const {
    businesses,
    jobs,
    loading,
    jobLoading,
    location,
    currentJob,
    apiAvailable,
    setLocation,
    fetchBusinesses,
    fetchJobs,
    handleStartScraper,
    handleRunWebsiteAudit,
  } = useScraper();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Scraper Control Panel</h1>
      
      <ScraperForm 
        currentJob={currentJob}
        location={location}
        onLocationChange={setLocation}
        onStartScraper={handleStartScraper}
        onRefreshJobs={fetchJobs}
        apiAvailable={apiAvailable}
      />

      <Tabs defaultValue="businesses">
        <TabsList className="mb-4">
          <TabsTrigger value="businesses">Recent Businesses</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="businesses">
          <BusinessList 
            businesses={businesses}
            loading={loading}
            onRefresh={fetchBusinesses}
            onRunAudit={handleRunWebsiteAudit}
          />
        </TabsContent>
        
        <TabsContent value="jobs">
          <JobList 
            jobs={jobs}
            loading={jobLoading}
            onRefresh={fetchJobs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
