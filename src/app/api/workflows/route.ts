import { NextResponse } from 'next/server';
import { WorkflowExecutor, orderWorkflow, type OrderContext } from '@/lib/workflow';
import { workflowStore } from '@/lib/workflow/store';

// GET /api/workflows - List all workflow runs
export async function GET() {
  const runs = workflowStore.getAll();
  return NextResponse.json(runs);
}

// POST /api/workflows - Start a new workflow
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create a sample order if not provided
    const orderContext: OrderContext = {
      orderId: body.orderId || `ORD-${Date.now()}`,
      customerId: body.customerId || `CUST-${Math.random().toString(36).substring(7)}`,
      items: body.items || [
        { productId: 'PROD-001', quantity: 2, price: 29.99 },
        { productId: 'PROD-002', quantity: 1, price: 49.99 },
      ],
      totalAmount: body.totalAmount || 109.97,
    };

    // Execute the workflow
    const executor = new WorkflowExecutor<OrderContext>(orderWorkflow.name, orderContext);
    const result = await executor.execute(orderWorkflow);

    // Save the result
    workflowStore.save(result);

    return NextResponse.json(result, {
      status: result.status === 'COMPLETED' ? 200 : 500,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
