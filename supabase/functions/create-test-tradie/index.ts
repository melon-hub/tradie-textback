import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // For now, return instructions on how to create a test tradie
    const testTradieInfo = {
      success: true,
      message: "To test the tradie dashboard (Email Auth):",
      instructions: [
        "1. Go to your auth page (/auth)",
        "2. Select 'Tradie' as user type",
        "3. Select 'Email' as login method",
        "4. Enter these details:",
        "   - Name: Test Tradie",
        "   - Email: testtradie@example.com",
        "   - Address: 456 Tradie Street, Melbourne, VIC 3000",
        "5. Click 'Send Magic Link'",
        "6. Check your email and click the link to log in",
        "7. You'll be redirected to the tradie dashboard"
      ],
      testEmail: "testtradie@example.com",
      testName: "Test Tradie",
      testAddress: "456 Tradie Street, Melbourne, VIC 3000",
      userType: "tradie",
      authMethod: "email"
    }

    return new Response(
      JSON.stringify(testTradieInfo),
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
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})