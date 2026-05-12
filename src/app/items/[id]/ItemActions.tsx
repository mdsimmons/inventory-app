'use client';

import { useRouter } from 'next/navigation';
import { useState, useOptimistic } from 'react';
import { updateItemCountAction, reorderItemAction } from './actions';
import type { ItemWithRelations } from '@/lib/db';

export default function ItemActions({ item }: { item: ItemWithRelations }) {
  const router = useRouter();
  const [optimisticCount, addOptimistic] = useOptimistic(
    item.current_count,
    (_state, newCount: number) => Math.max(0, newCount)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setSaving(true);
    setMessage(null);
    const newCount = parseFloat(formData.get('count') as string);
    addOptimistic(newCount);
    const result = await updateItemCountAction(item.id, newCount);
    if (result.success) {
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
    addOptimistic(item.current_count);
    const result = await reorderItemAction(item.id, item.vendor_id!, item.units_per_case);
    if (result.success) {
      setMessage('Added to reorder list');
      router.refresh();
    } else {
      setMessage('Already in reorder list');
    }
    setSaving(false);
  }

  const isLow = optimisticCount < item.reorder_threshold;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Update Count</h2>
        <form action={handleUpdate} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="count" className="block text-xs font-medium text-gray-600 mb-1">New Count</label>
            <input
              type="number"
              name="count"
              id="count"
              min={0}
              step="any"
              defaultValue={item.current_count}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-green-600 font-medium">{message}</p>}
      </div>

      {isLow && item.vendor_id && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Reorder</h2>
          <p className="text-xs text-gray-600 mb-4">
            Add 1 {item.case_unit || 'case'} ({item.units_per_case} {item.unit || 'units'}) to your order list for <strong>{item.vendor_name}</strong>.
          </p>
          <button
            onClick={handleReorder}
            disabled={saving}
            className="w-full rounded-lg bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Adding...' : `Reorder 1 ${item.case_unit || 'Case'}`}
          </button>
        </div>
      )}

      {isLow && !item.vendor_id && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Cannot Reorder</h2>
          <p className="text-xs text-gray-600">
            No vendor assigned. Edit the item to assign one.
          </p>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <a
          href={`/items/${item.id}/edit`}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg px-5 py-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Edit Item
        </a>
      </div>
    </div>
  );
}
