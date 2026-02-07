import { PrismaClient } from '@prisma/client';
import { CaseStatus, TransactionCategory } from '../src/lib/types';

const prisma = new PrismaClient();

// Transaction generators
const incomeGenerators = [
  { description: () => 'SOCIAL SECURITY ADMIN', amount: () => randomBetween(150000, 200000), category: TransactionCategory.SOCIAL_SECURITY },
  { description: () => 'SSI PAYMENT', amount: () => randomBetween(80000, 100000), category: TransactionCategory.SSI },
  { description: () => `PENSION ${randomFrom(['DISBURSEMENT', 'PAYMENT', 'DEPOSIT'])}`, amount: () => randomBetween(100000, 150000), category: TransactionCategory.PENSION },
  { description: () => 'VA BENEFITS', amount: () => randomBetween(30000, 60000), category: TransactionCategory.VETERANS_BENEFITS },
  { description: () => `INTEREST ${randomFrom(['PAYMENT', 'CREDIT', 'DIVIDEND'])}`, amount: () => randomBetween(500, 5000), category: TransactionCategory.INTEREST_DIVIDENDS },
];

const expenseGenerators = [
  { description: () => `${randomFrom(['MEDICARE', 'AETNA', 'BCBS', 'UNITED HEALTH'])} PREMIUM`, amount: () => -randomBetween(5000, 20000), category: TransactionCategory.HEALTH_INSURANCE },
  { description: () => `${randomFrom(['METLIFE', 'PRUDENTIAL', 'NEW YORK LIFE'])} INS`, amount: () => -randomBetween(3000, 8000), category: TransactionCategory.LIFE_INSURANCE },
  { description: () => `${randomFrom(['ELECTRIC', 'GAS', 'WATER', 'SEWER'])} ${randomFrom(['COMPANY', 'UTILITY', 'DEPT'])}`, amount: () => -randomBetween(5000, 15000), category: TransactionCategory.UTILITIES },
  { description: () => `${randomFrom(['AUTO', 'CAR', 'VEHICLE'])} INSURANCE`, amount: () => -randomBetween(8000, 15000), category: TransactionCategory.VEHICLE_EXPENSES },
  { description: () => `${randomFrom(['WALMART', 'KROGER', 'SAFEWAY', 'PUBLIX', 'ALDI', 'COSTCO'])} ${randomFrom(['GROCERY', 'STORE', ''])}`.trim(), amount: () => -randomBetween(5000, 25000), category: TransactionCategory.GROCERIES },
  { description: () => `${randomFrom(['CVS', 'WALGREENS', 'RITE AID', 'PHARMACY'])}`, amount: () => -randomBetween(1500, 8000), category: TransactionCategory.MEDICAL },
  { description: () => `${randomFrom(['NETFLIX', 'HULU', 'AMAZON PRIME', 'SPOTIFY', 'APPLE'])}`, amount: () => -randomBetween(999, 2000), category: TransactionCategory.ENTERTAINMENT },
  { description: () => `${randomFrom(['AMAZON', 'TARGET', 'BEST BUY', 'HOME DEPOT'])} PURCHASE`, amount: () => -randomBetween(2000, 15000), category: TransactionCategory.OTHER },
];

const transferGenerators = [
  { description: () => `TRANSFER TO ${randomFrom(['SAVINGS', 'CHECKING', 'MONEY MARKET'])}`, amount: () => -randomBetween(10000, 100000), category: TransactionCategory.INTERNAL_TRANSFER },
  { description: () => `${randomFrom(['ZELLE', 'VENMO', 'PAYPAL'])} TO ${randomName()}`, amount: () => -randomBetween(2000, 50000), category: TransactionCategory.EXTERNAL_TRANSFER },
  { description: () => `ATM WITHDRAWAL ${randomFrom(['', randomZip()])}`.trim(), amount: () => -randomBetween(4000, 40000), category: TransactionCategory.ATM_WITHDRAWAL },
  { description: () => `CHECK #${randomBetween(1000, 9999)}`, amount: () => -randomBetween(5000, 100000), category: TransactionCategory.CHECK },
  { description: () => `${randomFrom(['MOBILE', 'ATM', 'BRANCH'])} DEPOSIT`, amount: () => randomBetween(5000, 50000), category: TransactionCategory.DEPOSIT },
];

const flaggableGenerators = [
  { description: () => `CASH WITHDRAWAL $${randomBetween(3000, 8000)}`, amount: () => -randomBetween(300000, 800000), category: TransactionCategory.ATM_WITHDRAWAL, flagReason: 'Large cash withdrawal exceeds $3000 threshold' },
  { description: () => `WIRE TRANSFER ${randomFrom(['OVERSEAS', 'INTERNATIONAL', 'FOREIGN'])}`, amount: () => -randomBetween(100000, 500000), category: TransactionCategory.EXTERNAL_TRANSFER, flagReason: 'International wire transfer requires review' },
  { description: () => `${randomFrom(['CASINO', 'GAMBLING', 'LOTTERY', 'SLOTS'])} ${randomFrom(['RESORT', 'INC', 'LLC'])}`, amount: () => -randomBetween(20000, 150000), category: TransactionCategory.ENTERTAINMENT, flagReason: 'Gambling establishment transaction' },
];

