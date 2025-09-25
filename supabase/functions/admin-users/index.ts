import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface UserData {
  email: string
  first_name?: string
  last_name?: string
  name?: string // Keep for backward compatibility
  role?: string
  is_active?: boolean
}

interface BulkUserData {
  users: UserData[]
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
      // GET /admin/users - List all users
      return await getUsers(supabaseClient)
    } else if (method === 'POST' && pathParts.length === 4 && !url.searchParams.has('bulk')) {
      // POST /admin/users - Create new user
      return await createUser(req, supabaseClient)
    } else if (method === 'POST' && pathParts.length === 4 && url.searchParams.has('bulk')) {
      // POST /admin/users?bulk=true - Bulk create users
      return await bulkCreateUsers(req, supabaseClient)
    } else if (method === 'GET' && pathParts.length === 5) {
      // GET /admin/users/{id} - Get specific user
      const userId = pathParts[4]
      return await getUser(userId, supabaseClient)
    } else if (method === 'PUT' && pathParts.length === 5) {
      // PUT /admin/users/{id} - Update user
      const userId = pathParts[4]
      return await updateUser(req, userId, supabaseClient)
    } else if (method === 'DELETE' && pathParts.length === 5) {
      // DELETE /admin/users/{id} - Delete user
      const userId = pathParts[4]
      return await deleteUser(userId, supabaseClient)
    } else if (method === 'POST' && pathParts.includes('toggle')) {
      // POST /admin/users/{id}/toggle - Toggle user status
      const userId = pathParts[4]
      return await toggleUser(req, userId, supabaseClient)
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin users error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getUsers(supabaseClient: any) {
  const { data: users, error } = await supabaseClient
    .from('app_users')
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
    data: users
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createUser(req: Request, supabaseClient: any) {
  const userData: UserData = await req.json()

  const { data: user, error } = await supabaseClient
    .from('app_users')
    .insert([{
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '', // Keep for backward compatibility
      role: userData.role || 'user',
      is_active: userData.is_active ?? true
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
    data: user
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function bulkCreateUsers(req: Request, supabaseClient: any) {
  const bulkData: BulkUserData = await req.json()

  if (!bulkData.users || !Array.isArray(bulkData.users)) {
    return new Response(JSON.stringify({ error: 'Invalid bulk data format' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const usersToInsert = bulkData.users.map(user => ({
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '', // Keep for backward compatibility
    role: user.role || 'user',
    is_active: user.is_active ?? true
  }))

  const { data: users, error } = await supabaseClient
    .from('app_users')
    .insert(usersToInsert)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: users,
    message: `Successfully created ${users.length} users`
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getUser(userId: string, supabaseClient: any) {
  const { data: user, error } = await supabaseClient
    .from('app_users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    data: user
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateUser(req: Request, userId: string, supabaseClient: any) {
  const userData: Partial<UserData> = await req.json()

  const { data: user, error } = await supabaseClient
    .from('app_users')
    .update(userData)
    .eq('id', userId)
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
    data: user
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteUser(userId: string, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('app_users')
    .delete()
    .eq('id', userId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'User deleted successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function toggleUser(req: Request, userId: string, supabaseClient: any) {
  // First get current status
  const { data: currentUser, error: fetchError } = await supabaseClient
    .from('app_users')
    .select('is_active')
    .eq('id', userId)
    .single()

  if (fetchError) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Toggle the status
  const newStatus = !currentUser.is_active

  const { data: user, error } = await supabaseClient
    .from('app_users')
    .update({ is_active: newStatus })
    .eq('id', userId)
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
    data: user,
    message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}