import { db, type ItemWithRelations, type ReorderOrderWithItem, type Vendor, type Location } from './db';

export async function getItemsByLocation(): Promise<Record<string, ItemWithRelations[]>> {
  const { rows } = await db.execute(`
    SELECT i.*, l.name as location_name, v.name as vendor_name
    FROM items i
    LEFT JOIN locations l ON i.location_id = l.id
    LEFT JOIN vendors v ON i.vendor_id = v.id
    ORDER BY l.name, i.name
  `);
  const grouped: Record<string, ItemWithRelations[]> = {};
  for (const row of rows) {
    const item = row as unknown as ItemWithRelations;
    const loc = item.location_name ?? 'Unassigned';
    if (!grouped[loc]) grouped[loc] = [];
    grouped[loc].push(item);
  }
  return grouped;
}

export async function getItemById(id: number): Promise<ItemWithRelations | null> {
  const { rows } = await db.execute({
    sql: `
      SELECT i.*, l.name as location_name, v.name as vendor_name
      FROM items i
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      WHERE i.id = ?
    `,
    args: [id],
  });
  return (rows[0] as unknown as ItemWithRelations) ?? null;
}

export async function updateItemCount(id: number, newCount: number) {
  await db.execute({
    sql: "UPDATE items SET current_count = ?, updated_at = datetime('now') WHERE id = ?",
    args: [newCount, id],
  });
}

export async function getItemSuggestions(item: ItemWithRelations): Promise<string[]> {
  const suggestions: string[] = [];
  if (item.current_count <= 0) {
    suggestions.push('OUT OF STOCK — Immediate reorder needed');
  }
  if (item.current_count < item.reorder_threshold) {
    suggestions.push(`Below reorder threshold (${item.current_count} < ${item.reorder_threshold}) — Reorder recommended`);
  }
  if (item.vendor_name) {
    suggestions.push(`Order from vendor: ${item.vendor_name}`);
  } else {
    suggestions.push('No vendor assigned — Assign a vendor before ordering');
  }
  return suggestions;
}

export async function createReorderOrder(itemId: number, vendorId: number, quantity: number): Promise<number> {
  const { rows } = await db.execute({
    sql: 'SELECT id FROM reorder_orders WHERE item_id = ? AND status = ?',
    args: [itemId, 'pending'],
  });
  if (rows[0]) return (rows[0] as unknown as { id: number }).id;

  await db.execute({
    sql: 'INSERT INTO reorder_orders (item_id, vendor_id, quantity, status) VALUES (?, ?, ?, ?)',
    args: [itemId, vendorId, quantity, 'pending'],
  });

  const { rows: inserted } = await db.execute('SELECT last_insert_rowid() as id');
  return (inserted[0] as unknown as { id: number }).id;
}

export async function getOrdersByVendor(): Promise<Record<string, ReorderOrderWithItem[]>> {
  const { rows } = await db.execute(`
    SELECT o.*, i.name as item_name, i.sku as item_sku, v.name as vendor_name, v.phone as vendor_phone, i.current_count, i.units_per_case, i.case_unit
    FROM reorder_orders o
    JOIN items i ON o.item_id = i.id
    JOIN vendors v ON o.vendor_id = v.id
    WHERE o.status = 'pending'
    ORDER BY v.name, i.name
  `);
  const grouped: Record<string, ReorderOrderWithItem[]> = {};
  for (const row of rows) {
    const order = row as unknown as ReorderOrderWithItem;
    if (!grouped[order.vendor_name]) grouped[order.vendor_name] = [];
    grouped[order.vendor_name].push(order);
  }
  return grouped;
}

export async function completeOrder(id: number) {
  await db.execute({
    sql: 'UPDATE reorder_orders SET status = ? WHERE id = ?',
    args: ['completed', id],
  });
}

export async function completePendingOrdersForItem(itemId: number) {
  await db.execute({
    sql: "UPDATE reorder_orders SET status = 'completed' WHERE item_id = ? AND status = 'pending'",
    args: [itemId],
  });
}

export async function updateReorderVendor(orderId: number, vendorId: number) {
  await db.execute({
    sql: 'UPDATE reorder_orders SET vendor_id = ? WHERE id = ?',
    args: [vendorId, orderId],
  });
}

export async function getAllVendors(): Promise<Vendor[]> {
  const { rows } = await db.execute('SELECT * FROM vendors ORDER BY name');
  return rows as unknown as Vendor[];
}

export async function getVendorById(id: number): Promise<Vendor | undefined> {
  const { rows } = await db.execute({ sql: 'SELECT * FROM vendors WHERE id = ?', args: [id] });
  return rows[0] as unknown as Vendor | undefined;
}

export async function createVendor(name: string, email: string | null, phone: string | null) {
  await db.execute({
    sql: 'INSERT INTO vendors (name, email, phone) VALUES (?, ?, ?)',
    args: [name, email, phone],
  });
}

export async function updateVendor(id: number, name: string, email: string | null, phone: string | null) {
  await db.execute({
    sql: 'UPDATE vendors SET name = ?, email = ?, phone = ? WHERE id = ?',
    args: [name, email, phone, id],
  });
}

export async function deleteVendor(id: number) {
  await db.execute({ sql: 'UPDATE items SET vendor_id = NULL WHERE vendor_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM vendors WHERE id = ?', args: [id] });
}

export async function getAllLocations(): Promise<Location[]> {
  const { rows } = await db.execute('SELECT * FROM locations ORDER BY sort_order, name');
  return rows as unknown as Location[];
}

