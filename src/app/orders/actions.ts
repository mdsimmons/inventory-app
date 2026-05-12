'use server';

import { revalidatePath } from 'next/cache';
import { updateReorderVendor } from '@/lib/queries';

export async function changeOrderVendorAction(formData: FormData) {
  const orderId = parseInt(formData.get('order_id') as string);
  const vendorId = parseInt(formData.get('vendor_id') as string);
  updateReorderVendor(orderId, vendorId);
  revalidatePath('/orders');
}
