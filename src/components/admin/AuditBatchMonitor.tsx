
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchAuditBatchStatus, triggerAuditBatch, AuditBatchStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface AuditBatchMonitorProps {
  batchId?: string;
  onBatchComplete?: () => void;
}

export function AuditBatchMonitor({ batchId: initialBatchId, onBatchComplete }: AuditBatchMonitorProps) {
  const [batchId, setBatchId] = useState<string | undefined>(initialBatchId);
  const [batchStatus, setBatchStatus] = useState<AuditBatchStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState<boolean>(false);

  // Function to start a new batch
  const startNewBatch = async (size: number = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await triggerAuditBatch(size);
      
      if (result.success && result.batchId) {
        setBatchId(result.batchId);
        startPolling(result.batchId);
      } else {
        setError(result.message || 'Failed to start audit batch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audit batch');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch batch status
  const fetchStatus = async (id: string) => {
    try {
      const status = await fetchAuditBatchStatus(id);
      setBatchStatus(status);
      
      // If batch is completed, stop polling
      if (status.status === 'completed') {
        setPolling(false);
        if (onBatchComplete) {
          onBatchComplete();
        }
      }
      
      return status;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batch status');
      setPolling(false);
      return null;
    }
  };

  // Start polling for updates
  const startPolling = (id: string) => {
    setPolling(true);
    fetchStatus(id);
  };

  // Effect to handle polling
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (polling && batchId) {
      intervalId = window.setInterval(() => {
        fetchStatus(batchId);
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [polling, batchId]);

  // Initial fetch if batchId is provided
  useEffect(() => {
    if (initialBatchId && !batchStatus) {
      fetchStatus(initialBatchId);
      
      // Start polling if we're given an initial batchId
      if (initialBatchId) {
        startPolling(initialBatchId);
      }
    }
  }, [initialBatchId]);

  const getStatusIcon = () => {
    if (!batchStatus) return <Clock className="w-5 h-5 text-gray-400" />;
    
    switch (batchStatus.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressPercentage = () => {
    if (!batchStatus || batchStatus.totalSites === 0) return 0;
    return (batchStatus.processedSites / batchStatus.totalSites) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Audit Batch Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {batchStatus ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">
                  {batchStatus.processedSites} of {batchStatus.totalSites} sites
                </span>
              </div>
              <Progress value={getProgressPercentage()} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium capitalize">{batchStatus.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="font-medium">{batchStatus.successfulAudits} successful, {batchStatus.failedAudits} failed</p>
              </div>
              <div>
                <p className="text-gray-500">Started</p>
                <p className="font-medium">{new Date(batchStatus.startedAt).toLocaleString()}</p>
              </div>
              {batchStatus.completedAt && (
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-medium">{new Date(batchStatus.completedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No active audit batch</p>
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => startNewBatch(5)} 
            disabled={loading || polling}
            variant={batchStatus ? "outline" : "default"}
          >
            {batchStatus ? "Run New Batch" : "Start Audit Batch"}
          </Button>
          
          {batchId && (
            <Button 
              onClick={() => fetchStatus(batchId)}
              variant="secondary"
              disabled={loading}
            >
              Refresh Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
