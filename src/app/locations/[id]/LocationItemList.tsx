'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { quickUpdateCountAction } from '@/app/items/[id]/actions';
import type { ItemWithRelations } from '@/lib/db';

function CountButton({ delta, disabled, itemId, onClick }: { delta: number; disabled: boolean; itemId: number; onClick: (itemId: number, delta: number) => void }) {
  return (
    <button
      onClick={() => onClick(itemId, delta)}
      disabled={disabled}
      className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl font-bold bg-gray-100 text-gray-700 active:bg-indigo-100 active:text-indigo-700 disabled:opacity-30 disabled:active:bg-gray-100 select-none"
    >
      {delta > 0 ? '+' : '−'}
    </button>
  );
}

function ItemCountCard({ item, onQuickUpdate }: { item: ItemWithRelations; onQuickUpdate: (itemId: number, delta: number) => void }) {
  const isLow = item.current_count < item.reorder_threshold;
  const isOut = item.current_count <= 0;
  const countColor = isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {item.image ? (
            <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
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
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-4 mb-3">
        <CountButton delta={-1} disabled={item.current_count <= 0} itemId={item.id} onClick={onQuickUpdate} />
        <div className="flex flex-col items-center min-w-[80px]">
          <span className={`text-3xl md:text-4xl font-bold leading-none ${countColor}`}>
            {item.current_count}
          </span>
          {item.unit && (
            <span className="text-xs text-gray-400 mt-1 uppercase">{item.unit}</span>
          )}
        </div>
        <CountButton delta={1} disabled={false} itemId={item.id} onClick={onQuickUpdate} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Threshold: <strong className="text-gray-700">{item.reorder_threshold}</strong></span>
          {item.units_per_case > 1 && (
            <span className="text-gray-300">|</span>
          )}
          {item.units_per_case > 1 && (
            <span>{item.case_unit || 'Case'}: <strong className="text-gray-700">{item.units_per_case}{item.unit}</strong></span>
          )}
        </div>
        <Link
          href={`/items/${item.id}`}
          className="min-w-[72px] text-center text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg px-3 py-2"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

export default function LocationItemList({ items: initialItems }: { items: ItemWithRelations[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [optimisticItems, addOptimistic] = useOptimistic(
    initialItems,
    (state, { itemId, delta }: { itemId: number; delta: number }) =>
      state.map(item =>
        item.id === itemId
          ? { ...item, current_count: Math.max(0, item.current_count + delta) }
          : item
      )
  );

  function handleQuickUpdate(itemId: number, delta: number) {
    addOptimistic({ itemId, delta });
    startTransition(async () => {
      await quickUpdateCountAction(itemId, delta);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {optimisticItems.map((item) => <ItemCountCard key={item.id} item={item} onQuickUpdate={handleQuickUpdate} />)}
      {optimisticItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No items in this location.</p>
        </div>
      )}
    </div>
  );
}
