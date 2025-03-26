import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { invoices, customers, revenue, users } from '../app/lib/placeholder-data';
import { Customer, Invoice, Revenue, User } from '@/app/lib/definitions';

const prisma = new PrismaClient();

async function seedUsers(): Promise<void> {
  for (const user of users as User[]) {
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    await prisma.users.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }
}

async function seedCustomers(): Promise<void> {
  for (const customer of customers as Customer[]) {
    await prisma.customers.upsert({
      where: { id: customer.id },
      update: {},
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      },
    });
  }
}

async function seedInvoices(): Promise<void> {
  for (const invoice of invoices as Invoice[]) {
    await prisma.invoices.upsert({
      where: { id: invoice.id },
      update: {},
      create: {
        id: invoice.id,
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: new Date(invoice.date),
      },
    });
  }
}

async function seedRevenue(): Promise<void> {
  for (const rev of revenue as Revenue[]) {
    await prisma.revenue.upsert({
      where: { month: rev.month },
      update: {},
      create: {
        month: rev.month,
        revenue: rev.revenue,
      },
    });
  }
}

async function main() {
  try {
    console.log('Starting database seeding...');

    await seedUsers();
    console.log('Users table seeded successfully.');

    await seedCustomers();
    console.log('Customers table seeded successfully.');

    await seedInvoices();
    console.log('Invoices table seeded successfully.');

    await seedRevenue();
    console.log('Revenue table seeded successfully.');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
