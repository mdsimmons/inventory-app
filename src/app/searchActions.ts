'use server';

import { searchItems } from '@/lib/queries';

export async function searchItemsAction(query: string) {
  if (!query.trim()) return [];
  return searchItems(query.trim());
}
