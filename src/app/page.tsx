import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ArrowRight, Workflow } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          REAP Technical Assessment
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This application simulates a Medicaid eligibility case management system.
          Your interviewer will direct you to the appropriate challenge.
        </p>
      </div>

      <div className="space-y-6">
        {/* Challenge 1: Transaction Review */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Challenge 1: Transaction Review</CardTitle>
            </div>
            <CardDescription>
              Review, categorize, and flag financial transactions for Medicaid eligibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">The Problem:</p>
<p className="text-gray-500 mb-3">
                Users report the bulk &ldquo;Mark as Reviewed&rdquo; feature is slow and unreliable. 
                Sometimes only some transactions get updated.
              </p>
                <p className="font-medium mb-2">Your Task:</p>
                <p className="text-gray-500">
                  Investigate the issue, identify root causes, and implement improvements.
                </p>
              </div>
              <Link href="/transactions">
                <Button className="w-full">
                  Open Transaction Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Challenge 2: Order Processing Workflow */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Challenge 2: Order Processing Workflow</CardTitle>
            </div>
            <CardDescription>
              Automated order fulfillment pipeline with step-based execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">The Problem:</p>
                <p className="text-gray-500 mb-3">
                  The order processing workflow is failing frequently. Orders are not being 
                  fulfilled reliably, and the success rate is unacceptably low.
                </p>
                <p className="font-medium mb-2">Your Task:</p>
                <p className="text-gray-500">
                  Investigate why the workflow keeps failing and make it more reliable.
                </p>
              </div>
              <Link href="/workflows">
                <Button className="w-full" variant="outline">
                  Open Workflow Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-gray-100 rounded-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">General Tips</h2>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span>Check the browser Network tab and Console to see what&apos;s happening</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span>Look at both frontend and backend code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span>Use <code className="bg-gray-200 px-1 rounded">npm run db:studio</code> to inspect the database</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span>Think about error handling and edge cases</span>
          </li>
        </ul>
      </div>
    </main>
  );
}
