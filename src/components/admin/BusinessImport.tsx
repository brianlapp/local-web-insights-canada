
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

export function BusinessImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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
      const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      if (errors.length > 0) {
        throw new Error('CSV parsing failed: ' + errors.map(e => e.message).join(', '));
      }

      // Process the data in chunks to avoid overloading
      const chunkSize = 50;
      const totalChunks = Math.ceil(data.length / chunkSize);

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        const { error } = await supabase.rpc('process_business_import', {
          businesses: chunk
        });

        if (error) throw error;

        // Update progress
        const currentChunk = Math.floor(i / chunkSize) + 1;
        setProgress((currentChunk / totalChunks) * 100);
      }

      toast({
        title: "Import Successful",
        description: `Imported ${data.length} businesses successfully.`
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
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
