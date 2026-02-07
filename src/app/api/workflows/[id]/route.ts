import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/workflow/store';

// GET /api/workflows/[id] - Get a specific workflow run
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const run = workflowStore.get(id);

  if (!run) {
    return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 });
  }

  return NextResponse.json(run);
}
