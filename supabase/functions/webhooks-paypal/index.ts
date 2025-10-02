import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("PayPal webhook handler loaded")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get the raw body
    const body = await req.text()
    const payload = JSON.parse(body)

    console.log('Processing PayPal webhook event:', payload.event_type)

    // Handle different PayPal webhook events
    switch (payload.event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentSaleCompleted(supabaseClient, payload)
        break

      case 'PAYMENT.SALE.REFUNDED':
        await handlePaymentSaleRefunded(supabaseClient, payload)
        break

      case 'PAYMENT.SALE.REVERSED':
        await handlePaymentSaleReversed(supabaseClient, payload)
        break

      default:
        console.log('Unhandled PayPal event type:', payload.event_type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to map PayPal item IDs to our product SKUs
async function mapPayPalItemToSku(supabaseClient: any, itemId: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('product_mappings')
    .select('product_sku')
    .eq('provider', 'paypal')
    .eq('provider_product_id', itemId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.warn('No product mapping found for PayPal item:', itemId)
    return null
  }

  return data.product_sku
}

// Helper function to create purchase event
async function createPayPalPurchaseEvent(
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
      provider: 'paypal',
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
    console.error('Error creating PayPal purchase event:', error)
    throw error
  }
}

// Helper function to apply entitlement
async function applyPayPalEntitlement(
  supabaseClient: any,
  purchaseEventId: string,
  purchaserEmail: string,
  productSku: string,
  status: 'active' | 'cancelled' | 'refunded' | 'chargeback'
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
        source_provider: 'paypal',
        status: status,
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
        source_provider: 'paypal',
        status: status === 'active' ? 'pending' : 'cancelled',
        purchase_event_id: purchaseEventId
      })

    if (error) {
      console.error('Error creating pending entitlement:', error)
    }
  }
}

// Event handlers
async function handlePaymentSaleCompleted(supabaseClient: any, payload: any) {
  console.log('Processing PayPal payment sale completed:', payload.id)

  const sale = payload.resource
  const payerEmail = sale.payer?.payer_info?.email || sale.payer?.email_address

  if (!payerEmail) {
    console.warn('No email found in PayPal sale')
    return
  }

  // Convert amount to cents
  const amountCents = Math.round(parseFloat(sale.amount?.total || '0') * 100)

  // Create purchase event
  await createPayPalPurchaseEvent(supabaseClient, {
    provider_event_id: payload.id,
    purchaser_email: payerEmail,
    amount_cents: amountCents,
    currency: sale.amount?.currency || 'USD',
    status: 'paid',
    provider_order_id: sale.id,
    raw: payload
  })

  // Process items if available
  if (sale.item_list?.items) {
    for (const item of sale.item_list.items) {
      if (item.sku) {
        const productSku = await mapPayPalItemToSku(supabaseClient, item.sku)
        if (productSku) {
          await applyPayPalEntitlement(
            supabaseClient,
            payload.id,
            payerEmail,
            productSku,
            'active'
          )
        }
      }
    }
  } else {
    // If no items, try to map by transaction ID or create generic entitlement
    console.warn('No items found in PayPal sale, creating generic entitlement')
    // You might want to implement custom logic here based on your PayPal setup
  }
}

async function handlePaymentSaleRefunded(supabaseClient: any, payload: any) {
  console.log('Processing PayPal payment sale refunded:', payload.id)

  const refund = payload.resource
  const saleId = refund.sale_id

  // Find the original purchase event
  const { data: originalPurchase } = await supabaseClient
    .from('purchase_events')
    .select('*')
    .eq('provider_order_id', saleId)
    .eq('provider', 'paypal')
    .single()

  if (originalPurchase) {
    // Create refund purchase event
    await createPayPalPurchaseEvent(supabaseClient, {
      provider_event_id: payload.id,
      purchaser_email: originalPurchase.purchaser_email,
      amount_cents: Math.round(parseFloat(refund.amount?.total || '0') * 100),
      currency: refund.amount?.currency || 'USD',
      status: 'refunded',
      provider_order_id: refund.id,
      raw: payload
    })

    // Update entitlements to refunded status
    const { error } = await supabaseClient
      .from('user_entitlements')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('source_txn_id', saleId)

    if (error) {
      console.error('Error updating entitlements for refund:', error)
    }
  }
}

async function handlePaymentSaleReversed(supabaseClient: any, payload: any) {
  console.log('Processing PayPal payment sale reversed:', payload.id)

  const reversal = payload.resource
  const saleId = reversal.sale_id

  // Create reversal purchase event
  await createPayPalPurchaseEvent(supabaseClient, {
    provider_event_id: payload.id,
    purchaser_email: reversal.payer?.payer_info?.email || 'unknown',
    amount_cents: Math.round(parseFloat(reversal.amount?.total || '0') * 100),
    currency: reversal.amount?.currency || 'USD',
    status: 'chargeback',
    provider_order_id: reversal.id,
    raw: payload
  })

  // Update entitlements to chargeback status
  const { error } = await supabaseClient
    .from('user_entitlements')
    .update({
      status: 'chargeback',
      updated_at: new Date().toISOString()
    })
    .eq('source_txn_id', saleId)

  if (error) {
    console.error('Error updating entitlements for reversal:', error)
  }
}
