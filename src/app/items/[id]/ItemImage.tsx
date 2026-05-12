'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveImageAction } from './actions';

export default function ItemImage({ itemId, image }: { itemId: number; image: string }) {
  const [img, setImg] = useState(image);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      await saveImageAction(itemId, dataUrl);
      setImg(dataUrl);
      setEditing(false);
      setSaving(false);
      router.refresh();
    };
    reader.readAsDataURL(file);
  }

  async function handleUrl() {
    const url = urlRef.current?.value?.trim();
    if (!url) return;
    setSaving(true);
    await saveImageAction(itemId, url);
    setImg(url);
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  async function handleRemove() {
    setSaving(true);
    await saveImageAction(itemId, '');
    setImg('');
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  const hasImage = img.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Photo</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hasImage ? 'Change' : 'Add'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Take or upload photo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 shrink-0">Or URL:</span>
            <input
              ref={urlRef}
              type="text"
              placeholder="https://..."
              className="block flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleUrl}
              disabled={saving}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Set
            </button>
          </div>
          {hasImage && (
            <button onClick={handleRemove} disabled={saving} className="text-xs text-red-600 hover:text-red-800 font-medium">
              Remove photo
            </button>
          )}
          <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-700 font-medium ml-3">
            Cancel
          </button>
        </div>
      ) : (
        <div>
          {hasImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt="Item photo"
                className="w-full max-h-64 object-contain rounded-lg bg-gray-50"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs">No photo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
