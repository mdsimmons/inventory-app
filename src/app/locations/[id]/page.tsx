import { notFound } from 'next/navigation';
import { getAllLocations, getItemsByLocationId } from '@/lib/queries';
import LocationItemList from './LocationItemList';
import Link from 'next/link';

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locationId = Number(id);
  const [locations, items] = await Promise.all([
    getAllLocations() as Promise<{ id: number; name: string }[]>,
    getItemsByLocationId(locationId),
  ]);
  const location = locations.find((l) => l.id === locationId);
  if (!location) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-600 truncate">{location.name}</span>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{location.name}</h1>
      <p className="text-sm text-gray-500 mb-5">{items.length} item{items.length !== 1 ? 's' : ''}</p>

      <LocationItemList items={items} />
    </div>
  );
}
