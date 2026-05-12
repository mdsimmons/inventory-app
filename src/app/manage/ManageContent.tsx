'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Vendor, Location, ItemWithRelations } from '@/lib/db';
import { UNIT_OPTIONS } from '@/lib/constants';
import {
  addLocation, editLocation as editLocationAction, removeLocation, moveLocation,
  addVendor, editVendor as editVendorAction, removeVendor,
  addItem, removeItem,
} from './actions';

function EditForm<T extends Record<string, any>>({
  fields, data, onSubmit, onCancel,
}: {
  fields: { name: string; label: string; type?: string; required?: boolean }[];
  data: T;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}) {
  return (
    <form action={onSubmit} className="space-y-2 pt-3 pb-2 border-t border-gray-100 mt-2">
      <input type="hidden" name="id" value={data.id} />
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">{f.label}</label>
          <input
            type={f.type ?? 'text'}
            name={f.name}
            defaultValue={data[f.name] ?? ''}
            required={f.required}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Save</button>
        <button type="button" onClick={onCancel} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
      </div>
    </form>
  );
}

function CollapsibleSection({
  title, count, defaultOpen, children,
}: {
  title: string; count: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 list-none">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{count}</span>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

function ActionForm({ action, children, className }: {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await action(formData);
    form.reset();
    startTransition(() => router.refresh());
  }

  return <form onSubmit={handleSubmit} className={className}>{children}</form>;
}

function ConfirmDeleteForm({ action, children, message }: {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  message: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.confirm(message)) return;
    const formData = new FormData(e.currentTarget);
    await action(formData);
    startTransition(() => router.refresh());
  }

  return <form onSubmit={handleSubmit} className="inline">{children}</form>;
}

export default function ManageContent({
  locations, vendors, items,
}: {
  locations: Location[];
  vendors: Vendor[];
  items: ItemWithRelations[];
}) {
  const router = useRouter();
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Manage</h1>
      <div className="space-y-4">

        <CollapsibleSection title="Locations" count={locations.length} defaultOpen>
          <ActionForm action={addLocation} className="pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" name="name" placeholder="Location name" required className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input type="text" name="description" placeholder="Description" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 shrink-0">Add</button>
            </div>
          </ActionForm>
          <div>
            {locations.map((loc) => (
              <div key={loc.id}>
                <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{loc.name}</p>
                    {loc.description && <p className="text-xs text-gray-500 truncate">{loc.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <ActionForm action={moveLocation}>
                      <input type="hidden" name="id" value={loc.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button type="submit" className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                    </ActionForm>
                    <ActionForm action={moveLocation}>
                      <input type="hidden" name="id" value={loc.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button type="submit" className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </ActionForm>
                    <button onClick={() => setEditLoc(loc)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <ConfirmDeleteForm action={removeLocation} message="Delete this location? Items in this location will become unassigned.">
                      <input type="hidden" name="id" value={loc.id} />
                      <button type="submit" className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </ConfirmDeleteForm>
                  </div>
                </div>
                {editLoc?.id === loc.id && (
                  <EditForm
                    fields={[
                      { name: 'name', label: 'Name', required: true },
                      { name: 'description', label: 'Description' },
                    ]}
                    data={editLoc}
                    onSubmit={async (formData) => {
                      await editLocationAction(formData);
                      setEditLoc(null);
                      router.refresh();
                    }}
                    onCancel={() => setEditLoc(null)}
                  />
                )}
              </div>
            ))}
            {locations.length === 0 && <p className="text-xs text-gray-500 py-4 text-center">No locations yet.</p>}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Vendors" count={vendors.length} defaultOpen>
          <ActionForm action={addVendor} className="pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" name="name" placeholder="Vendor name" required className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input type="text" name="email" placeholder="Email" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input type="text" name="phone" placeholder="Phone" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 shrink-0">Add</button>
            </div>
          </ActionForm>
          <div>
            {vendors.map((v) => (
              <div key={v.id}>
                <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      {v.email && <span>{v.email}</span>}
                      {v.phone && <span>{v.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={() => setEditVendor(v)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <ConfirmDeleteForm action={removeVendor} message="Delete this vendor? Items assigned to this vendor will become unassigned.">
                      <input type="hidden" name="id" value={v.id} />
                      <button type="submit" className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </ConfirmDeleteForm>
                  </div>
                </div>
                {editVendor?.id === v.id && (
                  <EditForm
                    fields={[
                      { name: 'name', label: 'Name', required: true },
                      { name: 'email', label: 'Email' },
                      { name: 'phone', label: 'Phone' },
                    ]}
                    data={editVendor}
                    onSubmit={async (formData) => {
                      await editVendorAction(formData);
                      setEditVendor(null);
                      router.refresh();
                    }}
                    onCancel={() => setEditVendor(null)}
                  />
                )}
              </div>
            ))}
            {vendors.length === 0 && <p className="text-xs text-gray-500 py-4 text-center">No vendors yet.</p>}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Items" count={items.length}>
          <ActionForm action={addItem} className="pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input type="text" name="name" placeholder="Item name" required className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input type="text" name="sku" placeholder="SKU" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input type="number" name="current_count" placeholder="Count" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input type="number" name="reorder_threshold" placeholder="Threshold" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 shrink-0">Add</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select name="unit" defaultValue="" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
              <input type="number" name="units_per_case" placeholder="Units/case" defaultValue={1} min={1} className="rounded-md border border-gray-300 px-3 py-2 text-sm w-28 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="text" name="case_unit" placeholder="Case label" className="rounded-md border border-gray-300 px-3 py-2 text-sm w-28 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <select name="location_id" defaultValue="" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="">No location</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select name="vendor_id" defaultValue="" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="">No vendor</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </ActionForm>
          <div>
            {items.map((item) => {
              const isLow = item.current_count < item.reorder_threshold;
              const isOut = item.current_count <= 0;
              return (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <Link href={`/items/${item.id}`} className="text-sm font-medium text-gray-900 truncate block hover:text-indigo-600">{item.name}</Link>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="font-mono">{item.sku}</span>
                      {item.location_name && <span>{item.location_name}</span>}
                      {item.vendor_name && <span>{item.vendor_name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-sm font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                      {item.current_count}
                      {item.unit && <span className="text-xs font-normal text-gray-400 ml-0.5">{item.unit}</span>}
                    </span>
                    <Link href={`/items/${item.id}/edit`} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <ConfirmDeleteForm action={removeItem} message="Delete this item? This cannot be undone.">
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </ConfirmDeleteForm>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && <p className="text-xs text-gray-500 py-4 text-center">No items yet.</p>}
          </div>
        </CollapsibleSection>

      </div>
    </div>
  );
}
