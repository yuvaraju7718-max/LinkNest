import React, { useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Copy,
  Folder,
  Tag,
  Paperclip,
  Download,
  Clock,
  BookOpen,
  CheckCircle2,
  Edit,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { useToast } from '../context/ToastContext';

export default function LinkDetailModal({
  isOpen,
  onClose,
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateStatus
}) {
  const dialogRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  if (!isOpen || !link) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(link.url);
    toast.success('Link copied to clipboard!');
  };

  const formattedDate = link.created_at
    ? new Date(link.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="p-0 rounded-2xl bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm m-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={link.category} size="md" />
            {link.is_sample && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3 h-3" /> Sample Resource
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & URL */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {link.title}
          </h2>

          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 truncate max-w-md"
            >
              <span>{link.url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>

            <button
              onClick={copyUrl}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy URL"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Why I saved this (Personal Notes) */}
        <div className="mt-5 p-4 rounded-xl bg-brand-50/80 border border-brand-200 dark:bg-brand-950/40 dark:border-brand-900">
          <h4 className="text-xs font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span>Why you saved this</span>
          </h4>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            {link.personal_notes || (
              <span className="italic text-slate-400">No personal notes added yet. Click edit to record why this resource matters!</span>
            )}
          </p>
        </div>

        {/* Description */}
        {link.description && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Resource Summary
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {link.description}
            </p>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Collection</span>
            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-brand-500" />
              <span>{link.collection_name || 'None'}</span>
            </div>
          </div>

          <div>
            <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Status</span>
            <select
              value={link.reading_status}
              onChange={(e) => onUpdateStatus(link.id, e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none capitalize"
            >
              <option value="unread">Unread</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Saved Date</span>
            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {link.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <Tag className="w-3 h-3 text-brand-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* S3 Attachment */}
        {link.attachment && (
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                <Paperclip className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {link.attachment.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {link.attachment.size ? `${(link.attachment.size / 1024).toFixed(1)} KB` : 'Private S3 Object'}
                </p>
              </div>
            </div>

            {link.attachment.download_url ? (
              <a
                href={link.attachment.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 italic">S3 storage required for download</span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(link.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              link.is_favorite
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                : 'bg-white border-slate-200 text-slate-600 dark:bg-navy-950 dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            <Star className={`w-4 h-4 ${link.is_favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>{link.is_favorite ? 'Favorite' : 'Mark Favorite'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(link);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(link);
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
