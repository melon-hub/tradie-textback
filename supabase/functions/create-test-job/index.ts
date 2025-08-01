import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Get the request body
    const { clientId, description, customerName, phone, jobType, location, urgency } = await req.json()
    console.log('Creating test job for client:', clientId)

    // Validate required fields
    if (!clientId) {
      throw new Error('clientId is required')
    }

    // Validate clientId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      throw new Error('clientId must be a valid UUID')
    }

    // First verify the client exists
    const { data: clientProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', clientId)
      .eq('user_type', 'client')
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      if (profileError.code === 'PGRST116') {
        throw new Error(`Client not found with ID: ${clientId}. Make sure the client exists and is of type 'client'.`)
      }
      throw new Error(`Error looking up client: ${profileError.message}`)
    }

    if (!clientProfile) {
      throw new Error(`Client profile not found: ${clientId}`)
    }

    // Validate urgency if provided
    const validUrgencies = ['low', 'medium', 'high', 'urgent']
    if (urgency && !validUrgencies.includes(urgency)) {
      throw new Error(`Invalid urgency value. Must be one of: ${validUrgencies.join(', ')}`)
    }

    // Create job data with defaults for test job
    const jobData = {
      client_id: clientId,
      customer_name: customerName || clientProfile.name || 'Test Customer',
      phone: phone || clientProfile.phone || '+61400000000',
      job_type: jobType || 'Test Job - Plumbing Inspection',
      location: location || clientProfile.address || '123 Test Street, Sydney NSW 2000',
      urgency: urgency || 'medium',
      status: 'new',
      estimated_value: 250.00,
      description: description || 'Test job for client onboarding verification. This job tests that the client can see their own jobs in the dashboard.',
      preferred_time: 'Any time',
      last_contact: new Date().toISOString(),
      sms_blocked: false
    }

    console.log('Creating job with data:', jobData)

    // Insert the job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      throw jobError
    }

    console.log('Test job created successfully:', job.id)

    // Create a job link for customer access
    let jobLink = null
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin
        .rpc('create_job_link', {
          p_job_id: job.id,
          p_phone: job.phone,
          p_expires_hours: 720 // 30 days
        })

      if (linkError) {
        console.error('Job link creation error:', linkError)
      } else if (linkData) {
        // Construct the full URL for the job link
        const baseUrl = supabaseUrl.replace('.supabase.co', '')
        jobLink = `${baseUrl}.supabase.co/jobs/${linkData}`
        console.log('Job link created:', jobLink)
      }
    } catch (linkErr) {
      console.error('Failed to create job link:', linkErr)
      // Non-fatal error, job was still created
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        jobId: job.id,
        job: job,
        jobLink: jobLink,
        message: 'Test job created successfully in database',
        clientProfile: {
          name: clientProfile.name,
          phone: clientProfile.phone,
          address: clientProfile.address
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})
