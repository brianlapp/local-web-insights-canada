
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ImportProgress, useImport } from '@/hooks/useImport';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2, Upload, X } from 'lucide-react';

const BusinessImportForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState<string>('Ottawa');
  const [assignGrades, setAssignGrades] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { startImport, importing, progress } = useImport();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!file) return;
    
    await startImport(file, location, {
      batchSize: 50,
      updateExisting: false,
      assignGrades
    });
  };
  
  const getProgressColor = () => {
    if (progress.status === 'error') return 'bg-red-600';
    if (progress.status === 'completed') return 'bg-green-600';
    return 'bg-blue-600';
  };
  
  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.processed / progress.total) * 100);
  };
  
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getStatusLabel = () => {
    switch (progress.status) {
      case 'idle':
        return 'Ready to import';
      case 'preparing':
        return 'Preparing import...';
      case 'processing':
        return `Processing batch ${progress.currentBatch} of ${progress.totalBatches}`;
      case 'completed':
        return 'Import completed';
      case 'error':
        return 'Import failed';
      default:
        return '';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Business Import</CardTitle>
        <CardDescription>
          Import businesses from a CSV file into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="flex-1"
              disabled={importing}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse
            </Button>
          </div>
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={importing}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="assign-grades"
            checked={assignGrades}
            onCheckedChange={setAssignGrades}
            disabled={importing}
          />
          <Label htmlFor="assign-grades">Assign initial performance grades</Label>
        </div>
        
        {progress.status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusLabel()}
              </span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress className="h-2" value={getProgressPercentage()}>
              <div 
                className={`h-full ${getProgressColor()} rounded-full`} 
                style={{ width: `${getProgressPercentage()}%` }} 
              />
            </Progress>
            {progress.status !== 'idle' && progress.status !== 'preparing' && (
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="font-medium">{progress.processed}</p>
                  <p className="text-muted-foreground">Processed</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">{progress.successful}</p>
                  <p className="text-muted-foreground">Successful</p>
                </div>
                <div>
                  <p className="font-medium text-red-600">{progress.failed}</p>
                  <p className="text-muted-foreground">Failed</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button 
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Start Import
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BusinessImportForm;
