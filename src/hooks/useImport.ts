
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

export interface ImportOptions {
  batchSize?: number;
  updateExisting?: boolean;
  assignGrades?: boolean;
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'preparing' | 'processing' | 'completed' | 'error';
}

export const useImport = () => {
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
    status: 'idle'
  });
  const [importing, setImporting] = useState<boolean>(false);
  const [importRunId, setImportRunId] = useState<string | null>(null);
  const { toast } = useToast();

  // Create a new import source if it doesn't exist
  const ensureImportSource = useCallback(async () => {
    try {
      // Check if import source exists
      const { data: existingSource } = await supabase
        .from('scraper_sources')
        .select('*')
        .eq('id', 'csv_import')
        .single();
      
      if (!existingSource) {
        // Create the import source
        const { error } = await supabase
          .from('scraper_sources')
          .insert({
            id: 'csv_import',
            name: 'Ottawa Business CSV Import',
            enabled: true,
            config: {
              version: '1.0',
              type: 'file_import'
            }
          });
          
        if (error) throw error;
        
        console.log('Created new import source: csv_import');
      } else {
        console.log('Import source already exists');
      }
      
      return true;
    } catch (error: any) {
      console.error('Error ensuring import source:', error);
      toast({
        title: 'Error creating import source',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);
  
  // Create a new import run
  const createImportRun = useCallback(async (location: string) => {
    try {
      // Create a new scraper run record
      const { data, error } = await supabase
        .from('scraper_runs')
        .insert({
          status: 'preparing',
          location,
          businessesfound: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setImportRunId(data.id);
      console.log('Created new import run:', data.id);
      
      return data.id;
    } catch (error: any) {
      console.error('Error creating import run:', error);
      toast({
        title: 'Error creating import run',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);
  
  // Parse CSV file
  const parseCSV = useCallback((file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(results.errors[0]);
          } else {
            resolve(results.data as any[]);
          }
        },
        error: (error) => reject(error)
      });
    });
  }, []);
  
  // Map CSV data to business schema
  const mapBusinessData = useCallback((row: any) => {
    // Extract data from the extra JSON field if it exists
    let extraData = {};
    try {
      if (row.extra && typeof row.extra === 'string') {
        extraData = JSON.parse(row.extra);
      } else if (row.extra && typeof row.extra === 'object') {
        extraData = row.extra;
      }
    } catch (e) {
      console.warn('Error parsing extra data:', e);
    }
    
    // Generate a unique ID for the business
    const businessId = uuidv4();
    
    // Map the CSV data to the business schema
    return {
      id: businessId,
      name: row.name || '',
      phone: row.phone || '',
      address: row.address || '',
      city: 'Ottawa',
      category: row.category || '',
      website: row.website || '',
      source_id: 'csv_import',
      external_id: row.external_id || businessId,
      is_upgraded: false,
      scores: {
        seo: 0,
        performance: 0,
        accessibility: 0,
        design: 0,
        overall: 0
      }
    };
  }, []);
  
  // Store raw business data
  const storeRawBusinessData = useCallback(async (row: any, businessId: string) => {
    try {
      const { error } = await supabase
        .from('raw_business_data')
        .insert({
          source_id: 'csv_import',
          external_id: businessId,
          raw_data: row,
          processed: true
        });
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error storing raw business data:', error);
      return false;
    }
  }, []);
  
  // Assign initial grade to business
  const assignInitialGrade = useCallback((businessData: any, row: any) => {
    // Implementation of basic grading algorithm
    const hasWebsite = !!businessData.website ? 30 : 0;
    const hasPhone = !!businessData.phone ? 10 : 0;
    const hasAddress = !!businessData.address ? 10 : 0;
    const hasCategory = !!businessData.category ? 10 : 0;
    
    // Additional points for data in raw_data
    let extraPoints = 0;
    try {
      const extraData = typeof row.extra === 'string' ? JSON.parse(row.extra) : row.extra;
      
      // Check for wheelchair accessibility
      if (extraData?.wheelchair_accessible_entrance) {
        extraPoints += 5;
      }
      
      // Check for detailed types
      if (extraData?.types && extraData.types.length > 0) {
        extraPoints += 5;
      }
      
      // Check for geometry data
      if (extraData?.geometry?.location?.lat && extraData?.geometry?.location?.lng) {
        extraPoints += 10;
      }
    } catch (e) {
      console.warn('Error parsing extra data for grading:', e);
    }
    
    // Calculate overall score
    const overallScore = Math.min(Math.max(hasWebsite + hasPhone + hasAddress + hasCategory + extraPoints, 0), 100);
    
    // Assign grade based on score
    const scores = {
      overall: overallScore,
      seo: hasWebsite ? 50 : 0,
      performance: hasWebsite ? 50 : 0,
      accessibility: extraPoints > 0 ? 50 : 0,
      design: hasWebsite ? 50 : 0
    };
    
    // Add scores to business data
    return {
      ...businessData,
      scores
    };
  }, []);
  
  // Process a batch of businesses
  const processBatch = useCallback(async (
    batch: any[],
    runId: string,
    options: ImportOptions
  ) => {
    const results = {
      successful: 0,
      failed: 0
    };
    
    try {
      // Map batch data to business schema
      const businessRecords = batch.map(row => {
        const businessData = mapBusinessData(row);
        return options.assignGrades ? assignInitialGrade(businessData, row) : businessData;
      });
      
      // Insert businesses
      const { data, error } = await supabase
        .from('businesses')
        .insert(businessRecords)
        .select('id');
        
      if (error) throw error;
      
      // Store raw data for each business
      for (let i = 0; i < data.length; i++) {
        await storeRawBusinessData(batch[i], data[i].id);
      }
      
      results.successful = data.length;
      
      // Update run record with count
      await supabase
        .from('scraper_runs')
        .update({
          businessesfound: supabase.rpc('increment_counter', {
            row_id: runId,
            count: data.length
          })
        })
        .eq('id', runId);
        
      return results;
    } catch (error: any) {
      console.error('Error processing batch:', error);
      results.failed = batch.length;
      return results;
    }
  }, [mapBusinessData, assignInitialGrade, storeRawBusinessData]);
  
  // Start the import process
  const startImport = useCallback(async (
    file: File,
    location: string = 'Ottawa',
    options: ImportOptions = { batchSize: 50, updateExisting: false, assignGrades: true }
  ) => {
    try {
      setImporting(true);
      setProgress(prev => ({ ...prev, status: 'preparing' }));
      
      // Ensure import source exists
      const sourceReady = await ensureImportSource();
      if (!sourceReady) {
        throw new Error('Failed to ensure import source');
      }
      
      // Create import run
      const runId = await createImportRun(location);
      if (!runId) {
        throw new Error('Failed to create import run');
      }
      
      // Parse CSV file
      setProgress(prev => ({ ...prev, status: 'processing' }));
      const data = await parseCSV(file);
      
      // Update progress with total count
      const totalRecords = data.length;
      const batchSize = options.batchSize || 50;
      const totalBatches = Math.ceil(totalRecords / batchSize);
      
      setProgress({
        total: totalRecords,
        processed: 0,
        successful: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches,
        status: 'processing'
      });
      
      // Process in batches
      let processed = 0;
      let successful = 0;
      let failed = 0;
      
      // Update run status to running
      await supabase
        .from('scraper_runs')
        .update({ status: 'running' })
        .eq('id', runId);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, totalRecords);
        const batch = data.slice(start, end);
        
        const batchResults = await processBatch(batch, runId, options);
        
        processed += batch.length;
        successful += batchResults.successful;
        failed += batchResults.failed;
        
        setProgress({
          total: totalRecords,
          processed,
          successful,
          failed,
          currentBatch: i + 1,
          totalBatches,
          status: 'processing'
        });
        
        // Show progress toast every 5 batches or on first batch
        if (i === 0 || (i + 1) % 5 === 0 || i === totalBatches - 1) {
          toast({
            title: 'Import Progress',
            description: `Processed ${processed} of ${totalRecords} businesses`,
          });
        }
      }
      
      // Update run status to completed
      await supabase
        .from('scraper_runs')
        .update({
          status: 'completed',
          businessesfound: successful
        })
        .eq('id', runId);
      
      setProgress(prev => ({ ...prev, status: 'completed' }));
      
      toast({
        title: 'Import Completed',
        description: `Successfully imported ${successful} businesses. Failed: ${failed}.`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Import error:', error);
      
      // Update run status to failed if we have a run ID
      if (importRunId) {
        await supabase
          .from('scraper_runs')
          .update({
            status: 'failed',
            error: error.message
          })
          .eq('id', importRunId);
      }
      
      setProgress(prev => ({ ...prev, status: 'error' }));
      
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  }, [
    ensureImportSource,
    createImportRun,
    parseCSV,
    processBatch,
    toast,
    importRunId
  ]);
  
  return {
    startImport,
    importing,
    progress,
    importRunId
  };
};
