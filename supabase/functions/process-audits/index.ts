
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { runLighthouse } from './lighthouse.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Batch size for processing multiple audits
const DEFAULT_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 20;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting audit process...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the request is specifically for batch processing
    const url = new URL(req.url);
    const isBatchProcess = url.searchParams.get('batch') === 'true';
    
    // Get requested batch size with proper parsing and validation
    const requestedSizeParam = url.searchParams.get('size');
    let requestedBatchSize = requestedSizeParam ? parseInt(requestedSizeParam, 10) : 0;
    
    // Ensure batch size is valid
    if (isNaN(requestedBatchSize)) {
      requestedBatchSize = DEFAULT_BATCH_SIZE;
      console.log(`Invalid batch size parameter, using default: ${DEFAULT_BATCH_SIZE}`);
    }
    
    // Apply limits to batch size
    const batchSize = Math.min(Math.max(1, requestedBatchSize || DEFAULT_BATCH_SIZE), MAX_BATCH_SIZE);
    
    console.log(`Processing mode: ${isBatchProcess ? 'Batch' : 'Single'} (size: ${isBatchProcess ? batchSize : 1})`);

    // Get the pending audits
    const { data: pendingAudits, error: fetchError } = await supabase
      .from('audit_queue')
      .select(`
        id,
        business_id,
        batch_id,
        attempts,
        businesses!inner(id, name, website)
      `)
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(isBatchProcess ? batchSize : 1);

    if (fetchError) {
      console.error('Error fetching businesses to audit:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error fetching businesses to audit', details: fetchError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!pendingAudits || pendingAudits.length === 0) {
      console.log('No businesses to audit at this time');
      return new Response(
        JSON.stringify({ message: 'No businesses to audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${pendingAudits.length} businesses to audit`);

    // Process the first business immediately
    const firstAudit = pendingAudits[0];
    const firstBusiness = {
      business_id: firstAudit.business_id,
      queue_id: firstAudit.id,
      batch_id: firstAudit.batch_id,
      website: firstAudit.businesses?.website,
      name: firstAudit.businesses?.name,
      attempts: firstAudit.attempts || 0
    };

    // Update the first audit queue item status to processing
    await supabase
      .from('audit_queue')
      .update({
        status: 'processing',
        last_attempt: new Date().toISOString(),
        attempts: firstBusiness.attempts + 1
      })
      .eq('id', firstBusiness.queue_id);

    console.log(`Processing first business: ${firstBusiness.name} (${firstBusiness.website})`);

    // Process the first audit and get the result
    const result = await processAudit(firstBusiness, supabase);
    
    // If we're in batch mode, process the rest of the audits in the background
    if (isBatchProcess && pendingAudits.length > 1) {
      console.log(`Processing remaining ${pendingAudits.length - 1} businesses in the background...`);
      
      // Only wait for the first business result so we can return quickly
      const remainingAudits = pendingAudits.slice(1).map(audit => {
        const business = {
          business_id: audit.business_id,
          queue_id: audit.id,
          batch_id: audit.batch_id,
          website: audit.businesses?.website,
          name: audit.businesses?.name,
          attempts: audit.attempts || 0
        };
        
        return processAuditInBackground(business, supabase);
      });
      
      // Use waitUntil for background processing without blocking the response
      if (typeof EdgeRuntime !== 'undefined') {
        try {
          // @ts-ignore - Deno Edge Runtime
          EdgeRuntime.waitUntil(
            Promise.allSettled(remainingAudits).then(results => {
              console.log(`Background processing complete. Results: ${results.length} items processed.`);
              const successful = results.filter(r => r.status === 'fulfilled').length;
              const failed = results.filter(r => r.status === 'rejected').length;
              console.log(`Success: ${successful}, Failed: ${failed}`);
              
              // Update batch status if needed
              if (firstBusiness.batch_id) {
                updateBatchStatus(supabase, firstBusiness.batch_id, successful, failed);
              }
            })
          );
        } catch (waitUntilError) {
          console.error('Error with EdgeRuntime.waitUntil:', waitUntilError);
        }
      }
      
      // Return the result of the first audit along with batch info
      return new Response(
        JSON.stringify({ 
          success: true, 
          business: firstBusiness.name,
          scores: result.scores,
          batchSize: pendingAudits.length,
          batchStatus: 'processing',
          message: `Processing ${pendingAudits.length} businesses in total`,
          requestedBatchSize: requestedBatchSize,
          actualBatchSize: batchSize
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If single mode or only one audit in batch, just return the result
    return new Response(
      JSON.stringify({ 
        success: true, 
        business: firstBusiness.name,
        scores: result.scores 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Critical error processing audit:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper to update batch status
async function updateBatchStatus(supabase: any, batchId: string, successful: number, failed: number) {
  try {
    console.log(`Updating batch ${batchId} status with ${successful} successful and ${failed} failed audits`);
    
    const { data: batchData, error: batchError } = await supabase
      .from('audit_batches')
      .select('successful_audits, failed_audits, processed_sites, total_sites')
      .eq('id', batchId)
      .single();
    
    if (batchError) {
      console.error('Error fetching batch data:', batchError);
      return;
    }
    
    // Calculate new values
    const newSuccessful = (batchData.successful_audits || 0) + successful;
    const newFailed = (batchData.failed_audits || 0) + failed;
    const newProcessed = (batchData.processed_sites || 0) + successful + failed;
    const isComplete = newProcessed >= batchData.total_sites;
    
    // Update batch record
    const { error: updateError } = await supabase
      .from('audit_batches')
      .update({
        successful_audits: newSuccessful,
        failed_audits: newFailed,
        processed_sites: newProcessed,
        status: isComplete ? 'completed' : 'processing',
        completed_at: isComplete ? new Date().toISOString() : null
      })
      .eq('id', batchId);
      
    if (updateError) {
      console.error('Error updating batch status:', updateError);
    } else {
      console.log(`Batch ${batchId} updated successfully.`);
    }
  } catch (error) {
    console.error('Error in updateBatchStatus:', error);
  }
}

// Process a single audit
async function processAudit(business: any, supabase: any): Promise<{ scores: any }> {
  if (!business.website) {
    console.error('No website URL provided for business:', business.business_id);
    await updateAuditProgress(supabase, business.queue_id, 'failed', 'No website URL provided');
    return { scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, overall: 0 } };
  }

  // Run Lighthouse audit
  console.log('Starting Lighthouse audit for:', business.website);
  const auditResult = await runLighthouse(business.website);

  if (!auditResult) {
    console.error('Lighthouse audit failed for:', business.website);
    await updateAuditProgress(supabase, business.queue_id, 'failed', 'Lighthouse audit failed');
    return { scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, overall: 0 } };
  }

  console.log('Calculating scores for:', business.website);
  // Calculate scores
  const scores = {
    performance: Math.round(auditResult.categories.performance.score * 100),
    accessibility: Math.round(auditResult.categories.accessibility.score * 100),
    bestPractices: Math.round(auditResult.categories['best-practices'].score * 100),
    seo: Math.round(auditResult.categories.seo.score * 100),
    overall: Math.round(
      (auditResult.categories.performance.score * 0.3 +
      auditResult.categories.accessibility.score * 0.3 +
      auditResult.categories['best-practices'].score * 0.4) * 100
    )
  };

  console.log('Scores calculated:', scores);

  console.log('Saving audit results for:', business.website);
  // Save audit results
  const { error: insertError } = await supabase
    .from('website_audits')
    .insert({
      business_id: business.business_id,
      url: business.website,
      lighthouse_data: auditResult,
      scores: scores,
      audit_date: new Date().toISOString()
    });

  if (insertError) {
    console.error('Error saving audit:', insertError);
    await updateAuditProgress(supabase, business.queue_id, 'failed', 'Failed to save audit results');
    return { scores };
  }

  // Update business scores
  console.log('Updating business scores for:', business.name);
  await supabase
    .from('businesses')
    .update({ 
      scores: scores,
      audit_date: new Date().toISOString() 
    })
    .eq('id', business.business_id);

  // Mark audit as completed
  await updateAuditProgress(supabase, business.queue_id, 'completed');

  console.log('Audit completed successfully for:', business.name);
  return { scores };
}

// Process an audit in the background
async function processAuditInBackground(business: any, supabase: any): Promise<void> {
  try {
    // Update the audit queue status to processing
    await supabase
      .from('audit_queue')
      .update({
        status: 'processing',
        last_attempt: new Date().toISOString(),
        attempts: business.attempts + 1
      })
      .eq('id', business.queue_id);

    console.log(`Background processing business: ${business.name} (${business.website})`);
    await processAudit(business, supabase);
  } catch (error) {
    console.error(`Background processing error for ${business.name}:`, error);
    await updateAuditProgress(supabase, business.queue_id, 'failed', 
      `Background processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update audit progress helper
async function updateAuditProgress(supabase: any, queueId: string, status: string, error?: string): Promise<void> {
  try {
    console.log(`Updating audit ${queueId} status to ${status}${error ? ` with error: ${error}` : ''}`);
    
    await supabase.rpc('update_audit_progress', {
      p_queue_id: queueId,
      p_status: status,
      p_error: error
    });
    
    console.log(`Audit ${queueId} status updated successfully`);
  } catch (error) {
    console.error('Failed to update audit progress:', error);
  }
}
