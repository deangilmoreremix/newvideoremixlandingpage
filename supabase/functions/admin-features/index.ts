import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface FeatureData {
  name: string
  slug: string
  description?: string
  is_enabled?: boolean
  config?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const method = req.method

    // Handle different routes
    if (method === 'GET' && pathParts.length === 4) {
      // GET /admin/features - List all features
      return await getFeatures(supabaseClient)
    } else if (method === 'POST' && pathParts.length === 4) {
      // POST /admin/features - Create new feature
      return await createFeature(req, supabaseClient)
    } else if (method === 'GET' && pathParts.length === 5) {
      // GET /admin/features/{id} - Get specific feature
      const featureId = pathParts[4]
      return await getFeature(featureId, supabaseClient)
    } else if (method === 'PUT' && pathParts.length === 5) {
      // PUT /admin/features/{id} - Update feature
      const featureId = pathParts[4]
      return await updateFeature(req, featureId, supabaseClient)
    } else if (method === 'DELETE' && pathParts.length === 5) {
      // DELETE /admin/features/{id} - Delete feature
      const featureId = pathParts[4]
      return await deleteFeature(featureId, supabaseClient)
    } else if (method === 'POST' && pathParts.includes('toggle')) {
      // POST /admin/features/{id}/toggle - Toggle feature status
      const featureId = pathParts[4]
      return await toggleFeature(req, featureId, supabaseClient)
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin features error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getFeatures(supabaseClient: any) {
  const { data: features, error } = await supabaseClient
    .from('features')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: features
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createFeature(req: Request, supabaseClient: any) {
  const featureData: FeatureData = await req.json()

  const { data: feature, error } = await supabaseClient
    .from('features')
    .insert([{
      name: featureData.name,
      slug: featureData.slug,
      description: featureData.description || '',
      is_enabled: featureData.is_enabled ?? true,
      config: featureData.config || {}
    }])
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: feature
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getFeature(featureId: string, supabaseClient: any) {
  const { data: feature, error } = await supabaseClient
    .from('features')
    .select('*')
    .eq('id', featureId)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'Feature not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: feature
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateFeature(req: Request, featureId: string, supabaseClient: any) {
  const featureData: Partial<FeatureData> = await req.json()

  const { data: feature, error } = await supabaseClient
    .from('features')
    .update(featureData)
    .eq('id', featureId)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: feature
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteFeature(featureId: string, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('features')
    .delete()
    .eq('id', featureId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Feature deleted successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function toggleFeature(req: Request, featureId: string, supabaseClient: any) {
  // First get current status
  const { data: currentFeature, error: fetchError } = await supabaseClient
    .from('features')
    .select('is_enabled')
    .eq('id', featureId)
    .single()

  if (fetchError) {
    return new Response(JSON.stringify({ error: 'Feature not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Toggle the status
  const newStatus = !currentFeature.is_enabled

  const { data: feature, error } = await supabaseClient
    .from('features')
    .update({ is_enabled: newStatus })
    .eq('id', featureId)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: feature,
    message: `Feature ${newStatus ? 'enabled' : 'disabled'} successfully`
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}