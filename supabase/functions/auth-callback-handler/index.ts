import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OnboardingData {
  basicInfo: {
    name?: string;
    phone?: string;
    email?: string;
    trade_primary?: string;
    years_experience?: number;
  };
  businessDetails: {
    business_name?: string;
    abn?: string;
    license_number?: string;
    license_expiry?: string;
    insurance_provider?: string;
    insurance_expiry?: string;
  };
  serviceArea: {
    service_postcodes?: string[];
    service_radius_km?: number;
  };
  smsTemplates: Array<{
    template_type: string;
    content: string;
    variables?: string[];
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { 
      user_id, 
      onboarding_data, 
      stored_onboarding_data 
    } = await req.json()

    console.log('Auth callback handler request:', { 
      user_id, 
      has_onboarding_data: !!onboarding_data,
      has_stored_data: !!stored_onboarding_data 
    })

    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Use stored onboarding data as fallback if direct data is not available
    const finalOnboardingData: OnboardingData = onboarding_data || stored_onboarding_data

    if (!finalOnboardingData) {
      throw new Error('No onboarding data found')
    }

    // Extract data for profile update
    const profileUpdate: any = {
      user_type: 'tradie',
      onboarding_completed: true,
      onboarding_step: 6, // Complete step
      updated_at: new Date().toISOString()
    }

    // Map basic info fields
    if (finalOnboardingData.basicInfo) {
      const { name, phone, trade_primary, years_experience } = finalOnboardingData.basicInfo
      if (name) profileUpdate.name = name
      if (phone) profileUpdate.phone = phone
      if (trade_primary) profileUpdate.trade_primary = trade_primary
      if (years_experience !== undefined) profileUpdate.years_experience = years_experience
    }

    // Map business details fields
    if (finalOnboardingData.businessDetails) {
      const { 
        business_name, 
        abn, 
        license_number, 
        license_expiry, 
        insurance_provider, 
        insurance_expiry 
      } = finalOnboardingData.businessDetails
      
      if (business_name) profileUpdate.business_name = business_name
      if (abn) profileUpdate.abn = abn
      if (license_number) profileUpdate.license_number = license_number
      if (license_expiry) profileUpdate.license_expiry = license_expiry
      if (insurance_provider) profileUpdate.insurance_provider = insurance_provider
      if (insurance_expiry) profileUpdate.insurance_expiry = insurance_expiry
    }

    // Map service area fields
    if (finalOnboardingData.serviceArea) {
      const { service_postcodes, service_radius_km } = finalOnboardingData.serviceArea
      if (service_postcodes) profileUpdate.service_postcodes = service_postcodes
      if (service_radius_km !== undefined) profileUpdate.service_radius_km = service_radius_km
    }

    console.log('Updating profile with data:', profileUpdate)

    // Update the user's profile
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        user_id: user_id,
        ...profileUpdate
      })
      .select()

    if (profileError) {
      console.error('Profile update error:', profileError)
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    console.log('Profile updated successfully:', profileData)

    // Create default SMS templates if provided
    if (finalOnboardingData.smsTemplates && finalOnboardingData.smsTemplates.length > 0) {
      const smsTemplateInserts = finalOnboardingData.smsTemplates.map(template => ({
        user_id: user_id,
        template_type: template.template_type,
        content: template.content,
        variables: template.variables || [],
        is_active: true
      }))

      const { error: templatesError } = await supabaseClient
        .from('tenant_sms_templates')
        .upsert(smsTemplateInserts)

      if (templatesError) {
        console.error('SMS templates creation error:', templatesError)
        // Don't fail the entire process for SMS template errors
        console.log('Continuing despite SMS template errors')
      } else {
        console.log('SMS templates created successfully')
      }
    }

    // Create default SMS templates using the database function if no custom templates
    if (!finalOnboardingData.smsTemplates || finalOnboardingData.smsTemplates.length === 0) {
      const { error: defaultTemplatesError } = await supabaseClient
        .rpc('create_default_sms_templates', { target_user_id: user_id })

      if (defaultTemplatesError) {
        console.error('Default SMS templates creation error:', defaultTemplatesError)
        // Don't fail the entire process for SMS template errors
        console.log('Continuing despite default SMS template errors')
      } else {
        console.log('Default SMS templates created successfully')
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Onboarding data processed successfully',
        user_id: user_id,
        profile_updated: true,
        templates_created: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Auth callback handler error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})