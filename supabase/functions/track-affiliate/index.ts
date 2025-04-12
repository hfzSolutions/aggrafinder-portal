
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  // Get request body
  let body
  try {
    body = await req.json()
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { 
    affiliateCode, 
    toolId, 
    ipAddress = null, 
    userAgent = null 
  } = body

  if (!affiliateCode || !toolId) {
    return new Response(
      JSON.stringify({ error: 'affiliateCode and toolId are required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Look up the affiliate ID from the affiliate code
    const { data: affiliateData, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .eq('is_active', true)
      .single()

    if (affiliateError || !affiliateData) {
      console.error('Affiliate error:', affiliateError)
      return new Response(
        JSON.stringify({ error: 'Invalid affiliate code or inactive affiliate' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if the tool exists
    const { data: toolData, error: toolError } = await supabase
      .from('ai_tools')
      .select('id')
      .eq('id', toolId)
      .single()

    if (toolError || !toolData) {
      console.error('Tool error:', toolError)
      return new Response(
        JSON.stringify({ error: 'Invalid tool ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Record the affiliate click
    const { data: clickData, error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert([
        {
          affiliate_id: affiliateData.id,
          tool_id: toolId,
          ip_address: ipAddress,
          user_agent: userAgent?.substring(0, 255) || null, // Truncate to prevent errors
        },
      ])
      .select()

    if (clickError) {
      console.error('Click error:', clickError)
      return new Response(
        JSON.stringify({ error: 'Failed to record affiliate click' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Record in tool_analytics as well
    await supabase.from('tool_analytics').insert([
      {
        tool_id: toolId,
        user_id: 'anonymous',
        action: 'affiliate_click',
        affiliate_code: affiliateCode,
        metadata: { 
          affiliate_id: affiliateData.id,
          click_id: clickData[0].id,
        },
      },
    ])

    return new Response(
      JSON.stringify({ success: true, clickId: clickData[0].id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
