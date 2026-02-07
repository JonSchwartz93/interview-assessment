import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/workflow/store';

// POST /api/workflows/clear - Clear all workflow runs (for testing)
export async function POST() {
  workflowStore.clear();
  return NextResponse.json({ success: true, message: 'All workflow runs cleared' });
}
