
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

export function BusinessImport() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const importCsv = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/docs/prepared_businesses.csv');
      const csvText = await response.text();
      
      const { data } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      // Process the data in chunks to avoid overloading
      const chunkSize = 50;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        const { error } = await supabase.rpc('process_business_import', {
          businesses: chunk
        });

        if (error) throw error;
      }

      toast({
        title: "Import Successful",
        description: `Imported ${data.length} businesses successfully.`
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "There was an error importing the businesses.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={importCsv}
        disabled={isImporting}
      >
        {isImporting ? 'Importing...' : 'Import Businesses CSV'}
      </Button>
    </div>
  );
}
