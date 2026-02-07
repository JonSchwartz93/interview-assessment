import type { WorkflowDefinition } from '../types';
import type { OrderContext } from '../steps/order-steps';
import {
  validateOrderStep,
  checkInventoryStep,
  processPaymentStep,
  createShipmentStep,
  sendNotificationStep,
} from '../steps/order-steps';

export const ORDER_STEP_KEYS = {
  VALIDATE_ORDER: 'validate_order',
  CHECK_INVENTORY: 'check_inventory',
  PROCESS_PAYMENT: 'process_payment',
  CREATE_SHIPMENT: 'create_shipment',
  SEND_NOTIFICATION: 'send_notification',
} as const;

export const orderWorkflow: WorkflowDefinition<OrderContext> = {
  name: 'Order Processing',
  steps: [
    {
      key: ORDER_STEP_KEYS.VALIDATE_ORDER,
      name: 'Validate Order',
      execute: validateOrderStep,
    },
    {
      key: ORDER_STEP_KEYS.CHECK_INVENTORY,
      name: 'Check Inventory',
      execute: checkInventoryStep,
    },
    {
      key: ORDER_STEP_KEYS.PROCESS_PAYMENT,
      name: 'Process Payment',
      execute: processPaymentStep,
    },
    {
      key: ORDER_STEP_KEYS.CREATE_SHIPMENT,
      name: 'Create Shipment',
      execute: createShipmentStep,
    },
    {
      key: ORDER_STEP_KEYS.SEND_NOTIFICATION,
      name: 'Send Notification',
      execute: sendNotificationStep,
    },
  ],
};
