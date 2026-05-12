'use client';

import { useRouter } from 'next/navigation';
import { updateItemAction } from '../actions';
import type { ItemWithRelations, Location, Vendor } from '@/lib/db';
import { UNIT_OPTIONS } from '@/lib/constants';

export default function EditItemForm({
  item, locations, vendors,
}: {
  item: ItemWithRelations;
  locations: Location[];
  vendors: Vendor[];
}) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await updateItemAction(formData);
    router.push(`/items/${item.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-4">
      <input type="hidden" name="id" value={item.id} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input type="text" name="name" defaultValue={item.name} required className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
        <input type="text" name="sku" defaultValue={item.sku ?? ''} className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Count</label>
          <input type="number" name="current_count" defaultValue={item.current_count} min={0} step="any" className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
          <input type="number" name="reorder_threshold" defaultValue={item.reorder_threshold} min={0} step="any" className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select name="unit" defaultValue={item.unit} className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Units per Case</label>
          <input type="number" name="units_per_case" defaultValue={item.units_per_case} min={1} className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Case Unit Label</label>
          <input type="text" name="case_unit" defaultValue={item.case_unit} placeholder='e.g. "case", "box", "carton"' className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select name="location_id" defaultValue={item.location_id ?? ''} className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">None</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
          <select name="vendor_id" defaultValue={item.vendor_id ?? ''} className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">None</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={item.notes}
          className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input type="text" name="image" defaultValue={item.image} className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="mt-2 h-20 rounded border border-gray-200 object-contain bg-gray-50" />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700">
          Save Changes
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Cancel
        </button>
      </div>
    </form>
  );
}
