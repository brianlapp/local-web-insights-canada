
export interface PetitionData {
  id: string
  slug: string
  businessName: string
  description: string
  signatures: number
  goal: number
}

export interface BusinessAuditData {
  id: string
  slug: string
  name: string
  score: number
  lastAudit: string
  metrics: {
    seo: number
    performance: number
    accessibility: number
    bestPractices?: number
  }
}

export interface AuditData {
  score: number
  metrics: {
    performance: number
    accessibility: number
    seo: number
    bestPractices: number
  }
  recommendations: Array<{
    id: number
    category: string
    description: string
  }>
  lastUpdated: string
}

export interface AuditBatchStatus {
  id: string
  status: 'pending' | 'processing' | 'completed'
  totalSites: number
  processedSites: number
  successfulAudits: number
  failedAudits: number
  startedAt: string
  completedAt: string | null
}

export async function fetchPetitionData(slug: string): Promise<PetitionData> {
  const response = await fetch(`/api/petitions/${slug}`)
  if (!response.ok) {
    throw new Error('Petition not found')
  }
  return response.json()
}

export async function fetchBusinessAudit(slug: string): Promise<BusinessAuditData> {
  console.log(`Fetching audit data for business slug: ${slug}`);
  const response = await fetch(`/api/businesses/${slug}/audit`)
  
  if (!response.ok) {
    console.error(`Failed to fetch audit data for ${slug}, status: ${response.status}`);
    throw new Error('Business not found')
  }
  
  const data = await response.json();
  console.log(`Received audit data for ${slug}:`, data);
  return data;
}

export async function fetchAuditData(businessSlug: string): Promise<AuditData> {
  console.log(`Fetching detailed audit data for: ${businessSlug}`);
  const response = await fetch(`/api/audit/${businessSlug}`)
  
  if (!response.ok) {
    console.error(`Error fetching audit data: ${response.status}`);
    throw new Error('Failed to fetch audit data')
  }
  
  const data = await response.json();
  console.log(`Received detailed audit data:`, data);
  return data;
}

export async function submitAuditData(businessSlug: string, data: AuditData): Promise<AuditData> {
  console.log(`Submitting audit data for: ${businessSlug}`, data);
  const response = await fetch(`/api/audit/${businessSlug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    console.error(`Error submitting audit data: ${response.status}`);
    throw new Error('Failed to submit audit data')
  }
  
  const responseData = await response.json();
  console.log(`Audit data submission successful:`, responseData);
  return responseData;
} 

export async function triggerAuditBatch(size: number = 5): Promise<{ success: boolean, message: string, batchId?: string }> {
  console.log(`Triggering audit batch with size: ${size}`);
  
  try {
    // First create a new batch
    const createResponse = await fetch('/api/batch/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ size }),
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error(`Error creating audit batch: ${createResponse.status}`, error);
      return { success: false, message: error.message || 'Failed to create audit batch' };
    }
    
    const batchData = await createResponse.json();
    console.log(`Audit batch created:`, batchData);
    
    // Now trigger the process
    const processResponse = await fetch(`/process-audits?batch=true&size=${size}`, {
      method: 'POST',
    });
    
    if (!processResponse.ok) {
      console.error(`Error processing audit batch: ${processResponse.status}`);
      return { 
        success: false, 
        message: 'Batch created but processing failed', 
        batchId: batchData.batchId 
      };
    }
    
    const processData = await processResponse.json();
    console.log(`Audit batch processing started:`, processData);
    
    return { 
      success: true, 
      message: `Audit batch started with ${size} websites`, 
      batchId: batchData.batchId 
    };
  } catch (error) {
    console.error('Error triggering audit batch:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function fetchAuditBatchStatus(batchId: string): Promise<AuditBatchStatus> {
  console.log(`Fetching status for batch: ${batchId}`);
  const response = await fetch(`/api/batch/${batchId}`);
  
  if (!response.ok) {
    console.error(`Failed to fetch batch status: ${response.status}`);
    throw new Error('Failed to fetch batch status');
  }
  
  const data = await response.json();
  console.log(`Received batch status:`, data);
  return data;
}
