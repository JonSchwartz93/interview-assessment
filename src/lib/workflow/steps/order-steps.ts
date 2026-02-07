import type { StepResult } from '../types';

export interface OrderContext extends Record<string, unknown> {
  orderId: string;
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  // Populated by steps
  inventoryChecked?: boolean;
  paymentId?: string;
  paymentStatus?: string;
  shipmentId?: string;
  notificationSent?: boolean;
}

/**
 * Step 1: Validate Order
 * Checks that the order data is complete and valid
 */
export async function validateOrderStep(context: OrderContext): Promise<StepResult> {
  // Simulate some processing time
  await sleep(100);

  if (!context.orderId) {
    return { success: false, error: 'Order ID is required' };
  }

  if (!context.customerId) {
    return { success: false, error: 'Customer ID is required' };
  }

  if (!context.items || context.items.length === 0) {
    return { success: false, error: 'Order must contain at least one item' };
  }

  if (context.totalAmount <= 0) {
    return { success: false, error: 'Total amount must be positive' };
  }

  return {
    success: true,
    data: { validatedAt: new Date().toISOString() },
  };
}

/**
 * Step 2: Check Inventory
 * Verifies that all items are in stock
 * 
 * NOTE: This step simulates checking an external inventory service
 */
export async function checkInventoryStep(context: OrderContext): Promise<StepResult> {
  // Simulate API call delay
  await sleep(200);

  // Simulate external service that sometimes fails
  const externalServiceCall = await simulateExternalInventoryService(context.items);
  
  if (!externalServiceCall.available) {
    return {
      success: false,
      error: externalServiceCall.error || 'Inventory check failed',
    };
  }

  return {
    success: true,
    data: { inventoryChecked: true },
  };
}

/**
 * Step 3: Process Payment
 * Charges the customer's payment method
 */
export async function processPaymentStep(context: OrderContext): Promise<StepResult> {
  // Simulate payment processing
  await sleep(150);

  const paymentResult = await simulatePaymentGateway(context.totalAmount, context.customerId);

  if (paymentResult.success) {
    return {
      success: true,
      data: {
        paymentId: paymentResult.transactionId,
        paymentStatus: 'completed',
      },
    };
  }

  return {
    success: false,
    error: 'Payment processing failed',
  };
}

/**
 * Step 4: Create Shipment
 * Creates a shipment record and schedules delivery
 */
export async function createShipmentStep(context: OrderContext): Promise<StepResult> {
  // Simulate shipment creation
  await sleep(100);

  if (!context.paymentId) {
    return {
      success: false,
      error: 'Cannot create shipment without payment confirmation',
    };
  }

  const shipmentId = `SHIP-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  return {
    success: true,
    data: {
      shipmentId,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Step 5: Send Notification
 * Sends order confirmation to the customer
 */
export async function sendNotificationStep(context: OrderContext): Promise<StepResult> {
  // Simulate notification service
  await sleep(100);

  const notificationResult = await simulateNotificationService(context.customerId, context.orderId);

  if (!notificationResult.sent) {
    return {
      success: false,
      error: notificationResult.error || 'Failed to send notification',
    };
  }

  return {
    success: true,
    data: { notificationSent: true },
  };
}

// --- Helper functions ---

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulates an external inventory service
 * This service is known to be unreliable and fails ~40% of the time
 */
async function simulateExternalInventoryService(
  items: Array<{ productId: string; quantity: number }>
): Promise<{ available: boolean; error?: string }> {
  // Simulate network latency
  await sleep(50);

  // Service randomly fails due to timeouts, rate limits, etc.
  if (Math.random() < 0.4) {
    const errors = [
      'Connection timeout',
      'Service temporarily unavailable',
      'Rate limit exceeded',
      'Internal server error',
    ];
    return {
      available: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  }

  // Check that all items have valid quantities
  for (const item of items) {
    if (item.quantity > 100) {
      return { available: false, error: `Insufficient stock for product ${item.productId}` };
    }
  }

  return { available: true };
}

/**
 * Simulates a payment gateway
 * Returns a mock transaction result
 */
async function simulatePaymentGateway(
  amount: number,
  customerId: string
): Promise<{ success: boolean; transactionId: string }> {
  await sleep(50);

  // Payment always succeeds in this simulation
  return {
    success: true,
    transactionId: `PAY-${Date.now()}-${customerId.substring(0, 4)}`,
  };
}

/**
 * Simulates a notification service (email/SMS)
 * This service is also somewhat unreliable
 */
async function simulateNotificationService(
  customerId: string,
  orderId: string
): Promise<{ sent: boolean; error?: string }> {
  await sleep(30);

  // Service randomly fails ~25% of the time
  if (Math.random() < 0.25) {
    const errors = [
      'Email service unavailable',
      'SMS gateway timeout',
      'Notification queue full',
    ];
    return {
      sent: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  }

  return { sent: true };
}
