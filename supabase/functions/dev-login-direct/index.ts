import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://cjxejmljovszxuleibqn.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'sb_secret_HGVs8AEQ7vy79W4rCD0fRQ_n8UCo0eO'
    )

    // Get the request body
    const { email, name, userType, address, isAdmin } = await req.json()
    console.log('Dev login direct request:', { email, name, userType, address, isAdmin })

    // First, try to get existing user
    const { data: existingUsers, error: listError } = await supabaseClient.auth.admin.listUsers()
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }
    
    let user = existingUsers.users.find(u => u.email === email)
    
    // If user doesn't exist, create them
    if (!user) {
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          name: name,
          email: email,
          user_type: userType,
          address: address || null,
          is_admin: isAdmin || false
        }
      })
      
      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`)
      }
      
      user = authData.user
      console.log('Created new user:', user.id)
    } else {
      console.log('Using existing user:', user.id)
    }
    
    // Update the profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        user_id: user.id,
        name: name,
        email: email,
        user_type: userType,
        address: address || null,
        is_admin: isAdmin || false,
        onboarding_completed: userType === 'tradie' || isAdmin
      })
      .eq('user_id', user.id)
    
    if (profileError) {
      console.error('Failed to update profile:', profileError)
    }

    // Instead of generating a magic link, create a session directly
    const { data: session, error: sessionError } = await supabaseClient.auth.admin.createSession({
      userId: user.id
    })
    
    if (sessionError) {
      throw new Error(`Session creation error: ${sessionError.message}`)
    }
    
    console.log('Created session for user:', user.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: user.id,
        email: email,
        name: name,
        userType: userType,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        },
        message: 'Direct session created - use the session tokens'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Dev login direct error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})