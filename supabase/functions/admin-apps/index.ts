import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AppData {
  name: string
  slug: string
  description?: string
  category?: string
  icon_url?: string
  is_active?: boolean
  is_featured?: boolean
  sort_order?: number
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

    // For now, we'll skip JWT verification and assume admin access
    // In production, implement proper JWT verification

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const method = req.method

    // Handle different routes
    if (method === 'GET' && pathParts.length === 4) {
      // GET /admin/apps - List all apps
      return await getApps(supabaseClient)
    } else if (method === 'POST' && pathParts.length === 4) {
      // POST /admin/apps - Create new app
      return await createApp(req, supabaseClient)
    } else if (method === 'GET' && pathParts.length === 5) {
      // GET /admin/apps/{id} - Get specific app
      const appId = pathParts[4]
      return await getApp(appId, supabaseClient)
    } else if (method === 'PUT' && pathParts.length === 5) {
      // PUT /admin/apps/{id} - Update app
      const appId = pathParts[4]
      return await updateApp(req, appId, supabaseClient)
    } else if (method === 'DELETE' && pathParts.length === 5) {
      // DELETE /admin/apps/{id} - Delete app
      const appId = pathParts[4]
      return await deleteApp(appId, supabaseClient)
    } else if (method === 'POST' && pathParts.includes('toggle')) {
      // POST /admin/apps/{id}/toggle - Toggle app status
      const appId = pathParts[4]
      return await toggleApp(req, appId, supabaseClient)
    } else if (method === 'POST' && pathParts.includes('reorder')) {
      // POST /admin/apps/reorder - Reorder apps
      return await reorderApps(req, supabaseClient)
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin apps error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getApps(supabaseClient: any) {
  const { data: apps, error } = await supabaseClient
    .from('apps')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: apps
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createApp(req: Request, supabaseClient: any) {
  const appData: AppData = await req.json()

  const { data: app, error } = await supabaseClient
    .from('apps')
    .insert([{
      name: appData.name,
      slug: appData.slug,
      description: appData.description || '',
      category: appData.category || 'general',
      icon_url: appData.icon_url || '',
      is_active: appData.is_active ?? true,
      is_featured: appData.is_featured ?? false,
      sort_order: appData.sort_order || 0,
      config: appData.config || {}
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
    data: app
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getApp(appId: string, supabaseClient: any) {
  const { data: app, error } = await supabaseClient
    .from('apps')
    .select('*')
    .eq('id', appId)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'App not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: app
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateApp(req: Request, appId: string, supabaseClient: any) {
  const appData: Partial<AppData> = await req.json()

  const { data: app, error } = await supabaseClient
    .from('apps')
    .update({
      ...appData,
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
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
    data: app
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteApp(appId: string, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('apps')
    .delete()
    .eq('id', appId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'App deleted successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function toggleApp(req: Request, appId: string, supabaseClient: any) {
  // First get current status
  const { data: currentApp, error: fetchError } = await supabaseClient
    .from('apps')
    .select('is_active')
    .eq('id', appId)
    .single()

  if (fetchError) {
    return new Response(JSON.stringify({ error: 'App not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Toggle the status
  const newStatus = !currentApp.is_active

  const { data: app, error } = await supabaseClient
    .from('apps')
    .update({
      is_active: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
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
    data: app,
    message: `App ${newStatus ? 'enabled' : 'disabled'} successfully`
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function reorderApps(req: Request, supabaseClient: any) {
  const { appOrder }: { appOrder: { id: string; sort_order: number }[] } = await req.json()

  // Update sort order for each app
  const promises = appOrder.map(app =>
    supabaseClient
      .from('apps')
      .update({
        sort_order: app.sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', app.id)
  )

  const results = await Promise.all(promises)
  const errors = results.filter(result => result.error)

  if (errors.length > 0) {
    return new Response(JSON.stringify({ error: 'Failed to reorder some apps' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Apps reordered successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}