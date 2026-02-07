// Since SQLite doesn't support native enums, we define them as const objects
// These mirror the values documented in prisma/schema.prisma

export const CaseStatus = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
} as const;

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

export const TransactionCategory = {
  // Income
  SOCIAL_SECURITY: 'SOCIAL_SECURITY',
  SSI: 'SSI',
  PENSION: 'PENSION',
  VETERANS_BENEFITS: 'VETERANS_BENEFITS',
  INTEREST_DIVIDENDS: 'INTEREST_DIVIDENDS',
  // Assets
  HEALTH_INSURANCE: 'HEALTH_INSURANCE',
  LIFE_INSURANCE: 'LIFE_INSURANCE',
  UTILITIES: 'UTILITIES',
  VEHICLE_EXPENSES: 'VEHICLE_EXPENSES',
  // Transfers
  INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
  EXTERNAL_TRANSFER: 'EXTERNAL_TRANSFER',
  ATM_WITHDRAWAL: 'ATM_WITHDRAWAL',
  CHECK: 'CHECK',
  DEPOSIT: 'DEPOSIT',
  // Other
  GROCERIES: 'GROCERIES',
  MEDICAL: 'MEDICAL',
  ENTERTAINMENT: 'ENTERTAINMENT',
  OTHER: 'OTHER',
  UNCATEGORIZED: 'UNCATEGORIZED',
} as const;

export type TransactionCategory = (typeof TransactionCategory)[keyof typeof TransactionCategory];

// Helper to get all values of an enum-like object as an array
export const getEnumValues = <T extends Record<string, string>>(enumObj: T): T[keyof T][] => {
  return Object.values(enumObj) as T[keyof T][];
};
