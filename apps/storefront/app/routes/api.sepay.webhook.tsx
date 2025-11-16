import { json, type ActionFunctionArgs } from '@shopify/remix-oxygen';
import { verifySepayWebhook } from '~/lib/sepay.server';

/**
 * Sepay Webhook Handler
 *
 * This endpoint receives payment notifications from Sepay when a payment is completed.
 * It verifies the webhook signature and updates the order status accordingly.
 *
 * Sepay will POST to this endpoint with payment status updates.
 */
export async function action({ request, context }: ActionFunctionArgs) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get the webhook signature from headers
    const signature = request.headers.get('X-Sepay-Signature') || '';
    const body = await request.text();

    // Verify webhook signature
    const secretKey = process.env.SEPAY_SECRET_KEY || '';
    if (secretKey && !verifySepayWebhook(body, signature, secretKey)) {
      console.error('❌ Invalid webhook signature');
      return json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook data
    const data = JSON.parse(body);

    console.log('✅ Sepay webhook received:', {
      orderId: data.order_id,
      status: data.status,
      transactionId: data.transaction_id,
    });

    // Handle different payment statuses
    switch (data.status) {
      case 'success':
      case 'paid':
        await handleSuccessfulPayment(data, context);
        break;

      case 'failed':
        await handleFailedPayment(data, context);
        break;

      case 'expired':
        await handleExpiredPayment(data, context);
        break;

      default:
        console.log('Unknown payment status:', data.status);
    }

    // Always return 200 OK to acknowledge receipt
    return json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Sepay from retrying
    return json({ received: true, error: 'Processing error' });
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(data: any, context: any) {
  const { order_id, transaction_id, amount, paid_at } = data;

  console.log(`✅ Payment successful for order ${order_id}`);

  // Update order in Sanity
  try {
    // Query for the order document
    const orderQuery = `*[_type == "order" && orderId == $orderId][0]`;
    const order = await context.sanity.query({
      query: orderQuery,
      params: { orderId: order_id },
    });

    if (order) {
      // Update order status
      await context.sanity.patch(order._id).set({
        paymentStatus: 'paid',
        transactionId: transaction_id,
        paidAt: paid_at || new Date().toISOString(),
        status: 'processing',
      }).commit();

      console.log(`✅ Order ${order_id} marked as paid`);

      // TODO: Additional actions
      // - Send order confirmation email
      // - Notify warehouse/fulfillment
      // - Update inventory
      // - Send customer SMS notification
    } else {
      console.warn(`⚠️  Order ${order_id} not found in Sanity`);
    }
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data: any, context: any) {
  const { order_id, transaction_id, reason } = data;

  console.log(`❌ Payment failed for order ${order_id}: ${reason}`);

  try {
    const orderQuery = `*[_type == "order" && orderId == $orderId][0]`;
    const order = await context.sanity.query({
      query: orderQuery,
      params: { orderId: order_id },
    });

    if (order) {
      await context.sanity.patch(order._id).set({
        paymentStatus: 'failed',
        transactionId: transaction_id,
        failedReason: reason,
        status: 'cancelled',
      }).commit();

      // TODO: Send payment failed notification to customer
    }
  } catch (error) {
    console.error('Error updating failed order:', error);
  }
}

/**
 * Handle expired payment
 */
async function handleExpiredPayment(data: any, context: any) {
  const { order_id } = data;

  console.log(`⏰ Payment expired for order ${order_id}`);

  try {
    const orderQuery = `*[_type == "order" && orderId == $orderId][0]`;
    const order = await context.sanity.query({
      query: orderQuery,
      params: { orderId: order_id },
    });

    if (order) {
      await context.sanity.patch(order._id).set({
        paymentStatus: 'expired',
        status: 'cancelled',
      }).commit();
    }
  } catch (error) {
    console.error('Error updating expired order:', error);
  }
}

/**
 * Optional: GET endpoint for webhook testing
 */
export async function loader() {
  return json({
    message: 'Sepay webhook endpoint',
    status: 'active',
    url: '/api/sepay/webhook',
  });
}
