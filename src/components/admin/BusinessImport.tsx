
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import Papa from 'papaparse';

export function BusinessImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateRow = (row: any) => {
    const requiredFields = ['name', 'city', 'category'];
    const missingFields = requiredFields.filter(field => !row[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  };

  const importCsv = async () => {
    setIsImporting(true);
    setProgress(0);
    try {
      // Fetch CSV file from public directory
      const response = await fetch('docs/prepared_businesses.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvText = await response.text();
      const { data, errors, meta } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: '\t', // Explicitly set tab as delimiter
        transformHeader: (header) => header.toLowerCase().trim()
      });

      if (errors.length > 0) {
        throw new Error('CSV parsing failed: ' + errors.map(e => e.message).join(', '));
      }

      if (data.length === 0) {
        throw new Error('No valid data found in the CSV file');
      }

      // Validate the first row to check column structure
      validateRow(data[0]);

      // Process the data in chunks to avoid overloading
      const chunkSize = 50;
      const totalChunks = Math.ceil(data.length / chunkSize);
      let successCount = 0;

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        const { error } = await supabase.rpc('process_business_import', {
          businesses: chunk
        });

        if (error) throw error;

        successCount += chunk.length;
        
        // Update progress
        const currentChunk = Math.floor(i / chunkSize) + 1;
        setProgress((currentChunk / totalChunks) * 100);
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${successCount} businesses.`
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "There was an error importing the businesses.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={importCsv}
        disabled={isImporting}
        className="w-full md:w-auto"
      >
        {isImporting ? 'Importing...' : 'Import Businesses CSV'}
      </Button>
      
      {isImporting && progress > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            Importing businesses... {Math.round(progress)}%
          </div>
          <Progress value={progress} />
        </div>
      )}
    </div>
  );
}
