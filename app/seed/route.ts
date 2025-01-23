import bcrypt from 'bcrypt';
import connectionPool from '../../db';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { User, Customer, Invoice, Revenue } from '../lib/definitions';

async function executeQuery(query: string, params: any[] = []): Promise<void> {
  try {
    await connectionPool.query(query, params);
  } catch (error) {
    console.error('Query Error:', query, error);
    throw error;
  }
}

async function seedUsers(): Promise<void> {
  await executeQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  for (const user of users as User[]) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await executeQuery(
      `INSERT INTO users (id, name, email, password)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING;`,
      [user.id, user.name, user.email, hashedPassword]
    );
  }
}

async function seedCustomers(): Promise<void> {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  for (const customer of customers as Customer[]) {
    await executeQuery(
      `INSERT INTO customers (id, name, email, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING;`,
      [customer.id, customer.name, customer.email, customer.image_url]
    );
  }
}

async function seedInvoices(): Promise<void> {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  for (const invoice of invoices as Invoice[]) {
    await executeQuery(
      `INSERT INTO invoices (customer_id, amount, status, date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING;`,
      [invoice.customer_id, invoice.amount, invoice.status, invoice.date]
    );
  }
}

async function seedRevenue(): Promise<void> {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  for (const rev of revenue as Revenue[]) {
    await executeQuery(
      `INSERT INTO revenue (month, revenue)
       VALUES ($1, $2)
       ON CONFLICT (month) DO NOTHING;`,
      [rev.month, rev.revenue]
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    console.log('Starting database seeding...');
    await connectionPool.query(`BEGIN`);

    await seedUsers();
    console.log('Users table seeded successfully.');

    await seedCustomers();
    console.log('Customers table seeded successfully.');

    await seedInvoices();
    console.log('Invoices table seeded successfully.');

    await seedRevenue();
    console.log('Revenue table seeded successfully.');

    await connectionPool.query(`COMMIT`);
    console.log('Database seeding completed successfully.');

    return new Response(
      JSON.stringify({ message: 'Database seeded successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    await connectionPool.query(`ROLLBACK`);
    console.error('Error seeding database:', error);

    return new Response(
      JSON.stringify({ error: 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
