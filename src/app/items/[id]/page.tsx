import { notFound } from 'next/navigation';
import { getItemById, getItemSuggestions } from '@/lib/queries';
import ItemActions from './ItemActions';
import ItemNotes from './ItemNotes';
import ItemImage from './ItemImage';
import Link from 'next/link';

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemById(Number(id));
  if (!item) notFound();

  const suggestions = await getItemSuggestions(item);

  return (
    <div>
      <Link href={`/locations/${item.location_id}`} className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to {item.location_name || 'Inventory'}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{item.name}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{item.sku}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            item.current_count <= 0 ? 'bg-red-100 text-red-800' :
            item.current_count < item.reorder_threshold ? 'bg-amber-100 text-amber-800' :
            'bg-green-100 text-green-800'
          }`}>
            {item.current_count <= 0 ? 'Out' :
             item.current_count < item.reorder_threshold ? 'Low' : 'OK'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-medium block mb-1">Count</span>
            <p className={`text-xl font-bold ${item.current_count <= 0 ? 'text-red-600' : item.current_count < item.reorder_threshold ? 'text-amber-600' : 'text-gray-900'}`}>
              {item.current_count}
              {item.unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{item.unit}</span>}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-medium block mb-1">Threshold</span>
            <p className="text-xl font-bold text-gray-900">{item.reorder_threshold}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-medium block mb-1">{item.case_unit || 'Case'}</span>
            <p className="text-xl font-bold text-gray-900">
              {item.units_per_case}
              {item.unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{item.unit}</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-xs text-gray-500">
          <span className="truncate">{item.location_name ?? 'No location'}</span>
          <span className="text-gray-300">·</span>
          <span className="truncate">{item.vendor_name ?? 'No vendor'}</span>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Suggested Actions</h3>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-xs md:text-sm text-amber-700 flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-amber-500">&#9654;</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ItemImage itemId={item.id} image={item.image} />
      <ItemNotes itemId={item.id} notes={item.notes} />
      <ItemActions item={item} />
    </div>
  );
}
