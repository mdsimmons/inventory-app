import { getSetting } from '@/lib/queries';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const showSku = await getSetting('show_sku_on_orders') !== '0';

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Settings</h1>
      <SettingsForm showSku={showSku} />
    </div>
  );
}
