'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { searchItemsAction } from './searchActions';
import type { ItemWithRelations } from '@/lib/db';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ItemWithRelations[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  async function handleChange(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const res = await searchItemsAction(value);
      setResults(res);
      setSearched(true);
      setSearching(false);
    }, 200);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setSearched(false);
  }

  const isLow = (item: ItemWithRelations) => item.current_count < item.reorder_threshold;
  const isOut = (item: ItemWithRelations) => item.current_count <= 0;

  return (
    <div className="mb-5">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search items by name or SKU..."
          className="block w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 active:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {searching && query && (
        <div className="mt-3 text-center text-sm text-gray-500">Searching...</div>
      )}

      {!searching && searched && results.length === 0 && (
        <div className="mt-3 text-center text-sm text-gray-500 py-8 bg-white rounded-xl border border-gray-200">
          No items match "{query}"
        </div>
      )}

      {!searching && results.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500 font-medium">{results.length} result{results.length > 1 ? 's' : ''}</p>
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    {item.location_name && <span>{item.location_name}</span>}
                    {item.vendor_name && <span>{item.vendor_name}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-lg font-bold ${isOut(item) ? 'text-red-600' : isLow(item) ? 'text-amber-600' : 'text-gray-900'}`}>
                    {item.current_count}
                  </span>
                  {item.unit && <span className="text-[10px] text-gray-400 uppercase mt-0.5">{item.unit}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
