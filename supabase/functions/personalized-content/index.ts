interface ContentRequest {
  userId?: string;
  visitorId?: string;
  location?: string;
  device?: string;
  referrer?: string;
  previousVisits?: number;
  interests?: string[];
}

interface PersonalizedContent {
  heroContent?: Record<string, any>;
  featuredTools?: string[];
  testimonials?: string[];
  cta?: {
    title: string;
    description: string;
    buttonText: string;
  };
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
    // Parse request data
    const contentRequest: ContentRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = new Supabase.SupabaseClient(supabaseUrl, supabaseAnonKey);

    const personalizedContent: PersonalizedContent = {};

    // Step 1: Get the appropriate hero content
    let heroQuery = supabase
      .from('hero_content')
      .select('*')
      .eq('enabled', true);
    
    // If we have a user ID, try to get personalized hero content
    if (contentRequest.userId) {
      // First check for audience segments matching this user
      const { data: userSegments } = await supabase
        .from('audience_segments')
        .select('id')
        .eq('user_id', contentRequest.userId)
        .eq('enabled', true);
        
      if (userSegments && userSegments.length > 0) {
        // Look for personalized hero content for this segment
        const segmentIds = userSegments.map(s => s.id);
        const { data: personalizedHero } = await supabase
          .from('content_variations')
          .select('*')
          .eq('section_id', 'hero')
          .in('segment_id', segmentIds)
          .single();
          
        if (personalizedHero) {
          personalizedContent.heroContent = JSON.parse(personalizedHero.content);
        }
      }
    }

    // If no personalized hero content found, get the default one
    if (!personalizedContent.heroContent) {
      const { data: defaultHero } = await heroQuery.order('created_at', { ascending: false }).limit(1).single();
      if (defaultHero) {
        personalizedContent.heroContent = defaultHero;
      }
    }

    // Step 2: Determine featured tools based on interests/behavior
    // This could be based on interest tags, previous tool usage, etc.
    if (contentRequest.interests && contentRequest.interests.length > 0) {
      // Simplified example - in reality would use a more sophisticated algorithm
      const interests = contentRequest.interests;
      
      // Map interests to relevant tool IDs (simplified example)
      personalizedContent.featuredTools = [];
      if (interests.includes('video')) {
        personalizedContent.featuredTools.push('video-creator', 'ai-editing');
      }
      if (interests.includes('marketing')) {
        personalizedContent.featuredTools.push('landing-page', 'proposal-generator');
      }
      if (interests.includes('content')) {
        personalizedContent.featuredTools.push('ai-art', 'content-repurposing');
      }
      if (interests.includes('design')) {
        personalizedContent.featuredTools.push('thumbnail-generator', 'ghibli-style');
      }
    }

    // Step 3: Get testimonials relevant to visitor
    let testimonialQuery = supabase
      .from('testimonials')
      .select('*')
      .eq('enabled', true);

    // If there's an industry or role preference, filter testimonials accordingly
    if (contentRequest.interests && contentRequest.interests.includes('marketing')) {
      testimonialQuery = testimonialQuery.eq('category', 'marketing');
    } else if (contentRequest.interests && contentRequest.interests.includes('education')) {
      testimonialQuery = testimonialQuery.eq('category', 'education');
    }

    const { data: testimonials } = await testimonialQuery.limit(3);
    if (testimonials && testimonials.length > 0) {
      personalizedContent.testimonials = testimonials.map(t => t.id);
    }

    // Step 4: Personalized CTA based on behavior
    personalizedContent.cta = {
      title: "Start Creating Amazing Videos Today",
      description: "Join thousands of creators and businesses transforming their video content.",
      buttonText: "Get Started Free"
    };

    // If visitor data suggests they're returning or from a specific source, customize the CTA
    if (contentRequest.previousVisits && contentRequest.previousVisits > 2) {
      personalizedContent.cta = {
        title: "Welcome Back! Ready to Continue Your Journey?",
        description: "Your projects are waiting for you. Keep creating amazing content.",
        buttonText: "Continue Creating"
      };
    } else if (contentRequest.referrer && contentRequest.referrer.includes('youtube')) {
      personalizedContent.cta = {
        title: "Special Offer for YouTube Creators",
        description: "Get 20% off your first 3 months with code YOUTUBE20",
        buttonText: "Claim Your Discount"
      };
    }

    // Log this interaction for analytics (in a real system)
    await supabase
      .from('personalization_events')
      .insert([
        {
          visitor_id: contentRequest.visitorId || 'anonymous',
          user_id: contentRequest.userId,
          device: contentRequest.device,
          location: contentRequest.location,
          content_served: JSON.stringify(personalizedContent),
          timestamp: new Date().toISOString()
        }
      ]);

    // Return the personalized content
    return new Response(
      JSON.stringify({
        success: true,
        data: personalizedContent
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
    console.error("Error generating personalized content:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate personalized content",
        details: error.message
      }),
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