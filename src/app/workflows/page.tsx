'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface StepLog {
  stepKey: string;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt: string;
  completedAt?: string;
  result?: { success: boolean; data?: Record<string, unknown>; error?: string };
  error?: string;
}

interface WorkflowRun {
  id: string;
  workflowName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  context: Record<string, unknown>;
  steps: StepLog[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      
      // Expand the new workflow automatically
      setExpandedWorkflows(prev => new Set([...prev, result.id]));
      
      // Refresh the list
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to run workflow:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runMultipleWorkflows = async (count: number = 5) => {
    setIsRunningBatch(true);
    try {
      for (let i = 0; i < count; i++) {
        await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to run workflows:', error);
    } finally {
      setIsRunningBatch(false);
    }
  };

  const clearWorkflows = async () => {
    setIsClearing(true);
    try {
      await fetch('/api/workflows/clear', { method: 'POST' });
      setWorkflows([]);
      setExpandedWorkflows(new Set());
    } catch (error) {
      console.error('Failed to clear workflows:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedWorkflows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RUNNING':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'SKIPPED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      COMPLETED: 'default',
      FAILED: 'destructive',
      RUNNING: 'secondary',
      PENDING: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const ms = endDate.getTime() - startDate.getTime();
    return `${ms}ms`;
  };

  // Calculate stats
  const stats = {
    total: workflows.length,
    completed: workflows.filter(w => w.status === 'COMPLETED').length,
    failed: workflows.filter(w => w.status === 'FAILED').length,
    successRate: workflows.length > 0 
      ? Math.round((workflows.filter(w => w.status === 'COMPLETED').length / workflows.length) * 100)
      : 0,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Processing Workflow</h1>
          <p className="text-gray-500 mt-1">
            Automated order fulfillment pipeline
          </p>
        </div>
        <div className="flex gap-2">
          {workflows.length > 0 && (
            <Button
              variant="ghost"
              onClick={clearWorkflows}
              disabled={isClearing}
              className="text-gray-500"
            >
              {isClearing ? 'Clearing...' : 'Clear History'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchWorkflows}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={runWorkflow} disabled={isRunning || isRunningBatch}>
            <PlayCircle className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Workflow'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => runMultipleWorkflows(5)} 
            disabled={isRunning || isRunningBatch}
          >
            {isRunningBatch ? 'Running...' : 'Run 5x'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Runs</CardTitle>
          <CardDescription>
            Click on a workflow to see step details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workflow runs yet</p>
              <p className="text-sm mt-1">Click &ldquo;Run Workflow&rdquo; to process an order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Workflow Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpanded(workflow.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedWorkflows.has(workflow.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      {getStatusIcon(workflow.status)}
                      <div>
                        <div className="font-medium">
                          {(workflow.context as { orderId?: string }).orderId || workflow.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(workflow.startedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {formatDuration(workflow.startedAt, workflow.completedAt)}
                      </span>
                      {getStatusBadge(workflow.status)}
                    </div>
                  </div>

                  {/* Workflow Details (Expanded) */}
                  {expandedWorkflows.has(workflow.id) && (
                    <div className="border-t bg-gray-50 p-4">
                      {workflow.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          <strong>Error:</strong> {workflow.error}
                        </div>
                      )}
                      
                      <div className="text-sm font-medium text-gray-700 mb-2">Steps:</div>
                      <div className="space-y-2">
                        {workflow.steps.map((step, index) => (
                          <div
                            key={step.stepKey}
                            className="flex items-center justify-between p-3 bg-white rounded border"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                              {getStatusIcon(step.status)}
                              <span className={step.status === 'FAILED' ? 'text-red-700' : ''}>
                                {step.stepName}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              {step.completedAt && (
                                <span className="text-sm text-gray-500">
                                  {formatDuration(step.startedAt, step.completedAt)}
                                </span>
                              )}
                              {step.error && (
                                <span className="text-sm text-red-600 max-w-xs truncate" title={step.error}>
                                  {step.error}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Context Data */}
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Context:</div>
                        <pre className="p-3 bg-white rounded border text-xs overflow-auto max-h-40">
                          {JSON.stringify(workflow.context, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
