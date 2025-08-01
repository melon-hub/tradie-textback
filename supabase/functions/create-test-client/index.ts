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
    const { phone, name, address } = await req.json()
    console.log('Creating test client:', { phone, name, address })

    // Validate required fields
    if (!phone || !name) {
      throw new Error('Phone and name are required')
    }

    // Generate a test email and password
    const timestamp = Date.now()
    const testEmail = `test.client.${timestamp}@example.com`
    const testPassword = `TestClient${timestamp}!`

    // Create auth user with metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      phone: phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        name: name,
        user_type: 'client',
        address: address || ''
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw authError
    }

    const userId = authData.user.id
    console.log('Created auth user:', userId)

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify the profile was created
    let finalProfile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // If profile wasn't created by trigger, create it manually
      const { data: manualProfile, error: manualError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          phone: phone,
          name: name,
          user_type: 'client',
          address: address || null
        })
        .select()
        .single()

      if (manualError) {
        console.error('Manual profile creation error:', manualError)
        throw new Error('Failed to create user profile')
      }

      console.log('Profile created manually:', manualProfile)
      finalProfile = manualProfile
    } else {
      finalProfile = profile
    }

    console.log('Test client created successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: userId,
        email: testEmail,
        password: testPassword,
        phone: phone,
        name: name,
        message: 'Test client created successfully. Save these credentials!',
        profile: finalProfile
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