export async function swapLocationOrder(id1: number, id2: number) {
  const { rows: rows1 } = await db.execute({ sql: 'SELECT sort_order FROM locations WHERE id = ?', args: [id1] });
  const { rows: rows2 } = await db.execute({ sql: 'SELECT sort_order FROM locations WHERE id = ?', args: [id2] });
  const loc1 = rows1[0] as unknown as { sort_order: number } | undefined;
  const loc2 = rows2[0] as unknown as { sort_order: number } | undefined;
  if (loc1 && loc2) {
    await db.execute({ sql: 'UPDATE locations SET sort_order = ? WHERE id = ?', args: [loc2.sort_order, id1] });
    await db.execute({ sql: 'UPDATE locations SET sort_order = ? WHERE id = ?', args: [loc1.sort_order, id2] });
  }
}

export async function getLocationById(id: number): Promise<Location | undefined> {
  const { rows } = await db.execute({ sql: 'SELECT * FROM locations WHERE id = ?', args: [id] });
  return rows[0] as unknown as Location | undefined;
}

export async function createLocation(name: string, description: string | null) {
  const { rows } = await db.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM locations');
  const max = rows[0] as unknown as { next: number };
  await db.execute({
    sql: 'INSERT INTO locations (name, description, sort_order) VALUES (?, ?, ?)',
    args: [name, description, max.next],
  });
}

export async function updateLocation(id: number, name: string, description: string | null) {
  await db.execute({
    sql: 'UPDATE locations SET name = ?, description = ? WHERE id = ?',
    args: [name, description, id],
  });
}

export async function deleteLocation(id: number) {
  await db.execute({ sql: 'UPDATE items SET location_id = NULL WHERE location_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM locations WHERE id = ?', args: [id] });
}

export async function updateItemNotes(id: number, notes: string) {
  await db.execute({
    sql: "UPDATE items SET notes = ?, updated_at = datetime('now') WHERE id = ?",
    args: [notes, id],
  });
}

export async function updateItemImage(id: number, image: string) {
  await db.execute({
    sql: "UPDATE items SET image = ?, updated_at = datetime('now') WHERE id = ?",
    args: [image, id],
  });
}

export async function createItem(name: string, sku: string | null, currentCount: number, reorderThreshold: number, locationId: number | null, vendorId: number | null, notes?: string, unit?: string, image?: string, unitsPerCase?: number, caseUnit?: string) {
  await db.execute({
    sql: 'INSERT INTO items (name, sku, current_count, reorder_threshold, location_id, vendor_id, notes, unit, image, units_per_case, case_unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [name, sku, currentCount, reorderThreshold, locationId, vendorId, notes ?? '', unit ?? '', image ?? '', unitsPerCase ?? 1, caseUnit ?? ''],
  });
}

export async function updateItem(id: number, name: string, sku: string | null, currentCount: number, reorderThreshold: number, locationId: number | null, vendorId: number | null, notes?: string, unit?: string, image?: string, unitsPerCase?: number, caseUnit?: string) {
  await db.execute({
    sql: "UPDATE items SET name = ?, sku = ?, current_count = ?, reorder_threshold = ?, location_id = ?, vendor_id = ?, notes = ?, unit = ?, image = ?, units_per_case = ?, case_unit = ?, updated_at = datetime('now') WHERE id = ?",
    args: [name, sku, currentCount, reorderThreshold, locationId, vendorId, notes ?? '', unit ?? '', image ?? '', unitsPerCase ?? 1, caseUnit ?? '', id],
  });
}

export async function getAllItems(): Promise<ItemWithRelations[]> {
  const { rows } = await db.execute(`
    SELECT i.*, l.name as location_name, v.name as vendor_name
    FROM items i
    LEFT JOIN locations l ON i.location_id = l.id
    LEFT JOIN vendors v ON i.vendor_id = v.id
    ORDER BY i.name
  `);
  return rows as unknown as ItemWithRelations[];
}

export async function deleteItem(id: number) {
  await db.execute({ sql: 'DELETE FROM reorder_orders WHERE item_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM items WHERE id = ?', args: [id] });
}

export type LocationStats = {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
  item_count: number;
  low_count: number;
  out_count: number;
};

export async function getLocationsWithStats(): Promise<LocationStats[]> {
  const { rows } = await db.execute(`
    SELECT
      l.id, l.name, l.description, l.sort_order,
      COUNT(i.id) as item_count,
      SUM(CASE WHEN i.current_count > 0 AND i.current_count < i.reorder_threshold THEN 1 ELSE 0 END) as low_count,
      SUM(CASE WHEN i.current_count <= 0 THEN 1 ELSE 0 END) as out_count
    FROM locations l
    LEFT JOIN items i ON i.location_id = l.id
    GROUP BY l.id
    ORDER BY l.sort_order, l.name
  `);
  return rows as unknown as LocationStats[];
}

export async function getItemsByLocationId(locationId: number): Promise<ItemWithRelations[]> {
  const { rows } = await db.execute({
    sql: `
      SELECT i.*, l.name as location_name, v.name as vendor_name
      FROM items i
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      WHERE i.location_id = ?
      ORDER BY i.name
    `,
    args: [locationId],
  });
  return rows as unknown as ItemWithRelations[];
}

export async function searchItems(query: string): Promise<ItemWithRelations[]> {
  const pattern = `%${query}%`;
  const { rows } = await db.execute({
    sql: `
      SELECT i.*, l.name as location_name, v.name as vendor_name
      FROM items i
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      WHERE i.name LIKE ? OR i.sku LIKE ?
      ORDER BY i.name
      LIMIT 50
    `,
    args: [pattern, pattern],
  });
  return rows as unknown as ItemWithRelations[];
}

export async function getSetting(key: string): Promise<string | null> {
  const { rows } = await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: [key] });
  return (rows[0] as unknown as { value: string } | undefined)?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await db.execute({
    sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    args: [key, value],
  });
}
