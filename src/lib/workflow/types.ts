// Simplified workflow types for the interview challenge

export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface StepResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface StepDefinition<TContext = Record<string, unknown>> {
  key: string;
  name: string;
  execute: (context: TContext) => Promise<StepResult>;
}

export interface WorkflowDefinition<TContext = Record<string, unknown>> {
  name: string;
  steps: StepDefinition<TContext>[];
}

export interface StepLog {
  stepKey: string;
  stepName: string;
  status: StepStatus;
  startedAt: Date;
  completedAt?: Date;
  result?: StepResult;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowName: string;
  status: WorkflowStatus;
  context: Record<string, unknown>;
  steps: StepLog[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}
