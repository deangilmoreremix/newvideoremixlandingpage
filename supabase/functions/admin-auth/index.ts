import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'
import { corsHeaders } from '../_shared/cors.ts'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

interface AdminLoginRequest {
  email: string
  password: string
}

interface AdminSignupRequest {
  email: string
  password: string
  role?: string
}

interface AdminUser {
  id: string
  email: string
  role: string
  is_active: boolean
  permissions: Record<string, any>
}

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

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (path) {
      case 'login':
        return await handleLogin(req, supabaseClient)
      case 'signup':
        return await handleSignup(req, supabaseClient)
      case 'logout':
        return await handleLogout(req)
      case 'verify':
        return await handleVerify(req)
      case 'me':
        return await handleMe(req, supabaseClient)
      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleLogin(req: Request, supabaseClient: any) {
  const { email, password }: AdminLoginRequest = await req.json()

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Get admin user
  const { data: adminUser, error } = await supabaseClient
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (error || !adminUser) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)

  if (!isValidPassword) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Update last login
  await supabaseClient
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminUser.id)

  // Generate JWT token
  const token = await generateJWT(adminUser)

  // Remove password hash from response
  const { password_hash, ...userWithoutPassword } = adminUser

  return new Response(JSON.stringify({
    success: true,
    user: userWithoutPassword,
    token
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleSignup(req: Request, supabaseClient: any) {
  const { email, password, role = 'admin' }: AdminSignupRequest = await req.json()

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Check if user already exists
  const { data: existingUser } = await supabaseClient
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return new Response(JSON.stringify({ error: 'User already exists' }), {
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Hash password
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // Create new admin user
  const { data: newUser, error } = await supabaseClient
    .from('admin_users')
    .insert({
      email,
      password_hash: passwordHash,
      role,
      is_active: true
    })
    .select('id, email, role, is_active, permissions, created_at')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Generate JWT token
  const token = await generateJWT(newUser)

  return new Response(JSON.stringify({
    success: true,
    user: newUser,
    token
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleLogout(req: Request) {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleVerify(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const token = authHeader.substring(7)

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return new Response(JSON.stringify({
      success: true,
      user: payload.user
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleMe(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const token = authHeader.substring(7)

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    const userId = payload.user.id

    const { data: user, error } = await supabaseClient
      .from('admin_users')
      .select('id, email, role, is_active, permissions, created_at, last_login')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      user
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function generateJWT(user: AdminUser): Promise<string> {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}