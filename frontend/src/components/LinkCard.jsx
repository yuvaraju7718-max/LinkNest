import React from 'react';
import {
  ExternalLink,
  Star,
  Copy,
  Check,
  MoreVertical,
  Paperclip,
  Clock,
  BookOpen,
  CheckCircle2,
  Folder,
  Tag,
  Sparkles,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { useToast } from '../context/ToastContext';

export default function LinkCard({
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateStatus,
  onViewDetails,
  viewMode = 'grid'
}) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close dropdown menu on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (link.reading_status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
        };
      case 'reading':
        return {
          label: 'In Progress',
          icon: BookOpen,
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
        };
      default:
        return {
          label: 'Unread',
          icon: Clock,
          classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  if (viewMode === 'list') {
    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-brand-500/50 transition-all">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            onClick={() => onToggleFavorite(link.id)}
            className={`mt-1 p-1 rounded-lg transition-colors ${
              link.is_favorite
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
            }`}
            title={link.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Star className={`w-5 h-5 ${link.is_favorite ? 'fill-amber-400' : ''}`} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <CategoryBadge category={link.category} size="sm" />
              {link.collection_name && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                  <Folder className="w-3 h-3 text-brand-500" />
                  {link.collection_name}
                </span>
              )}
              {link.is_sample && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Sample
                </span>
              )}
            </div>

            <h3
              onClick={() => onViewDetails(link)}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer truncate text-base"
            >
              {link.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="truncate">{link.domain}</span>
              <span>•</span>
              <span className="capitalize">{link.reading_status}</span>
              {link.attachment && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
                    <Paperclip className="w-3 h-3" /> S3 Attachment
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* List actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <select
            value={link.reading_status}
            onChange={(e) => onUpdateStatus(link.id, e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1.5 px-2.5 font-medium cursor-pointer focus:ring-2 focus:ring-brand-500"
          >
            <option value="unread">Unread</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Copy URL"
            aria-label="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40 transition-colors"
            title="Open in new tab"
            aria-label="Open original URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => onEdit(link)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Edit"
            aria-label="Edit link"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(link)}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete"
            aria-label="Delete link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid view (Default)
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group hover:border-brand-500/50 hover:shadow-lg transition-all duration-200 relative">
      <div>
        {/* Card Header: Category & Favorite toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={link.category} size="sm" />
            {link.is_sample && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="w-2.5 h-2.5" /> Sample
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(link.id)}
              className={`p-1.5 rounded-xl transition-colors ${
                link.is_favorite
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
              title={link.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${link.is_favorite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Overflow menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-20 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onViewDetails(link);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> View Details
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(link);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" /> Edit Link
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(link);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title & Domain */}
        <h3
          onClick={() => onViewDetails(link)}
          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer text-base line-clamp-2 leading-snug mb-1.5"
          title={link.title}
        >
          {link.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3">
          <span className="font-mono truncate">{link.domain}</span>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-brand-500 transition-colors inline-flex items-center p-0.5"
            title="Open in new tab"
            aria-label="Open original resource URL"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Description */}
        {link.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {link.description}
          </p>
        )}

        {/* KEY HIGHLIGHT: Personal Notes ("Why I saved this") */}
        {link.personal_notes && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-brand-50/70 border border-brand-100 dark:bg-brand-950/30 dark:border-brand-900/40">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
              <span>Why saved:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic leading-relaxed">
              "{link.personal_notes}"
            </p>
          </div>
        )}

        {/* Collection & Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {link.collection_name && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Folder className="w-3 h-3 text-brand-500" />
              {link.collection_name}
            </span>
          )}

          {link.tags && link.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-md"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {tag}
            </span>
          ))}

          {link.attachment && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-900 px-2 py-0.5 rounded-md ml-auto">
              <Paperclip className="w-3 h-3" />
              Attachment
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Reading Status & Quick Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {/* Status Dropdown Pill */}
        <div className="relative">
          <select
            value={link.reading_status}
            onChange={(e) => onUpdateStatus(link.id, e.target.value)}
            className={`text-xs font-medium rounded-full py-1 pl-2.5 pr-6 border cursor-pointer appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${status.classes}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.4rem center',
              backgroundSize: '0.8rem'
            }}
          >
            <option value="unread">Unread</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy URL"
            aria-label="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Visit URL"
            aria-label="Visit URL"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
