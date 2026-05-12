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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
        <p className="text-gray-500">No pending orders. Mark low-stock items for reorder from the inventory.</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium">View Inventory</Link>
      </div>
    );
  }

  const orders = grouped[active] ?? [];

  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {vendorNames.map((v) => (
          <button
            key={v}
            onClick={() => setActive(v)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap ${
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
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Send Order to {active}
          </a>
        );
      })()}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm hidden md:table">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Item</th>
                {showSku !== false && <th className="text-left px-4 py-2 font-medium">SKU</th>}
                <th className="text-right px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    <Link href={`/items/${order.item_id}`} className="hover:text-indigo-600">{order.item_name}</Link>
                  </td>
                  {showSku !== false && <td className="px-4 py-2 text-gray-500 font-mono text-xs">{order.item_sku ?? '—'}</td>}
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{order.quantity}<span className="font-normal text-gray-500 ml-1">{order.case_unit || 'pcs'}</span></td>
                  <td className="px-4 py-2">
                    <VendorSelect orderId={order.id} currentVendor={order.vendor_name} vendors={vendors} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-gray-100 md:hidden">
          {orders.map((order) => (
            <div key={order.id} className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/items/${order.item_id}`} className="font-medium text-gray-900 leading-tight block truncate">{order.item_name}</Link>
                  {showSku !== false && <p className="text-xs text-gray-500 font-mono mt-0.5">{order.item_sku ?? '—'}</p>}
                </div>
                <span className="shrink-0 text-lg font-bold text-gray-900">x{order.quantity}<span className="text-sm font-normal text-gray-500 ml-1">{order.case_unit || 'pcs'}</span></span>
              </div>
              <div className="mt-2">
                <VendorSelect orderId={order.id} currentVendor={order.vendor_name} vendors={vendors} />
              </div>
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(!open);
  }

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
        ref={btnRef}
        onClick={handleToggle}
        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-md px-2 py-1"
      >
        {currentVendor}
        <svg className={`w-3 h-3 transition ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-36"
            style={{ left: pos.left, top: pos.top }}
          >
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-100">Change vendor</p>
            {vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => handlePick(v.id)}
                className={`block w-full text-left px-3 py-1.5 text-sm whitespace-nowrap hover:bg-gray-50 ${
                  v.name === currentVendor ? 'font-semibold text-indigo-600' : 'text-gray-700'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
