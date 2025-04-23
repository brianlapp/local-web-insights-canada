
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { runLighthouse } from './lighthouse.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BusinessToAudit {
  business_id: string;
  queue_id: string;
  batch_id: string;
  website: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get next business to audit
    const { data: nextBusiness, error: fetchError } = await supabase
      .rpc('get_next_audit_business')
      .single();

    if (fetchError || !nextBusiness) {
      console.error('Error fetching next business:', fetchError);
      return new Response(
        JSON.stringify({ error: 'No businesses to audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const business = nextBusiness as BusinessToAudit;
    
    if (!business.website) {
      await supabase.rpc('update_audit_progress', {
        p_queue_id: business.queue_id,
        p_status: 'failed',
        p_error: 'No website URL provided'
      });
      return new Response(
        JSON.stringify({ error: 'No website URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Run Lighthouse audit
    console.log(`Starting audit for ${business.name} (${business.website})`);
    const auditResult = await runLighthouse(business.website);

    if (!auditResult) {
      await supabase.rpc('update_audit_progress', {
        p_queue_id: business.queue_id,
        p_status: 'failed',
        p_error: 'Lighthouse audit failed'
      });
      return new Response(
        JSON.stringify({ error: 'Audit failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Calculate scores
    const scores = {
      performance: Math.round(auditResult.categories.performance.score * 100),
      accessibility: Math.round(auditResult.categories.accessibility.score * 100),
      seo: Math.round(auditResult.categories['best-practices'].score * 100),
      overall: Math.round(
        (auditResult.categories.performance.score * 0.3 +
        auditResult.categories.accessibility.score * 0.3 +
        auditResult.categories['best-practices'].score * 0.4) * 100
      )
    };

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
      await supabase.rpc('update_audit_progress', {
        p_queue_id: business.queue_id,
        p_status: 'failed',
        p_error: 'Failed to save audit results'
      });
      return new Response(
        JSON.stringify({ error: 'Failed to save audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update business scores
    await supabase
      .from('businesses')
      .update({ scores: scores })
      .eq('id', business.business_id);

    // Mark audit as completed
    await supabase.rpc('update_audit_progress', {
      p_queue_id: business.queue_id,
      p_status: 'completed'
    });

    return new Response(
      JSON.stringify({ success: true, business: business.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing audit:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
