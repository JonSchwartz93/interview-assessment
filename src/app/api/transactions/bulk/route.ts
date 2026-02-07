import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionCategory, getEnumValues } from "@/lib/types";
import { z } from "zod";

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  updates: z.object({
    category: z.enum(getEnumValues(TransactionCategory) as [string, ...string[]]).optional(),
    isReviewed: z.boolean().optional(),
    isFlagged: z.boolean().optional(),
  }),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, updates } = bulkUpdateSchema.parse(body);

    const results = [];
    for (const id of ids) {
      try {
        const updated = await prisma.financialTransaction.update({
          where: { id },
          data: updates,
        });
        results.push({ id, success: true, data: updated });
      } catch (error) {
        results.push({ id, success: false, error: "Failed to update" });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Updated ${successCount} transactions, ${failedCount} failed`,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to bulk update transactions:", error);
    return NextResponse.json(
      { error: "Failed to bulk update transactions" },
      { status: 500 }
    );
  }
}
