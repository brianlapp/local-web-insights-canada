
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define the expected structure of the scores object
interface Scores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  overall: number;
}

// Define the expected structure of the PageSpeed API response (simplified)
interface PageSpeedApiResponse {
  lighthouseResult?: {
    categories: {
      performance?: { score: number };
      accessibility?: { score: number };
      'best-practices'?: { score: number }; // Note the key name
      seo?: { score: number };
    };
    audits?: any; // Keep the full audit data if needed
    configSettings?: any;
    environment?: any;
    fetchTime?: string;
    finalUrl?: string;
    i18n?: any;
    lighthouseVersion?: string;
    requestedUrl?: string;
    runWarnings?: any[];
    timing?: any;
    userAgent?: string;
  };
  loadingExperience?: any;
  analysisUTCTimestamp?: string;
  id?: string;
  kind?: string;
  error?: { // Added error structure
    code: number;
    message: string;
    errors: any[];
  };
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Batch size for processing multiple audits
const DEFAULT_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 10; // Reduced max batch size due to potential API rate limits

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting audit process using PageSpeed Insights API...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get PageSpeed API Key
    const apiKey = Deno.env.get('PAGESPEED_API_KEY');
    if (!apiKey) {
      console.error('PAGESPEED_API_KEY environment variable not set.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: API key missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

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

    // Get the pending audits - ONLY GET BUSINESSES WITH WEBSITES
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
      .not('businesses.website', 'is', null) // Only get businesses with websites
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
      console.log('No businesses with valid websites to audit at this time');
      return new Response(
        JSON.stringify({ message: 'No businesses with valid websites to audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${pendingAudits.length} businesses with websites to audit`);

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

    // Validate website URL before processing
    if (!firstBusiness.website || !isValidUrl(firstBusiness.website)) {
      console.error(`Invalid website URL for business: ${firstBusiness.business_id}`);
      await updateAuditProgress(supabase, firstBusiness.queue_id, 'failed', 'Invalid website URL');
      // Don't return immediately in batch mode, allow others to process
      if (!isBatchProcess) {
        return new Response(
          JSON.stringify({ error: 'Invalid website URL', business: firstBusiness.name }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Update the first audit queue item status to processing (only if URL is valid)
    let firstResult: { scores: Scores | null } = { scores: null }; // Initialize with null
    if (firstBusiness.website && isValidUrl(firstBusiness.website)) {
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
        firstResult = await processAudit(firstBusiness, supabase, apiKey);
    }


    // If we're in batch mode, process the rest of the audits in the background
    if (isBatchProcess && pendingAudits.length > 1) {
      console.log(`Processing remaining ${pendingAudits.length - 1} businesses in the background...`);

      const remainingAuditsPromises = pendingAudits.slice(1).map(audit => {
        const business = {
          business_id: audit.business_id,
          queue_id: audit.id,
          batch_id: audit.batch_id,
          website: audit.businesses?.website,
          name: audit.businesses?.name,
          attempts: audit.attempts || 0
        };

        // Skip businesses without valid websites immediately
        if (!business.website || !isValidUrl(business.website)) {
          console.log(`Skipping business ${business.name} - invalid or missing website URL`);
          // Mark as failed directly without background processing
          return updateAuditProgress(supabase, business.queue_id, 'failed', 'Invalid or missing website URL').then(() => 'skipped'); // Ensure it returns a promise
        }

        // Process valid businesses in background
        return processAuditInBackground(business, supabase, apiKey);
      });

      // Use waitUntil for background processing without blocking the response
        if (typeof EdgeRuntime !== 'undefined') {
            try {
                // @ts-ignore - Deno Edge Runtime
                EdgeRuntime.waitUntil(
                    Promise.allSettled(remainingAuditsPromises).then(results => {
                        console.log(`Background processing complete. Results: ${results.length} items processed.`);
                        // Correctly count successful and failed background tasks
                        let successfulBackground = 0;
                        let failedBackground = 0;
                        results.forEach(r => {
                            if (r.status === 'fulfilled' && r.value !== 'skipped') {
                                successfulBackground++;
                            } else if (r.status === 'rejected' || r.value === 'skipped') {
                                failedBackground++;
                            }
                        });

                        // Include the result of the first audit in batch counts
                        const totalSuccessful = (firstResult.scores ? 1 : 0) + successfulBackground;
                        const totalFailed = (firstResult.scores ? 0 : 1) + failedBackground; // Assuming firstResult.scores is null on failure
                        console.log(`Total Batch Success: ${totalSuccessful}, Total Batch Failed: ${totalFailed}`);


                        if (firstBusiness.batch_id) {
                             // Important: Update batch status based on ALL results in this invocation
                             updateBatchStatus(supabase, firstBusiness.batch_id, totalSuccessful, totalFailed);
                        }
                    })
                );
            } catch (waitUntilError) {
                console.error('Error with EdgeRuntime.waitUntil:', waitUntilError);
                // Fallback or logging if waitUntil is not available or fails
            }
        } else {
            // If EdgeRuntime is not available, process sequentially (might timeout)
            console.warn("EdgeRuntime.waitUntil not available. Processing remaining audits sequentially.");
            await Promise.allSettled(remainingAuditsPromises);
             let successfulBackground = 0;
             let failedBackground = 0;
              const results = await Promise.allSettled(remainingAuditsPromises);
               results.forEach(r => {
                    if (r.status === 'fulfilled' && r.value !== 'skipped') {
                        successfulBackground++;
                    } else if (r.status === 'rejected' || r.value === 'skipped') {
                         failedBackground++;
                     }
                });
             const totalSuccessful = (firstResult.scores ? 1 : 0) + successfulBackground;
             const totalFailed = (firstResult.scores ? 0 : 1) + failedBackground;
             console.log(`Total Batch Success (Sequential): ${totalSuccessful}, Total Batch Failed (Sequential): ${totalFailed}`);
             if (firstBusiness.batch_id) {
                 updateBatchStatus(supabase, firstBusiness.batch_id, totalSuccessful, totalFailed);
             }
        }

      // Return the result of the first audit along with batch info
      return new Response(
        JSON.stringify({
          success: !!firstResult.scores, // Indicate success based on the first audit
          business: firstBusiness.name,
          scores: firstResult.scores, // May be null if the first one failed
          batchSize: pendingAudits.length,
          batchStatus: 'processing',
          message: `Processing ${pendingAudits.length} businesses in total. First audit result returned.`,
          requestedBatchSize: requestedBatchSize,
          actualBatchSize: batchSize
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If single mode or only one audit in batch, just return the result
    return new Response(
      JSON.stringify({
        success: !!firstResult.scores,
        business: firstBusiness.name,
        scores: firstResult.scores
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: firstResult.scores ? 200 : 500 } // Return 500 if the single audit failed
    );

  } catch (error) {
    console.error('Critical error processing audit function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// URL validation helper function
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Basic check for http/https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
}

// Helper to update batch status based on the counts from a single invocation
async function updateBatchStatus(supabase: any, batchId: string, successfulInRun: number, failedInRun: number) {
  try {
    console.log(`Attempting to update batch ${batchId} status with ${successfulInRun} successful and ${failedInRun} failed audits from this run.`);

     // Use RPC function to handle atomic updates
     const { error: rpcError } = await supabase.rpc('update_audit_batch_progress', {
       p_batch_id: batchId,
       p_successful_increment: successfulInRun,
       p_failed_increment: failedInRun
     });

     if (rpcError) {
       console.error(`Error updating batch ${batchId} status via RPC:`, rpcError);
     } else {
       console.log(`Batch ${batchId} status update successful via RPC.`);
     }

  } catch (error) {
    console.error('Error in updateBatchStatus function:', error);
  }
}

// Process a single audit using PageSpeed Insights API
async function processAudit(business: any, supabase: any, apiKey: string): Promise<{ scores: Scores | null }> {
   const defaultScores: Scores = { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, overall: 0 };

  if (!business.website) {
    console.error('No website URL provided for business:', business.business_id);
    await updateAuditProgress(supabase, business.queue_id, 'failed', 'No website URL provided');
    return { scores: null };
  }

  // --- Call PageSpeed Insights API ---
  console.log(`[${business.name}] Calling PageSpeed Insights API for: ${business.website}`);
  const categories = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'];
  const strategy = 'DESKTOP'; // Or 'MOBILE' or run both? For now, stick to one.
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(business.website)}&key=${apiKey}&category=${categories.join('&category=')}&strategy=${strategy}`;

  let apiResponse: PageSpeedApiResponse;
  let lighthouseResult: PageSpeedApiResponse['lighthouseResult'] | undefined;

  try {
    const response = await fetch(apiUrl);
    console.log(`[${business.name}] PageSpeed API raw response status: ${response.status}`);

    if (!response.ok) {
        const errorBody = await response.text(); // Read body for more details
        console.error(`[${business.name}] PageSpeed API HTTP error! Status: ${response.status}, Body: ${errorBody}`);
         // Attempt to parse error JSON if possible
        let errorMessage = `PageSpeed API HTTP error ${response.status}`;
        try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.error?.message || errorMessage;
        } catch (parseError) { /* Ignore if body isn't JSON */ }

      await updateAuditProgress(supabase, business.queue_id, 'failed', errorMessage);
      return { scores: null };
    }

    apiResponse = await response.json() as PageSpeedApiResponse;

    // Check for errors within the API response body
     if (apiResponse.error) {
         console.error(`[${business.name}] PageSpeed API returned an error:`, apiResponse.error.message, apiResponse.error.errors);
         await updateAuditProgress(supabase, business.queue_id, 'failed', `PageSpeed API Error: ${apiResponse.error.message}`);
         return { scores: null };
     }

    lighthouseResult = apiResponse.lighthouseResult;

    if (!lighthouseResult || !lighthouseResult.categories) {
        console.error(`[${business.name}] Invalid or incomplete PageSpeed API response structure. Missing lighthouseResult or categories.`);
        await updateAuditProgress(supabase, business.queue_id, 'failed', 'Incomplete PageSpeed API response');
        return { scores: null };
    }

    console.log(`[${business.name}] Received PageSpeed API response successfully.`);

  } catch (error) {
    console.error(`[${business.name}] Error calling PageSpeed Insights API:`, error);
    await updateAuditProgress(supabase, business.queue_id, 'failed', `API Fetch Error: ${error instanceof Error ? error.message : 'Unknown fetch error'}`);
    return { scores: null };
  }

  // --- Extract and Calculate Scores ---
  console.log(`[${business.name}] Calculating scores...`);
  try {
    const categories = lighthouseResult.categories;
    // Get scores (0-1), multiply by 100, default to 0 if category is missing
    const performanceScore = Math.round((categories.performance?.score ?? 0) * 100);
    const accessibilityScore = Math.round((categories.accessibility?.score ?? 0) * 100);
    const bestPracticesScore = Math.round((categories['best-practices']?.score ?? 0) * 100);
    const seoScore = Math.round((categories.seo?.score ?? 0) * 100);

    // Calculate overall score using the same weights as before
    const overallScore = Math.round(
      (performanceScore * 0.3) +
      (accessibilityScore * 0.3) +
      (bestPracticesScore * 0.2) +
      (seoScore * 0.2)
    );

    const calculatedScores: Scores = {
      performance: performanceScore,
      accessibility: accessibilityScore,
      bestPractices: bestPracticesScore,
      seo: seoScore,
      overall: overallScore,
    };

    console.log(`[${business.name}] Scores calculated:`, calculatedScores);

    // --- Save Audit Results ---
    const auditDate = new Date().toISOString();
    console.log(`[${business.name}] Saving audit results...`);
    const { error: insertError } = await supabase
      .from('website_audits')
      .insert({
        business_id: business.business_id,
        url: business.website,
        // Store the relevant part of the Lighthouse result, not the massive full report unless needed
        lighthouse_data: { // Store a subset for sanity
             categories: lighthouseResult.categories,
             fetchTime: lighthouseResult.fetchTime,
             finalUrl: lighthouseResult.finalUrl,
             lighthouseVersion: lighthouseResult.lighthouseVersion,
             timing: lighthouseResult.timing,
             environment: lighthouseResult.environment,
             configSettings: lighthouseResult.configSettings,
             runWarnings: lighthouseResult.runWarnings,
         },
        scores: calculatedScores, // Use the calculated scores
        audit_date: auditDate
      });

    if (insertError) {
      console.error(`[${business.name}] Error saving audit results to website_audits:`, insertError);
      // Don't fail the whole process here, but log it. The queue status will reflect the overall outcome.
      // Consider if this should mark the queue item as failed. For now, we proceed to update business.
      await updateAuditProgress(supabase, business.queue_id, 'failed', `Failed to save audit details: ${insertError.message}`);
      return { scores: null }; // Return null as saving failed
    }

    // --- Update Business Scores ---
    console.log(`[${business.name}] Updating business scores...`);
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        scores: calculatedScores,
        audit_date: auditDate
      })
      .eq('id', business.business_id);

     if (updateError) {
        console.error(`[${business.name}] Error updating scores in businesses table:`, updateError);
         await updateAuditProgress(supabase, business.queue_id, 'failed', `Failed to update business score: ${updateError.message}`);
         return { scores: null }; // Return null as update failed
      }


    // --- Mark Audit as Completed ---
    await updateAuditProgress(supabase, business.queue_id, 'completed');

    console.log(`[${business.name}] Audit completed successfully.`);
    return { scores: calculatedScores };

  } catch (calculationError) {
      console.error(`[${business.name}] Error processing API results or saving data:`, calculationError);
      await updateAuditProgress(supabase, business.queue_id, 'failed', `Processing Error: ${calculationError instanceof Error ? calculationError.message : 'Unknown processing error'}`);
      return { scores: null };
  }
}

// Process an audit in the background
// Added apiKey parameter
async function processAuditInBackground(business: any, supabase: any, apiKey: string): Promise<void | 'skipped'> {
  try {
    // Update the audit queue status to processing
     const { error: updateError } = await supabase
      .from('audit_queue')
      .update({
        status: 'processing',
        last_attempt: new Date().toISOString(),
        attempts: business.attempts + 1
      })
      .eq('id', business.queue_id);

      if (updateError){
          console.error(`[${business.name}] Background Error: Failed to update queue status to processing:`, updateError);
          // Don't stop, attempt the audit anyway, but log the error
      }


    console.log(`[${business.name}] Background processing starting...`);
    const result = await processAudit(business, supabase, apiKey); // Pass apiKey

    // If processAudit resulted in failure (returned null), the status is already set within processAudit
    if (result.scores) {
       console.log(`[${business.name}] Background processing completed successfully.`);
    } else {
         console.log(`[${business.name}] Background processing failed (handled within processAudit).`);
         // Throw an error to indicate failure to the Promise.allSettled in the main handler
         throw new Error(`Audit failed for ${business.name}`);
    }

  } catch (error) {
    console.error(`[${business.name}] Background processing critical error:`, error);
    // Ensure the status is marked as failed if an unexpected error occurs here
    await updateAuditProgress(supabase, business.queue_id, 'failed',
      `Background Processing Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error; // Re-throw error for Promise.allSettled
  }
}


// Update audit progress helper - Using RPC for atomicity
async function updateAuditProgress(supabase: any, queueId: string, status: string, errorMsg?: string): Promise<void> {
  try {
    console.log(`Updating audit ${queueId} status to ${status}${errorMsg ? ` with error: ${errorMsg.substring(0, 200)}...` : ''}`); // Log trimmed error

    // Call the RPC function to update the audit queue item
    const { error: rpcError } = await supabase.rpc('update_audit_progress', {
      p_queue_id: queueId,
      p_status: status,
      p_error: errorMsg || null // Pass null if no error message
    });

    if (rpcError) {
      console.error(`Failed to update audit progress for ${queueId} via RPC:`, rpcError);
      // Consider fallback or retry? For now, just log.
    } else {
      // console.log(`Audit ${queueId} status updated successfully via RPC.`);
    }
  } catch (error) {
    console.error(`Critical error in updateAuditProgress function for ${queueId}:`, error);
  }
}


