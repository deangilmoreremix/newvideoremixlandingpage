import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface VideoProcessRequest {
  videoId: string;
  thumbnailTimestamp?: number;
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
    const requestData: VideoProcessRequest = await req.json();

    // Validate required field
    if (!requestData.videoId) {
      return new Response(
        JSON.stringify({ error: "Video ID is required" }),
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get video record
    const { data: video, error: fetchError } = await supabaseAdmin
      .from("videos")
      .select("*")
      .eq("id", requestData.videoId)
      .single();

    if (fetchError || !video) {
      return new Response(
        JSON.stringify({ error: "Video not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from("videos")
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq("id", requestData.videoId);

    // In a real implementation, we would:
    // 1. Download the video from storage
    // 2. Extract metadata (duration, etc.)
    // 3. Generate thumbnail at specified timestamp
    // 4. Upload thumbnail to storage
    // 5. Update video record with metadata and thumbnail path

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now, create a placeholder thumbnail path
    const thumbnailPath = `${video.user_id}/${requestData.videoId}_thumbnail.jpg`;

    // Simulate metadata extraction
    const duration = 120; // seconds
    const fileSize = video.file_size || 0;

    // Update video record with processed data
    const { error: updateError } = await supabaseAdmin
      .from("videos")
      .update({
        status: 'completed',
        duration: duration,
        thumbnail_path: thumbnailPath,
        completed_at: new Date().toISOString(),
        metadata: {
          ...video.metadata,
          processed_at: new Date().toISOString(),
          thumbnail_timestamp: requestData.thumbnailTimestamp || 1
        }
      })
      .eq("id", requestData.videoId);

    if (updateError) {
      console.error("Error updating video:", updateError);
      // Mark as failed
      await supabaseAdmin
        .from("videos")
        .update({
          status: 'failed',
          error_message: updateError.message
        })
        .eq("id", requestData.videoId);

      return new Response(
        JSON.stringify({ error: "Failed to update video metadata" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video processed successfully",
        video: {
          id: requestData.videoId,
          thumbnail_path: thumbnailPath,
          duration: duration
        }
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
    console.error("Video processing error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred during video processing" }),
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