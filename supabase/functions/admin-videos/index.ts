import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET') || 'your-secret-key')

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

    const token = authHeader.substring(7)
    let isAdmin = false

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      const userId = payload.user.id

      const { data: adminUser } = await supabaseClient
        .from('admin_users')
        .select('role')
        .eq('id', userId)
        .single()

      isAdmin = adminUser && ['admin', 'super_admin'].includes(adminUser.role)
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const method = req.method

    if (method === 'GET' && pathParts.length === 4) {
      // GET /admin/videos - List all videos
      return await getVideos(supabaseClient)
    } else if (method === 'POST' && pathParts.length === 4) {
      // POST /admin/videos - Create new video
      return await createVideo(req, supabaseClient)
    } else if (method === 'GET' && pathParts.length === 5) {
      // GET /admin/videos/{id} - Get specific video
      const videoId = pathParts[4]
      return await getVideo(videoId, supabaseClient)
    } else if (method === 'PUT' && pathParts.length === 5) {
      // PUT /admin/videos/{id} - Update video
      const videoId = pathParts[4]
      return await updateVideo(req, videoId, supabaseClient)
    } else if (method === 'DELETE' && pathParts.length === 5) {
      // DELETE /admin/videos/{id} - Delete video
      const videoId = pathParts[4]
      return await deleteVideo(videoId, supabaseClient)
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin videos error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getVideos(supabaseClient: any) {
  const { data: videos, error } = await supabaseClient
    .from('videos')
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
    data: videos
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createVideo(req: Request, supabaseClient: any) {
  const videoData = await req.json()

  const { data: video, error } = await supabaseClient
    .from('videos')
    .insert([videoData])
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
    data: video
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getVideo(videoId: string, supabaseClient: any) {
  const { data: video, error } = await supabaseClient
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single()

  if (error || !video) {
    return new Response(JSON.stringify({ error: 'Video not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: video
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateVideo(req: Request, videoId: string, supabaseClient: any) {
  const videoData = await req.json()

  const { data: video, error } = await supabaseClient
    .from('videos')
    .update(videoData)
    .eq('id', videoId)
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
    data: video
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteVideo(videoId: string, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('videos')
    .delete()
    .eq('id', videoId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Video deleted successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}