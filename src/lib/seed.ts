import { db } from './db';

export async function seed() {
  const { rows } = await db.execute('SELECT COUNT(*) as count FROM vendors');
  const vendorCount = rows[0] as unknown as { count: number };
  if (vendorCount.count > 0) return;

  await db.execute(`INSERT INTO vendors (name, email, phone) VALUES
    ('Industrial Supply Co', 'orders@industrialsupply.com', '555-0100'),
    ('Parts Plus Inc', 'sales@partsplus.com', '555-0101'),
    ('Warehouse Direct', 'info@warehousedirect.com', '555-0102'),
    ('ToolPro Distributors', 'orders@toolpro.com', '555-0103')
  `);

  await db.execute(`INSERT INTO locations (name, description, sort_order) VALUES
    ('Aisle A - Shelf 1', 'Front left section', 1),
    ('Aisle A - Shelf 2', 'Front left section', 2),
    ('Aisle B - Shelf 1', 'Middle section right', 3),
    ('Aisle B - Shelf 2', 'Middle section right', 4),
    ('Aisle C - Shelf 1', 'Back corner', 5),
    ('Aisle C - Shelf 2', 'Back corner', 6),
    ('Overflow - Rack 1', 'Overflow storage area', 7),
    ('Overflow - Rack 2', 'Overflow storage area', 8)
  `);

  await db.execute(`INSERT INTO items (name, sku, current_count, reorder_threshold, location_id, vendor_id, notes, unit, units_per_case, case_unit) VALUES
    ('Steel Bolts M10', 'HW-BOLT-001', 45, 20, 1, 1, '', 'pcs', 100, 'box'),
    ('Steel Bolts M12', 'HW-BOLT-002', 8, 15, 1, 1, 'Low stock — order soon', 'pcs', 100, 'box'),
    ('Washers Flat M10', 'HW-WASH-001', 120, 50, 2, 1, '', 'pcs', 200, 'box'),
    ('Hex Nuts M10', 'HW-NUT-001', 3, 25, 2, 2, 'Almost out, reorder from Parts Plus', 'pcs', 100, 'box'),
    ('Aluminum Sheet 3mm', 'MTL-AL-001', 12, 5, 3, 2, 'Grade 6061, keep flat stored', 'meter', 10, 'bundle'),
    ('Steel Rod 12mm', 'MTL-ST-001', 6, 10, 3, 3, 'Check for rust before use', 'meter', 10, 'bundle'),
    ('Copper Wire 2.5mm', 'MTL-CU-001', 30, 15, 3, 3, '', 'meter', 25, 'bundle'),
    ('LED Panel Light 60cm', 'ELEC-LED-001', 2, 10, 4, 4, 'Backordered 2 weeks', 'pcs', 12, 'case'),
    ('USB Cable Type-C 2m', 'ELEC-USB-001', 55, 30, 4, 4, '', 'pcs', 20, 'case'),
    ('Resistor Kit 1/4W', 'ELEC-RES-001', 4, 10, 4, 4, 'Assorted values, 100pc kit', 'pack', 1, ''),
    ('Screwdriver Set 6pc', 'TL-SD-001', 7, 5, 5, 4, '', 'set', 6, 'case'),
    ('Wrench Adjustable 8"', 'TL-WR-001', 1, 5, 5, 1, 'Only one left — last one was damaged', 'pcs', 12, 'case'),
    ('Pliers Long Nose', 'TL-PL-001', 0, 5, 5, 2, 'OUT OF STOCK — reorder urgently', 'pcs', 12, 'case'),
    ('Safety Glasses', 'PPE-SG-001', 18, 10, 6, 3, 'ANSI Z87.1 rated', 'pair', 24, 'case'),
    ('Work Gloves L', 'PPE-GL-001', 40, 20, 6, 3, 'Size large, leather palm', 'pair', 12, 'case'),
    ('Duct Tape Silver', 'ADH-DT-001', 22, 10, 7, 4, '', 'roll', 12, 'case'),
    ('Zip Ties 200mm', 'HW-ZIP-001', 200, 50, 7, 1, 'Black nylon', 'pack', 100, 'case'),
    ('Lubricant Spray 400ml', 'MNT-LUB-001', 5, 10, 8, 2, 'WD-40 equivalent', 'can', 12, 'case')
  `);
}
