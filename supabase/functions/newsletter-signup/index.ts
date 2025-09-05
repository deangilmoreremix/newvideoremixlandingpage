interface NewsletterData {
  email: string;
  name?: string;
  interests?: string[];
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
    const newsletterData: NewsletterData = await req.json();

    // Email validation
    if (!newsletterData.email || !validateEmail(newsletterData.email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
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
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabaseAdmin = new Supabase.SupabaseClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if email already exists
    const { data: existingSubscriber } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", newsletterData.email)
      .maybeSingle();

    // If subscriber already exists
    if (existingSubscriber) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "You're already subscribed to our newsletter!",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Store new subscriber
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert([
        {
          email: newsletterData.email,
          name: newsletterData.name,
          interests: newsletterData.interests,
        },
      ]);

    if (error) {
      console.error("Error storing newsletter subscription:", error);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe you to the newsletter" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // In a production system, you'd also integrate with your email marketing platform
    // such as Mailchimp, ConvertKit, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thanks for subscribing to our newsletter!" 
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
    console.error("Newsletter signup error:", error);
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

// Simple email validation
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}