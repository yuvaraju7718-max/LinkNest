import React from 'react';
import { Star, Bookmark, Plus } from 'lucide-react';
import LinkCard from '../components/LinkCard';

export default function FavoritesView({
  links = [],
  onOpenAddModal,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onUpdateStatus,
  onViewDetails
}) {
  const favoriteLinks = links.filter((l) => l.is_favorite);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Starred Favorites
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your top internet bookmarks for immediate reference ({favoriteLinks.length} total)
        </p>
      </div>

      {favoriteLinks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
          <Star className="w-12 h-12 text-amber-300 dark:text-amber-500/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No favorites starred yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
            Click the star icon on any link card in your library to pin it to your favorites for instant access.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            Add New Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteLinks.map((link) => (
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
  );
}
