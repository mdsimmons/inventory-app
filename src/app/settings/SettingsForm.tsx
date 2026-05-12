'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toggleSkuAction } from './actions';

export default function SettingsForm({ showSku }: { showSku: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleToggle(formData: FormData) {
    await toggleSkuAction(formData);
    startTransition(() => router.refresh());
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Orders Display</h2>
      <form action={handleToggle} className="flex items-center justify-between">
        <div>
          <label htmlFor="show-sku" className="text-sm font-medium text-gray-700">Show SKU on Pending Orders</label>
          <p className="text-xs text-gray-500 mt-0.5">Display the SKU column in the orders view</p>
        </div>
        <input type="hidden" name="show_sku_on_orders" value={showSku ? '0' : '1'} />
        <button
          type="submit"
          id="show-sku"
          role="switch"
          aria-checked={showSku}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            showSku ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
            showSku ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </form>
    </div>
  );
}
