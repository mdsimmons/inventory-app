import { getAllLocations, getAllVendors, getAllItems } from '@/lib/queries';
import ManageContent from './ManageContent';

export default async function ManagePage() {
  const [locations, vendors, items] = await Promise.all([
    getAllLocations(),
    getAllVendors(),
    getAllItems(),
  ]);

  return <ManageContent locations={locations} vendors={vendors} items={items} />;
}
