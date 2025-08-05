import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobUpdatePayload {
  jobId: string
  updatedFields: string[]
  updatedBy: string
  updatedByType: 'client' | 'tradie'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { jobId, updatedFields, updatedBy, updatedByType } = await req.json() as JobUpdatePayload

    // Only send SMS if update was made by a client
    if (updatedByType !== 'client') {
      return new Response(
        JSON.stringify({ message: 'SMS only sent for client updates' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get job details with tradie information
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        profiles!jobs_client_id_fkey (
          name,
          phone,
          business_name
        )
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Get the tradie's phone number
    const tradieProfile = job.profiles
    if (!tradieProfile?.phone) {
      return new Response(
        JSON.stringify({ message: 'Tradie phone number not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get Twilio credentials from vault
    const { data: twilioSettings, error: vaultError } = await supabaseClient
      .from('vault')
      .select('decrypted_secret')
      .eq('user_id', job.client_id)
      .eq('key', 'twilio_settings')
      .single()

    if (vaultError || !twilioSettings) {
      console.error('Twilio settings not found in vault')
      return new Response(
        JSON.stringify({ 
          message: 'SMS notifications not configured. Please set up Twilio in Settings.',
          requiresSetup: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const twilioConfig = twilioSettings.decrypted_secret as any
    
    // Format the SMS message
    const updateSummary = updatedFields.join(', ')
    const message = `Job Update: ${job.customer_name} updated their ${job.job_type} request (${updateSummary}). View details: ${Deno.env.get('SITE_URL')}/job/${jobId}`

    // Send SMS via Twilio
    const accountSid = twilioConfig.accountSid
    const authToken = twilioConfig.authToken
    const fromNumber = twilioConfig.phoneNumber

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: tradieProfile.phone,
        From: fromNumber,
        Body: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio error:', error)
      throw new Error('Failed to send SMS')
    }

    const result = await response.json()

    // Log the notification
    await supabaseClient
      .from('notification_logs')
      .insert({
        job_id: jobId,
        type: 'sms',
        recipient: tradieProfile.phone,
        message: message,
        status: 'sent',
        metadata: { twilio_sid: result.sid }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS notification sent',
        sid: result.sid 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in send-job-update-sms:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})