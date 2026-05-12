'use server';

import { revalidatePath } from 'next/cache';
import {
  createLocation, updateLocation, deleteLocation, swapLocationOrder,
  createVendor, updateVendor, deleteVendor,
  createItem, updateItem, deleteItem, getItemById, getAllLocations,
} from '@/lib/queries';

export async function addLocation(formData: FormData) {
  await createLocation(formData.get('name') as string, formData.get('description') as string || null);
  revalidatePath('/manage');
  revalidatePath('/');
}

export async function editLocation(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  await updateLocation(id, formData.get('name') as string, formData.get('description') as string || null);
  revalidatePath('/manage');
  revalidatePath('/');
}

export async function removeLocation(formData: FormData) {
  await deleteLocation(parseInt(formData.get('id') as string));
  revalidatePath('/manage');
  revalidatePath('/');
}

export async function moveLocation(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const dir = formData.get('dir') as string;
  const locations = await getAllLocations();
  const idx = locations.findIndex((l) => l.id === id);
  if (idx === -1) return;
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= locations.length) return;
  await swapLocationOrder(id, locations[swapIdx].id);
  revalidatePath('/manage');
  revalidatePath('/');
}

export async function addVendor(formData: FormData) {
  await createVendor(
    formData.get('name') as string,
    formData.get('email') as string || null,
    formData.get('phone') as string || null,
  );
  revalidatePath('/manage');
}

export async function editVendor(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  await updateVendor(id, formData.get('name') as string, formData.get('email') as string || null, formData.get('phone') as string || null);
  revalidatePath('/manage');
}

export async function removeVendor(formData: FormData) {
  await deleteVendor(parseInt(formData.get('id') as string));
  revalidatePath('/manage');
}

export async function addItem(formData: FormData) {
  await createItem(
    formData.get('name') as string,
    formData.get('sku') as string || null,
    parseFloat(formData.get('current_count') as string) || 0,
    parseFloat(formData.get('reorder_threshold') as string) || 10,
    parseInt(formData.get('location_id') as string) || null,
    parseInt(formData.get('vendor_id') as string) || null,
    undefined,
    formData.get('unit') as string || '',
    undefined,
    parseInt(formData.get('units_per_case') as string) || 1,
    formData.get('case_unit') as string || '',
  );
  revalidatePath('/manage');
  revalidatePath('/');
  revalidatePath('/locations');
}

export async function removeItem(formData: FormData) {
  await deleteItem(parseInt(formData.get('id') as string));
  revalidatePath('/manage');
  revalidatePath('/');
  revalidatePath('/locations');
}

export async function getItemData(id: number) {
  return getItemById(id);
}
