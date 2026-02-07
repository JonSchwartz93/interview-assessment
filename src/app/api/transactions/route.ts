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
      where: {
        caseId,
      },
      orderBy: {
        date: "desc",
      },
    });

    const stats = {
      total: transactions.length,
      reviewed: transactions.filter((transaction) => transaction.isReviewed).length,
      flagged: transactions.filter((transaction) => transaction.isFlagged).length,
      uncategorized: transactions.filter((transaction) => transaction.category === "UNCATEGORIZED").length,
      income: transactions
        .filter((transaction) => transaction.amountInCents > 0)
        .reduce((sum, transaction) => sum + transaction.amountInCents, 0),
      expenses: transactions
        .filter((transaction) => transaction.amountInCents < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amountInCents), 0),
    };

    return NextResponse.json({ transactions, stats });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
