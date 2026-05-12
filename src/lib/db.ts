import { createClient } from '@libsql/client';

const isTurso = !!process.env.TURSO_DB_URL;

let _db: ReturnType<typeof createClient> | null = null;

function getDb() {
  if (!_db) {
    if (isTurso) {
      const remoteUrl = process.env.TURSO_DB_URL!;
      const authToken = process.env.TURSO_DB_TOKEN;
      const tmp = process.env.TMPDIR || '/tmp';
      _db = createClient({
        url: `file:${tmp}/inventory.db`,
        syncUrl: remoteUrl,
        authToken,
      });
    } else {
      _db = createClient({ url: 'file:data/inventory.db' });
    }
  }
  return _db;
}

async function migrate(db: ReturnType<typeof createClient>) {
  const res = await db.execute("PRAGMA table_info('items')");
  const itemCols = res.rows.map((r) => ({ name: r.name as string }));
  if (!itemCols.find((c) => c.name === 'notes')) {
    await db.execute("ALTER TABLE items ADD COLUMN notes TEXT DEFAULT ''");
  }
  if (!itemCols.find((c) => c.name === 'unit')) {
    await db.execute("ALTER TABLE items ADD COLUMN unit TEXT DEFAULT ''");
  }
  if (!itemCols.find((c) => c.name === 'image')) {
    await db.execute("ALTER TABLE items ADD COLUMN image TEXT DEFAULT ''");
  }
  if (!itemCols.find((c) => c.name === 'units_per_case')) {
    await db.execute("ALTER TABLE items ADD COLUMN units_per_case INTEGER DEFAULT 1");
  }
  if (!itemCols.find((c) => c.name === 'case_unit')) {
    await db.execute("ALTER TABLE items ADD COLUMN case_unit TEXT DEFAULT ''");
  }

  const locRes = await db.execute("PRAGMA table_info('locations')");
  const locCols = locRes.rows.map((r) => ({ name: r.name as string }));
  if (!locCols.find((c) => c.name === 'sort_order')) {
    await db.execute("ALTER TABLE locations ADD COLUMN sort_order INTEGER DEFAULT 0");
  }
  await db.execute("UPDATE locations SET sort_order = id WHERE sort_order IS NULL OR sort_order = 0");
}

export async function initSchema() {
  const db = getDb();
  if (isTurso) await db.sync();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      current_count INTEGER NOT NULL DEFAULT 0,
      reorder_threshold INTEGER NOT NULL DEFAULT 10,
      location_id INTEGER REFERENCES locations(id),
      vendor_id INTEGER REFERENCES vendors(id),
      notes TEXT DEFAULT '',
      unit TEXT DEFAULT '',
      image TEXT DEFAULT '',
      units_per_case INTEGER DEFAULT 1,
      case_unit TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS reorder_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id),
      vendor_id INTEGER REFERENCES vendors(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  await migrate(db);
}

export const db = getDb();

export type Vendor = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
};

export type Location = {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Item = {
  id: number;
  name: string;
  sku: string | null;
  current_count: number;
  reorder_threshold: number;
  location_id: number | null;
  vendor_id: number | null;
  notes: string;
  unit: string;
  image: string;
  units_per_case: number;
  case_unit: string;
  created_at: string;
  updated_at: string;
};

export type ItemWithRelations = Item & {
  location_name: string | null;
  vendor_name: string | null;
};

export type ReorderOrder = {
  id: number;
  item_id: number;
  vendor_id: number;
  quantity: number;
  status: string;
  created_at: string;
};

export type ReorderOrderWithItem = ReorderOrder & {
  item_name: string;
  item_sku: string | null;
  vendor_name: string;
  vendor_phone: string | null;
  current_count: number;
  units_per_case: number;
  case_unit: string;
};
