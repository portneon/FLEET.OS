import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const transactions = await prisma.transaction.findMany();
  
  const orgIds = [...new Set(transactions.map(t => t.organizationId))];

  for (const orgId of orgIds) {
    let legacyCustomer = await prisma.customer.findFirst({
      where: { organizationId: orgId, name: 'Legacy Customer' }
    });

    if (!legacyCustomer) {
      legacyCustomer = await prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'Legacy Customer',
          email: 'legacy@example.com',
          customerType: 'BUSINESS'
        }
      });
    }

    const orgTxs = transactions.filter(t => t.organizationId === orgId);

    for (const tx of orgTxs) {
      if (tx.type === 'INCOME') {
        await prisma.invoice.create({
          data: {
            organizationId: orgId,
            customerId: legacyCustomer.id,
            subtotal: tx.amount,
            tax: 0,
            total: tx.amount,
            status: 'PAID',
            issuedAt: tx.date,
            dueDate: tx.date,
          }
        });
      } else if (tx.type === 'EXPENSE') {
        const validCategories = ['FUEL', 'MAINTENANCE', 'SALARY', 'INSURANCE', 'TAX', 'TOLL', 'RENT', 'PARKING', 'LOAN_PAYMENT', 'OTHER'];
        let cat = tx.category.toUpperCase();
        if (!validCategories.includes(cat)) {
          cat = 'OTHER';
        }

        await prisma.expense.create({
          data: {
            organizationId: orgId,
            amount: tx.amount,
            category: cat as any,
            expenseDate: tx.date,
            notes: tx.description
          }
        });
      }
    }
    console.log(`Migrated ${orgTxs.length} transactions for org ${orgId}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
