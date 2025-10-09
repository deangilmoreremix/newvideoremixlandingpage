import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("PayKickstart webhook received:", body);

    // Log the webhook
    await supabase.from("webhook_logs").insert({
      platform: "paykickstart",
      event_type: body.event_type || "unknown",
      webhook_payload: body,
      processing_status: "processing",
    });

    // Handle different PayKickstart events
    switch (body.event_type) {
      case "order_created":
        await handleOrderCreated(supabase, body);
        break;

      case "order_completed":
        await handleOrderCompleted(supabase, body);
        break;

      case "subscription_created":
        await handleSubscriptionCreated(supabase, body);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(supabase, body);
        break;

      case "refund_processed":
        await handleRefundProcessed(supabase, body);
        break;

      default:
        console.log(`Unhandled PayKickstart event: ${body.event_type}`);
    }

    // Update webhook log as processed
    await supabase
      .from("webhook_logs")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("platform", "paykickstart")
      .eq("event_type", body.event_type || "unknown")
      .eq("processing_status", "processing")
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ success: true, received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing PayKickstart webhook:", error);

    // Log the error
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("webhook_logs").insert({
      platform: "paykickstart",
      event_type: "error",
      webhook_payload: { error: error.message },
      processing_status: "failed",
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleOrderCreated(supabase: any, data: any) {
  console.log("Processing PayKickstart order created:", data.order_id);

  const customerEmail = data.customer?.email;
  if (!customerEmail) {
    throw new Error("No customer email in PayKickstart order");
  }

  // Find or create user
  let userId = null;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u: any) => u.email === customerEmail);

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Create new user
    const password = Math.random().toString(36).slice(-12) + "Aa1!";
    const { data: newUser } = await supabase.auth.admin.createUser({
      email: customerEmail,
      password: password,
      email_confirm: true,
    });
    userId = newUser?.user?.id;

    // Create user role and profile
    if (userId) {
      await supabase.from("user_roles").insert({
        user_id: userId,
        role: "user",
      });

      await supabase.from("admin_profiles").insert({
        user_id: userId,
        email: customerEmail,
      });
    }
  }

  // Find product mapping
  const { data: productMapping } = await supabase
    .from("platform_product_mappings")
    .select("product_id, products_catalog(*)")
    .eq("platform", "paykickstart")
    .eq("platform_product_id", data.product_id)
    .maybeSingle();

  const product = productMapping?.products_catalog;

  // Create purchase record
  await supabase.from("purchases").insert({
    user_id: userId,
    email: customerEmail,
    platform: "paykickstart",
    platform_transaction_id: data.order_id,
    platform_customer_id: data.customer_id,
    product_id: product?.id,
    product_name: data.product_name || product?.name || "Unknown Product",
    product_sku: data.product_sku || product?.sku,
    amount: parseFloat(data.amount || "0"),
    currency: data.currency || "USD",
    status: "pending",
    is_subscription: data.is_subscription || false,
    purchase_date: new Date().toISOString(),
    webhook_data: data,
    processed: false,
  });
}

async function handleOrderCompleted(supabase: any, data: any) {
  console.log("Processing PayKickstart order completed:", data.order_id);

  // Update purchase status
  const { data: purchase } = await supabase
    .from("purchases")
    .update({
      status: "completed",
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq("platform_transaction_id", data.order_id)
    .eq("platform", "paykickstart")
    .select()
    .single();

  if (!purchase) {
    throw new Error(`Purchase not found for order: ${data.order_id}`);
  }

  // Grant app access
  if (purchase.product_id && purchase.user_id) {
    const { data: product } = await supabase
      .from("products_catalog")
      .select("apps_granted, product_type")
      .eq("id", purchase.product_id)
      .single();

    if (product?.apps_granted) {
      const appsGranted = Array.isArray(product.apps_granted)
        ? product.apps_granted
        : JSON.parse(product.apps_granted);

      for (const appSlug of appsGranted) {
        await supabase.from("user_app_access").upsert({
          user_id: purchase.user_id,
          app_slug: appSlug,
          purchase_id: purchase.id,
          access_type: product.product_type === "subscription" ? "subscription" : "lifetime",
          granted_at: new Date().toISOString(),
          is_active: true,
        });
      }
    }
  }

  // Handle subscription if applicable
  if (data.is_subscription && data.subscription_id) {
    await supabase.from("subscription_status").insert({
      user_id: purchase.user_id,
      purchase_id: purchase.id,
      platform: "paykickstart",
      platform_subscription_id: data.subscription_id,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    });
  }
}

async function handleSubscriptionCreated(supabase: any, data: any) {
  console.log("Processing PayKickstart subscription created:", data.subscription_id);

  // Find the related purchase
  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("platform_transaction_id", data.order_id)
    .eq("platform", "paykickstart")
    .single();

  if (purchase) {
    await supabase.from("subscription_status").insert({
      user_id: purchase.user_id,
      purchase_id: purchase.id,
      platform: "paykickstart",
      platform_subscription_id: data.subscription_id,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

async function handleSubscriptionCancelled(supabase: any, data: any) {
  console.log("Processing PayKickstart subscription cancelled:", data.subscription_id);

  await supabase
    .from("subscription_status")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("platform_subscription_id", data.subscription_id)
    .eq("platform", "paykickstart");
}

async function handleRefundProcessed(supabase: any, data: any) {
  console.log("Processing PayKickstart refund:", data.order_id);

  // Update purchase status
  await supabase
    .from("purchases")
    .update({
      status: "refunded",
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq("platform_transaction_id", data.order_id)
    .eq("platform", "paykickstart");

  // Log access revocation
  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id, product_id")
    .eq("platform_transaction_id", data.order_id)
    .eq("platform", "paykickstart")
    .single();

  if (purchase?.user_id && purchase?.product_id) {
    const { data: product } = await supabase
      .from("products_catalog")
      .select("apps_granted")
      .eq("id", purchase.product_id)
      .single();

    if (product?.apps_granted) {
      const appsGranted = Array.isArray(product.apps_granted)
        ? product.apps_granted
        : JSON.parse(product.apps_granted);

      for (const appSlug of appsGranted) {
        await supabase.from("access_revocation_log").insert({
          user_id: purchase.user_id,
          app_slug: appSlug,
          reason: "refunded",
          purchase_id: purchase.id,
          revoked_at: new Date().toISOString(),
        });

        // Revoke access
        await supabase
          .from("user_app_access")
          .update({ is_active: false })
          .eq("user_id", purchase.user_id)
          .eq("app_slug", appSlug)
          .eq("purchase_id", purchase.id);
      }
    }
  }
}