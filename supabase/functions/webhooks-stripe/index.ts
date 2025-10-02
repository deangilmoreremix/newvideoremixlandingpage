import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

console.log("Stripe webhook handler loaded")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Get the webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(supabaseClient, event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabaseClient, event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabaseClient, event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabaseClient, event.data.object as Stripe.Invoice)
        break

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(supabaseClient, event.data.object as Stripe.Dispute)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to map Stripe price IDs to our product SKUs
async function mapStripePriceToSku(supabaseClient: any, priceId: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('product_mappings')
    .select('product_sku')
    .eq('provider', 'stripe')
    .eq('provider_product_id', priceId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.warn('No product mapping found for Stripe price:', priceId)
    return null
  }

  return data.product_sku
}

// Helper function to create purchase event
async function createPurchaseEvent(
  supabaseClient: any,
  eventData: {
    provider_event_id: string
    purchaser_email: string
    amount_cents?: number
    currency?: string
    status: string
    provider_order_id?: string
    raw: any
  }
) {
  const { error } = await supabaseClient
    .from('purchase_events')
    .insert({
      provider: 'stripe',
      provider_event_id: eventData.provider_event_id,
      purchaser_email: eventData.purchaser_email,
      amount_cents: eventData.amount_cents,
      currency: eventData.currency || 'usd',
      status: eventData.status,
      provider_order_id: eventData.provider_order_id,
      raw: eventData.raw,
      processed_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error creating purchase event:', error)
    throw error
  }
}

// Helper function to apply entitlement
async function applyEntitlement(
  supabaseClient: any,
  purchaseEventId: string,
  purchaserEmail: string,
  productSku: string,
  status: 'active' | 'cancelled' | 'refunded' | 'chargeback',
  expiresAt?: string
) {
  // Check if user exists
  const { data: user } = await supabaseClient.auth.admin.getUserByEmail(purchaserEmail)

  if (user) {
    // Create user entitlement
    const { error } = await supabaseClient
      .from('user_entitlements')
      .upsert({
        user_id: user.id,
        product_sku: productSku,
        source_provider: 'stripe',
        status: status,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,product_sku'
      })

    if (error) {
      console.error('Error creating user entitlement:', error)
    }
  } else {
    // Create pending entitlement
    const { error } = await supabaseClient
      .from('pending_entitlements')
      .insert({
        purchaser_email: purchaserEmail,
        product_sku: productSku,
        source_provider: 'stripe',
        status: status === 'active' ? 'pending' : 'cancelled',
        purchase_event_id: purchaseEventId,
        expires_at: expiresAt
      })

    if (error) {
      console.error('Error creating pending entitlement:', error)
    }
  }
}

// Event handlers
async function handleCheckoutSessionCompleted(supabaseClient: any, session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id)

  if (!session.customer_details?.email) {
    console.warn('No email found in checkout session')
    return
  }

  // Create purchase event
  await createPurchaseEvent(supabaseClient, {
    provider_event_id: session.id,
    purchaser_email: session.customer_details.email,
    amount_cents: session.amount_total || undefined,
    currency: session.currency || 'usd',
    status: 'paid',
    provider_order_id: session.id,
    raw: session
  })

  // Process line items
  if (session.line_items?.data) {
    for (const item of session.line_items.data) {
      if (item.price?.id) {
        const productSku = await mapStripePriceToSku(supabaseClient, item.price.id)
        if (productSku) {
          await applyEntitlement(
            supabaseClient,
            session.id,
            session.customer_details.email,
            productSku,
            'active',
            session.mode === 'subscription' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
          )
        }
      }
    }
  }
}

async function handleInvoicePaymentSucceeded(supabaseClient: any, invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id)

  if (!invoice.customer_email) {
    console.warn('No email found in invoice')
    return
  }

  // Create purchase event
  await createPurchaseEvent(supabaseClient, {
    provider_event_id: invoice.id,
    purchaser_email: invoice.customer_email,
    amount_cents: invoice.amount_paid || undefined,
    currency: invoice.currency || 'usd',
    status: 'paid',
    provider_order_id: invoice.id,
    raw: invoice
  })

  // Process subscription items
  if (invoice.lines?.data) {
    for (const line of invoice.lines.data) {
      if (line.price?.id) {
        const productSku = await mapStripePriceToSku(supabaseClient, line.price.id)
        if (productSku) {
          const subscription = invoice.subscription as Stripe.Subscription
          const expiresAt = subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : undefined

          await applyEntitlement(
            supabaseClient,
            invoice.id,
            invoice.customer_email,
            productSku,
            'active',
            expiresAt
          )
        }
      }
    }
  }
}

async function handleSubscriptionUpdated(supabaseClient: any, subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
  if (!customer || typeof customer === 'string' || !customer.email) {
    console.warn('No email found for subscription customer')
    return
  }
  if (!customer.email) {
    console.warn('No email found for subscription customer')
    return
  }

  // Find existing entitlements and update them
  const { data: entitlements } = await supabaseClient
    .from('user_entitlements')
    .select('*')
    .eq('source_txn_id', subscription.id)

  if (entitlements) {
    const status = subscription.status === 'active' ? 'active' : 'cancelled'
    const expiresAt = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : undefined

    for (const entitlement of entitlements) {
      await supabaseClient
        .from('user_entitlements')
        .update({
          status: status,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', entitlement.id)
    }
  }
}

async function handleSubscriptionDeleted(supabaseClient: any, subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id)

  // Cancel entitlements
  const { error } = await supabaseClient
    .from('user_entitlements')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('source_txn_id', subscription.id)

  if (error) {
    console.error('Error cancelling entitlements:', error)
  }
}

async function handleInvoicePaymentFailed(supabaseClient: any, invoice: Stripe.Invoice) {
  console.log('Processing invoice payment failed:', invoice.id)

  // Could implement retry logic or notification here
  console.warn('Payment failed for invoice:', invoice.id)
}

async function handleChargeDisputeCreated(supabaseClient: any, dispute: Stripe.Dispute) {
  console.log('Processing charge dispute created:', dispute.id)

  // Mark entitlements as disputed
  const { error } = await supabaseClient
    .from('user_entitlements')
    .update({
      status: 'chargeback',
      updated_at: new Date().toISOString()
    })
    .eq('source_txn_id', dispute.charge as string)

  if (error) {
    console.error('Error updating entitlements for dispute:', error)
  }
}
