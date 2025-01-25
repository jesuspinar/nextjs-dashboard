'use server';

import { z } from 'zod';
import connectionPool from '../../db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  try {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    const query = {
      text: `INSERT INTO invoices (customer_id, amount, status, date)
             VALUES ($1, $2, $3, $4)`,
      values: [customerId, amountInCents, status, date],
    };

    await connectionPool.query(query);

  } catch (error: any) {
    console.error('Database Error:', error.message, error.stack);
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices')
}
