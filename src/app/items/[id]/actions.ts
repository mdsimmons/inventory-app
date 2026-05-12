'use server';

import { revalidatePath } from 'next/cache';
import { updateItemCount, createReorderOrder, completePendingOrdersForItem, updateItem, updateItemNotes, updateItemImage, getItemById } from '@/lib/queries';

export async function updateItemCountAction(id: number, newCount: number) {
  try {
    await updateItemCount(id, newCount);
    const item = await getItemById(id);
    if (item) {
      if (newCount < item.reorder_threshold && item.vendor_id) {
        await createReorderOrder(id, item.vendor_id, item.units_per_case);
      } else if (newCount >= item.reorder_threshold) {
        await completePendingOrdersForItem(id);
      }
    }
    revalidatePath(`/items/${id}`);
    revalidatePath('/');
    revalidatePath('/orders');
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function reorderItemAction(itemId: number, vendorId: number, quantity: number) {
  try {
    await createReorderOrder(itemId, vendorId, quantity);
    revalidatePath(`/items/${itemId}`);
    revalidatePath('/orders');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function reorderCaseAction(itemId: number) {
  const item = await getItemById(itemId);
  if (!item || !item.vendor_id) return { success: false };
  return reorderItemAction(itemId, item.vendor_id, item.units_per_case);
}

export async function updateItemAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const newCount = parseFloat(formData.get('current_count') as string) || 0;
  const newThreshold = parseFloat(formData.get('reorder_threshold') as string) || 10;
  const vendorId = parseInt(formData.get('vendor_id') as string) || null;
  const unitsPerCase = parseInt(formData.get('units_per_case') as string) || 1;
  const caseUnit = (formData.get('case_unit') as string) || '';
  await updateItem(
    id,
    formData.get('name') as string,
    formData.get('sku') as string || null,
    newCount,
    newThreshold,
    parseInt(formData.get('location_id') as string) || null,
    vendorId,
    formData.get('notes') as string || '',
    formData.get('unit') as string || '',
    formData.get('image') as string || '',
    unitsPerCase,
    caseUnit,
  );
  if (newCount >= newThreshold) {
    await completePendingOrdersForItem(id);
  } else if (newCount < newThreshold && vendorId) {
    await createReorderOrder(id, vendorId, unitsPerCase);
  }
  revalidatePath(`/items/${id}`);
  revalidatePath(`/items/${id}/edit`);
  revalidatePath('/');
  revalidatePath('/manage');
}

export async function saveNotesAction(id: number, notes: string) {
  await updateItemNotes(id, notes);
  revalidatePath(`/items/${id}`);
  revalidatePath('/');
}

export async function quickUpdateCountAction(itemId: number, delta: number) {
  const item = await getItemById(itemId);
  if (!item) return { success: false };
  const newCount = Math.max(0, item.current_count + delta);
  await updateItemCount(itemId, newCount);
  if (newCount < item.reorder_threshold && item.vendor_id) {
    await createReorderOrder(itemId, item.vendor_id, item.units_per_case);
  } else if (newCount >= item.reorder_threshold) {
    await completePendingOrdersForItem(itemId);
  }
  revalidatePath(`/items/${itemId}`);
  revalidatePath('/');
  revalidatePath('/orders');
  return { success: true };
}

export async function saveImageAction(id: number, image: string) {
  await updateItemImage(id, image);
  revalidatePath(`/items/${id}`);
  revalidatePath(`/items/${id}/edit`);
  revalidatePath('/');
}
