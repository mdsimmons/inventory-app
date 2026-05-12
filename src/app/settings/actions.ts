'use server';

import { revalidatePath } from 'next/cache';
import { setSetting } from '@/lib/queries';

export async function toggleSkuAction(formData: FormData) {
  const value = formData.get('show_sku_on_orders') === 'on' ? '1' : '0';
  setSetting('show_sku_on_orders', value);
  revalidatePath('/orders');
  revalidatePath('/settings');
}
