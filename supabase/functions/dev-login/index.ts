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
    const { email, name, userType, address } = await req.json()
    console.log('Dev login request:', { email, name, userType, address })

    // Create or get user
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: email,
      email_confirm: true, // Skip email confirmation for dev
      user_metadata: {
        name: name,
        email: email,
        user_type: userType,
        address: address || null
      }
    })

    if (authError) {
      // If user already exists, try to get them
      console.log('User might already exist, trying to get user:', authError.message)
      
      const { data: existingUsers, error: listError } = await supabaseClient.auth.admin.listUsers()
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`)
      }
      
      const existingUser = existingUsers.users.find(u => u.email === email)
      if (!existingUser) {
        throw new Error(`Auth error: ${authError.message}`)
      }
      
      console.log('Found existing user:', existingUser.id)
      
      // Generate a session for the existing user
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: 'http://localhost:8082/dashboard'
        }
      })
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          userId: existingUser.id,
          email: email,
          name: name,
          userType: userType,
          loginUrl: sessionData.properties.action_link,
          message: 'Existing user - use the login URL below',
          instructions: [
            'Copy the loginUrl from the response',
            'Paste it in your browser address bar',
            'You will be automatically logged in'
          ]
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )
    }
    
    console.log('User created successfully:', authData.user.id)

    // Generate a magic link for the new user
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'http://localhost:8082/dashboard'
      }
    })
    
    if (linkError) {
      throw new Error(`Link generation error: ${linkError.message}`)
    }
    
    console.log('Generated login URL:', linkData.properties.action_link)

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: authData.user.id,
        email: email,
        name: name,
        userType: userType,
        loginUrl: linkData.properties.action_link,
        message: 'Dev user created successfully - use the login URL below',
        instructions: [
          'Copy the loginUrl from the response',
          'Paste it in your browser address bar',
          'You will be automatically logged in as the test user'
        ]
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Dev login error:', error)
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