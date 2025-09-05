interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const formData: ContactFormData = await req.json();

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      return new Response(
        JSON.stringify({ error: "Required fields are missing" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabaseAdmin = new Supabase.SupabaseClient(supabaseUrl, supabaseServiceRoleKey);

    // Store contact form submission in database
    // You'd create a 'contact_submissions' table in your Supabase project
    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          company: formData.company,
        },
      ]);

    if (error) {
      console.error("Error storing contact submission:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save your message" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // In a production system, you'd likely also send an email notification here
    // using a service like SendGrid, Mailgun, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been received. We'll get back to you soon!" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});