// Helper functions
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName(): string {
  const firstNames = ['JOHN', 'MARY', 'JAMES', 'SARAH', 'MICHAEL', 'LINDA', 'ROBERT', 'SUSAN'];
  const lastNames = ['DOE', 'SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'DAVIS'];
  return `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
}

function randomZip(): string {
  return String(randomBetween(10000, 99999));
}

function generateTransaction(
  caseId: string,
  date: Date,
  generator: { description: () => string; amount: () => number; category: string; flagReason?: string },
  accountLastFour: string
) {
  const isFlagged = !!generator.flagReason;
  return {
    caseId,
    date,
    description: generator.description(),
    amountInCents: generator.amount(),
    category: generator.category,
    isFlagged,
    flagReason: generator.flagReason || null,
    isReviewed: !isFlagged && Math.random() > 0.7, // 30% reviewed, but not flagged ones
    accountLastFour,
  };
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.financialTransaction.deleteMany();
  await prisma.case.deleteMany();

  // Create test cases
  const case1 = await prisma.case.create({
    data: {
      residentName: 'John Smith',
      facilityName: 'Sunny Acres Nursing Home',
      status: CaseStatus.IN_PROGRESS,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      residentName: 'Mary Johnson',
      facilityName: 'Sunny Acres Nursing Home',
      status: CaseStatus.DRAFT,
    },
  });

  console.log(`✅ Created 2 cases`);

  // Generate transactions for case 1 (3 years of data = ~1500 transactions)
  const transactions: ReturnType<typeof generateTransaction>[] = [];
  const startDate = new Date('2021-01-01');
  const endDate = new Date('2024-03-31');
  const accountLastFour = '4532';

  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Monthly income (1st of month)
    if (currentDate.getDate() === 1) {
      // 2-3 income sources per month
      const incomeCount = randomBetween(2, 3);
      for (let i = 0; i < incomeCount; i++) {
        const generator = randomFrom(incomeGenerators);
        transactions.push(generateTransaction(case1.id, new Date(currentDate), generator, accountLastFour));
      }
    }

    // Random daily transactions (50% chance each day)
    if (Math.random() > 0.5) {
      const dailyCount = randomBetween(1, 3);
      for (let i = 0; i < dailyCount; i++) {
        const allExpenses = [...expenseGenerators, ...transferGenerators];
        const generator = randomFrom(allExpenses);
        const txDate = new Date(currentDate);
        txDate.setHours(randomBetween(8, 20), randomBetween(0, 59));
        transactions.push(generateTransaction(case1.id, txDate, generator, accountLastFour));
      }
    }

    // Occasional flaggable transactions (2% chance per day)
    if (Math.random() < 0.02) {
      const generator = randomFrom(flaggableGenerators);
      transactions.push(generateTransaction(case1.id, new Date(currentDate), generator, accountLastFour));
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add some uncategorized transactions (for candidate to categorize)
  const uncategorizedDescriptions = [
    'DIRECT DEP PENSION FUND',
    'POS PURCHASE 12345',
    'ACH DEBIT INSURANCE',
    'VENMO PAYMENT',
    'CHECK DEPOSIT',
    'ONLINE TRANSFER',
    'DEBIT CARD PURCHASE',
    'ACH CREDIT',
    'WIRE INCOMING',
    'MISC CREDIT',
  ];

  for (let i = 0; i < 50; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + randomBetween(0, 1000));
    transactions.push({
      caseId: case1.id,
      date,
      description: randomFrom(uncategorizedDescriptions),
      amountInCents: Math.random() > 0.5 ? randomBetween(5000, 100000) : -randomBetween(2000, 50000),
      category: TransactionCategory.UNCATEGORIZED,
      isFlagged: false,
      flagReason: null,
      isReviewed: false,
      accountLastFour,
    });
  }

  // Add transactions for case 2 (smaller set - just 1 month)
  const case2StartDate = new Date('2024-01-01');
  for (let day = 0; day < 30; day++) {
    const date = new Date(case2StartDate);
    date.setDate(date.getDate() + day);
    
    if (day === 0) {
      // Income on first day
      transactions.push(generateTransaction(case2.id, date, randomFrom(incomeGenerators), '8821'));
    }
    
    if (Math.random() > 0.6) {
      const generator = randomFrom([...expenseGenerators, ...transferGenerators]);
      transactions.push(generateTransaction(case2.id, date, generator, '8821'));
    }
  }

  // Batch insert transactions
  await prisma.financialTransaction.createMany({
    data: transactions,
  });

  console.log(`✅ Created ${transactions.length} transactions`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
