'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { quickUpdateCountAction } from '@/app/items/[id]/actions';
import type { ItemWithRelations } from '@/lib/db';

function CountButton({ delta, disabled, itemId }: { delta: number; disabled: boolean; itemId: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleClick() {
    await quickUpdateCountAction(itemId, delta);
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl text-2xl font-bold bg-gray-100 text-gray-700 active:bg-indigo-100 active:text-indigo-700 disabled:opacity-30 disabled:active:bg-gray-100 disabled:active:text-gray-700 select-none"
    >
      {delta > 0 ? '+' : '−'}
    </button>
  );
}

function ItemCountCard({ item }: { item: ItemWithRelations }) {
  const isLow = item.current_count < item.reorder_threshold;
  const isOut = item.current_count <= 0;
  const countColor = isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {item.image ? (
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <Link href={`/items/${item.id}`} className="text-sm font-semibold text-gray-900 leading-tight block truncate hover:text-indigo-600">
              {item.name}
            </Link>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</p>
          </div>
        </div>
        {isOut ? (
          <span className="shrink-0 text-xs font-medium text-red-600 bg-red-50 rounded-full px-2 py-0.5">Out</span>
        ) : isLow ? (
          <span className="shrink-0 text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Low</span>
        ) : (
          <span className="shrink-0 text-xs font-medium text-green-600 bg-green-50 rounded-full px-2 py-0.5">OK</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
        <CountButton delta={-1} disabled={item.current_count <= 0} itemId={item.id} />
        <div className="flex flex-col items-center min-w-[80px]">
          <span className={`text-3xl md:text-4xl font-bold leading-none ${countColor}`}>
            {item.current_count}
          </span>
          {item.unit && (
            <span className="text-xs text-gray-400 mt-1 uppercase">{item.unit}</span>
          )}
        </div>
        <CountButton delta={1} disabled={false} itemId={item.id} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Threshold: <strong className="text-gray-700">{item.reorder_threshold}</strong></span>
          {item.units_per_case > 1 && (
            <>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="hidden sm:inline">{item.case_unit || 'Case'}: <strong className="text-gray-700">{item.units_per_case}{item.unit}</strong></span>
            </>
          )}
          {item.vendor_name && (
            <>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="hidden sm:inline truncate max-w-[120px]">{item.vendor_name}</span>
            </>
          )}
        </div>
        <Link
          href={`/items/${item.id}`}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          Details
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function LocationItemList({ items }: { items: ItemWithRelations[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => <ItemCountCard key={item.id} item={item} />)}
      {items.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No items in this location.</p>
        </div>
      )}
    </div>
  );
}
