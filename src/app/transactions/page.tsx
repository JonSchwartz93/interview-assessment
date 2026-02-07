"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  Flag,
  Download,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amountInCents: number;
  category: string;
  isReviewed: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  reviewNote: string | null;
  accountLastFour: string | null;
  caseId: string;
};

type Case = {
  id: string;
  residentName: string;
  facilityName: string;
};

type CategoryStats = {
  category: string;
  count: number;
  totalAmount: number;
};

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "SOCIAL_SECURITY", label: "Social Security" },
  { value: "SSI", label: "SSI" },
  { value: "PENSION", label: "Pension" },
  { value: "VETERANS_BENEFITS", label: "Veterans Benefits" },
  { value: "INTEREST_DIVIDENDS", label: "Interest & Dividends" },
  { value: "HEALTH_INSURANCE", label: "Health Insurance" },
  { value: "LIFE_INSURANCE", label: "Life Insurance" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "VEHICLE_EXPENSES", label: "Vehicle Expenses" },
  { value: "INTERNAL_TRANSFER", label: "Internal Transfer" },
  { value: "EXTERNAL_TRANSFER", label: "External Transfer" },
  { value: "ATM_WITHDRAWAL", label: "ATM Withdrawal" },
  { value: "CHECK", label: "Check" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "GROCERIES", label: "Groceries" },
  { value: "MEDICAL", label: "Medical" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "OTHER", label: "Other" },
  { value: "UNCATEGORIZED", label: "Uncategorized" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"all" | "reviewed" | "unreviewed" | "flagged">("all");

  // Fetch cases on mount
  useEffect(() => {
    fetchCases();
  }, []);

  // Fetch transactions when case changes
  useEffect(() => {
    if (selectedCaseId) {
      fetchTransactions();
    }
  }, [selectedCaseId]);

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/cases");
      const data = await response.json();
      setCases(data);
      if (data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions?caseId=${selectedCaseId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!t.description.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "reviewed" && !t.isReviewed) return false;
      if (statusFilter === "unreviewed" && t.isReviewed) return false;
      if (statusFilter === "flagged" && !t.isFlagged) return false;

      return true;
    });
  }, [transactions, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = transactions.length;
    const reviewed = transactions.filter((t) => t.isReviewed).length;
    const flagged = transactions.filter((t) => t.isFlagged).length;
    const uncategorized = transactions.filter((t) => t.category === "UNCATEGORIZED").length;

    const income = transactions
      .filter((t) => t.amountInCents > 0)
      .reduce((sum, t) => sum + t.amountInCents, 0);
    const expenses = transactions
      .filter((t) => t.amountInCents < 0)
      .reduce((sum, t) => sum + Math.abs(t.amountInCents), 0);

    return { total, reviewed, flagged, uncategorized, income, expenses };
  }, [transactions]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkMarkReviewed = async () => {
    if (selectedIds.size === 0) return;

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/transactions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isReviewed: true }),
        })
      );

      await Promise.all(promises);
      await fetchTransactions();
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to mark as reviewed:", error);
    }
  };

  const handleCategoryChange = async (transactionId: string, category: string) => {
    try {
      await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      // Refetch all transactions
      await fetchTransactions();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleToggleReviewed = async (transactionId: string, isReviewed: boolean) => {
    try {
      await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReviewed }),
      });

      await fetchTransactions();
    } catch (error) {
      console.error("Failed to toggle reviewed:", error);
    }
  };

  const handleExportCsv = async () => {
    const csv = [
      ["Date", "Description", "Amount", "Category", "Reviewed", "Flagged"].join(","),
      ...filteredTransactions.map((t) =>
        [
          formatDate(t.date),
          `"${t.description}"`,
          (t.amountInCents / 100).toFixed(2),
          t.category,
          t.isReviewed ? "Yes" : "No",
          t.isFlagged ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
  };

  const getCategoryBadgeVariant = (category: string) => {
    if (["SOCIAL_SECURITY", "SSI", "PENSION", "VETERANS_BENEFITS", "INTEREST_DIVIDENDS"].includes(category)) {
      return "success";
    }
    if (["HEALTH_INSURANCE", "LIFE_INSURANCE", "UTILITIES", "VEHICLE_EXPENSES"].includes(category)) {
      return "info";
    }
    if (["INTERNAL_TRANSFER", "EXTERNAL_TRANSFER", "ATM_WITHDRAWAL", "CHECK", "DEPOSIT"].includes(category)) {
      return "warning";
    }
    if (category === "UNCATEGORIZED") {
      return "secondary";
    }
    return "outline";
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Review</h1>
          <p className="text-gray-600 mt-1">
            Review and categorize financial transactions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a case" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.residentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchTransactions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="text-gray-400">
                <Filter className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reviewed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.reviewed}
                </p>
              </div>
              <div className="text-green-500">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Flagged</p>
                <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
              </div>
              <div className="text-red-500">
                <Flag className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Uncategorized</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.uncategorized}
                </p>
              </div>
              <div className="text-yellow-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income/Expense Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Total Income</p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(stats.income)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Total Expenses</p>
                <p className="text-xl font-bold text-red-800">
                  {formatCurrency(stats.expenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unreviewed">Unreviewed</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 ml-auto">
              {selectedIds.size > 0 && (
                <Button onClick={handleBulkMarkReviewed} variant="success" size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark {selectedIds.size} Reviewed
                </Button>
              )}

              <Button onClick={handleExportCsv} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Transactions ({filteredTransactions.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left">
                      <Checkbox
                        checked={
                          selectedIds.size === filteredTransactions.length &&
                          filteredTransactions.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Description
                    </th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Category
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={cn(
                        "border-b last:border-0 hover:bg-gray-50",
                        transaction.isFlagged && "bg-red-50 hover:bg-red-100"
                      )}
                    >
                      <td className="py-3">
                        <Checkbox
                          checked={selectedIds.has(transaction.id)}
                          onChange={(e) =>
                            handleSelectOne(transaction.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {transaction.isFlagged && (
                            <Flag className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            {transaction.flagReason && (
                              <p className="text-xs text-red-600">
                                {transaction.flagReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "py-3 text-right text-sm font-medium",
                          transaction.amountInCents >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {formatCurrency(transaction.amountInCents)}
                      </td>
                      <td className="py-3">
                        <Select
                          value={transaction.category}
                          onValueChange={(value) =>
                            handleCategoryChange(transaction.id, value)
                          }
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <Badge
                              variant={getCategoryBadgeVariant(transaction.category)}
                              className="truncate"
                            >
                              {transaction.category.replace("_", " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.filter((c) => c.value !== "ALL").map(
                              (cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 text-center">
                        {transaction.isReviewed ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <Button
                          variant={transaction.isReviewed ? "ghost" : "outline"}
                          size="sm"
                          onClick={() =>
                            handleToggleReviewed(
                              transaction.id,
                              !transaction.isReviewed
                            )
                          }
                        >
                          {transaction.isReviewed ? "Unreview" : "Review"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
