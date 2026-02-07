import type { WorkflowRun } from './types';

/**
 * Simple in-memory store for workflow runs
 * In a real application, this would be persisted to a database
 */
class WorkflowStore {
  private runs: Map<string, WorkflowRun> = new Map();

  save(run: WorkflowRun): void {
    this.runs.set(run.id, run);
  }

  get(id: string): WorkflowRun | undefined {
    return this.runs.get(id);
  }

  getAll(): WorkflowRun[] {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  clear(): void {
    this.runs.clear();
  }
}

// Global singleton instance
export const workflowStore = new WorkflowStore();
