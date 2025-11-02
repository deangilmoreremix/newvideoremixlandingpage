// Removed Deno-specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    if (action === "login" && req.method === "POST") {
      const { email, password } = await req.json();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return new Response(
          JSON.stringify({ success: false, error: authError.message }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!authData.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Authentication failed" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!roleData || (roleData.role !== 'super_admin' && roleData.role !== 'admin')) {
        // Sign out the user since they don't have admin access
        await supabase.auth.signOut();
        return new Response(
          JSON.stringify({ success: false, error: "Admin access required" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Generate JWT token for admin session
      const { data: tokenData, error: tokenError } = await supabase.auth.getSession();

      if (tokenError || !tokenData.session) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to generate session token" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const adminUser = {
        id: authData.user.id,
        email: authData.user.email!,
        role: roleData.role,
        is_active: true,
        permissions: {},
        created_at: authData.user.created_at,
        last_login: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify({
          success: true,
          user: adminUser,
          token: tokenData.session.access_token
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "signup" && req.method === "POST") {
      const { email, password } = await req.json();

      try {
        let userId: string | null = null;

        // First, try to create the user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError) {
          // If user already exists, try to update their password instead
          if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
            // Get the existing user
            const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

            if (listError) {
              return new Response(
                JSON.stringify({ success: false, error: 'Failed to check existing users' }),
                {
                  status: 500,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }

            const existingUser = existingUsers.users.find((u: any) => u.email === email);

            if (existingUser) {
              // Update the existing user's password
              const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
                password,
                email_confirm: true,
              });

              if (updateError) {
                return new Response(
                  JSON.stringify({ success: false, error: `Failed to update password: ${updateError.message}` }),
                  {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                  }
                );
              }
              userId = existingUser.id;
            } else {
              return new Response(
                JSON.stringify({ success: false, error: createError.message }),
                {
                  status: 400,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }
          } else {
            return new Response(
              JSON.stringify({ success: false, error: createError.message }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } else {
          userId = newUser.user.id;
        }

        // Assign admin role
        if (userId) {
          console.log('Assigning admin role to user:', userId);

          // First check if role already exists
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle();

          if (!existingRole) {
            // Insert new role
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: userId,
                role: 'super_admin'
              });

            if (roleError) {
              console.error('Failed to assign admin role:', roleError);
              // Don't fail the signup if role assignment fails, just log it
            } else {
              console.log('Admin role assigned successfully');
            }
          } else {
            console.log('User already has role:', existingRole.role);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Signup process failed' }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (action === "logout" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: "Authorization required" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const token = authHeader.replace("Bearer ", "");

      // For logout, we just return success since the client will clear the token
      // In a more secure implementation, you might want to invalidate the token server-side

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "verify" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: "Authorization required" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const token = authHeader.replace("Bearer ", "");

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid token" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if user still has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!roleData || (roleData.role !== 'super_admin' && roleData.role !== 'admin')) {
        return new Response(
          JSON.stringify({ success: false, error: "Admin access revoked" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const adminUser = {
        id: user.id,
        email: user.email!,
        role: roleData.role,
        is_active: true,
        permissions: {},
        created_at: user.created_at,
        last_login: user.last_sign_in_at,
      };

      return new Response(
        JSON.stringify({ success: true, user: adminUser }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});