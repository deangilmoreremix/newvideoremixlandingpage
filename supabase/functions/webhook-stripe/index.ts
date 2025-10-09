import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { stripe } from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
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

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

    const stripeClient = new stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ success: false, error: "No stripe signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the raw body
    const body = await req.text();

    let event: stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log the webhook
    await supabase.from("webhook_logs").insert({
      platform: "stripe",
      event_type: event.type,
      webhook_payload: event.data,
      processing_status: "processing",
    });

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(supabase, stripeClient, event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(supabase, stripeClient, event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(supabase, stripeClient, event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(supabase, stripeClient, event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, stripeClient, event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, stripeClient, event.data.object);
        break;

      case "invoice.created":
        await handleInvoiceCreated(supabase, stripeClient, event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Update webhook log as processed
    await supabase
      .from("webhook_logs")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("platform", "stripe")
      .eq("event_type", event.type)
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
    console.error("Error processing webhook:", error);

    // Log the error
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("webhook_logs").insert({
      platform: "stripe",
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

async function handleCheckoutSessionCompleted(
  supabase: any,
  stripeClient: stripe,
  session: stripe.Checkout.Session
) {
  console.log("Processing checkout session completed:", session.id);

  try {
    // Get the customer details
    const customer = await stripeClient.customers.retrieve(session.customer as string);
    const customerEmail = customer.email || session.customer_details?.email;

    if (!customerEmail) {
      throw new Error("No customer email found");
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

      // Create user role
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

    // Get line items to determine what was purchased
    const lineItems = await stripeClient.checkout.sessions.listLineItems(session.id);
    const productId = lineItems.data[0]?.price?.product;

    if (!productId) {
      throw new Error("No product found in checkout session");
    }

    // Find the product in our catalog
    const { data: productMapping } = await supabase
      .from("platform_product_mappings")
      .select("product_id, products_catalog(*)")
      .eq("platform", "stripe")
      .eq("platform_product_id", productId)
      .maybeSingle();

    const product = productMapping?.products_catalog;

    // Create purchase record
    const { data: purchase } = await supabase
      .from("purchases")
      .insert({
        user_id: userId,
        email: customerEmail,
        platform: "stripe",
        platform_transaction_id: session.id,
        platform_customer_id: session.customer as string,
        product_id: product?.id,
        product_name: product?.name || "Unknown Product",
        product_sku: product?.sku,
        amount: (session.amount_total || 0) / 100, // Convert from cents
        currency: session.currency?.toUpperCase() || "USD",
        status: "completed",
        is_subscription: session.mode === "subscription",
        purchase_date: new Date(session.created * 1000).toISOString(),
        webhook_data: session,
        processed: true,
        processed_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_customer_id: session.customer as string,
      })
      .select()
      .single();

    // Grant app access
    if (product?.apps_granted && userId) {
      const appsGranted = Array.isArray(product.apps_granted)
        ? product.apps_granted
        : JSON.parse(product.apps_granted);

      for (const appSlug of appsGranted) {
        await supabase.from("user_app_access").upsert({
          user_id: userId,
          app_slug: appSlug,
          purchase_id: purchase.id,
          access_type: product.product_type === "subscription" ? "subscription" : "lifetime",
          granted_at: new Date().toISOString(),
          is_active: true,
        });
      }
    }

    // Handle subscription if applicable
    if (session.mode === "subscription" && session.subscription) {
      const subscription = await stripeClient.subscriptions.retrieve(session.subscription as string);

      await supabase.from("subscription_status").insert({
        user_id: userId,
        purchase_id: purchase.id,
        platform: "stripe",
        platform_subscription_id: subscription.id,
        status: subscription.status === "active" ? "active" : "pending",
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      });
    }

    console.log("Checkout session processed successfully");

  } catch (error) {
    console.error("Error processing checkout session:", error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(
  supabase: any,
  stripeClient: stripe,
  invoice: stripe.Invoice
) {
  console.log("Processing invoice payment succeeded:", invoice.id);

  // Update subscription status
  if (invoice.subscription) {
    await supabase
      .from("subscription_status")
      .update({
        status: "active",
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
      })
      .eq("platform_subscription_id", invoice.subscription);

    // Reactivate access if it was revoked
    const { data: subscription } = await supabase
      .from("subscription_status")
      .select("user_id")
      .eq("platform_subscription_id", invoice.subscription)
      .single();

    if (subscription?.user_id) {
      await supabase
        .from("user_app_access")
        .update({ is_active: true })
        .eq("user_id", subscription.user_id)
        .eq("access_type", "subscription");
    }
  }
}

async function handleInvoicePaymentFailed(
  supabase: any,
  stripeClient: stripe,
  invoice: stripe.Invoice
) {
  console.log("Processing invoice payment failed:", invoice.id);

  // Update subscription status
  if (invoice.subscription) {
    await supabase
      .from("subscription_status")
      .update({
        status: "payment_failed",
        updated_at: new Date().toISOString(),
      })
      .eq("platform_subscription_id", invoice.subscription);
  }
}

async function handleSubscriptionCreated(
  supabase: any,
  stripeClient: stripe,
  subscription: stripe.Subscription
) {
  console.log("Processing subscription created:", subscription.id);

  // This is typically handled by checkout.session.completed
  // But we can use this as a backup
}

async function handleSubscriptionUpdated(
  supabase: any,
  stripeClient: stripe,
  subscription: stripe.Subscription
) {
  console.log("Processing subscription updated:", subscription.id);

  const status = subscription.status === "active" ? "active" :
                 subscription.status === "canceled" ? "cancelled" :
                 subscription.status === "past_due" ? "payment_failed" : "pending";

  await supabase
    .from("subscription_status")
    .update({
      status: status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("platform_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(
  supabase: any,
  stripeClient: stripe,
  subscription: stripe.Subscription
) {
  console.log("Processing subscription deleted:", subscription.id);

  await supabase
    .from("subscription_status")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("platform_subscription_id", subscription.id);
}

async function handleInvoiceCreated(
  supabase: any,
  stripeClient: stripe,
  invoice: stripe.Invoice
) {
  console.log("Processing invoice created:", invoice.id);

  // Log invoice creation for tracking
  // Additional logic can be added here if needed
}