import React from 'react';
import {
  Bookmark,
  Folder,
  Star,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Layers,
  Clock
} from 'lucide-react';
import LinkCard from '../components/LinkCard';

export default function DashboardView({
  stats = {},
  recentLinks = [],
  collections = [],
  onOpenAddModal,
  onNavigate,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onUpdateStatus,
  onViewDetails,
  onSelectCollection
}) {
  const statCards = [
    {
      title: 'Total Saved Links',
      value: stats.total_links || 0,
      icon: Bookmark,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/60',
      view: 'links'
    },
    {
      title: 'Collections',
      value: stats.total_collections || 0,
      icon: Folder,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      view: 'collections'
    },
    {
      title: 'Starred Favorites',
      value: stats.favorites_count || 0,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      view: 'favorites'
    },
    {
      title: 'Unread to Explore',
      value: stats.unread_count || 0,
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      view: 'reading-list'
    }
  ];

  // Calculate reading progress percentage
  const total = stats.total_links || 0;
  const completed = stats.completed_count || 0;
  const reading = stats.reading_count || 0;
  const unread = stats.unread_count || 0;

  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const readingPct = total > 0 ? Math.round((reading / total) * 100) : 0;
  const unreadPct = total > 0 ? Math.round((unread / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome & Quick Action Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-950 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase text-brand-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back to LinkNest</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curate what inspires you.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Quickly save tutorials, articles, GitHub repositories, and docs with your personal reason for saving them.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-white text-brand-950 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Save New Resource</span>
            </button>

            <button
              onClick={() => onNavigate('links')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Explore All Links</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subtle Decorative Pattern */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.view)}
              className="glass-card rounded-2xl p-5 cursor-pointer hover:border-brand-500/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {card.value}
                </span>
                <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline">
                  View →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reading Status Progress Bar */}
      {total > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Reading Status Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {completed} of {total} completed ({completedPct}%)
            </span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${completedPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Completed: ${completed} (${completedPct}%)`}
            />
            <div
              style={{ width: `${readingPct}%` }}
              className="bg-indigo-500 transition-all duration-500"
              title={`In Progress: ${reading} (${readingPct}%)`}
            />
            <div
              style={{ width: `${unreadPct}%` }}
              className="bg-slate-300 dark:bg-slate-600 transition-all duration-500"
              title={`Unread: ${unread} (${unreadPct}%)`}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed ({completed})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Reading ({reading})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Unread ({unread})
            </span>
          </div>
        </div>
      )}

      {/* Frequently Used Collections */}
      {collections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Your Collections</span>
            </h3>
            <button
              onClick={() => onNavigate('collections')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all ({collections.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {collections.slice(0, 4).map((col) => (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="glass-card rounded-2xl p-4 cursor-pointer hover:border-brand-500/50 hover:shadow-md transition-all flex items-start gap-3.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                  style={{ backgroundColor: col.color || '#6366f1' }}
                >
                  <Folder className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {col.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {col.description || 'No description'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {col.links_count || 0} resources
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Saved Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recently Saved Resources
            </h3>
          </div>
          <button
            onClick={() => onNavigate('links')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            See full library →
          </button>
        </div>

        {recentLinks.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No resources saved yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Click the button below to add your first YouTube tutorial, article, or documentation link.
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
            >
              Add First Link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentLinks.slice(0, 6).map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={onEditLink}
                onDelete={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
                onUpdateStatus={onUpdateStatus}
                onViewDetails={onViewDetails}
                viewMode="grid"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
