
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import Papa from 'papaparse';

interface BusinessRow {
  name: string;
  city: string;
  category: string;
  address?: string;
  website?: string;
  description?: string;
  [key: string]: any;
}

export function BusinessImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateRow = (row: BusinessRow, rowIndex: number): BusinessRow => {
    const requiredFields = ['name', 'city', 'category'];
    const missingFields = requiredFields.filter(field => !row[field] || row[field].trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error(`Row ${rowIndex + 1}: Missing required fields: ${missingFields.join(', ')}`);
    }

    // Clean up and format the data
    return {
      name: row.name.trim(),
      city: row.city.toLowerCase().trim().replace(/\s*\([^)]*\)/g, ''), // Remove postal code in parentheses if present
      category: row.category.trim(),
      address: row.address?.trim(),
      website: row.website?.trim(),
      description: row.description?.trim()
    };
  };

  const importCsv = async () => {
    setIsImporting(true);
    setProgress(0);
    let successCount = 0;
    let failedRows: number[] = [];

    try {
      // Fetch CSV file from public directory
      const response = await fetch('docs/prepared_businesses.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvText = await response.text();
      const { data, errors, meta } = Papa.parse<BusinessRow>(csvText, {
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

      // Process the data in chunks to avoid overloading
      const chunkSize = 50;
      const totalChunks = Math.ceil(data.length / chunkSize);
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const validatedChunk = [];

        // Validate each row in the chunk
        for (let j = 0; j < chunk.length; j++) {
          try {
            const validatedRow = validateRow(chunk[j], i + j);
            validatedChunk.push(validatedRow);
          } catch (error) {
            failedRows.push(i + j + 1); // Store the row number (1-based)
            console.error(`Row ${i + j + 1} validation failed:`, error);
            continue; // Skip invalid rows but continue processing
          }
        }

        if (validatedChunk.length > 0) {
          const { error } = await supabase.rpc('process_business_import', {
            businesses: validatedChunk
          });

          if (error) throw error;
          successCount += validatedChunk.length;
        }
        
        // Update progress
        const currentChunk = Math.floor(i / chunkSize) + 1;
        setProgress((currentChunk / totalChunks) * 100);
      }

      const failedCount = failedRows.length;
      if (failedCount > 0) {
        toast({
          title: "Import Partially Successful",
          description: `Imported ${successCount} businesses. Failed to import ${failedCount} rows (rows: ${failedRows.join(', ')}). Check console for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${successCount} businesses.`
        });
      }
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
