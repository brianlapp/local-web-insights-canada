
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Papa from 'papaparse';

interface BusinessRow {
  name?: string;
  city?: string;
  category?: string;
  address?: string;
  website?: string;
  description?: string;
  // For any additional fields
  [key: string]: any;
}

interface ValidationError {
  rowIndex: number;
  message: string;
}

export function BusinessImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { toast } = useToast();

  const validateRow = (row: BusinessRow, rowIndex: number): BusinessRow => {
    // Extract and clean up the values directly from the row
    const name = row.name?.trim();
    const city = row.city?.toLowerCase().trim();
    const category = row.category?.trim() || 'uncategorized';
    
    if (!name || !city) {
      throw new Error(`Row ${rowIndex + 1}: Missing required fields: ${!name ? 'name' : 'city'}`);
    }

    return {
      name,
      city,
      category,
      address: row.address,
      website: row.website,
      description: row.description
    };
  };

  const importCsv = async () => {
    setIsImporting(true);
    setProgress(0);
    setErrors([]);

    try {
      const response = await fetch('/docs/prepared_businesses.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvText = await response.text();
      console.log("CSV sample:", csvText.substring(0, 200));
      
      const { data, errors: parseErrors } = Papa.parse<BusinessRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim()
      });

      if (parseErrors && parseErrors.length > 0) {
        console.error("Parse errors:", parseErrors);
        throw new Error(`CSV parsing failed: ${parseErrors.map(e => e.message).join(', ')}`);
      }

      console.log("Sample row:", data[0]);

      const chunkSize = 50;
      const totalChunks = Math.ceil(data.length / chunkSize);
      let successCount = 0;
      let failedRows: ValidationError[] = [];
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const validatedChunk: BusinessRow[] = [];
        
        // Validate rows in chunk
        for (let j = 0; j < chunk.length; j++) {
          try {
            const validatedRow = validateRow(chunk[j], i + j);
            validatedChunk.push(validatedRow);
          } catch (error) {
            failedRows.push({
              rowIndex: i + j + 1,
              message: error.message
            });
            continue;
          }
        }

        if (validatedChunk.length > 0) {
          try {
            const { error } = await supabase.rpc('process_business_import', {
              businesses: validatedChunk
            });

            if (error) throw error;
            successCount += validatedChunk.length;
          } catch (error) {
            console.error('Database error:', error);
            throw new Error(`Failed to import data: ${error.message}`);
          }
        }

        const currentChunk = Math.floor(i / chunkSize) + 1;
        setProgress((currentChunk / totalChunks) * 100);
      }

      setErrors(failedRows);

      toast({
        title: failedRows.length > 0 ? "Import Partially Complete" : "Import Successful",
        description: `Successfully imported ${successCount} businesses. ${
          failedRows.length > 0 ? `Failed to import ${failedRows.length} rows.` : ''
        }`,
        variant: failedRows.length > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        onClick={importCsv}
        disabled={isImporting}
        className="w-full md:w-auto"
      >
        {isImporting ? 'Importing...' : 'Import Businesses'}
      </Button>
      
      {isImporting && progress > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            Importing businesses... {Math.round(progress)}%
          </div>
          <Progress value={progress} />
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="mt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Import Errors</AlertTitle>
            <AlertDescription>
              <div className="mt-2 max-h-60 overflow-y-auto border rounded">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {errors.map((error, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 py-1 whitespace-nowrap">{error.rowIndex}</td>
                        <td className="px-2 py-1">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
