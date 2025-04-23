import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { runLighthouse } from './lighthouse.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    console.log('Fetching next business to audit...');

    // Get next business to audit with improved error handling
    const { data: nextBusiness, error: fetchError } = await supabase
      .rpc('get_next_audit_business')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching next business:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error fetching business to audit', details: fetchError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!nextBusiness) {
      console.log('No businesses to audit at this time');
      return new Response(
        JSON.stringify({ message: 'No businesses to audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Log retrieved business data with explicit field access
    console.log('Retrieved business data:', {
      id: nextBusiness.business_id,
      name: nextBusiness.name,
      website: nextBusiness.website,
      queue_id: nextBusiness.queue_id,
      batch_id: nextBusiness.batch_id
    });
    
    if (!nextBusiness.website) {
      console.error('No website URL provided for business:', nextBusiness.business_id);
      await supabase.rpc('update_audit_progress', {
        p_queue_id: nextBusiness.queue_id,
        p_status: 'failed',
        p_error: 'No website URL provided'
      });
      return new Response(
        JSON.stringify({ error: 'No website URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Run Lighthouse audit
    console.log('Starting Lighthouse audit...');
    const auditResult = await runLighthouse(nextBusiness.website);

    if (!auditResult) {
      console.error('Lighthouse audit failed for:', nextBusiness.website);
      await supabase.rpc('update_audit_progress', {
        p_queue_id: nextBusiness.queue_id,
        p_status: 'failed',
        p_error: 'Lighthouse audit failed'
      });
      return new Response(
        JSON.stringify({ error: 'Audit failed', details: 'Lighthouse returned no results' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Calculating scores...');
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

    console.log('Saving audit results...');
    // Save audit results
    const { error: insertError } = await supabase
      .from('website_audits')
      .insert({
        business_id: nextBusiness.business_id,
        url: nextBusiness.website,
        lighthouse_data: auditResult,
        scores: scores,
        audit_date: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error saving audit:', insertError);
      await supabase.rpc('update_audit_progress', {
        p_queue_id: nextBusiness.queue_id,
        p_status: 'failed',
        p_error: 'Failed to save audit results'
      });
      return new Response(
        JSON.stringify({ error: 'Failed to save audit', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update business scores
    console.log('Updating business scores...');
    await supabase
      .from('businesses')
      .update({ scores: scores })
      .eq('id', nextBusiness.business_id);

    // Mark audit as completed
    await supabase.rpc('update_audit_progress', {
      p_queue_id: nextBusiness.queue_id,
      p_status: 'completed'
    });

    console.log('Audit completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        business: nextBusiness.name,
        scores: scores 
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
})
