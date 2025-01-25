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
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

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

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    const query = {
      text: `UPDATE invoices SET customer_id = $1, amount = $2, status = $3 WHERE id = $4`,
      values: [customerId, amountInCents, status, id],
    };

    await connectionPool.query(query);

  } catch (error: any) {
    console.error('Error updating invoice:', error.message, error.stack);
    throw new Error('An error occurred while updating the invoice.');
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    const query = {
      text: `DELETE FROM invoices WHERE id = $1`,
      values: [id],
    };

    await connectionPool.query(query);

  } catch (error: any) {
    console.error('Error deleting invoice:', error.message, error.stack);
    throw new Error('An error occurred while deleting the invoice.');
  }
  revalidatePath('/dashboard/invoices');
}
