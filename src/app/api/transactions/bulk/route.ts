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

    const updateResult = await prisma.financialTransaction.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updates,
    });

    const successCount = updateResult.count;
    const failedCount = ids.length - updateResult.count;

    return NextResponse.json({
      message: `Updated ${successCount} transactions, ${failedCount} failed`,
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
