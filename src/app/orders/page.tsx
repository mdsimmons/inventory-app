import { getOrdersByVendor, getAllVendors, getSetting } from '@/lib/queries';
import VendorTabs from './VendorTabs';

export default async function OrdersPage() {
  const [grouped, vendors, showSkuRaw] = await Promise.all([
    getOrdersByVendor(),
    getAllVendors(),
    getSetting('show_sku_on_orders'),
  ]);
  const showSku = showSkuRaw !== '0';

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-5 md:mb-6 text-gray-900">Pending Orders</h1>
      <VendorTabs grouped={grouped} vendors={vendors} showSku={showSku} />
    </div>
  );
}
