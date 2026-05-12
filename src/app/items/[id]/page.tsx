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
      <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{item.name}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{item.sku}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs md:text-sm font-medium ${
            item.current_count <= 0 ? 'bg-red-100 text-red-800' :
            item.current_count < item.reorder_threshold ? 'bg-amber-100 text-amber-800' :
            'bg-green-100 text-green-800'
          }`}>
            {item.current_count <= 0 ? 'Out of Stock' :
             item.current_count < item.reorder_threshold ? 'Low Stock' : 'In Stock'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <span className="text-xs text-gray-500 uppercase font-medium block mb-0.5">Location</span>
            <p className="text-sm md:text-base text-gray-900 font-medium">{item.location_name ?? 'Unassigned'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <span className="text-xs text-gray-500 uppercase font-medium block mb-0.5">Vendor</span>
            <p className="text-sm md:text-base text-gray-900 font-medium">{item.vendor_name ?? 'None'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <span className="text-xs text-gray-500 uppercase font-medium block mb-0.5">Count</span>
            <p className={`text-xl md:text-2xl font-bold ${item.current_count <= 0 ? 'text-red-600' : item.current_count < item.reorder_threshold ? 'text-amber-600' : 'text-gray-900'}`}>
              {item.current_count}
              {item.unit && <span className="text-sm md:text-base font-normal text-gray-400 ml-1">{item.unit}</span>}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <span className="text-xs text-gray-500 uppercase font-medium block mb-0.5">Threshold</span>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{item.reorder_threshold}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <span className="text-xs text-gray-500 uppercase font-medium block mb-0.5">Per {item.case_unit || 'Case'}</span>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {item.units_per_case}
              {item.unit && <span className="text-sm md:text-base font-normal text-gray-400 ml-1">{item.unit}</span>}
            </p>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
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
      </div>

      <ItemImage itemId={item.id} image={item.image} />

      <ItemNotes itemId={item.id} notes={item.notes} />

      <ItemActions item={item} />
    </div>
  );
}
