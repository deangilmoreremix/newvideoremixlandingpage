// scripts/extract-stripe-data.js
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractAllStripeData() {
  const logStream = fs.createWriteStream('stripe-extraction.log', { flags: 'a' });
  const log = (message) => {
    const timestamp = new Date().toISOString();
    logStream.write(`${timestamp}: ${message}\n`);
    console.log(message);
  };

  try {
    log('Starting comprehensive Stripe data extraction...');

    await extractCustomers(log);
    await extractPaymentMethods(log);
    await extractCharges(log);
    await extractInvoices(log);
    await extractSubscriptions(log);
    await extractProductsAndPrices(log);
    await extractCheckoutSessions(log);
    await extractPaymentIntents(log);

    log('Data extraction completed successfully');
  } catch (error) {
    log(`Error during extraction: ${error.message}`);
  } finally {
    logStream.end();
  }
}

async function extractCustomers(log) {
  log('Extracting customers...');
  let hasMore = true;
  let startingAfter = null;
  let count = 0;

  while (hasMore) {
    try {
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      const customers = await stripe.customers.list(params);

      for (const customer of customers.data) {
        const { error } = await supabase
          .from('stripe_customers')
          .upsert({
            id: customer.id,
            object: customer.object,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            description: customer.description,
            created: customer.created,
            delinquent: customer.delinquent,
            discount: customer.discount,
            invoice_prefix: customer.invoice_prefix,
            livemode: customer.livemode,
            metadata: customer.metadata,
            preferred_locales: customer.preferred_locales,
            shipping: customer.shipping,
            tax_exempt: customer.tax_exempt,
            tax_ids: customer.tax_ids?.data || [],
            sources: customer.sources?.data || []
          }, { onConflict: 'id' });

        if (error) log(`Error storing customer ${customer.id}: ${error.message}`);
        else count++;
      }

      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
        log(`Processed ${count} customers...`);
      }
    } catch (error) {
      log(`Error fetching customers: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Customer extraction complete. Total: ${count}`);
}

async function extractPaymentMethods(log) {
  log('Extracting payment methods...');
  let count = 0;

  // First, get all customers
  const { data: customers, error } = await supabase
    .from('stripe_customers')
    .select('id');

  if (error) {
    log(`Error fetching customers for payment methods: ${error.message}`);
    return;
  }

  // For each customer, get their payment methods
  for (const customer of customers) {
    try {
      let hasMore = true;
      let startingAfter = null;

      while (hasMore) {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customer.id,
          limit: 100,
          starting_after: startingAfter
        });

        for (const paymentMethod of paymentMethods.data) {
          const { error } = await supabase
            .from('stripe_payment_methods')
            .upsert({
              id: paymentMethod.id,
              customer_id: customer.id,
              type: paymentMethod.type,
              billing_details: paymentMethod.billing_details,
              card: paymentMethod.card,
              created: paymentMethod.created,
              livemode: paymentMethod.livemode,
              metadata: paymentMethod.metadata
            }, { onConflict: 'id' });

          if (error) log(`Error storing payment method ${paymentMethod.id}: ${error.message}`);
          else count++;
        }

        hasMore = paymentMethods.has_more;
        if (hasMore && paymentMethods.data.length > 0) {
          startingAfter = paymentMethods.data[paymentMethods.data.length - 1].id;
        }
      }
    } catch (error) {
      log(`Error fetching payment methods for customer ${customer.id}: ${error.message}`);
    }
  }

  log(`Payment method extraction complete. Total: ${count}`);
}

