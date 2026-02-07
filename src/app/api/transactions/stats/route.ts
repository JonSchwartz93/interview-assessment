import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "caseId is required" },
        { status: 400 }
      );
    }

    const transactions = await prisma.financialTransaction.findMany({
      where: { caseId },
      select: {
        amountInCents: true,
        category: true,
        isReviewed: true,
        isFlagged: true,
      },
    });

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

    const byCategory = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { count: 0, total: 0 };
      }
      acc[t.category].count++;
      acc[t.category].total += t.amountInCents;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return NextResponse.json({
      total,
      reviewed,
      flagged,
      uncategorized,
      income,
      expenses,
      byCategory,
    });
  } catch (error) {
    console.error("Failed to fetch transaction stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction stats" },
      { status: 500 }
    );
  }
}
