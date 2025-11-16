/**
 * Sepay Payment Gateway Integration
 * Server-side only (contains API keys)
 *
 * Documentation: https://docs.sepay.vn
 *
 * Setup Instructions:
 * 1. Sign up at https://my.sepay.vn
 * 2. Get your API credentials (API Key & Secret Key)
 * 3. Add to .env file:
 *    - SEPAY_API_KEY=your_api_key
 *    - SEPAY_SECRET_KEY=your_secret_key
 *    - SEPAY_SANDBOX=true (for testing)
 */

import crypto from 'node:crypto';

interface SepayPaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description?: string;
  returnUrl?: string;
}

interface SepayPaymentResponse {
  success: boolean;
  payment_url?: string;
  qr_code?: string;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  transaction_id?: string;
  error?: string;
}

/**
 * Create a Sepay payment
 * This is a placeholder - you'll need to implement based on Sepay's actual API
 */
export async function createSepayPayment({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  description,
  returnUrl,
}: SepayPaymentRequest): Promise<SepayPaymentResponse> {
  const apiKey = process.env.SEPAY_API_KEY;
  const secretKey = process.env.SEPAY_SECRET_KEY;
  const isSandbox = process.env.SEPAY_SANDBOX === 'true';

  if (!apiKey || !secretKey) {
    console.error('⚠️  Sepay credentials not configured. Please set SEPAY_API_KEY and SEPAY_SECRET_KEY in .env');

    // Return mock data for development
    return {
      success: true,
      payment_url: `/orders/${orderId}?mock=true`,
      qr_code: 'https://via.placeholder.com/300x300?text=QR+Code',
      bank_account: {
        bank_name: 'Vietcombank',
        account_number: '1234567890',
        account_name: 'CONG TY DEMO',
      },
      transaction_id: `MOCK-${orderId}`,
    };
  }

  try {
    // Sepay API endpoint (replace with actual endpoint)
    const endpoint = isSandbox
      ? 'https://sandbox.sepay.vn/api/v1/payment'
      : 'https://api.sepay.vn/api/v1/payment';

    // Prepare request payload (adjust based on Sepay's API spec)
    const payload = {
      order_id: orderId,
      amount: amount,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      description: description || `Đơn hàng #${orderId}`,
      return_url: returnUrl || `${process.env.PUBLIC_STORE_DOMAIN}/orders/${orderId}`,
      webhook_url: `${process.env.PUBLIC_STORE_DOMAIN}/api/sepay/webhook`,
    };

    // Generate signature (adjust based on Sepay's signature algorithm)
    const signature = generateSepaySignature(payload, secretKey);

    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment');
    }

    return {
      success: true,
      payment_url: data.payment_url,
      qr_code: data.qr_code,
      bank_account: data.bank_account,
      transaction_id: data.transaction_id,
    };
  } catch (error) {
    console.error('Sepay payment creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate Sepay webhook signature for verification
 * Adjust this based on Sepay's actual signature algorithm
 */
export function generateSepaySignature(
  payload: Record<string, any>,
  secretKey: string
): string {
  // Example signature generation - adjust based on Sepay docs
  const sortedKeys = Object.keys(payload).sort();
  const signatureString = sortedKeys
    .map((key) => `${key}=${JSON.stringify(payload[key])}`)
    .join('&');

  return crypto
    .createHmac('sha256', secretKey)
    .update(signatureString)
    .digest('hex');
}

/**
 * Verify Sepay webhook signature
 */
export function verifySepayWebhook(
  body: string,
  signature: string,
  secretKey: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return false;
  }
}

/**
 * Query payment status from Sepay
 */
export async function getSepayPaymentStatus(
  transactionId: string
): Promise<{
  status: 'pending' | 'success' | 'failed' | 'expired';
  amount?: number;
  paid_at?: string;
}> {
  const apiKey = process.env.SEPAY_API_KEY;
  const isSandbox = process.env.SEPAY_SANDBOX === 'true';

  if (!apiKey) {
    return { status: 'pending' };
  }

  try {
    const endpoint = isSandbox
      ? `https://sandbox.sepay.vn/api/v1/payment/${transactionId}`
      : `https://api.sepay.vn/api/v1/payment/${transactionId}`;

    const response = await fetch(endpoint, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    const data = await response.json();

    return {
      status: data.status,
      amount: data.amount,
      paid_at: data.paid_at,
    };
  } catch (error) {
    console.error('Failed to get payment status:', error);
    return { status: 'pending' };
  }
}
