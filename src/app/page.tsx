import { getLocationsWithStats } from '@/lib/queries';
import Link from 'next/link';

function LocationCard({ loc }: { loc: import('@/lib/queries').LocationStats }) {
  const hasIssues = loc.out_count > 0 || loc.low_count > 0;

  return (
    <Link
      href={`/locations/${loc.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-gray-900 truncate">{loc.name}</h2>
          {loc.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{loc.description}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{loc.item_count}</span>
          <span className="text-xs text-gray-400">items</span>
        </div>
      </div>

      {hasIssues && (
        <div className="flex gap-2 mt-3">
          {loc.out_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {loc.out_count} out
            </span>
          )}
          {loc.low_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {loc.low_count} low
            </span>
          )}
        </div>
      )}

      {!hasIssues && loc.item_count > 0 && (
        <p className="text-xs text-green-600 mt-3 font-medium">All stocked</p>
      )}
    </Link>
  );
}

export default async function Home() {
  const locations = await getLocationsWithStats();
  const totalItems = locations.reduce((s, l) => s + l.item_count, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Locations</h1>
        <span className="text-sm text-gray-500">{totalItems} items</span>
      </div>

      <div className="space-y-3">
        {locations.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>

      {locations.length === 0 && (
        <p className="text-gray-500 text-center py-12">No locations found.</p>
      )}
    </div>
  );
}
