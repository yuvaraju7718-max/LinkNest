import React, { useState, useEffect, useRef } from 'react';
import { X, Folder, Cloud, Code2, Layout, Cpu, BookOpen, Database, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

const PRESET_ICONS = [
  { name: 'Folder', icon: Folder },
  { name: 'Cloud', icon: Cloud },
  { name: 'Code2', icon: Code2 },
  { name: 'Layout', icon: Layout },
  { name: 'Cpu', icon: Cpu },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Database', icon: Database },
];

export default function CollectionModal({
  isOpen,
  onClose,
  onSuccess,
  editCollection = null
}) {
  const dialogRef = useRef(null);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('Folder');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editCollection) {
      setName(editCollection.name || '');
      setDescription(editCollection.description || '');
      setColor(editCollection.color || '#6366f1');
      setIcon(editCollection.icon || 'Folder');
    } else {
      setName('');
      setDescription('');
      setColor('#6366f1');
      setIcon('Folder');
    }
    setErrorMsg('');
  }, [editCollection, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Collection name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        color,
        icon
      };

      if (editCollection) {
        await api.updateCollection(editCollection.id, payload);
        toast.success(`Collection "${name}" updated!`);
      } else {
        await api.createCollection(payload);
        toast.success(`Collection "${name}" created!`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save collection.');
      toast.error(err.message || 'Failed to save collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="p-0 rounded-2xl bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm m-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold">
            {editCollection ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Collection Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS & Cloud, System Design, React"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What belongs in this collection..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-xs sm:text-sm"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icon
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_ICONS.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-950 dark:border-brand-500 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={item.name}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 transition-all shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editCollection ? 'Save Changes' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
