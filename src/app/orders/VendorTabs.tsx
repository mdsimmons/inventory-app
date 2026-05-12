'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { changeOrderVendorAction } from './actions';

type Order = {
  id: number;
  item_id: number;
  item_name: string;
  item_sku: string | null;
  vendor_name: string;
  vendor_phone: string | null;
  current_count: number;
  quantity: number;
  units_per_case: number;
  case_unit: string;
  created_at: string;
};

type Vendor = { id: number; name: string };

export default function VendorTabs({ grouped, vendors, showSku }: { grouped: Record<string, Order[]>; vendors: Vendor[]; showSku?: boolean }) {
  const vendorNames = Object.keys(grouped);
  const [active, setActive] = useState(vendorNames[0] ?? '');

  if (vendorNames.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
        <p className="text-gray-500">No pending orders. Mark low-stock items for reorder from the inventory.</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium">View Inventory</Link>
      </div>
    );
  }

  const orders = grouped[active] ?? [];

  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-3 px-3 snap-x">
        {vendorNames.map((v) => (
          <button
            key={v}
            onClick={() => setActive(v)}
            className={`snap-start shrink-0 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap ${
              active === v
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {v}
            <span className={`ml-1.5 text-xs ${active === v ? 'text-indigo-200' : 'text-gray-400'}`}>
              ({grouped[v].length})
            </span>
          </button>
        ))}
      </div>

      {(() => {
        const phone = orders[0]?.vendor_phone;
        if (!phone) return null;
        const lines = orders.map((o) => {
          const sku = o.item_sku ? ` (${o.item_sku})` : '';
          return `- ${o.item_name}${sku}: ${o.quantity} ${o.case_unit || 'pcs'}`;
        });
        const body = encodeURIComponent(`Order for ${active}\n\n${lines.join('\n')}`);
        return (
          <a
            href={`sms:${phone}?body=${body}`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Send Order
          </a>
        );
      })()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div key={order.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/items/${order.item_id}`} className="font-medium text-gray-900 leading-tight block truncate text-sm">{order.item_name}</Link>
                  {showSku !== false && <p className="text-xs text-gray-500 font-mono mt-0.5">{order.item_sku ?? '—'}</p>}
                </div>
                <span className="shrink-0 text-lg font-bold text-gray-900">x{order.quantity}<span className="text-sm font-normal text-gray-500 ml-1">{order.case_unit || 'pcs'}</span></span>
              </div>
              <VendorSelect orderId={order.id} currentVendor={order.vendor_name} vendors={vendors} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorSelect({ orderId, currentVendor, vendors }: { orderId: number; currentVendor: string; vendors: Vendor[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function handlePick(vendorId: number) {
    const formData = new FormData();
    formData.set('order_id', String(orderId));
    formData.set('vendor_id', String(vendorId));
    await changeOrderVendorAction(formData);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 active:bg-indigo-200 rounded-md px-2.5 py-1.5"
      >
        {currentVendor}
        <svg className={`w-3 h-3 transition ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/30" />
          <div className="relative bg-white rounded-t-2xl w-full max-w-lg pb-8 pt-2 safe-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <p className="px-5 text-xs font-semibold text-gray-500 mb-2">Change vendor</p>
            {vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => handlePick(v.id)}
                className={`block w-full text-left px-5 py-3 text-sm active:bg-gray-50 ${
                  v.name === currentVendor ? 'font-semibold text-indigo-600' : 'text-gray-700'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
