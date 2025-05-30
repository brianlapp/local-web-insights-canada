import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";
import Papa from 'papaparse';
import { useQueryClient } from "@tanstack/react-query";

interface BusinessRow {
  name?: string;
  city?: string;
  category?: string;
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
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setErrors([]);
    }
  };

  const importCsv = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setErrors([]);

    try {
      const csvText = await file.text();
      
      // Log the raw CSV content for debugging
      console.log("RAW CSV CONTENT (first 1000 chars):", csvText.substring(0, 1000));
      
      // Detect common delimiters
      const delimiters = [',', ';', '\t'];
      let detectedDelimiter: string | null = null;

      // Try each delimiter until we find one that works
      for (const delimiter of delimiters) {
        try {
          const parseResult = Papa.parse<BusinessRow>(csvText, {
            header: true,
            skipEmptyLines: true,
            delimiter: delimiter,
            transformHeader: (header) => header.toLowerCase().trim()
          });

          if (!parseResult.errors.length) {
            detectedDelimiter = delimiter;
            console.log(`Successfully parsed with delimiter: ${detectedDelimiter}`);
            
            const { data, errors: parseErrors } = parseResult;

            if (parseErrors && parseErrors.length > 0) {
              console.error("Parsing errors:", parseErrors);
              throw new Error(`CSV parsing failed: ${parseErrors.map(e => e.message).join(', ')}`);
            }

            console.log("First row sample:", data[0]);

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
              } You can now view the imported data in the dashboard.`,
              variant: failedRows.length > 0 ? "destructive" : "default"
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['business-count'] });
            queryClient.invalidateQueries({ queryKey: ['recent-businesses'] });

            return; // Exit after successful parse
          }
        } catch (parseError) {
          console.error(`Failed to parse with delimiter '${delimiter}':`, parseError);
        }
      }

      // If no delimiter worked
      throw new Error("Could not parse CSV with any known delimiter. Please check your file format.");

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
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <label className="border rounded-md px-4 py-2 bg-gray-100 flex items-center cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            <span>Select CSV File</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden"
              onChange={handleFileChange} 
              disabled={isImporting} 
            />
          </label>
          {file && <span className="text-sm text-gray-600">{file.name}</span>}
        </div>
        
        <Button 
          onClick={importCsv}
          disabled={isImporting || !file}
          className="w-full md:w-auto"
        >
          {isImporting ? 'Importing...' : 'Import Businesses'}
        </Button>
      </div>
      
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
