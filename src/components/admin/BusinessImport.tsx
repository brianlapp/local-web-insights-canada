
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
    if (!row.raw_data) {
      throw new Error(`Row ${rowIndex + 1}: Missing raw data`);
    }

    try {
      const rawData = typeof row.raw_data === 'string' ? JSON.parse(row.raw_data) : row.raw_data;
      
      // Extract and clean up the values
      const name = rawData.name?.trim() || row.name?.trim();
      let city = rawData.city?.toLowerCase().trim() || '';
      
      // Extract city from address components if available
      if (!city && rawData.address_components) {
        const cityComponent = rawData.address_components.find(
          (c: any) => c.types.includes('locality')
        );
        if (cityComponent) {
          city = cityComponent.long_name.toLowerCase().trim();
        }
      }
      
      // Get first category from types array or use provided category
      const category = (rawData.types?.[0] || row.category || 'uncategorized').trim();
      
      if (!name || !city) {
        throw new Error(`Row ${rowIndex + 1}: Missing required fields: ${!name ? 'name' : 'city'}`);
      }

      return {
        name,
        city,
        category,
        address: rawData.formatted_address || row.address,
        website: rawData.website || row.website,
        description: rawData.description || row.description
      };
    } catch (error) {
      console.error(`Error parsing row ${rowIndex + 1}:`, error);
      throw new Error(`Row ${rowIndex + 1}: Invalid data format - ${error.message}`);
    }
  };

  const importCsv = async () => {
    setIsImporting(true);
    setProgress(0);
    setErrors([]);

    try {
      const response = await fetch('docs/prepared_businesses.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvText = await response.text();
      console.log("CSV sample:", csvText.substring(0, 200));
      
      const { data, errors: parseErrors } = Papa.parse<BusinessRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: '\t',
        transformHeader: (header) => header.toLowerCase().trim()
      });

      if (parseErrors && parseErrors.length > 0) {
        console.error("Parse errors:", parseErrors);
        throw new Error(`CSV parsing failed: ${parseErrors.map(e => e.message).join(', ')}`);
      }

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
