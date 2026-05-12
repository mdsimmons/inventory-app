'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateItemCountAction, reorderItemAction } from './actions';
import type { ItemWithRelations } from '@/lib/db';

export default function ItemActions({ item }: { item: ItemWithRelations }) {
  const router = useRouter();
  const [count, setCount] = useState(item.current_count);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setSaving(true);
    setMessage(null);
    const newCount = parseInt(formData.get('count') as string);
    const result = await updateItemCountAction(item.id, newCount);
    if (result.success) {
      setCount(newCount);
      setMessage('Count updated');
      router.refresh();
    } else {
      setMessage('Error updating count');
    }
    setSaving(false);
  }

  async function handleReorder() {
    setSaving(true);
    setMessage(null);
    const result = await reorderItemAction(item.id, item.vendor_id!, item.units_per_case);
    if (result.success) {
      setMessage('Added to reorder list');
      router.refresh();
    } else {
      setMessage('Already in reorder list');
    }
    setSaving(false);
  }

  const isLow = count < item.reorder_threshold;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Update Count</h2>
        <form action={handleUpdate} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">New Count</label>
            <input
              type="number"
              name="count"
              id="count"
              min={0}
              defaultValue={count}
              className="block w-full sm:w-32 rounded-md border border-gray-300 px-3 py-2.5 md:py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2.5 md:py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-green-600 font-medium">{message}</p>}
      </div>

      {isLow && item.vendor_id && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Reorder</h2>
          <p className="text-sm text-gray-600 mb-4">
            This item is below the reorder threshold. Add 1 {item.case_unit || 'case'} ({item.units_per_case} {item.unit || 'units'}) to your order list for <strong>{item.vendor_name}</strong>.
          </p>
          <button
            onClick={handleReorder}
            disabled={saving}
            className="w-full sm:w-auto rounded-md bg-amber-600 px-5 py-2.5 md:py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Adding...' : `Reorder 1 ${item.case_unit || 'Case'}`}
          </button>
        </div>
      )}

      {isLow && !item.vendor_id && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Cannot Reorder</h2>
          <p className="text-sm text-gray-600">
            This item has no vendor assigned. Assign a vendor to enable reordering.
          </p>
        </div>
      )}
    </div>
  );
}
