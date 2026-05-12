'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveNotesAction } from './actions';

export default function ItemNotes({ itemId, notes: initial }: { itemId: number; notes: string }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    await saveNotesAction(itemId, text);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setText(initial);
    setEditing(false);
  }

  const hasNotes = initial.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {hasNotes ? 'Edit' : 'Add'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Add notes about this item..."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-md bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {hasNotes ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{initial}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No notes added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
