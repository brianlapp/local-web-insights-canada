
import React from 'react';
import BusinessImportForm from '@/components/import/BusinessImportForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobList from '@/components/scraper/JobList';
import { useScraper } from '@/hooks/useScraper';

export default function BusinessImport() {
  const {
    jobs,
    jobLoading,
    fetchJobs,
    handleResetJobStatus,
  } = useScraper();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Business Import</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <BusinessImportForm />
        
        <Tabs defaultValue="jobs">
          <TabsList className="mb-4">
            <TabsTrigger value="jobs">Import Jobs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs">
            <JobList 
              jobs={jobs}
              loading={jobLoading}
              onRefresh={fetchJobs}
              onResetStatus={handleResetJobStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
