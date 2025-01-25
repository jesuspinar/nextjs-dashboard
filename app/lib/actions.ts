'use server';

import { z } from 'zod';
import connectionPool from '../../db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  try {
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or Invalid Fields. Failed to Create Invoice.'
      };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    const query = {
      text: `INSERT INTO invoices (customer_id, amount, status, date)
             VALUES ($1, $2, $3, $4)`,
      values: [customerId, amountInCents, status, date],
    };

    await connectionPool.query(query);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Database Error:', error.message, error.stack);
    }
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

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating invoice:', error.message, error.stack);
    }
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting invoice:', error.message, error.stack);
    }
    throw new Error('An error occurred while deleting the invoice.');
  }
  revalidatePath('/dashboard/invoices');
}