async function extractCharges(log) {
  log('Extracting charges...');
  let hasMore = true;
  let startingAfter = null;
  let count = 0;

  while (hasMore) {
    try {
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      const charges = await stripe.charges.list(params);

      for (const charge of charges.data) {
        const { error } = await supabase
          .from('stripe_charges')
          .upsert({
            id: charge.id,
            object: charge.object,
            amount: charge.amount,
            amount_refunded: charge.amount_refunded,
            application: charge.application,
            application_fee: charge.application_fee,
            balance_transaction: charge.balance_transaction?.id,
            balance_transaction_details: charge.balance_transaction,
            captured: charge.captured,
            created: charge.created,
            currency: charge.currency,
            customer: charge.customer?.id,
            customer_details: charge.customer,
            description: charge.description,
            destination: charge.destination,
            dispute: charge.dispute,
            disputed: charge.disputed,
            failure_code: charge.failure_code,
            failure_message: charge.failure_message,
            fraud_details: charge.fraud_details,
            invoice: charge.invoice?.id,
            invoice_details: charge.invoice,
            livemode: charge.livemode,
            metadata: charge.metadata,
            outcome: charge.outcome,
            paid: charge.paid,
            payment_intent: charge.payment_intent,
            payment_method: charge.payment_method,
            payment_method_details: charge.payment_method_details,
            receipt_email: charge.receipt_email,
            receipt_number: charge.receipt_number,
            receipt_url: charge.receipt_url,
            refunded: charge.refunded,
            review: charge.review,
            shipping: charge.shipping,
            source: charge.source,
            source_transfer: charge.source_transfer,
            statement_descriptor: charge.statement_descriptor,
            status: charge.status,
            transfer_data: charge.transfer_data,
            transfer_group: charge.transfer_group
          }, { onConflict: 'id' });

        if (error) log(`Error storing charge ${charge.id}: ${error.message}`);
        else count++;
      }

      hasMore = charges.has_more;
      if (hasMore && charges.data.length > 0) {
        startingAfter = charges.data[charges.data.length - 1].id;
        log(`Processed ${count} charges...`);
      }
    } catch (error) {
      log(`Error fetching charges: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Charge extraction complete. Total: ${count}`);
}

async function extractInvoices(log) {
  log('Extracting invoices...');
  let hasMore = true;
  let startingAfter = null;
  let count = 0;

  while (hasMore) {
    try {
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      const invoices = await stripe.invoices.list(params);

      for (const invoice of invoices.data) {
        const { error } = await supabase
          .from('stripe_invoices')
          .upsert({
            id: invoice.id,
            object: invoice.object,
            account_country: invoice.account_country,
            account_name: invoice.account_name,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            amount_remaining: invoice.amount_remaining,
            application_fee_amount: invoice.application_fee_amount,
            attempt_count: invoice.attempt_count,
            attempted: invoice.attempted,
            auto_advance: invoice.auto_advance,
            billing_reason: invoice.billing_reason,
            charge: invoice.charge,
            collection_method: invoice.collection_method,
            created: invoice.created,
            currency: invoice.currency,
            custom_fields: invoice.custom_fields,
            customer: invoice.customer?.id,
            customer_address: invoice.customer_address,
            customer_email: invoice.customer_email,
            customer_name: invoice.customer_name,
            customer_phone: invoice.customer_phone,
            customer_shipping: invoice.customer_shipping,
            customer_tax_exempt: invoice.customer_tax_exempt,
            customer_tax_ids: invoice.customer_tax_ids,
            default_payment_method: invoice.default_payment_method,
            default_source: invoice.default_source,
            default_tax_rates: invoice.default_tax_rates,
            description: invoice.description,
            discount: invoice.discount,
            discounts: invoice.discounts,
            due_date: invoice.due_date,
            ending_balance: invoice.ending_balance,
            footer: invoice.footer,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            last_finalization_error: invoice.last_finalization_error,
            lines: invoice.lines,
            livemode: invoice.livemode,
            metadata: invoice.metadata,
            next_payment_attempt: invoice.next_payment_attempt,
            number: invoice.number,
            on_behalf_of: invoice.on_behalf_of,
            paid: invoice.paid,
            payment_settings: invoice.payment_settings,
            period_end: invoice.period_end,
            period_start: invoice.period_start,
            post_payment_credit_notes_amount: invoice.post_payment_credit_notes_amount,
            pre_payment_credit_notes_amount: invoice.pre_payment_credit_notes_amount,
            receipt_number: invoice.receipt_number,
            starting_balance: invoice.starting_balance,
            statement_descriptor: invoice.statement_descriptor,
            status: invoice.status,
            status_transitions: invoice.status_transitions,
            subscription: invoice.subscription?.id,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            total_tax_amounts: invoice.total_tax_amounts,
            transfer_data: invoice.transfer_data,
            webhooks_delivered_at: invoice.webhooks_delivered_at
          }, { onConflict: 'id' });

        if (error) log(`Error storing invoice ${invoice.id}: ${error.message}`);
        else count++;
      }

      hasMore = invoices.has_more;
      if (hasMore && invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
        log(`Processed ${count} invoices...`);
      }
    } catch (error) {
      log(`Error fetching invoices: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Invoice extraction complete. Total: ${count}`);
}

async function extractSubscriptions(log) {
  log('Extracting subscriptions...');
  let hasMore = true;
  let startingAfter = null;
  let count = 0;

  while (hasMore) {
    try {
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      const subscriptions = await stripe.subscriptions.list(params);

      for (const subscription of subscriptions.data) {
        const { error } = await supabase
          .from('stripe_subscriptions')
          .upsert({
            id: subscription.id,
            object: subscription.object,
            application_fee_percent: subscription.application_fee_percent,
            billing_cycle_anchor: subscription.billing_cycle_anchor,
            billing_thresholds: subscription.billing_thresholds,
            cancel_at: subscription.cancel_at,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at,
            collection_method: subscription.collection_method,
            created: subscription.created,
            current_period_end: subscription.current_period_end,
            current_period_start: subscription.current_period_start,
            customer: subscription.customer?.id,
            days_until_due: subscription.days_until_due,
            default_payment_method: subscription.default_payment_method,
            default_source: subscription.default_source,
            default_tax_rates: subscription.default_tax_rates,
            discount: subscription.discount,
            ended_at: subscription.ended_at,
            items: subscription.items,
            latest_invoice: subscription.latest_invoice?.id,
            livemode: subscription.livemode,
            metadata: subscription.metadata,
            next_pending_invoice_item_invoice: subscription.next_pending_invoice_item_invoice,
            pause_collection: subscription.pause_collection,
            payment_settings: subscription.payment_settings,
            pending_invoice_item_interval: subscription.pending_invoice_item_interval,
            pending_setup_intent: subscription.pending_setup_intent,
            pending_update: subscription.pending_update,
            schedule: subscription.schedule,
            start_date: subscription.start_date,
            status: subscription.status,
            transfer_data: subscription.transfer_data,
            trial_end: subscription.trial_end,
            trial_start: subscription.trial_start
          }, { onConflict: 'id' });

        if (error) log(`Error storing subscription ${subscription.id}: ${error.message}`);
        else count++;
      }

      hasMore = subscriptions.has_more;
      if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
        log(`Processed ${count} subscriptions...`);
      }
    } catch (error) {
      log(`Error fetching subscriptions: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Subscription extraction complete. Total: ${count}`);
}

async function extractProductsAndPrices(log) {
  log('Extracting products and prices...');
  let productsCount = 0;
  let pricesCount = 0;

  // Extract products
  let hasMore = true;
  let startingAfter = null;

  while (hasMore) {
    try {
      const products = await stripe.products.list({
        limit: 100,
        starting_after: startingAfter
      });

      for (const product of products.data) {
        const { error } = await supabase
          .from('stripe_products')
          .upsert({
            id: product.id,
            object: product.object,
            active: product.active,
            created: product.created,
            default_price: product.default_price,
            description: product.description,
            images: product.images,
            livemode: product.livemode,
            metadata: product.metadata,
            name: product.name,
            package_dimensions: product.package_dimensions,
            shippable: product.shippable,
            statement_descriptor: product.statement_descriptor,
            tax_code: product.tax_code,
            type: product.type,
            unit_label: product.unit_label,
            updated: product.updated,
            url: product.url
          }, { onConflict: 'id' });

        if (error) log(`Error storing product ${product.id}: ${error.message}`);
        else productsCount++;
      }

      hasMore = products.has_more;
      if (hasMore && products.data.length > 0) {
        startingAfter = products.data[products.data.length - 1].id;
      }
    } catch (error) {
      log(`Error fetching products: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Extract prices
  hasMore = true;
  startingAfter = null;

  while (hasMore) {
    try {
      const prices = await stripe.prices.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['product']
      });

      for (const price of prices.data) {
        const { error } = await supabase
          .from('stripe_prices')
          .upsert({
            id: price.id,
            object: price.object,
            active: price.active,
            billing_scheme: price.billing_scheme,
            created: price.created,
            currency: price.currency,
            custom_unit_amount: price.custom_unit_amount,
            livemode: price.livemode,
            lookup_key: price.lookup_key,
            metadata: price.metadata,
            nickname: price.nickname,
            product: price.product?.id,
            recurring: price.recurring,
            tax_behavior: price.tax_behavior,
            tiers: price.tiers,
            tiers_mode: price.tiers_mode,
            transform_quantity: price.transform_quantity,
            type: price.type,
            unit_amount: price.unit_amount,
            unit_amount_decimal: price.unit_amount_decimal
          }, { onConflict: 'id' });

        if (error) log(`Error storing price ${price.id}: ${error.message}`);
        else pricesCount++;
      }

      hasMore = prices.has_more;
      if (hasMore && prices.data.length > 0) {
        startingAfter = prices.data[prices.data.length - 1].id;
      }
    } catch (error) {
      log(`Error fetching prices: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Products and prices extraction complete. Products: ${productsCount}, Prices: ${pricesCount}`);
}

async function extractCheckoutSessions(log) {
  log('Extracting checkout sessions...');
  let hasMore = true;
  let startingAfter = null;
  let count = 0;

  while (hasMore) {
    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['customer', 'payment_intent']
      });

      for (const session of sessions.data) {
        const { error } = await supabase
          .from('stripe_checkout_sessions')
          .upsert({
            id: session.id,
            object: session.object,
            after_expiration: session.after_expiration,
            allow_promotion_codes: session.allow_promotion_codes,
            amount_subtotal: session.amount_subtotal,
            amount_total: session.amount_total,
            automatic_tax: session.automatic_tax,
            billing_address_collection: session.billing_address_collection,
            cancel_url: session.cancel_url,
            client_reference_id: session.client_reference_id,
            consent: session.consent,
            consent_collection: session.consent_collection,
            created: session.created,
            currency: session.currency,
            custom_fields: session.custom_fields,
            custom_text: session.custom_text,
            customer: session.customer?.id,
            customer_creation: session.customer_creation,
            customer_details: session.customer_details,
            customer_email: session.customer_email,
            expires_at: session.expires_at,
            invoice: session.invoice,
            invoice_creation: session.invoice_creation,
            line_items: session.line_items,
            livemode: session.livemode,
            locale: session.locale,
            metadata: session.metadata,
            mode: session.mode,
            payment_intent: session.payment_intent?.id,
            payment_link: session.payment_link,
            payment_method_collection: session.payment_method_collection,
            payment_method_options: session.payment_method_options,
            payment_method_types: session.payment_method_types,
            payment_status: session.payment_status,
            phone_number_collection: session.phone_number_collection,
            recovered_from: session.recovered_from,
            setup_intent: session.setup_intent,
            shipping_address_collection: session.shipping_address_collection,
            shipping_cost: session.shipping_cost,
            shipping_details: session.shipping_details,
            shipping_options: session.shipping_options,
            status: session.status,
            submit_type: session.submit_type,
            subscription: session.subscription,
            success_url: session.success_url,
            total_details: session.total_details,
            url: session.url
          }, { onConflict: 'id' });

        if (error) log(`Error storing checkout session ${session.id}: ${error.message}`);
        else count++;
      }

      hasMore = sessions.has_more;
      if (hasMore && sessions.data.length > 0) {
        startingAfter = sessions.data[sessions.data.length - 1].id;
        log(`Processed ${count} checkout sessions...`);
      }
    } catch (error) {
      log(`Error fetching checkout sessions: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Checkout session extraction complete. Total: ${count}`);
}

async function extractPaymentIntents(log) {
  log('Extracting payment intents...');
  let hasMore = true;
  let startingAfter = null;
  let count = 0;

  while (hasMore) {
    try {
      const intents = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['customer', 'invoice']
      });

      for (const intent of intents.data) {
        const { error } = await supabase
          .from('stripe_payment_intents')
          .upsert({
            id: intent.id,
            object: intent.object,
            amount: intent.amount,
            amount_capturable: intent.amount_capturable,
            amount_details: intent.amount_details,
            amount_received: intent.amount_received,
            application: intent.application,
            application_fee_amount: intent.application_fee_amount,
            automatic_payment_methods: intent.automatic_payment_methods,
            canceled_at: intent.canceled_at,
            cancellation_reason: intent.cancellation_reason,
            capture_method: intent.capture_method,
            client_secret: intent.client_secret,
            confirmation_method: intent.confirmation_method,
            created: intent.created,
            currency: intent.currency,
            customer: intent.customer?.id,
            description: intent.description,
            invoice: intent.invoice?.id,
            last_payment_error: intent.last_payment_error,
            livemode: intent.livemode,
            metadata: intent.metadata,
            next_action: intent.next_action,
            on_behalf_of: intent.on_behalf_of,
            payment_method: intent.payment_method,
            payment_method_options: intent.payment_method_options,
            payment_method_types: intent.payment_method_types,
            processing: intent.processing,
            receipt_email: intent.receipt_email,
            review: intent.review,
            setup_future_usage: intent.setup_future_usage,
            shipping: intent.shipping,
            source: intent.source,
            statement_descriptor: intent.statement_descriptor,
            statement_descriptor_suffix: intent.statement_descriptor_suffix,
            status: intent.status,
            transfer_data: intent.transfer_data,
            transfer_group: intent.transfer_group
          }, { onConflict: 'id' });

        if (error) log(`Error storing payment intent ${intent.id}: ${error.message}`);
        else count++;
      }

      hasMore = intents.has_more;
      if (hasMore && intents.data.length > 0) {
        startingAfter = intents.data[intents.data.length - 1].id;
        log(`Processed ${count} payment intents...`);
      }
    } catch (error) {
      log(`Error fetching payment intents: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  log(`Payment intent extraction complete. Total: ${count}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  extractAllStripeData().catch(console.error);
}

export { extractAllStripeData };