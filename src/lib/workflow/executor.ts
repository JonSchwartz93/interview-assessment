import type { WorkflowDefinition, WorkflowRun, StepLog, StepStatus, WorkflowStatus } from './types';

/**
 * Simple workflow executor
 * 
 * Executes workflow steps in sequence and tracks their status.
 * Each step receives the workflow context and can return updates to it.
 */
export class WorkflowExecutor<TContext extends Record<string, unknown>> {
  private workflowRun: WorkflowRun;

  constructor(workflowName: string, initialContext: TContext) {
    this.workflowRun = {
      id: crypto.randomUUID(),
      workflowName,
      status: 'PENDING',
      context: { ...initialContext },
      steps: [],
      startedAt: new Date(),
    };
  }

  async execute(definition: WorkflowDefinition<TContext>): Promise<WorkflowRun> {
    this.workflowRun.status = 'RUNNING';

    try {
      for (const stepDef of definition.steps) {
        await this.executeStep(stepDef);
      }

      this.workflowRun.status = 'COMPLETED';
      this.workflowRun.completedAt = new Date();
    } catch (error) {
      this.workflowRun.status = 'FAILED';
      this.workflowRun.completedAt = new Date();
      this.workflowRun.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return this.workflowRun;
  }

  private async executeStep(stepDef: { key: string; name: string; execute: (context: TContext) => Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> }): Promise<void> {
    const stepLog: StepLog = {
      stepKey: stepDef.key,
      stepName: stepDef.name,
      status: 'RUNNING',
      startedAt: new Date(),
    };

    this.workflowRun.steps.push(stepLog);

    try {
      const result = await stepDef.execute(this.workflowRun.context as TContext);

      if (!result.success) {
        stepLog.status = 'FAILED';
        stepLog.error = result.error || 'Step execution failed';
        stepLog.result = result;
        stepLog.completedAt = new Date();
        throw new Error(stepLog.error);
      }

      // Merge any returned data into context
      if (result.data) {
        this.workflowRun.context = {
          ...this.workflowRun.context,
          ...result.data,
        };
      }

      stepLog.status = 'COMPLETED';
      stepLog.result = result;
      stepLog.completedAt = new Date();
    } catch (error) {
      if (stepLog.status !== 'FAILED') {
        stepLog.status = 'FAILED';
        stepLog.error = error instanceof Error ? error.message : 'Unknown error';
        stepLog.completedAt = new Date();
      }
      throw error;
    }
  }

  getWorkflowRun(): WorkflowRun {
    return this.workflowRun;
  }
}
