import { initSchema } from '@/lib/db';
import { seed } from '@/lib/seed';

export async function register() {
  try {
    await initSchema();
    await seed();
  } catch (e) {
    console.error('DB init failed:', e);
  }
}
