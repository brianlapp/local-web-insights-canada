
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuditBatchMonitor } from './AuditBatchMonitor';
import { triggerAuditBatch } from '@/lib/api';
import { AlertCircle, PlayCircle } from 'lucide-react';

export function AuditBatchControls() {
  const [batchSize, setBatchSize] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBatchId, setActiveBatchId] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStartBatch = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await triggerAuditBatch(batchSize);
      
      if (result.success) {
        setSuccessMessage(`Batch started successfully: ${result.message}`);
        if (result.batchId) {
          setActiveBatchId(result.batchId);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchComplete = () => {
    setSuccessMessage('Batch processing completed successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Run Audit Batch
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="batch-size">Batch Size</Label>
              <div className="flex mt-1">
                <Input
                  id="batch-size"
                  type="number"
                  min={1}
                  max={20}
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 5)}
                  className="mr-2"
                />
                <Button 
                  onClick={handleStartBatch}
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Batch'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Number of websites to audit (1-20)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {activeBatchId && (
        <AuditBatchMonitor 
          batchId={activeBatchId} 
          onBatchComplete={handleBatchComplete}
        />
      )}
    </div>
  );
}
