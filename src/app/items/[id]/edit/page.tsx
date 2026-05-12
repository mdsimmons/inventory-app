import { notFound } from 'next/navigation';
import { getItemById, getAllLocations, getAllVendors } from '@/lib/queries';
import EditItemForm from './EditItemForm';

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemById(Number(id));
  if (!item) notFound();

  const [locations, vendors] = await Promise.all([
    getAllLocations(),
    getAllVendors(),
  ]);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Edit Item</h1>
      <EditItemForm item={item} locations={locations} vendors={vendors} />
    </div>
  );
}
