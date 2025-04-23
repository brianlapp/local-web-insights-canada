
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
  const [csvPreview, setCsvPreview] = useState<{ headers: string[], sample: any[] } | null>(null);
  const { toast } = useToast();

  const validateRow = (row: BusinessRow, rowIndex: number): BusinessRow => {
    // Log the row content to help debug
    console.log(`Validating row ${rowIndex + 1}:`, row);
    
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

  const analyzeCsvStructure = async () => {
    try {
      // Fetch CSV file from public directory
      const response = await fetch('docs/prepared_businesses.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvText = await response.text();
      
      // First try parsing with tab as delimiter
      let result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: '\t',
        preview: 5, // Just get a few rows for preview
        transformHeader: (header) => header.toLowerCase().trim()
      });
      
      // If we don't have enough columns, try with comma
      if (Object.keys(result.data[0] || {}).length <= 1) {
        result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          delimiter: ',',
          preview: 5,
          transformHeader: (header) => header.toLowerCase().trim()
        });
      }
      
      // Store preview data
      setCsvPreview({
        headers: result.meta.fields || [],
        sample: result.data.slice(0, 5)
      });
      
      // Show detected structure
      toast({
        title: "CSV Analysis Complete",
        description: `Found ${result.meta.fields?.length || 0} columns with headers: ${result.meta.fields?.join(', ') || 'none'}`
      });
      
    } catch (error) {
      console.error('CSV analysis error:', error);
      toast({
        title: "CSV Analysis Failed",
        description: error.message || "There was an error analyzing the CSV file.",
        variant: "destructive"
      });
    }
  };

  const importCsv = async () => {
    setIsImporting(true);
    setProgress(0);
    setErrors([]);
    let successCount = 0;
    let failedRows: ValidationError[] = [];

    try {
      // Fetch CSV file from public directory
      const response = await fetch('docs/prepared_businesses.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvText = await response.text();
      
      // Try to automatically detect the delimiter
      const sampleFirstLine = csvText.split('\n')[0];
      const tabCount = (sampleFirstLine.match(/\t/g) || []).length;
      const commaCount = (sampleFirstLine.match(/,/g) || []).length;
      const delimiter = tabCount > commaCount ? '\t' : ',';
      
      console.log(`Detected delimiter: ${delimiter === '\t' ? 'tab' : 'comma'}`);
      
      const { data, errors, meta } = Papa.parse<BusinessRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
        transformHeader: (header) => header.toLowerCase().trim()
      });

      console.log('Parsed headers:', meta.fields);
      console.log('First row sample:', data[0]);

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
            const rowError = {
              rowIndex: i + j + 1, 
              message: error.message
            };
            failedRows.push(rowError);
            console.error(`Row ${i + j + 1} validation failed:`, error);
            continue; // Skip invalid rows but continue processing
          }
        }

        if (validatedChunk.length > 0) {
          const { error } = await supabase.rpc('process_business_import', {
            businesses: validatedChunk
          });

          if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${error.message}`);
          }
          
          successCount += validatedChunk.length;
        }
        
        // Update progress
        const currentChunk = Math.floor(i / chunkSize) + 1;
        setProgress((currentChunk / totalChunks) * 100);
      }

      setErrors(failedRows);
      
      if (failedRows.length > 0) {
        toast({
          title: "Import Partially Successful",
          description: `Imported ${successCount} businesses. Failed to import ${failedRows.length} rows. See below for details.`,
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          onClick={analyzeCsvStructure}
          variant="outline"
          className="w-full md:w-auto"
          disabled={isImporting}
        >
          Analyze CSV Structure
        </Button>
        
        <Button 
          onClick={importCsv}
          disabled={isImporting}
          className="w-full md:w-auto"
        >
          {isImporting ? 'Importing...' : 'Import Businesses CSV'}
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
      
      {csvPreview && (
        <div className="border rounded-md p-4 mt-4">
          <h3 className="text-lg font-medium mb-2">CSV Preview</h3>
          <p className="text-sm text-gray-500 mb-2">
            Detected headers: {csvPreview.headers.join(', ')}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                  {csvPreview.headers.map((header, index) => (
                    <th 
                      key={index} 
                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvPreview.sample.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-2 py-1 whitespace-nowrap">{rowIndex + 1}</td>
                    {csvPreview.headers.map((header, colIndex) => (
                      <td key={colIndex} className="px-2 py-1 whitespace-nowrap">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="mt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Import Errors</AlertTitle>
            <AlertDescription>
              The following rows could not be imported:
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
